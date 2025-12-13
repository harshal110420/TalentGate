const asyncHandler = require("express-async-handler");
const { DashMatrixDB } = require("../models");
const { Candidate, Exam, Department, JobOpening } = DashMatrixDB;
const sendEmails = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

const createCandidate = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    mobile,
    experience,
    examId,
    departmentId,
    isActive = true,
    source = "offline",
    jobId,
    jobCode,
    applicationStage = "Applied",
    assignedRecruiterId,
    remarks,
    resumeReviewed = false,
    hrRating,
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  //-------------------------------
  // EMAIL DUPLICATE CHECK
  //-------------------------------
  const existing = await Candidate.findOne({ where: { email } });
  if (existing) {
    return res
      .status(400)
      .json({ message: "Candidate with this email already exists" });
  }
  const resumeUrl = req.file ? req.file.path : null;

  const finalExamId = examId && examId !== "null" ? Number(examId) : null;

  const payload = {
    name,
    email,
    mobile,
    experience,
    examId: finalExamId,
    departmentId: departmentId ? Number(departmentId) : null,
    isActive,
    resumeUrl,
    source,
    jobId,
    jobCode,
    applicationStage,
    assignedRecruiterId: assignedRecruiterId
      ? Number(assignedRecruiterId)
      : null,
    remarks,
    resumeReviewed,
    hrRating: hrRating ? Number(hrRating) : null,
    examStatus: finalExamId ? "Assigned" : "Not assigned",
    examAssignedAt: finalExamId ? new Date() : null, // ✅ yahan add karo
    created_by: req.user?.id || null,
  };
  try {
    const candidate = await Candidate.create(payload);
    res.status(201).json({
      message: "Candidate created successfully",
      candidate,
    });
  } catch (err) {
    res.status(500).json({
      message: "Candidate creation failed",
      error: err.original?.sqlMessage || err.message,
    });
  }
});

const getAllCandidates = asyncHandler(async (req, res) => {
  const candidates = await Candidate.findAll({
    include: [
      { model: Exam, as: "exam" },
      { model: Department, as: "department", attributes: ["id", "name"] },
      {
        model: JobOpening,
        as: "job",
        attributes: ["id", "jobCode", "title", "designation"],
      },
    ],
    order: [["id", "DESC"]],
  });
  res
    .status(200)
    .json({ message: "Candidates fetched successfully", candidates });
});

const getCandidateById = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByPk(req.params.id, {
    include: [
      { model: Exam, as: "exam" },
      { model: Department, as: "department" },
    ],
  });
  if (!candidate)
    return res.status(404).json({ message: "Candidate not found" });
  res
    .status(200)
    .json({ message: "Candidate fetched successfully", candidate });
});

const updateCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByPk(req.params.id);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const {
    name,
    email,
    mobile,
    experience,
    examId,
    departmentId,
    isActive,
    resumeUrl,
    source,
    jobId,
    jobCode,
    applicationStage,
    assignedRecruiterId,
    remarks,
    resumeReviewed,
    hrRating,
  } = req.body;

  /* ---------------- HELPERS ---------------- */

  const sanitizeNumber = (val, fallback = null) => {
    if (val === undefined || val === null || val === "" || val === "null")
      return fallback;

    const num = Number(val);
    return isNaN(num) ? fallback : num;
  };

  const sanitizeBoolean = (val, fallback) => {
    if (typeof val === "boolean") return val;
    if (val === "true") return true;
    if (val === "false") return false;
    return fallback;
  };

  /* ---------------- SANITIZATION ---------------- */

  const sanitizedExamId = sanitizeNumber(examId);
  const sanitizedDepartmentId = sanitizeNumber(
    departmentId,
    candidate.departmentId
  );
  const sanitizedJobId = sanitizeNumber(jobId, candidate.jobId);
  const sanitizedAssignedRecruiterId = sanitizeNumber(
    assignedRecruiterId,
    candidate.assignedRecruiterId
  );
  const sanitizedHrRating = sanitizeNumber(hrRating, candidate.hrRating);

  const sanitizedIsActive = sanitizeBoolean(isActive, candidate.isActive);
  const sanitizedResumeReviewed = sanitizeBoolean(
    resumeReviewed,
    candidate.resumeReviewed
  );

  const resumeUrlFinal = req.file?.path || resumeUrl || candidate.resumeUrl;

  /* ---------------- SHORTLIST VALIDATION ---------------- */

  if (
    applicationStage === "Shortlisted for Exam" &&
    candidate.resumeReviewed !== true &&
    sanitizedResumeReviewed !== true
  ) {
    return res.status(400).json({
      message: "Candidate can be shortlisted only after resume is reviewed.",
    });
  }

  /* ---------------- EXAM ASSIGN VALIDATION ---------------- */
  const effectiveStage = applicationStage || candidate.applicationStage;

  if (
    sanitizedExamId && // exam assign ho raha hai
    sanitizedExamId !== candidate.examId && // exam change ho raha hai
    effectiveStage !== "Shortlisted for Exam"
  ) {
    return res.status(400).json({
      message: "Exam can be assigned only to SHORTLISTED candidates.",
    });
  }

  /* ---------------- UPDATE PAYLOAD ---------------- */

  const updatedFields = {
    name: name ?? candidate.name,
    email: email ?? candidate.email,
    mobile: mobile ?? candidate.mobile,
    experience: experience ?? candidate.experience,
    examId: sanitizedExamId ?? candidate.examId,
    departmentId: sanitizedDepartmentId,
    isActive: sanitizedIsActive,
    resumeUrl: resumeUrlFinal,
    source: source ?? candidate.source,
    jobId: sanitizedJobId,
    jobCode: jobCode ?? candidate.jobCode,
    assignedRecruiterId: sanitizedAssignedRecruiterId,
    remarks: remarks ?? candidate.remarks,
    resumeReviewed: sanitizedResumeReviewed,
    hrRating: sanitizedHrRating,
    updated_by: req.user?.id || null,
  };

  /* ---------------- AUTO STAGE: Resume Review ---------------- */

  if (
    sanitizedResumeReviewed === true &&
    candidate.resumeReviewed === false &&
    candidate.applicationStage === "Applied"
  ) {
    updatedFields.applicationStage = "Resume Reviewed";
  }

  /* ---------------- MANUAL STAGE UPDATE ---------------- */

  if (applicationStage) {
    updatedFields.applicationStage = applicationStage;
  }

  /* ---------------- EXAM STATUS + STAGE LINK ---------------- */

  // ✅ Exam assigned
  if (sanitizedExamId && sanitizedExamId !== candidate.examId) {
    updatedFields.examStatus = "Assigned";
    updatedFields.applicationStage = "Exam Assigned";
    updatedFields.examAssignedAt = new Date();
  }

  // ✅ Exam removed
  if (!sanitizedExamId && candidate.examId) {
    updatedFields.examStatus = "Not assigned";
    updatedFields.examId = null;
  }

  /* ---------------- UPDATE ---------------- */

  await candidate.update(updatedFields);

  res.status(200).json({
    message: "Candidate updated successfully",
    candidate,
  });
});

const deleteCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByPk(req.params.id);
  if (!candidate)
    return res.status(404).json({ message: "Candidate not found" });
  await candidate.destroy();
  res.status(200).json({ message: "Candidate deleted successfully" });
});

const sendExamMailToCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // 1. Get candidate with exam
    const candidate = await Candidate.findByPk(candidateId, {
      include: [{ model: Exam, as: "exam" }],
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // 2. Check exam assignment
    if (!candidate.examId || candidate.examStatus === "Not assigned") {
      return res.status(400).json({
        message: "Assign an exam before sending the mail.",
      });
    }

    // 3. Check if mail was already sent recently
    if (candidate.examStatus === "In Progress") {
      const now = new Date();
      const lastSent = candidate.lastMailSentAt;

      if (lastSent) {
        const oneHour = 60 * 60 * 1000; // 1 hour in ms
        const diff = now - new Date(lastSent);

        if (diff < oneHour) {
          const minutesLeft = Math.ceil((oneHour - diff) / (60 * 1000));
          return res.status(400).json({
            message: `Mail already sent. You can resend after ${minutesLeft} min.`,
          });
        }
      }
    }

    // 4. Generate secure token
    const token = jwt.sign(
      {
        candidateId: candidate.id,
        examId: candidate.examId,
      },
      process.env.JWT_SECRET_EXAM,
      { expiresIn: "1h" }
    );
    const baseUrl = process.env.FRONTEND_URL || "https://talentgate.in/exam";
    const examLink = `${baseUrl}/exam-login?token=${token}`;

    // 5. Prepare mail
    const mailOptions = {
      to: candidate.email,
      subject: "📩 Your Talent Gate Exam Link",
      text: `Dear ${candidate.name}, You have been assigned an exam on Talent Gate.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Dear ${candidate.name},</h2>
          <p>You have been assigned an exam on <strong>Talent Gate</strong>.</p>
          <p><strong>📝 Exam:</strong> ${
            candidate.exam?.name || "Talent Gate Test"
          }</p>
          <p><strong>📎 Exam Link:</strong><br />
          <a href="${examLink}" target="_blank" rel="noopener noreferrer">${examLink}</a></p>
          <p><strong>🕒 Please read the instructions carefully and complete the exam before the due time.</strong></p>
          <p>All the best!<br />
          <em>Regards,<br />Talent Gate Team</em></p>
        </div>`,
    };

    // 6. Send email
    await sendEmails(mailOptions);

    // 7. Update status and mail sent time
    candidate.examStatus = "In Progress";
    candidate.lastMailSentAt = new Date();
    await candidate.save();

    return res.status(200).json({
      message:
        "Exam mail sent successfully. Status updated to In Progress. Token expires in 1 hour.",
    });
  } catch (err) {
    console.error("Send mail error:", err);
    return res.status(500).json({ message: "Failed to send exam mail." });
  }
};

const startExam = async (req, res) => {
  try {
    const candidate = req.candidate; // ✅ From verifyExamToken middleware
    const exam = await candidate.getExam(); // Get exam details via association

    if (!exam) {
      return res
        .status(404)
        .json({ message: "Exam not found for this candidate." });
    }

    // ✅ If exam already completed
    if (candidate.examStatus === "Completed") {
      return res.status(400).json({ message: "Exam already submitted." });
    }

    // ✅ If exam already started, return existing start time
    if (candidate.examStatus === "In Progress") {
      return res.status(200).json({
        message: "Exam already started.",
        startedAt: candidate.startedAt,
        exam: {
          id: exam.id,
          name: exam.name,
          totalQuestions: exam.questionIds?.length || 0,
          positiveMarking: exam.positiveMarking,
          negativeMarking: exam.negativeMarking,
        },
      });
    }

    // ✅ Mark exam as started
    candidate.examStatus = "In progress";
    candidate.startedAt = new Date(); // store UTC (DB converts automatically)
    await candidate.save();

    return res.status(200).json({
      message: "✅ Exam started successfully.",
      candidate: {
        id: candidate.id,
        name: candidate.name,
        examStatus: candidate.examStatus,
        startedAt: candidate.startedAt,
      },
      exam: {
        id: exam.id,
        name: exam.name,
        totalQuestions: exam.questionIds?.length || 0,
        positiveMarking: exam.positiveMarking,
        negativeMarking: exam.negativeMarking,
      },
    });
  } catch (err) {
    console.error("❌ Start exam error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const reassignExam = async (req, res) => {
  try {
    const { candidateId, examId } = req.body;

    if (!candidateId || !examId)
      return res.status(400).json({ message: "candidateId & examId required" });

    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });

    candidate.examId = examId;
    // Reset exam status
    candidate.examStatus = "Assigned";
    candidate.examReassignedAt = new Date();
    await candidate.save();

    return res.json({ message: "Exam reassigned successfully", candidate });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const markResumeReviewed = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByPk(req.params.id);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  // ⛔ backward flow protection
  if (
    ["Exam Assigned", "Exam Completed"].includes(candidate.applicationStage)
  ) {
    return res.status(400).json({
      message: "Resume review not allowed after exam has been assigned.",
    });
  }

  // ✅ SYNC FIX: agar resumeReviewed true hai but stage old hai
  if (
    candidate.resumeReviewed === true &&
    candidate.applicationStage === "Applied"
  ) {
    candidate.applicationStage = "Resume Reviewed";
    await candidate.save();

    return res.json({
      message: "Stage automatically synced with resume review",
      candidate,
    });
  }

  // ⛔ normal duplicate prevention
  if (candidate.resumeReviewed === true) {
    return res.status(400).json({
      message: "Resume already reviewed",
    });
  }

  // ✅ standard success flow
  candidate.resumeReviewed = true;
  candidate.applicationStage = "Resume Reviewed";
  candidate.resumeReviewedAt = new Date();
  await candidate.save();

  res.json({
    message: "Resume marked as reviewed successfully",
    candidate,
  });
});

const shortlistCandidateForExam = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByPk(req.params.id);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  // ⛔ safety — resume must be reviewed
  if (!candidate.resumeReviewed) {
    return res.status(400).json({
      message: "Resume must be reviewed before shortlisting",
    });
  }

  // ⛔ already shortlisted
  if (candidate.applicationStage === "Shortlisted for Exam") {
    return res.status(400).json({
      message: "Candidate is already Shortlisted for Exam",
    });
  }

  // ⛔ prevent backward workflow changes
  if (
    ["Exam Assigned", "Exam Completed"].includes(candidate.applicationStage)
  ) {
    return res.status(400).json({
      message: "Cannot shortlist candidate after exam has started.",
    });
  }

  // ✅ stage automation
  candidate.applicationStage = "Shortlisted for Exam";
  candidate.shortlistedForExamAt = new Date();
  await candidate.save();

  res.json({
    message: "Candidate shortlisted successfully",
    candidate,
  });
});

const rejectCandidate = asyncHandler(async (req, res) => {
  const { remarks } = req.body;

  if (!remarks || remarks.trim() === "") {
    return res.status(400).json({
      message: "Rejection remark is required",
    });
  }

  const candidate = await Candidate.findByPk(req.params.id);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  // ⛔ Already hired
  if (candidate.applicationStage === "Hired") {
    return res.status(400).json({
      message: "Cannot reject a hired candidate",
    });
  }

  // ⛔ already rejected
  if (candidate.applicationStage === "Rejected") {
    return res.status(400).json({
      message: "Candidate already rejected",
    });
  }

  // ✅ Reject candidate
  candidate.applicationStage = "Rejected";
  candidate.rejectedAt = new Date();
  candidate.remarks = remarks;

  // ✅ Cleanup exam flow
  if (
    candidate.examStatus === "Assigned" ||
    candidate.examStatus === "In progress"
  ) {
    candidate.examStatus = "Expired";
  }

  await candidate.save();

  res.json({
    message: "Candidate rejected successfully",
    candidate,
  });
});

const shortlistCandidateForInterview = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByPk(req.params.id);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }
  // ⛔ safety — exam must be completed
  if (candidate.applicationStage !== "Exam Completed") {
    return res.status(400).json({
      message: "Candidate must complete exam before shortlisting for interview",
    });
  }

  // ⛔ already shortlisted for interview
  if (candidate.applicationStage === "Interview Scheduled") {
    return res.status(400).json({
      message: "Candidate is already Shortlisted for Interview",
    });
  }

  // ✅ stage automation
  candidate.applicationStage = "Shortlisted for Interview";
  candidate.shortlistedForInterviewAt = new Date();
  await candidate.save();

  res.json({
    message: "Candidate shortlisted for interview successfully",
    candidate,
  });
});

const scheduleInterview = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByPk(req.params.id);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  // 🔒 Stage Protection
  if (candidate.applicationStage !== "Shortlisted for Interview") {
    return res.status(400).json({
      message:
        "Interview can be scheduled only after candidate is shortlisted for interview",
    });
  }

  // Only stage update now
  candidate.applicationStage = "Interview Scheduled";
  candidate.interviewScheduledAt = new Date();
  await candidate.save();

  res.json({
    success: true,
    message: "Interview scheduled successfully",
    candidate,
  });
});

const markInterviewCompleted = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByPk(req.params.id);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  // ⛔ Workflow protection
  if (candidate.applicationStage === "Rejected") {
    return res
      .status(400)
      .json({ message: "Rejected candidate cannot be processed" });
  }

  if (candidate.applicationStage === "Hired") {
    return res.status(400).json({ message: "Candidate already hired" });
  }

  // ✅ Only valid if scheduled interview stage
  if (candidate.applicationStage !== "Interview Scheduled") {
    return res.status(400).json({
      message: "Interview must be scheduled before passing",
    });
  }

  // ✅ Mark interview passed
  candidate.applicationStage = "Interview Completed";
  candidate.interviewCompletedAt = new Date();
  await candidate.save();

  res.json({
    message: "Interview marked as completed",
    candidate,
  });
});

const markSelected = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByPk(req.params.id);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  // ⛔ Workflow safety
  if (candidate.applicationStage === "Rejected") {
    return res
      .status(400)
      .json({ message: "Rejected candidate cannot be selected" });
  }

  if (candidate.applicationStage === "Hired") {
    return res.status(400).json({ message: "Candidate already hired" });
  }

  // ✅ Only from interview pass
  if (candidate.applicationStage !== "Interview Completed") {
    return res.status(400).json({
      message: "Candidate must complete interview before selection",
    });
  }

  // ✅ Mark selected
  candidate.applicationStage = "Selected";
  candidate.selectedAt = new Date();
  await candidate.save();

  res.json({
    message: "Candidate selected successfully",
    candidate,
  });
});

const markHired = asyncHandler(async (req, res) => {
  const { joiningDate } = req.body;

  if (!joiningDate) {
    return res.status(400).json({
      message: "Joining date is required",
    });
  }

  const candidate = await Candidate.findByPk(req.params.id);

  if (!candidate) {
    return res.status(404).json({
      message: "Candidate not found",
    });
  }

  // ⛔ VALIDATIONS
  if (candidate.applicationStage === "Rejected") {
    return res.status(400).json({
      message: "Rejected candidate cannot be hired",
    });
  }

  if (candidate.applicationStage === "Hired") {
    return res.status(400).json({
      message: "Candidate already hired",
    });
  }

  if (candidate.applicationStage !== "Selected") {
    return res.status(400).json({
      message: "Candidate must be Selected before hiring",
    });
  }

  // ✅ MARK AS HIRED
  candidate.applicationStage = "Hired";
  candidate.joiningDate = joiningDate;

  await candidate.save();

  res.json({
    message: "Candidate hired successfully",
    candidate,
  });
});

module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  sendExamMailToCandidate,
  startExam,
  reassignExam,
  markResumeReviewed,
  shortlistCandidateForExam,
  shortlistCandidateForInterview,
  rejectCandidate,
  scheduleInterview,
  markInterviewCompleted,
  markSelected,
  markHired,
};

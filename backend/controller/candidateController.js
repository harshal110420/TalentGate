const asyncHandler = require("express-async-handler");
const { DashMatrixDB } = require("../models");
const { Candidate, Exam, Department } = DashMatrixDB;
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
  } = req.body;

  // Basic validation
  if (!email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  // Check for duplicate email
  const existing = await Candidate.findOne({ where: { email } });
  if (existing) {
    return res
      .status(400)
      .json({ message: "Candidate with this email already exists" });
  }

  const examStatus = examId ? "Assigned" : "Not assigned";

  const candidate = await Candidate.create({
    name,
    email,
    mobile,
    experience,
    examId,
    departmentId,
    isActive,
    examStatus,
    created_by: req.user?.id || null,
  });

  res
    .status(201)
    .json({ message: "Candidate created successfully", candidate });
});

const getAllCandidates = asyncHandler(async (req, res) => {
  const candidates = await Candidate.findAll({
    include: [
      { model: Exam, as: "exam" },
      { model: Department, as: "department" },
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
  if (!candidate)
    return res.status(404).json({ message: "Candidate not found" });

  const { name, email, mobile, experience, examId, departmentId, isActive } =
    req.body;

  const updatedFields = {
    name: name ?? candidate.name,
    email: email ?? candidate.email,
    mobile: mobile ?? candidate.mobile,
    experience: experience ?? candidate.experience,
    examId: examId,
    departmentId: departmentId ?? candidate.departmentId,
    isActive: typeof isActive === "boolean" ? isActive : candidate.isActive,
    updated_by: req.user?.id || null,
  };

  // Update examStatus only if examId has changed
  if (typeof examId !== "undefined" && examId !== candidate.examId) {
    if (examId) {
      updatedFields.examStatus = "Assigned";
    } else {
      updatedFields.examStatus = "Not assigned";
      updatedFields.examId = null; // also reset examId if needed
    }
  }
  console.log("Updating candidate with =>", updatedFields);

  await candidate.update(updatedFields);

  res
    .status(200)
    .json({ message: "Candidate updated successfully", candidate });
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
    console.log("Generated Token:", token);

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

    await candidate.save();

    return res.json({ message: "Exam reassigned successfully", candidate });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  sendExamMailToCandidate,
  startExam,
  reassignExam,
};

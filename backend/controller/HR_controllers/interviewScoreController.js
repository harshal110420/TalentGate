const asyncHandler = require("express-async-handler");
const { DashMatrixDB } = require("../../models");
const { InterviewScore, Interview, Candidate } = DashMatrixDB;

// Submit or update interview score
const submitInterviewScore = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const interviewerId = req.user.id; // from auth middleware
  const {
    score,
    recommendation,
    strengths,
    weaknesses,
    comments,
    submit = false, // flag to indicate final submission
  } = req.body;

  // 1️⃣ Validate score if submitting
  if (submit && (score === undefined || score < 0 || score > 10)) {
    return res.status(400).json({
      message: "Score must be between 0 and 10.",
    });
  }

  // 2️⃣ Fetch interview
  const interview = await Interview.findByPk(interviewId);
  if (!interview) {
    return res.status(404).json({ message: "Interview not found." });
  }

  // 3️⃣ Ensure interview is completed before final submission
  if (submit) {
    // 1️⃣ Mark interview completed
    if (interview.status !== "Completed") {
      await interview.update({
        status: "Completed",
        completedAt: new Date(),
      });
    }

    // 2️⃣ Update candidate application stage
    const candidate = await Candidate.findByPk(interview.candidateId);

    if (candidate && candidate.applicationStage !== "Interview Completed") {
      await candidate.update({
        applicationStage: "Interview Completed",
        interviewCompletedAt: new Date(),
      });
    }
  }

  // 4️⃣ Check existing score
  let interviewScore = await InterviewScore.findOne({
    where: { interviewId, interviewerId },
  });

  // 5️⃣ If already submitted, prevent updates
  if (interviewScore?.status === "Submitted" && submit) {
    return res.status(409).json({
      message: "Score already submitted and cannot be updated.",
    });
  }

  // 6️⃣ Prepare payload
  const scorePayload = {
    interviewId,
    interviewerId,
    candidateId: interview.candidateId,
    round: interview.round,
    score,
    recommendation,
    strengths,
    weaknesses,
    comments,
    status: submit ? "Submitted" : "Draft",
    submittedAt: submit ? new Date() : null,
  };

  // 7️⃣ Create or update
  if (interviewScore) {
    interviewScore = await interviewScore.update(scorePayload);
  } else {
    interviewScore = await InterviewScore.create(scorePayload);
  }

  return res.status(201).json({
    message: submit
      ? "Interview score submitted successfully."
      : "Interview score saved as draft.",
    data: interviewScore,
  });
});

// GET /api/interviews/:interviewId/scores
const fetchInterviewScores = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  const interview = await Interview.findByPk(interviewId, {
    include: [
      {
        model: Candidate,
        as: "candidate",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
  });

  if (!interview) {
    return res.status(404).json({ message: "Interview not found." });
  }

  const scores = await InterviewScore.findAll({
    where: { interviewId },
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  // Map scores to include candidate info
  const responseData = scores.map((s) => ({
    ...s.toJSON(),
    candidateName: interview.Candidate
      ? `${interview.Candidate.firstName} ${interview.Candidate.lastName}`
      : "—",
    interviewType: interview.interviewType || "—",
    startTime: interview.startTime,
    endTime: interview.endTime,
    interviewDate: interview.interviewDate,
    round: interview.round,
    status: interview.status,
  }));

  res.status(200).json({
    message: "Interview scores fetched successfully.",
    data: responseData,
  });
});

// GET /api/interviews/:interviewId/my-score
const fetchMyInterviewScore = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const interviewerId = req.user.id; // from auth middleware

  // 1️⃣ Fetch interview without include to avoid join issues
  const interview = await Interview.findByPk(interviewId);

  if (!interview) {
    return res.status(404).json({ message: "Interview not found." });
  }

  // 2️⃣ Fetch candidate separately
  let candidate = null;
  if (interview.candidateId) {
    candidate = await Candidate.findByPk(interview.candidateId, {
      attributes: ["id", "name", "email"],
    });
  }

  // 3️⃣ Fetch interview score for current user
  const score = await InterviewScore.findOne({
    where: { interviewId, interviewerId },
  });

  // 4️⃣ Prepare response safely
  const responseData = {
    // Spread score if it exists
    ...(score ? score.toJSON() : {}),
    // Candidate info
    candidateName: candidate ? candidate.name : "—",
    candidateEmail: candidate?.email || "—",
    // Interview info
    interviewType: interview.interviewType || "—",
    startTime: interview.startTime || "—",
    endTime: interview.endTime || "—",
    interviewDate: interview.interviewDate || "—",
    round: interview.round || "—",
    status: interview.status || "—",
  };
  res.status(200).json({
    message: "Your interview score fetched successfully.",
    data: responseData,
  });
});

module.exports = {
  submitInterviewScore,
  fetchMyInterviewScore,
  fetchInterviewScores,
};

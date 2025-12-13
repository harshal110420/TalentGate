const asyncHandler = require("express-async-handler");
const { DashMatrixDB } = require("../../models");
const {
  Candidate,
  JobOpening,
  Interview,
  InterviewRound,
  InterviewScore,
  ExamResult,
  Department,
} = DashMatrixDB;

// Fetch candidates with related job & exam info
const { Op } = require("sequelize");

const getCandidatesOverview = asyncHandler(async (req, res) => {
  const {
    departmentId,
    jobId,
    resultStatus,
    startDate,
    endDate,
    search,
    limit = 10,
    offset = 0,
    sortBy = "created_at",
    sortOrder = "DESC",
  } = req.query;

  // =====================================================
  // 🎯 INTERVIEW PIPELINE STAGES ONLY
  // =====================================================
  const INTERVIEW_STAGES = [
    "Shortlisted for Interview",
    "Interview Scheduled",
    "Interview Completed",
    "Selected",
    "Rejected",
    "Hired",
  ];

  // =====================================================
  // 🔎 BASE WHERE CONDITION
  // =====================================================
  const whereCondition = {
    applicationStage: {
      [Op.in]: INTERVIEW_STAGES,
    },
  };

  // 🔹 Department Filter
  if (departmentId) {
    whereCondition.departmentId = departmentId;
  }

  // 🔹 Job Filter
  if (jobId) {
    whereCondition.jobId = jobId;
  }

  // 🔹 Date Range Filter
  if (startDate && endDate) {
    whereCondition.created_at = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }

  // 🔹 Search Filter (name | email | mobile)
  if (search) {
    whereCondition[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { mobile: { [Op.like]: `%${search}%` } },
    ];
  }

  // =====================================================
  // 🔃 SORTING MAP
  // =====================================================
  const sortableFields = {
    name: ["name", sortOrder],
    created_at: ["created_at", sortOrder],
    date: ["created_at", sortOrder],
    score: [{ model: ExamResult, as: "examResults" }, "score", sortOrder],
  };

  const orderBy = sortableFields[sortBy] || ["created_at", "DESC"];

  // =====================================================
  // 🔥 MAIN QUERY
  // =====================================================
  const candidates = await Candidate.findAndCountAll({
    where: whereCondition,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [orderBy],

    attributes: [
      "id",
      "name",
      "email",
      "mobile",
      "applicationStage",
      "examStatus",
      "created_at",
    ],

    include: [
      {
        model: JobOpening,
        as: "job",
        attributes: ["id", "jobCode", "title", "designation", "departmentId"],
      },
      {
        model: Department,
        as: "department",
        attributes: ["id", "name"],
      },
      {
        model: ExamResult,
        as: "examResults",
        attributes: ["resultStatus"],
        where: resultStatus ? { resultStatus } : undefined,
        required: false,
      },
    ],
  });

  // =====================================================
  // ✅ RESPONSE
  // =====================================================
  res.status(200).json({
    success: true,
    totalRecords: candidates.count,
    pageRecords: candidates.rows.length,
    candidates: candidates.rows,
  });
});

// -------------------- CREATE INTERVIEW --------------------
const createInterview = asyncHandler(async (req, res) => {
  const { candidateId, jobId, defaultRounds } = req.body;

  const candidate = await Candidate.findByPk(candidateId);
  if (!candidate)
    return res.status(404).json({ message: "Candidate not found" });

  const job = await JobOpening.findByPk(jobId);
  if (!job) return res.status(404).json({ message: "Job Opening not found" });

  // Optional: candidate belongs to this job
  if (candidate.jobId !== job.id) {
    return res
      .status(400)
      .json({ message: "Candidate not assigned to this Job Opening" });
  }

  // 🔒 Stage check
  if (candidate.applicationStage !== "Shortlisted for Interview") {
    return res
      .status(400)
      .json({ message: "Candidate not ready for interview" });
  }

  const interview = await Interview.create({ candidateId, jobId });

  // Default rounds logic
  let roundsToCreate = [];
  switch (defaultRounds) {
    case "A":
      roundsToCreate = [{ roundNumber: 1, roundName: "Technical" }];
      break;
    case "B":
      roundsToCreate = [
        { roundNumber: 1, roundName: "Technical" },
        { roundNumber: 2, roundName: "HR" },
      ];
      break;
    case "C":
      roundsToCreate = [
        { roundNumber: 1, roundName: "Technical" },
        { roundNumber: 2, roundName: "Managerial" },
        { roundNumber: 3, roundName: "HR" },
      ];
      break;
    default:
      roundsToCreate = []; // Custom will be added separately
  }

  for (let r of roundsToCreate) {
    await InterviewRound.create({ ...r, interviewId: interview.id });
  }

  // Update candidate stage
  candidate.applicationStage = "Interview Scheduled";
  await candidate.save();

  res.json({ success: true, interview });
});

// -------------------- ADD CUSTOM ROUND --------------------
const addInterviewRound = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const { roundNumber, roundName, scheduledAt, mode, location, panelMembers } =
    req.body;

  const interview = await Interview.findByPk(interviewId);
  if (!interview)
    return res.status(404).json({ message: "Interview not found" });

  const round = await InterviewRound.create({
    interviewId,
    roundNumber,
    roundName,
    scheduledAt,
    mode,
    location,
    panelMembers,
  });

  res.json({ success: true, round });
});

// -------------------- ADD SCORE --------------------
const addInterviewScore = asyncHandler(async (req, res) => {
  const { roundId } = req.params;
  const { interviewerName, criteriaScores, totalScore, decision, comments } =
    req.body;

  const round = await InterviewRound.findByPk(roundId);
  if (!round) return res.status(404).json({ message: "Round not found" });

  const score = await InterviewScore.create({
    roundId,
    interviewerName,
    criteriaScores,
    totalScore,
    decision,
    comments,
  });

  res.json({ success: true, score });
});

// -------------------- GET INTERVIEW DETAILS --------------------
const getInterviewDetails = asyncHandler(async (req, res) => {
  const { candidateId } = req.params;

  const interview = await Interview.findOne({
    where: { candidateId },
    include: {
      model: InterviewRound,
      as: "rounds",
      include: { model: InterviewScore, as: "scores" },
    },
  });

  if (!interview)
    return res.status(404).json({ message: "Interview not found" });

  res.json({ success: true, interview });
});

module.exports = {
  createInterview,
  addInterviewRound,
  addInterviewScore,
  getInterviewDetails,
  getCandidatesOverview,
};

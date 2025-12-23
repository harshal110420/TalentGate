const asyncHandler = require("express-async-handler");
const { DashMatrixDB } = require("../../models");
const {
  Candidate,
  JobOpening,
  ExamResult,
  Department,
  Interview,
  InterviewPanel,
  User,
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
    "Interview Rescheduled",
    "Interview Completed",
    "Interview Cancelled",
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
      {
        model: Interview,
        as: "interviews",
        attributes: [
          "id",
          "round",
          "status",
          "interviewDate",
          "startTime",
          "endTime",
        ],
        where: {
          status: "Scheduled",
        },
        required: false,
        limit: 1,
        order: [["createdAt", "DESC"]],
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

const createInterview = async (req, res) => {
  try {
    const {
      candidateId,
      jobId,
      round,
      interviewType,
      interviewDate,
      startTime,
      endTime,
      status,
      meetingLink,
      location,
      notes,
      panel, // [{ userId, role }]
    } = req.body;

    const createdBy = req.user.id; // 🔐 Always from token

    // =============================
    // BASIC VALIDATION
    // =============================
    if (
      !candidateId ||
      !jobId ||
      !round ||
      !interviewDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // =============================
    // CANDIDATE VALIDATION
    // =============================
    const candidate = await Candidate.findByPk(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (candidate.applicationStage !== "Shortlisted for Interview") {
      return res.status(400).json({
        message:
          "Candidate is not eligible for interview. Stage must be 'Shortlisted for Interview'.",
      });
    }

    // =============================
    // CREATE INTERVIEW
    // =============================
    const interview = await Interview.create({
      candidateId,
      jobId,
      round,
      interviewType: interviewType || "Online",
      interviewDate,
      startTime,
      endTime,
      status: status || "Scheduled",
      meetingLink,
      location,
      notes,
      createdBy,
    });

    // =============================
    // UPDATE CANDIDATE STAGE
    // =============================
    await candidate.update({
      applicationStage: "Interview Scheduled",
      interviewScheduledAt: new Date(),
    });

    // =============================
    // PANEL VALIDATION + INSERT
    // =============================
    if (panel && Array.isArray(panel) && panel.length > 0) {
      const allowedRoles = ["Lead", "Panelist", "Observer"];

      const userIds = panel.map((p) => p.userId);

      // Fetch valid users
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ["id"],
      });

      const validUserIds = users.map((u) => u.id);

      // Check invalid users
      const invalidUsers = userIds.filter((id) => !validUserIds.includes(id));

      if (invalidUsers.length > 0) {
        return res.status(400).json({
          message: "Invalid panel members found",
          invalidUsers,
        });
      }

      const panelData = panel.map((p) => ({
        interviewId: interview.id,
        userId: p.userId,
        role: allowedRoles.includes(p.role) ? p.role : "Panelist",
        addedBy: createdBy,
      }));

      await InterviewPanel.bulkCreate(panelData);
    }

    return res.status(201).json({
      message: "Interview created successfully",
      interviewId: interview.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// -------------------- RESCHEDULE INTERVIEW --------------------

const rescheduleInterview = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const {
    interviewDate,
    startTime,
    endTime,
    interviewType,
    meetingLink,
    location,
    notes,
  } = req.body;

  // 1️⃣ Fetch old interview
  const oldInterview = await Interview.findByPk(interviewId);

  if (!oldInterview) {
    return res.status(404).json({ message: "Interview not found" });
  }

  if (oldInterview.status !== "Scheduled") {
    return res.status(400).json({
      message: "Only scheduled interviews can be rescheduled",
    });
  }

  // 2️⃣ Mark old interview as Rescheduled
  oldInterview.status = "Rescheduled";
  await oldInterview.save();

  // 3️⃣ Create new interview
  const newInterview = await Interview.create({
    candidateId: oldInterview.candidateId,
    jobId: oldInterview.jobId,
    round: oldInterview.round,
    interviewType,
    interviewDate,
    startTime,
    endTime,
    meetingLink,
    location,
    notes,
    createdBy: req.user.id, // HR
    status: "Scheduled",
    rescheduledFromId: oldInterview.id,
  });

  // 4️⃣ Update candidate stage
  await Candidate.update(
    {
      applicationStage: "Interview Rescheduled",
    },
    {
      where: { id: oldInterview.candidateId },
    }
  );

  res.json({
    message: "Interview rescheduled successfully",
    interview: newInterview,
  });
});

// -------------------- GET MY INTERVIEWS --------------------
// GET /api/interview/my
// ===============================
const getMyInterviews = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const interviews = await Interview.findAll({
    distinct: true, // 🔥 again important

    include: [
      {
        model: InterviewPanel,
        as: "panel",
        where: { userId },
        attributes: [],
      },
      {
        model: Candidate,
        as: "candidate",
        attributes: ["id", "name", "email", "mobile", "applicationStage"],
      },
      {
        model: JobOpening,
        as: "jobOpening",
        attributes: ["id", "jobCode", "title"],
      },
    ],

    order: [["interviewDate", "ASC"]],
  });

  res.status(200).json({
    success: true,
    interviews,
  });
});

// -------------------- GET ALL INTERVIEWS --------------------
// GET /api/interview
// ===============================
const getAllInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.findAll({
    distinct: true, // 🔥 VERY IMPORTANT

    include: [
      {
        model: Candidate,
        as: "candidate",
        attributes: ["id", "name", "email", "applicationStage"],
      },
      {
        model: JobOpening,
        as: "jobOpening",
        attributes: ["id", "jobCode", "title"],
      },
      {
        model: InterviewPanel,
        as: "panel",
        required: false, // 👈 safe join
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "mail"],
          },
        ],
      },
    ],

    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    success: true,
    interviews,
  });
});

module.exports = {
  getCandidatesOverview,
  createInterview,
  rescheduleInterview,
  getMyInterviews,
  getAllInterviews,
};

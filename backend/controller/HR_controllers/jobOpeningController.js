const asyncHandler = require("express-async-handler");
const { DashMatrixDB } = require("../../models");
const generateJobCode = require("../../utils/generateJobCode");

const { JobOpening, Department, Exam, User } = DashMatrixDB;

/* ======================================================
   ✅ CREATE JOB OPENING
====================================================== */
const createJobOpening = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  const {
    title,
    departmentId,
    designation,
    employmentType,
    location,
    minExperience,
    maxExperience,
    salaryMin,
    salaryMax,
    noticePeriod,
    requiredSkills,
    educationQualifications,
    jobDescription,
    vacancyCount,
    priorityLevel,
    examId,
    openingDate,
    closingDate,
    status,
    isPublished,
  } = req.body;

  if (
    !title ||
    !departmentId ||
    !designation ||
    !employmentType ||
    !location ||
    minExperience === undefined ||
    maxExperience === undefined ||
    !openingDate
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  if (Number(minExperience) > Number(maxExperience)) {
    return res.status(400).json({
      success: false,
      message: "Min experience cannot exceed max experience",
    });
  }

  if (
    salaryMin !== undefined &&
    salaryMax !== undefined &&
    Number(salaryMin) > Number(salaryMax)
  ) {
    return res.status(400).json({
      success: false,
      message: "SalaryMin cannot exceed SalaryMax",
    });
  }

  if (closingDate && new Date(openingDate) > new Date(closingDate)) {
    return res.status(400).json({
      success: false,
      message: "Opening date cannot exceed closing date",
    });
  }

  if (vacancyCount !== undefined && vacancyCount < 1) {
    return res.status(400).json({
      success: false,
      message: "Vacancy count must be at least 1",
    });
  }

  if (requiredSkills && !Array.isArray(requiredSkills)) {
    return res.status(400).json({
      success: false,
      message: "`requiredSkills` must be an array",
    });
  }

  const department = await Department.findByPk(departmentId);
  if (!department)
    return res
      .status(400)
      .json({ success: false, message: "Invalid department" });

  // ✅ AUTO JOB CODE GENERATION
  const jobCode = await generateJobCode();
  const duplicate = await JobOpening.findOne({ where: { jobCode } });
  if (duplicate)
    return res.status(409).json({
      success: false,
      message: "Job with this job code already exists",
    });

  const jobOpening = await JobOpening.create({
    jobCode,
    title,
    departmentId,
    designation,
    employmentType,
    location,
    minExperience,
    maxExperience,
    salaryMin,
    salaryMax,
    noticePeriod,
    requiredSkills,
    educationQualifications,
    jobDescription,
    vacancyCount,
    priorityLevel,
    examId,
    openingDate,
    closingDate,
    status,
    isPublished,

    createdBy: req.user?.id || null,
    updatedBy: req.user?.id || null,
  });

  res.status(201).json({
    success: true,
    message: "Job opening created successfully",
    data: jobOpening,
  });
});

/* ======================================================
   ✅ GET ALL JOB OPENINGS (FILTER SUPPORT)
====================================================== */
const getAllJobOpenings = asyncHandler(async (req, res) => {
  const {
    departmentId,
    examId,
    status,
    isPublished,
    employmentType,
    location,
  } = req.query;

  const where = {};

  if (departmentId) where.departmentId = departmentId;
  if (examId) where.examId = examId;
  if (status) where.status = status;
  if (employmentType) where.employmentType = employmentType;
  if (location) where.location = location;
  if (isPublished !== undefined) where.isPublished = isPublished === "true";

  console.log("Filters applied:", where);

  try {
    const jobs = await JobOpening.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: Exam,
          as: "exam",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "mail"],
          required: false,
        },
      ],
    });
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch job openings",
      error: err.message,
    });
  }
});

/* ======================================================
   ✅ GET SINGLE JOB OPENING
====================================================== */
const getJobOpeningById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await JobOpening.findByPk(id, {
    include: [
      { model: Department, as: "department", attributes: ["id", "name"] },
      { model: Exam, as: "exam", attributes: ["id", "name"] },
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName", "mail"],
      },
    ],
  });

  if (!job)
    return res.status(404).json({
      success: false,
      message: "Job opening not found",
    });

  res.json({ success: true, data: job });
});

/* ======================================================
   ✅ UPDATE JOB OPENING
====================================================== */
const updateJobOpening = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await JobOpening.findByPk(id);
  if (!job)
    return res
      .status(404)
      .json({ success: false, message: "Job opening not found" });

  await job.update({
    ...req.body,
    updatedBy: req.user?.id || null,
  });

  res.json({
    success: true,
    message: "Job opening updated successfully",
    data: job,
  });
});

/* ======================================================
   ✅ DELETE JOB OPENING
====================================================== */
const deleteJobOpening = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await JobOpening.findByPk(id);

  if (!job)
    return res
      .status(404)
      .json({ success: false, message: "Job opening not found" });

  await job.destroy();

  res.json({
    success: true,
    message: "Job opening deleted successfully",
  });
});

module.exports = {
  createJobOpening,
  getAllJobOpenings,
  getJobOpeningById,
  updateJobOpening,
  deleteJobOpening,
};

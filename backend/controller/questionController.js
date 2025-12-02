const asyncHandler = require("express-async-handler");
// const { QuestionBank, Subject, Level, Department } = require("../models"); // adjust if your index exports differently
const { Op } = require("sequelize");
const XLSX = require("xlsx");
const { DashMatrixDB } = require("../models");
const { QuestionBank, Subject, Level, Department } = DashMatrixDB;

// Create Question
const createQuestion = asyncHandler(async (req, res) => {
  const {
    question,
    options,
    correct,
    subjectId,
    levelId,
    departmentId,
    timeLimit,
    isActive = true,
  } = req.body;

  // Basic validation
  if (!question || !options || !correct) {
    return res.status(400).json({ message: "Required fields missing" });
  }
  // Normalize options and correct before save
  const normalizedOptions = options.map((opt) => String(opt).trim());
  const normalizedCorrect = String(correct).trim();

  const newQuestion = await QuestionBank.create({
    question,
    options: normalizedOptions,
    correct: normalizedCorrect,
    subjectId,
    levelId,
    departmentId,
    timeLimit,
    isActive,
    createdBy: req.user?.id,
  });

  res.status(201).json({
    message: "Question created successfully",
    question: newQuestion,
  });
});

// Get All Questions with pagination & filters
const getAllQuestions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 30,
    subjectId,
    levelId,
    departmentId,
    search = "",
    isActive = "all",
  } = req.query;

  const filters = {};
  if (isActive !== "all") {
    filters.isActive = isActive === "true";
  }
  if (subjectId && !isNaN(Number(subjectId)) && subjectId !== "")
    filters.subjectId = subjectId;
  if (levelId && !isNaN(Number(levelId)) && levelId !== "")
    filters.levelId = levelId;
  if (departmentId && !isNaN(Number(departmentId)) && departmentId !== "")
    filters.departmentId = departmentId;
  if (search) filters.question = { [Op.like]: `%${search}%` };

  const offset = (page - 1) * limit;

  const { count, rows } = await QuestionBank.findAndCountAll({
    where: filters,
    include: [
      { model: Subject, attributes: ["id", "name"], as: "subject" },
      { model: Level, attributes: ["id", "name"], as: "level" },
      { model: Department, attributes: ["id", "name"], as: "department" },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["id", "DESC"]],
  });

  res.status(200).json({
    message: "Questions fetched successfully",
    questions: rows,
    total: count,
    currentPage: parseInt(page),
    totalPages: Math.ceil(count / limit),
  });
});

// Get Single Question by ID
const getSingleQuestion = asyncHandler(async (req, res) => {
  const question = await QuestionBank.findByPk(req.params.id, {
    include: [
      {
        model: Department,
        as: "department",
        attributes: ["id", "name"],
      },
      {
        model: Subject,
        as: "subject",
        attributes: ["id", "name"],
      },
      {
        model: Level,
        as: "level",
        attributes: ["id", "name"],
      },
    ],
  });
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  res.status(200).json({ message: "Question found", question });
});

// Update Question
const updateQuestion = asyncHandler(async (req, res) => {
  const question = await QuestionBank.findByPk(req.params.id);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const {
    question: questionText,
    options,
    correct,
    subjectId,
    levelId,
    departmentId,
    timeLimit,
    isActive,
  } = req.body;

  await question.update({
    question: questionText ?? question.question,
    options: options ? options.map((o) => String(o).trim()) : question.options,
    correct: correct ? String(correct).trim() : question.correct,
    subjectId: subjectId ?? question.subjectId,
    levelId: levelId ?? question.levelId,
    departmentId: departmentId ?? question.departmentId,
    timeLimit: timeLimit ?? question.timeLimit,
    isActive: typeof isActive === "boolean" ? isActive : question.isActive,
  });

  res.status(200).json({ message: "Question updated successfully", question });
});

// Delete Question (soft delete by setting isActive = false, or hard delete)
const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await QuestionBank.findByPk(req.params.id);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  // Option 1: Soft delete
  await question.update({ isActive: false });

  // Option 2: Hard delete
  // await question.destroy();

  res.status(200).json({ message: "Question deleted successfully" });
});

// Toggle isActive status
const toggleActiveQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const question = await QuestionBank.findByPk(id);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  question.isActive = !question.isActive;
  await question.save();
  res.status(200).json({
    message: `Question ${
      question.isActive ? "activated" : "deactivated"
    } successfully`,
    question,
  });
});

const bulkUploadQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required." });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const questions = [];

    for (const row of rows) {
      const department = await Department.findOne({
        where: { name: row.department },
      });
      if (!department) {
        return res.status(400).json({
          message: `Department '${row.department}' not found. Please check or create it first.`,
        });
      }

      const subject = await Subject.findOne({ where: { name: row.subject } });
      if (!subject) {
        return res.status(400).json({
          message: `Subject '${row.subject}' not found. Please check or create it first.`,
        });
      }

      let level = null;
      if (row.level) {
        level = await Level.findOne({ where: { name: row.level } });
        if (!level) {
          return res.status(400).json({
            message: `Level '${row.level}' not found. Please check or create it first.`,
          });
        }
      }

      // Normalize options
      let options = [row.option1, row.option2, row.option3, row.option4]
        .filter(Boolean)
        .map((o) => String(o).trim());

      // Normalize correct answer
      const correct = String(row.correct).trim();

      // Match correct answer
      if (!options.includes(correct)) {
        return res.status(400).json({
          message: `Correct answer '${correct}' does not match any option for question: '${row.question}'`,
        });
      }

      // Push into array
      questions.push({
        departmentId: department.id,
        subjectId: subject.id,
        levelId: level?.id || null,
        question: row.question,
        options,
        correct,
        timeLimit: row.timeLimit || 60,
        isActive: String(row.isActive).trim().toLowerCase() === "true",
        createdBy: req.user?.id || null,
        updatedBy: req.user?.id || null,
      });
    }

    await QuestionBank.bulkCreate(questions);
    res.status(201).json({ message: "Questions uploaded successfully" });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const exportQuestionsToExcel = async (req, res) => {
  try {
    const questions = await QuestionBank.findAll({
      include: [
        { model: Department, as: "department", attributes: ["name"] },
        { model: Subject, as: "subject", attributes: ["name"] },
        { model: Level, as: "level", attributes: ["name"] },
      ],
    });

    const data = questions.map((q) => ({
      id: q.id,
      department: q.department?.name,
      subject: q.subject?.name,
      level: q.level?.name,
      question: q.question,
      options: JSON.stringify(q.options),
      correct: q.correct,
      timeLimit: q.timeLimit,
      isActive: q.isActive,
      createdAt: q.created_at,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=questions.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getSingleQuestion,
  updateQuestion,
  deleteQuestion,
  toggleActiveQuestion,
  bulkUploadQuestions,
  exportQuestionsToExcel,
};

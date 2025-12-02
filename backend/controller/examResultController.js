// controllers/examResultController.js

const { DashMatrixDB } = require("../models");
const { ExamResult, Candidate, Exam, QuestionBank, Department, Level } =
  DashMatrixDB;
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

// controllers/examResultController.js
const getAllExamResults = async (req, res) => {
  try {
    const results = await ExamResult.findAll({
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id", "name", "email"],
        },
        {
          model: Exam,
          as: "exam",
          attributes: ["id", "name", "departmentId", "levelId"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // ✅ Count per (candidateId + examId)
    const attemptCount = {};
    results.forEach((r) => {
      const key = `${r.candidateId}_${r.examId}`;
      attemptCount[key] = (attemptCount[key] || 0) + 1;
    });

    // ✅ Add multipleAttempts flag
    const enrichedResults = results.map((r) => ({
      id: r.id,
      candidateId: r.candidateId,
      candidateName: r.Candidate?.name,
      examId: r.examId,
      examName: r.Exam?.name,
      resultStatus: r.resultStatus,
      score: r.score,
      multipleAttempts: attemptCount[`${r.candidateId}_${r.examId}`] > 1,
    }));

    return res.status(200).json({
      success: true,
      data: enrichedResults,
    });
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam results.",
      error: error.message,
    });
  }
};

// Get single result with full details
// controllers/examResultController.js

const getExamResultById = async (req, res) => {
  try {
    const { id } = req.params;

    const examResult = await ExamResult.findOne({
      where: { id },
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id", "name", "email"],
        },
        {
          model: Exam,
          as: "exam",
          attributes: ["id", "name", "positiveMarking", "negativeMarking"],
        },
      ],
    });

    if (!examResult) {
      return res
        .status(404)
        .json({ success: false, message: "Exam result not found" });
    }

    // Fetch all question details for the candidateResponses
    const questionIds = examResult.candidateResponses.map((q) => q.questionId);
    const questions = await QuestionBank.findAll({
      where: { id: questionIds },
      attributes: ["id", "question", "correct"],
    });

    // Merge question details into candidateResponses
    const candidateResponses = examResult.candidateResponses.map((q) => {
      const question = questions.find((ques) => ques.id === q.questionId);
      return {
        ...q,
        question: question?.question || "[Question missing]",
        correctAnswer: question
          ? String(question.correct).trim()
          : "[Correct answer missing]",
      };
    });

    const resultWithDetails = {
      ...examResult.toJSON(),
      candidateResponses,
      candidateName: examResult.candidate.name,
      examName: examResult.exam.name,
      skipped: examResult.skipped || 0,
    };

    res.json({ success: true, data: resultWithDetails });
  } catch (err) {
    console.error("Error fetching exam result by ID:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// controllers/examResultController.js

const getExamResultsGroupedByCandidate = async (req, res) => {
  try {
    const results = await ExamResult.findAll({
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id", "name", "email"],
          include: [
            { model: Department, as: "department", attributes: ["id", "name"] },
          ],
        },
        {
          model: Exam,
          as: "exam",
          attributes: ["id", "name"],
          include: [
            { model: Department, as: "department", attributes: ["id", "name"] },
            { model: Level, as: "level", attributes: ["id", "name"] },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // ✅ Group results by candidateId
    const grouped = {};
    results.forEach((r) => {
      const cid = r.candidateId;
      if (!grouped[cid]) {
        grouped[cid] = {
          candidateId: cid,
          candidateName: r.candidate?.name,
          email: r.candidate?.email,
          candidateDepartment: r.candidate?.department?.name || "N/A",
          exams: [],
        };
      }

      grouped[cid].exams.push({
        id: r.id,
        examId: r.examId,
        examName: r.exam?.name,
        examDepartment: r.exam?.department?.name || "N/A",
        examLevel: r.exam?.level?.name || "N/A",
        resultStatus: r.resultStatus,
        score: r.score,
        submittedAt: r.submittedAt,
      });
    });

    return res.status(200).json({
      success: true,
      data: Object.values(grouped),
    });
  } catch (error) {
    console.error("Error fetching grouped exam results:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch grouped data" });
  }
};

// ================================================================ //

// const generateExamResultPDF = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch result with candidate and exam info
//     const examResult = await ExamResult.findOne({
//       where: { id },
//       include: [
//         {
//           model: Candidate,
//           as: "candidate",
//           include: [{ model: Department, as: "department" }],
//         },
//         {
//           model: Exam,
//           as: "exam",
//           include: [
//             { model: Department, as: "department" },
//             { model: Level, as: "level" },
//           ],
//         },
//       ],
//     });

//     if (!examResult) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Exam result not found" });
//     }

//     // --- Initialize PDF ---
//     const doc = new PDFDocument({ margin: 20 });
//     let buffers = [];
//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", () => {
//       const pdfData = Buffer.concat(buffers);
//       res
//         .writeHead(200, {
//           "Content-Type": "application/pdf",
//           "Content-Disposition": `attachment; filename=ExamResult_${examResult.candidate.name}.pdf`,
//           "Content-Length": pdfData.length,
//         })
//         .end(pdfData);
//     });

//     // --- Load and Register Poppins Font ---
//     const fontDir = path.join(__dirname, "../assets/fonts");
//     const regularFont = path.join(fontDir, "Poppins-Regular.ttf");
//     const boldFont = path.join(fontDir, "Poppins-Bold.ttf");
//     const boldMedium = path.join(fontDir, "Poppins-Medium.ttf");

//     if (fs.existsSync(regularFont) && fs.existsSync(boldFont)) {
//       doc.registerFont("Poppins", regularFont);
//       doc.registerFont("Poppins-Bold", boldFont);
//       doc.registerFont("Poppins-Medium", boldMedium);
//     } else {
//       console.warn(
//         "⚠️ Poppins font files not found, falling back to Helvetica."
//       );
//       doc.registerFont("Poppins", "Helvetica");
//       doc.registerFont("Poppins-Bold", "Helvetica-Bold");
//       doc.registerFont("Poppins-Medium", "Helvetica-Bold");
//     }

//     // --- Logo ---
//     const logoPath = path.join(
//       __dirname,
//       "../assets/images/dinshaw-logo-red-text.png"
//     );

//     if (fs.existsSync(logoPath)) {
//       const logoWidth = 200; // your logo display width
//       const pageWidth = doc.page.width; // total PDF page width

//       // Calculate X so the image is perfectly centered
//       const centerX = (pageWidth - logoWidth) / 2;

//       doc.image(logoPath, centerX, -30, { width: logoWidth });
//     }
//     // --- Header ---
//     doc.moveDown(3);
//     doc
//       .fontSize(22)
//       .font("Poppins-Medium")
//       .text("Dinshaw's Dairy Food Pvt. Ltd.", { align: "center" });
//     doc
//       .fontSize(14)
//       .font("Poppins")
//       .text("Exam Result Report", { align: "center" });
//     doc.moveDown(15);
//     doc.moveTo(50, 140).lineTo(550, 140).stroke();

//     // --- Candidate Info Section ---
//     doc.moveDown(1.5);
//     doc
//       .fontSize(12)
//       .font("Poppins-Bold")
//       .text("Candidate Information", 55, 150);

//     const infoTop = 170;
//     const infoHeight = 100;
//     doc
//       .roundedRect(50, infoTop, 500, infoHeight, 8)
//       .strokeColor("#333")
//       .lineWidth(1)
//       .stroke();

//     doc.font("Poppins").fontSize(11);
//     const leftX = 60;
//     const rightX = 300;
//     let lineY = infoTop + 20;

//     doc.text(`Name: ${examResult.candidate.name}`, leftX, lineY);
//     doc.text(`Email: ${examResult.candidate.email}`, rightX, lineY);
//     lineY += 20;
//     doc.text(`Exam: ${examResult.exam.name}`, leftX, lineY);
//     doc.text(
//       `Exam Date: ${new Date(examResult.submittedAt).toLocaleDateString()}`,
//       rightX,
//       lineY
//     );
//     lineY += 20;

//     const departmentName =
//       examResult.exam?.department?.name ||
//       examResult.candidate?.department?.name ||
//       "N/A";
//     const levelName = examResult.exam?.level?.name || "N/A";

//     doc.text(`Department: ${departmentName}`, leftX, lineY);
//     doc.text(`Level: ${levelName}`, rightX, lineY);

//     // --- Result Summary Section ---
//     const summaryTop = infoTop + infoHeight + 40;
//     doc
//       .fontSize(12)
//       .font("Poppins-Bold")
//       .text("Result Summary", 55, summaryTop);

//     const summaryHeight = 120;
//     doc
//       .roundedRect(50, summaryTop + 20, 500, summaryHeight, 8)
//       .strokeColor("#333")
//       .lineWidth(1)
//       .stroke();

//     doc.font("Poppins").fontSize(11);
//     let sumY = summaryTop + 35;
//     doc.text(`Total Questions: ${examResult.totalQuestions}`, 60, sumY);
//     doc.text(`Attempted: ${examResult.attempted}`, 300, sumY);
//     sumY += 20;
//     doc.text(`Correct Answers: ${examResult.correctAnswers}`, 60, sumY);
//     doc.text(`Incorrect Answers: ${examResult.incorrectAnswers}`, 300, sumY);
//     sumY += 20;
//     doc.text(`Score: ${examResult.score}`, 60, sumY);
//     doc.text(`Skipped Questions: ${examResult.skipped}`, 300, sumY);
//     sumY += 20;
//     doc.text(
//       `Result Status: ${examResult.resultStatus.toUpperCase()}`,
//       300,
//       sumY
//     );

//     // --- Footer ---
//     doc.moveDown(5);
//     doc
//       .fontSize(10)
//       .font("Poppins")
//       .text("Authorized By: ____________________________", { align: "left" });
//     doc.moveDown(0.5);
//     doc.text(`Generated on: ${new Date().toLocaleString()}`, {
//       align: "right",
//     });

//     doc.end();
//   } catch (error) {
//     console.error("Error generating exam result PDF:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate PDF",
//     });
//   }
// };

const generateExamResultPDF = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Fetch result with candidate + exam + department + level
    const examResult = await ExamResult.findOne({
      where: { id },
      include: [
        {
          model: Candidate,
          as: "candidate",
          include: [{ model: Department, as: "department" }],
        },
        {
          model: Exam,
          as: "exam",
          include: [
            { model: Department, as: "department" },
            { model: Level, as: "level" },
          ],
        },
      ],
    });

    if (!examResult)
      return res
        .status(404)
        .json({ success: false, message: "Exam result not found" });

    const doc = new PDFDocument({ margin: 40 });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=ExamResult_${examResult.candidate.name}.pdf`,
        })
        .end(pdfData);
    });

    // ============================
    // 🏷 Font Registration
    // ============================
    const fontDir = path.join(__dirname, "../assets/fonts");
    const regularFont = path.join(fontDir, "Poppins-Regular.ttf");
    const boldFont = path.join(fontDir, "Poppins-Bold.ttf");
    const mediumFont = path.join(fontDir, "Poppins-Medium.ttf");

    if (fs.existsSync(regularFont) && fs.existsSync(boldFont)) {
      doc.registerFont("Poppins", regularFont);
      doc.registerFont("Poppins-Bold", boldFont);
      doc.registerFont("Poppins-Medium", mediumFont);
    } else {
      doc.registerFont("Poppins", "Helvetica");
      doc.registerFont("Poppins-Bold", "Helvetica-Bold");
      doc.registerFont("Poppins-Medium", "Helvetica-Bold");
    }

    // ============================
    // 🧾 HEADER SECTION
    // ============================
    const logoPath = path.join(
      __dirname,
      "../assets/images/dinshaw-logo-red-text.png"
    );
    if (fs.existsSync(logoPath)) {
      const logoWidth = 200; // your logo display width
      const pageWidth = doc.page.width; // total PDF page width

      // Calculate X so the image is perfectly centered
      const centerX = (pageWidth - logoWidth) / 2;

      doc.image(logoPath, centerX, -30, { width: logoWidth });
    }

    doc.moveDown(3);
    doc
      .font("Poppins-Bold")
      .fontSize(20)
      .text("Dinshaw’s Dairy Food Pvt. Ltd.", {
        align: "center",
      });
    doc.font("Poppins").fontSize(13).text("Exam Result Report", {
      align: "center",
    });
    doc.moveDown(1);
    doc.moveTo(50, 130).lineTo(550, 130).stroke();

    // ============================
    // 👤 Candidate Info
    // ============================
    const cTop = 150;
    doc
      .font("Poppins-Bold")
      .fontSize(12)
      .text("Candidate Information", 55, cTop);
    doc.roundedRect(50, cTop + 15, 500, 100, 8).stroke();

    const leftX = 60;
    const rightX = 300;
    let y = cTop + 30;
    const candidate = examResult.candidate;
    const exam = examResult.exam;

    doc.font("Poppins").fontSize(11);
    doc.text(`Name: ${candidate.name}`, leftX, y);
    doc.text(`Email: ${candidate.email}`, rightX, y);
    y += 20;
    doc.text(`Mobile: ${candidate.mobile || "N/A"}`, leftX, y);
    doc.text(`Exam: ${exam?.name}`, rightX, y);
    y += 20;
    doc.text(`Department: ${candidate?.department?.name || "N/A"}`, leftX, y);
    doc.text(
      `Exam Date: ${new Date(examResult.submittedAt).toLocaleDateString()}`,
      rightX,
      y
    );
    y += 20;
    doc.text(`Level: ${exam?.level?.name || "N/A"}`, leftX, y);

    // ============================
    // 📘 Exam Info
    // ============================
    const eTop = cTop + 140;
    doc.font("Poppins-Bold").fontSize(12).text("Exam Information", 55, eTop);
    doc.roundedRect(50, eTop + 15, 500, 70, 8).stroke();

    y = eTop + 30;
    doc.font("Poppins").fontSize(11);
    doc.text(`Total Questions: ${examResult.totalQuestions}`, leftX, y);
    doc.text(`Positive Mark: +${exam?.positiveMarking || 1}`, rightX, y);
    y += 20;
    doc.text(`Negative Mark: -${exam?.negativeMarking || 0}`, leftX, y);
    y += 20;
    doc.text(
      `Department: ${
        exam?.department?.name || candidate?.department?.name || "N/A"
      }`,
      leftX,
      y
    );

    // ============================
    // 📊 Result Summary
    // ============================
    const rTop = eTop + 110;
    doc.font("Poppins-Bold").fontSize(12).text("Result Summary", 55, rTop);
    doc.roundedRect(50, rTop + 15, 500, 100, 8).stroke();

    y = rTop + 30;
    const totalMarks = (exam?.positiveMarking || 1) * examResult.totalQuestions;

    doc.font("Poppins").fontSize(11);
    doc.text(`Attempted: ${examResult.attempted}`, leftX, y);
    doc.text(`Correct Answers: ${examResult.correctAnswers}`, rightX, y);
    y += 20;
    doc.text(`Incorrect Answers: ${examResult.incorrectAnswers}`, leftX, y);
    doc.text(`Skipped: ${examResult.skipped}`, rightX, y);
    y += 20;
    doc.text(`Score: ${examResult.score} / ${totalMarks}`, leftX, y);
    doc.text(`Result: ${examResult.resultStatus.toUpperCase()}`, rightX, y);

    // ============================
    // 🕒 Footer
    // ============================
    doc.moveDown(3);
    doc.font("Poppins").fontSize(11);
    doc.text("Authorized By: _________________________________", 55);
    doc.moveDown(1);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, {
      align: "right",
    });

    doc.end();
  } catch (error) {
    console.error("Error generating exam result PDF:", error);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
};

module.exports = {
  getAllExamResults,
  getExamResultById,
  getExamResultsGroupedByCandidate,
  generateExamResultPDF,
};

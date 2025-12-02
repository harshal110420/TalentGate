const cron = require("node-cron");

const { Op } = require("sequelize");
const { DashMatrixDB } = require("../models");
const { Candidate } = DashMatrixDB;

const expireStaleExams = async () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    const candidates = await Candidate.findAll({
      where: {
        examStatus: "In Progress",
        lastMailSentAt: { [Op.lt]: oneHourAgo },
      },
    });

    if (candidates.length === 0) {
      console.log("✅ [ExamExpiryCron] No stale candidates found.");
      return;
    }

    console.log(
      `⚙️ [ExamExpiryCron] Found ${candidates.length} stale candidates.`
    );

    // Update all in parallel (non-blocking)
    await Promise.all(
      candidates.map(async (candidate) => {
        candidate.examStatus = "Expired";
        await candidate.save();
        console.log(`✅ Candidate ${candidate.id} marked as Expired`);
      })
    );

    console.log("🕒 [ExamExpiryCron] Expiry check completed successfully.");
  } catch (err) {
    console.error("❌ [ExamExpiryCron] Error:", err.message);
  }
};

const startExamExpiryCron = () => {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      console.log("🔁 [ExamExpiryCron] Running exam expiry check...");
      await expireStaleExams();
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata", // optional but recommended
    }
  );
};

module.exports = startExamExpiryCron;

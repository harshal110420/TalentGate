const { DataTypes } = require("sequelize");
const { dashMatrixSequelize } = require("../config/db");

module.exports = () => {
  const Candidate = dashMatrixSequelize.define(
    "Candidate",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      /* =====================
          BASIC PROFILE
      ====================== */

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      experience: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      resumeUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      source: {
        type: DataTypes.ENUM("online", "offline"),
        defaultValue: "offline",
      },

      /* =====================
          JOB TRACKING
      ====================== */

      jobId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      jobCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // 🔑 SUMMARY FIELD (no dates here)
      applicationStage: {
        type: DataTypes.ENUM(
          "Applied",
          "Resume Reviewed",
          "Exam Assigned",
          "Exam Completed",
          "Interview Scheduled",
          "Interview Completed",
          "Selected",
          "Rejected",
          "Hired",
        ),
        defaultValue: "Applied",
      },

      /* =====================
          HR / SCREENING
      ====================== */

      assignedRecruiterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      resumeReviewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      resumeReviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      hrRating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 },
      },

      /* =====================
          OFFER / JOINING
      ====================== */

      joiningDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      /* =====================
          SYSTEM
      ====================== */

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "candidates",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return Candidate;
};

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
        allowNull: true, // Cloudinary link
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

      applicationStage: {
        type: DataTypes.ENUM(
          "Applied",
          "Resume Reviewed",
          "Shortlisted",
          "Exam Assigned",
          "Exam Completed",
          "Interview Scheduled",
          "Interview Passed",
          "Selected",
          "Rejected",
          "Hired"
        ),
        defaultValue: "Applied",
      },

      /* =====================
          INTERVIEW WORKFLOW
         ===================== */

      interviewDateTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      interviewMode: {
        type: DataTypes.ENUM("Online", "Offline", "Telephonic"),
        allowNull: true,
      },

      interviewLocation: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      interviewPanel: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      interviewRemarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      /* =====================
         OFFER / JOINING
       ===================== */

      joiningDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      /* =====================
          SCREENING / HR TOOLS
      ====================== */

      assignedRecruiterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      resumeReviewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      hrRating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5,
        },
      },

      /* =====================
          EXAM WORKFLOW
      ====================== */

      examId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      examStatus: {
        type: DataTypes.ENUM(
          "Not assigned",
          "Assigned",
          "In progress",
          "Completed",
          "Expired"
        ),
        defaultValue: "Not assigned",
      },

      lastMailSentAt: {
        type: DataTypes.DATE,
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
      timestamps: true, // will generate created_at, updated_at
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Candidate;
};

// models/JobOpening.js
const { DataTypes } = require("sequelize");
const { dashMatrixSequelize } = require("../../config/db"); // ✅ Import the correct Sequelize instance

module.exports = () => {
  const JobOpening = dashMatrixSequelize.define(
    "JobOpening",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      jobCode: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      designation: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      employmentType: {
        type: DataTypes.ENUM(
          "Full-Time",
          "Part-Time",
          "Contract",
          "Internship"
        ),
        allowNull: false,
      },

      location: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },

      minExperience: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      maxExperience: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      salaryMin: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      salaryMax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      noticePeriod: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      requiredSkills: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },

      educationQualifications: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      jobDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      vacancyCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      priorityLevel: {
        type: DataTypes.ENUM("Low", "Medium", "High"),
        allowNull: false,
        defaultValue: "Medium",
      },

      examId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      openingDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      closingDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("Draft", "Open", "Hold", "Closed", "Cancelled"),
        allowNull: false,
        defaultValue: "Open",
      },

      isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "job_openings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return JobOpening;
};

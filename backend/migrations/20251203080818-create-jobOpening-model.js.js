"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("job_openings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      jobCode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      designation: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      employmentType: {
        type: Sequelize.ENUM(
          "Full-Time",
          "Part-Time",
          "Contract",
          "Internship"
        ),
        allowNull: false,
      },

      location: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },

      minExperience: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      maxExperience: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      salaryMin: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      salaryMax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      noticePeriod: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      requiredSkills: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },

      educationQualifications: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      jobDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      vacancyCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      priorityLevel: {
        type: Sequelize.ENUM("Low", "Medium", "High"),
        allowNull: false,
        defaultValue: "Medium",
      },

      examId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      openingDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      closingDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("Draft", "Open", "Hold", "Closed", "Cancelled"),
        allowNull: false,
        defaultValue: "Open",
      },

      isPublished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("job_openings");
  },
};

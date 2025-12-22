"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("interview_scores", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      interviewId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "interviews",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      interviewerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // assuming your User table is 'users'
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      candidateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "candidates", // assuming your Candidate table is 'candidates'
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      round: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },

      recommendation: {
        type: Sequelize.ENUM("Strong Yes", "Yes", "Neutral", "No", "Strong No"),
        allowNull: true,
      },

      strengths: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      weaknesses: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("Draft", "Submitted"),
        defaultValue: "Draft",
        allowNull: false,
      },

      submittedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add unique index for interviewer + interview to prevent duplicates
    await queryInterface.addIndex(
      "interview_scores",
      ["interviewId", "interviewerId"],
      {
        unique: true,
        name: "unique_interview_interviewer",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("interview_scores");
  },
};

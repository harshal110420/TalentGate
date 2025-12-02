"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("exam_results", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // 🔗 FK to candidates
      candidateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "candidates",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      // 🔗 FK to exams
      examId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "exams",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      totalQuestions: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      attempted: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      correctAnswers: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      incorrectAnswers: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      skipped: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      candidateResponses: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      score: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      resultStatus: {
        type: Sequelize.ENUM("pass", "fail", "pending"),
        defaultValue: "pending",
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("exam_results");
  },
};

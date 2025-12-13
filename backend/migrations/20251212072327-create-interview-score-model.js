"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("interview_scores", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      roundId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "interview_rounds", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      interviewerName: { type: Sequelize.STRING, allowNull: false },
      criteriaScores: { type: Sequelize.JSON, allowNull: false },
      totalScore: { type: Sequelize.INTEGER, allowNull: false },
      decision: {
        type: Sequelize.ENUM("Hire", "Hold", "Reject"),
        defaultValue: "Hold",
      },
      comments: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("interview_scores");
  },
};

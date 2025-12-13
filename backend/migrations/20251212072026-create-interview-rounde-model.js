"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("interview_rounds", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      interviewId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "interviews", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      roundNumber: { type: Sequelize.INTEGER, allowNull: false },
      roundName: { type: Sequelize.STRING, allowNull: false },
      scheduledAt: { type: Sequelize.DATE, allowNull: true },
      mode: {
        type: Sequelize.ENUM("Online", "Offline", "Telephonic"),
        allowNull: true,
      },
      location: { type: Sequelize.STRING, allowNull: true },
      panelMembers: { type: Sequelize.JSON, allowNull: true },
      status: {
        type: Sequelize.ENUM("Scheduled", "In Progress", "Completed"),
        defaultValue: "Scheduled",
      },
      finalDecision: {
        type: Sequelize.ENUM("Pending", "Hire", "Hold", "Reject"),
        defaultValue: "Pending",
      },
      remarks: { type: Sequelize.TEXT, allowNull: true },
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
    await queryInterface.dropTable("interview_rounds");
  },
};

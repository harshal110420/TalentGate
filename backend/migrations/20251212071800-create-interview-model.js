"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("interviews", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      candidateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "candidates", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      jobId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "job_openings", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("Scheduled", "In Progress", "Completed"),
        defaultValue: "Scheduled",
      },
      overallResult: {
        type: Sequelize.ENUM("Pending", "Hire", "Hold", "Reject"),
        defaultValue: "Pending",
      },
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
    await queryInterface.dropTable("interviews");
  },
};

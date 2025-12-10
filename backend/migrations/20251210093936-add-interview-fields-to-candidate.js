"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("candidates", "interviewDateTime", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "interviewMode", {
      type: Sequelize.ENUM("Online", "Offline", "Telephonic"),
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "interviewLocation", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "interviewPanel", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "interviewRemarks", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("candidates", "interviewDateTime");
    await queryInterface.removeColumn("candidates", "interviewMode");
    await queryInterface.removeColumn("candidates", "interviewLocation");
    await queryInterface.removeColumn("candidates", "interviewPanel");
    await queryInterface.removeColumn("candidates", "interviewRemarks");

    // ✅ Required cleanup for ENUM
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_candidates_interviewMode";`
    );
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("candidates", "resumeReviewedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "shortlistedForExamAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "shortlistedForInterviewAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "examReassignedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "examCompletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "interviewScheduledAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "interviewCompletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "selectedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "rejectedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("candidates", "resumeReviewedAt");
    await queryInterface.removeColumn("candidates", "shortlistedForExamAt");
    await queryInterface.removeColumn(
      "candidates",
      "shortlistedForInterviewAt"
    );
    await queryInterface.removeColumn("candidates", "examReassignedAt");
    await queryInterface.removeColumn("candidates", "examCompletedAt");
    await queryInterface.removeColumn("candidates", "interviewScheduledAt");
    await queryInterface.removeColumn("candidates", "interviewCompletedAt");
    await queryInterface.removeColumn("candidates", "selectedAt");
    await queryInterface.removeColumn("candidates", "rejectedAt");
  },
};

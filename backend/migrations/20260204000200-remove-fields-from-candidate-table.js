"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove exam related columns from candidates table

    await queryInterface.removeColumn("candidates", "examId");
    await queryInterface.removeColumn("candidates", "examStatus");
    await queryInterface.removeColumn("candidates", "lastMailSentAt");

    await queryInterface.removeColumn("candidates", "examAssignedAt");
    await queryInterface.removeColumn("candidates", "examReassignedAt");
    await queryInterface.removeColumn("candidates", "examCompletedAt");
  },

  async down(queryInterface, Sequelize) {
    // Rollback: add exam related columns back

    await queryInterface.addColumn("candidates", "examId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "examStatus", {
      type: Sequelize.ENUM(
        "Not assigned",
        "Assigned",
        "In progress",
        "Completed",
        "Disqualified",
        "Expired",
      ),
      allowNull: false,
      defaultValue: "Not assigned",
    });

    await queryInterface.addColumn("candidates", "lastMailSentAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "examAssignedAt", {
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
  },
};

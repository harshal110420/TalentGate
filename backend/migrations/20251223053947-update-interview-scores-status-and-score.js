"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Make score nullable
    await queryInterface.changeColumn("interview_scores", "score", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    });

    // 2️⃣ Update status enum to include 'Locked'
    await queryInterface.changeColumn("interview_scores", "status", {
      type: Sequelize.ENUM("Draft", "Submitted", "Locked"),
      defaultValue: "Draft",
    });
  },

  async down(queryInterface, Sequelize) {
    // revert status enum
    await queryInterface.changeColumn("interview_scores", "status", {
      type: Sequelize.ENUM("Draft", "Submitted"),
      defaultValue: "Draft",
    });

    // revert score to NOT NULL
    await queryInterface.changeColumn("interview_scores", "score", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
    });
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("candidates", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mobile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      experience: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      examId: {
        // optional, remove if not needed
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      examStatus: {
        type: Sequelize.ENUM(
          "Not assigned",
          "Assigned",
          "In progress",
          "Completed",
          "Expired"
        ),
        defaultValue: "Not assigned",
      },
      lastMailSentAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("candidates");
  },
};

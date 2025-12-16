"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("interview_panels", {
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

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      role: {
        type: Sequelize.ENUM("Lead", "Panelist", "Observer"),
        allowNull: false,
        defaultValue: "Panelist",
      },

      status: {
        type: Sequelize.ENUM("Invited", "Accepted", "Declined"),
        allowNull: false,
        defaultValue: "Invited",
      },

      addedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Prevent same interviewer added twice to same interview
    await queryInterface.addConstraint("interview_panels", {
      fields: ["interviewId", "userId"],
      type: "unique",
      name: "unique_interview_panel_member",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("interview_panels");
  },
};

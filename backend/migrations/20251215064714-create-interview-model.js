"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("interviews", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

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

      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "job_openings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      round: {
        type: Sequelize.STRING, // HR, Technical, Managerial
        allowNull: false,
      },

      interviewType: {
        type: Sequelize.ENUM("Online", "Offline", "Telephonic"),
        allowNull: false,
        defaultValue: "Online",
      },

      interviewDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
          "Scheduled",
          "Completed",
          "Cancelled",
          "Rescheduled",
          "No Show"
        ),
        allowNull: false,
        defaultValue: "Scheduled",
      },

      meetingLink: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      rescheduledFromId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "interviews",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      cancelReason: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("interviews");
  },
};

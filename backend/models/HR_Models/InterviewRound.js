const { DataTypes } = require("sequelize");
const { dashMatrixSequelize } = require("../../config/db");

module.exports = () => {
  const InterviewRound = dashMatrixSequelize.define(
    "InterviewRound",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      interviewId: { type: DataTypes.INTEGER, allowNull: false },
      roundNumber: { type: DataTypes.INTEGER, allowNull: false },
      roundName: { type: DataTypes.STRING, allowNull: false },
      scheduledAt: { type: DataTypes.DATE, allowNull: true },
      mode: {
        type: DataTypes.ENUM("Online", "Offline", "Telephonic"),
        allowNull: true,
      },
      location: { type: DataTypes.STRING, allowNull: true },
      panelMembers: { type: DataTypes.JSON, allowNull: true },
      status: {
        type: DataTypes.ENUM("Scheduled", "In Progress", "Completed"),
        defaultValue: "Scheduled",
      },
      finalDecision: {
        type: DataTypes.ENUM("Pending", "Hire", "Hold", "Reject"),
        defaultValue: "Pending",
      },
      remarks: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "interview_rounds",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return InterviewRound;
};

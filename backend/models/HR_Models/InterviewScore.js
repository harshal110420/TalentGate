const { DataTypes } = require("sequelize");
const { dashMatrixSequelize } = require("../../config/db");

module.exports = () => {
  const InterviewScore = dashMatrixSequelize.define(
    "InterviewScore",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      roundId: { type: DataTypes.INTEGER, allowNull: false },
      interviewerName: { type: DataTypes.STRING, allowNull: false },
      criteriaScores: { type: DataTypes.JSON, allowNull: false },
      totalScore: { type: DataTypes.INTEGER, allowNull: false },
      decision: {
        type: DataTypes.ENUM("Hire", "Hold", "Reject"),
        defaultValue: "Hold",
      },
      comments: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "interview_scores",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return InterviewScore;
};

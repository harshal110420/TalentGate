const { DataTypes } = require("sequelize");
const { dashMatrixSequelize } = require("../../config/db");

module.exports = () => {
  const Interview = dashMatrixSequelize.define(
    "Interview",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      candidateId: { type: DataTypes.INTEGER, allowNull: false },
      jobId: { type: DataTypes.INTEGER, allowNull: true },
      status: {
        type: DataTypes.ENUM("Scheduled", "In Progress", "Completed"),
        defaultValue: "Scheduled",
      },
      overallResult: {
        type: DataTypes.ENUM("Pending", "Hire", "Hold", "Reject"),
        defaultValue: "Pending",
      },
    },
    {
      tableName: "interviews",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Interview;
};

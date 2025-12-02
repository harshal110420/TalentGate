const { DataTypes } = require("sequelize");
const { dashMatrixSequelize } = require("../config/db"); // ✅ Import the correct Sequelize instance

module.exports = () => {
  const QuestionBank = dashMatrixSequelize.define(
    "QuestionBank",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      question: { type: DataTypes.TEXT, allowNull: false },
      options: { type: DataTypes.JSON, allowNull: false },
      correct: { type: DataTypes.STRING, allowNull: false },
      subjectId: { type: DataTypes.INTEGER, allowNull: true },
      levelId: { type: DataTypes.INTEGER, allowNull: true },
      departmentId: { type: DataTypes.INTEGER, allowNull: true },
      timeLimit: { type: DataTypes.INTEGER },
      createdBy: { type: DataTypes.INTEGER },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "questionBank",
      timestamps: false,
    }
  );

 

  return QuestionBank;
};

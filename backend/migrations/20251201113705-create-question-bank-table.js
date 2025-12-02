"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("questionBank", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      options: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      correct: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      subjectId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "subjects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      levelId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "levels",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "departments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      timeLimit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("questionBank");
  },
};

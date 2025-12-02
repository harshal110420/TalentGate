"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("modules", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      moduleId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      }, // e.g., ACCOUNTS

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      path: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      version: {
        type: Sequelize.STRING,
        defaultValue: "1.0",
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      orderBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("modules");
  },
};

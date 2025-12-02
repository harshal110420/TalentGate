"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("menus", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      parentCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      moduleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Uncomment this when modules table exists
        // references: { model: "modules", key: "id" },
        // onDelete: "CASCADE",
        // onUpdate: "CASCADE",
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM("Master", "Transaction", "Report"),
        allowNull: false,
      },

      menuId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
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
    await queryInterface.dropTable("menus");
  },
};

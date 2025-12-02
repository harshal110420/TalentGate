"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 🔵 1. roleId → roles.id
    await queryInterface.addConstraint("users", {
      fields: ["roleId"],
      type: "foreign key",
      name: "fk_users_roleId",
      references: {
        table: "roles",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Optional — user remain even if role is deleted
    });

    // 🔵 2. departmentId → departments.id
    await queryInterface.addConstraint("users", {
      fields: ["departmentId"],
      type: "foreign key",
      name: "fk_users_departmentId",
      references: {
        table: "departments",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("users", "fk_users_roleId");
    await queryInterface.removeConstraint("users", "fk_users_departmentId");
  },
};

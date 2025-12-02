"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("menus", {
      fields: ["moduleId"],
      type: "foreign key",
      name: "fk_menus_moduleId", // custom FK name
      references: {
        table: "modules",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("menus", "fk_menus_moduleId");
  },
};

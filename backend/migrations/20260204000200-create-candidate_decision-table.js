"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("candidate_decisions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      /* =====================
          RELATIONS
      ====================== */

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
      },

      /* =====================
          FINAL DECISION
      ====================== */

      decision: {
        type: Sequelize.ENUM("Selected", "Rejected", "On Hold"),
        allowNull: false,
      },

      decisionAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      decisionBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      /* =====================
          SYSTEM
      ====================== */

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      /* =====================
          TIMESTAMPS
      ====================== */

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
      },
    });

    /* =====================
        INDEXES
    ====================== */

    await queryInterface.addIndex("candidate_decisions", ["candidateId"]);
    await queryInterface.addIndex("candidate_decisions", ["jobId"]);
    await queryInterface.addIndex("candidate_decisions", ["decision"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("candidate_decisions");

    // ENUM cleanup (important for MySQL)
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_candidate_decisions_decision;",
    );
  },
};

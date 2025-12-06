"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("candidates", "resumeUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "source", {
      type: Sequelize.ENUM("online", "offline"),
      defaultValue: "offline",
    });

    await queryInterface.addColumn("candidates", "jobId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "jobCode", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "applicationStage", {
      type: Sequelize.ENUM(
        "Applied",
        "Resume Reviewed",
        "Shortlisted",
        "Interview Scheduled",
        "Interview Passed",
        "Exam Assigned",
        "Selected",
        "Rejected",
        "Hired"
      ),
      defaultValue: "Applied",
    });

    await queryInterface.addColumn("candidates", "assignedRecruiterId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "remarks", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("candidates", "resumeReviewed", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn("candidates", "hrRating", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("candidates", "resumeUrl");
    await queryInterface.removeColumn("candidates", "source");
    await queryInterface.removeColumn("candidates", "jobId");
    await queryInterface.removeColumn("candidates", "jobCode");

    await queryInterface.removeColumn("candidates", "applicationStage");
    await queryInterface.removeColumn("candidates", "assignedRecruiterId");
    await queryInterface.removeColumn("candidates", "remarks");
    await queryInterface.removeColumn("candidates", "resumeReviewed");
    await queryInterface.removeColumn("candidates", "hrRating");

    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_candidates_source;"
    );

    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_candidates_applicationStage;"
    );
  },
};

const { Sequelize } = require("sequelize");
const { dashMatrixSequelize, sequelizeWebsite } = require("../config/db");

// ==============================
// 🧩 MODEL IMPORTS (Talent Gate)
// ==============================
const Candidate = require("./Candidate")(dashMatrixSequelize);
const Department = require("./Department")(dashMatrixSequelize);
const Exam = require("./Exam")(dashMatrixSequelize);
const ExamResult = require("./ExamResult")(dashMatrixSequelize);
const Level = require("./Level")(dashMatrixSequelize);
const Module = require("./ModuleModel")(dashMatrixSequelize);
const Menu = require("./MenuModel")(dashMatrixSequelize);
const Permission = require("./Permission")(dashMatrixSequelize);
const QuestionBank = require("./QuestionBank")(dashMatrixSequelize);
const Role = require("./Role")(dashMatrixSequelize);
const Subject = require("./Subject")(dashMatrixSequelize);
const User = require("./User")(dashMatrixSequelize);
const UserPermission = require("./UserPermission")(dashMatrixSequelize);

// ==============================
// 📦 CREATE DB OBJECT FIRST
// ==============================
const DashMatrixDB = {
  sequelize: dashMatrixSequelize,
  Sequelize,
  Candidate,
  Department,
  Exam,
  ExamResult,
  Level,
  Module,
  Menu,
  Permission,
  QuestionBank,
  Role,
  Subject,
  User,
  UserPermission,
};

// ==============================
// 🔗 MANUAL ASSOCIATIONS (ORDERED)
// ==============================

// --- Module ↔ Menu
Module.hasMany(Menu, { foreignKey: "moduleId", as: "menus" });
Menu.belongsTo(Module, { foreignKey: "moduleId", as: "module" });

// --- Role ↔ Permission ↔ Menu
Role.hasMany(Permission, { foreignKey: "roleId", as: "permissions" });
Permission.belongsTo(Role, { foreignKey: "roleId", as: "role" });

Menu.hasMany(Permission, { foreignKey: "menuId", as: "permissions" });
Permission.belongsTo(Menu, { foreignKey: "menuId", as: "menu" });

// --- User ↔ UserPermission ↔ Menu
User.hasMany(UserPermission, { foreignKey: "userId", as: "userPermissions" });
UserPermission.belongsTo(User, { foreignKey: "userId", as: "user" });

Menu.hasMany(UserPermission, { foreignKey: "menuId", as: "userPermissions" });
UserPermission.belongsTo(Menu, { foreignKey: "menuId", as: "menu" });

// --- Department ↔ User
Department.hasMany(User, { foreignKey: "departmentId", as: "users" });
User.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

// --- Department ↔ Candidate
Department.hasMany(Candidate, { foreignKey: "departmentId", as: "candidates" });
Candidate.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
});

// --- Department ↔ Exam
Department.hasMany(Exam, { foreignKey: "departmentId", as: "exams" });
Exam.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

// --- Department ↔ Subject
Department.hasMany(Subject, { foreignKey: "departmentId", as: "subjects" });
Subject.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

// --- Department ↔ QuestionBank
Department.hasMany(QuestionBank, {
  foreignKey: "departmentId",
  as: "questions",
});

QuestionBank.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
});

// --- Subject ↔ QuestionBank
Subject.hasMany(QuestionBank, { foreignKey: "subjectId", as: "questions" });
QuestionBank.belongsTo(Subject, { foreignKey: "subjectId", as: "subject" });

// --- Level ↔ QuestionBank
Level.hasMany(QuestionBank, { foreignKey: "levelId", as: "questions" });
QuestionBank.belongsTo(Level, { foreignKey: "levelId", as: "level" });

// --- Level ↔ Exam
Level.hasMany(Exam, { foreignKey: "levelId", as: "exams" });
Exam.belongsTo(Level, { foreignKey: "levelId", as: "level" });

// --- Exam ↔ Candidate
Exam.hasMany(Candidate, { foreignKey: "examId", as: "candidates" });
Candidate.belongsTo(Exam, { foreignKey: "examId", as: "exam" });

// --- Exam ↔ ExamResult
Exam.hasMany(ExamResult, { foreignKey: "examId", as: "results" });
ExamResult.belongsTo(Exam, { foreignKey: "examId", as: "exam" });

// --- Candidate ↔ ExamResult
// Candidate.belongsTo(ExamResult, { foreignKey: "resultId", as: "examResult" });
ExamResult.belongsTo(Candidate, { foreignKey: "candidateId", as: "candidate" });

// --- User ↔ Role
Role.hasMany(User, { foreignKey: "roleId", as: "users" });
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

// --- QuestionBank ↔ CreatedBy User
User.hasMany(QuestionBank, { foreignKey: "createdBy", as: "createdQuestions" });
QuestionBank.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

// ==============================
// 🔗 AUTO-ASSOCIATE (IF AVAILABLE)
// ==============================
Object.values(DashMatrixDB).forEach((model) => {
  if (model?.associate) {
    model.associate(DashMatrixDB);
  }
});

// ==============================
// WEBSITE MODELS (Future)
// ==============================
const WebsiteDB = {
  sequelize: sequelizeWebsite,
  Sequelize,
};

// ==============================
module.exports = { DashMatrixDB, WebsiteDB };

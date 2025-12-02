// controllers/userController.js
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
// const { User, Role, Department } = require("../models");

const { DashMatrixDB } = require("../models");
const { User, Role, Department } = DashMatrixDB;

// @desc    Create new user
// @route   POST /api/users
// @access  Private
const createUser = asyncHandler(async (req, res) => {
  const { username, password, mail, mobile, roleId, departmentId, isActive } =
    req.body;
  console.log("🔍 Checking duplicate for:", { username, mail });

  // Check if username or mail already exists
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }
  console.log("🔍 Existing found:", existingUser?.dataValues ?? "❌ None");

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with logged-in user's ID as creator
  const user = await User.create({
    username,
    password: hashedPassword,
    mail,
    mobile,
    roleId,
    departmentId,
    isActive,
    created_by: req.user.id,
  });

  res.status(201).json({ message: "User created successfully", user });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["role_name", "displayName"],
      },
      {
        model: Department,
        as: "department", // Use alias if defined in model
        attributes: ["name"],
      },
    ],
  });

  res.status(200).json(users);
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserByID = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["role_name", "displayName"],
      },
      {
        model: Department,
        as: "department",
        attributes: ["name"],
      },
    ],
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json(user);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  console.log("🔍 Updating user with ID:", userId);

  const { username, password, mail, mobile, roleId, departmentId, isActive } =
    req.body;

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Hash new password if provided
  let hashedPassword = null;
  if (password && password.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  }

  // Prepare fields to update
  const updatedFields = {
    username,
    mail,
    mobile,
    roleId: parseInt(roleId),
    departmentId: parseInt(departmentId),
    isActive,
    updated_by: req.user.id,
  };

  if (hashedPassword) {
    updatedFields.password = hashedPassword;
  }

  console.log("🧾 Final Sequelize update payload:", updatedFields);

  try {
    await user.update(updatedFields);
    return res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    if (
      err.name === "SequelizeValidationError" ||
      err.name === "SequelizeUniqueConstraintError"
    ) {
      console.error("🔍 Validation Errors:");
      err.errors.forEach((e) => {
        console.error(`⛔ Field: ${e.path} | Message: ${e.message}`);
      });
    }
    return res.status(500).json({
      message: "Update failed",
      error: err.message,
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.destroy();
  res.status(200).json({ message: "User deleted successfully" });
});

module.exports = {
  createUser,
  getAllUsers,
  getUserByID,
  updateUser,
  deleteUser,
};

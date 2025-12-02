const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { DashMatrixDB } = require("../models");
const { User, Role } = DashMatrixDB;
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const user = await User.findOne({
      where: { username },
      include: [{ model: Role, as: "role" }],
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid username or user not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role?.role_name || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        // fullName: user.fullName,
        username: user.username,
        role: user.role?.role_name || null,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    // Just remove token on frontend side
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const currentLoggedIn = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      include: [{ model: Role, as: "role" }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      mail: user.mail,
      role: user.role?.role_name || null,
    });
  } catch (error) {
    console.error("Error fetching current user:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  loginUser,
  logoutUser,
  currentLoggedIn,
};

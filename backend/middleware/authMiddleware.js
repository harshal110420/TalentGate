const jwt = require("jsonwebtoken");
const { DashMatrixDB } = require("../models");
const { User, Role } = DashMatrixDB;

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      where: {
        id: decoded.id,
        isActive: true, // ✅ only fetch active users
      },
      include: [{ model: Role, as: "role" }],
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not found or inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("❌ JWT Middleware Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;

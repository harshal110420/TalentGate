const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkPermissionUnified = require("../middleware/checkPermissionUnified");

const {
  createRole,
  getAllRoles,
  getSingleRole,
  updateRole,
  deleteRole,
} = require("../controller/roleController");

// 👇 CRUD Routes for Role with Permission Check
router.post(
  "/create",
  authMiddleware,
  checkPermissionUnified("role_management", "new", false), // ✅ Only if role has "new" action
  createRole
);

router.get(
  "/all",
  authMiddleware,
  checkPermissionUnified("role_management", "view", false), // ✅ Only if role has "view" action
  getAllRoles
);

router.get("/all_roles", authMiddleware, getAllRoles);

router.get(
  "/get/:id",
  authMiddleware,
  checkPermissionUnified("role_management", "view", false), // ✅ Even single-role fetch should require view
  getSingleRole
);

router.put(
  "/update/:id",
  authMiddleware,
  checkPermissionUnified("role_management", "edit", false), // ✅ Only if role has "edit" action
  updateRole
);

router.delete(
  "/delete/:id",
  authMiddleware,
  checkPermissionUnified("role_management", "delete", false), // ✅ Only if role has "delete" action
  deleteRole
);

module.exports = router;

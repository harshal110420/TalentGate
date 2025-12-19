const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const checkPermissionUnified = require("../../middleware/checkPermissionUnified");
const MENU_CODE = "interview_management";
const {
  getCandidatesOverview,
  createInterview,
  rescheduleInterview,
} = require("../../controller/HR_controllers/interviewController");

router.get(
  "/overview",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "view"),
  getCandidatesOverview
);

router.post(
  "/schedule",
  authMiddleware,
  // checkPermissionUnified(MENU_CODE, "create"),
  createInterview
);

router.post(
  "/reschedule/:interviewId",
  authMiddleware,
  // checkPermissionUnified(MENU_CODE, "edit", false),
  rescheduleInterview
);

module.exports = router;

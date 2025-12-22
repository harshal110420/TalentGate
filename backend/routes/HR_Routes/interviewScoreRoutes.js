const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const checkPermissionUnified = require("../../middleware/checkPermissionUnified");
const MENU_CODE = "interview_score_management";
const {
  submitInterviewScore,
  fetchInterviewScores,
  fetchMyInterviewScore,
} = require("../../controller/HR_controllers/interviewScoreController");

// Submit or save draft
router.post(
  "/:interviewId/submit-score",
  authMiddleware,
  // checkPermissionUnified(MENU_CODE, "create"),
  submitInterviewScore
);

// HR / Admin – fetch all scores
router.get(
  "/:interviewId/scores",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "view"),
  fetchInterviewScores
);

// Interviewer – fetch own score
router.get(
  "/:interviewId/my-score",
  authMiddleware,
  // checkPermissionUnified(MENU_CODE, "view"),
  fetchMyInterviewScore
);

module.exports = router;

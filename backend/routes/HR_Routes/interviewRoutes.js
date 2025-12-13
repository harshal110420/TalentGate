const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const checkPermissionUnified = require("../../middleware/checkPermissionUnified");
const MENU_CODE = "interview_management";
const {
  createInterview,
  addInterviewRound,
  addInterviewScore,
  getInterviewDetails,
  getCandidatesOverview,
} = require("../../controller/HR_controllers/interviewController");

router.get(
  "/overview",
  authMiddleware,
  
  getCandidatesOverview
);

// Create interview + default rounds
router.post(
  "/interview",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "new", false),
  createInterview
);

// Add custom round
router.post(
  "/round/:interviewId",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "view", false),
  addInterviewRound
);

// Add score for a round
router.post(
  "/score/:roundId",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "view", false),
  addInterviewScore
);

// Fetch interview details with rounds and scores
router.get(
  "/:candidateId",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "view", false),
  getInterviewDetails
);

module.exports = router;

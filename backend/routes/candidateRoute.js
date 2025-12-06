const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkPermissionUnified = require("../middleware/checkPermissionUnified"); // <- new flexible middleware
const {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  sendExamMailToCandidate,
  startExam,
  reassignExam,
} = require("../controller/candidateController");
const verifyTokenAndLogin = require("../middleware/verifyExamTokenMiddleware");
const verifyCandidateToken = require("../middleware/verifyCandidateMiddleware");
const upload = require("../middleware/multerMiddleware");
const MENU_CODE = "candidate_management";

// Create
router.post(
  "/create",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "new", false),
  upload.single("resume"),
  createCandidate
);
// Get All
router.get(
  "/all",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "view", false),
  getAllCandidates
);

// Get All
router.get("/all_candidates", authMiddleware, getAllCandidates);

// Get by ID
router.get(
  "/:id",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "view", false),
  getCandidateById
);
// Update
router.put(
  "/:id",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "edit", false),
  upload.single("resume"),
  updateCandidate
);
// Delete
router.delete(
  "/:id",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "delete", false),
  deleteCandidate
);

router.post(
  "/reassign-exam",
  authMiddleware,
  checkPermissionUnified(MENU_CODE, "edit", false),
  reassignExam
);
// ------------------------------------------------------------------- //
router.post("/send-exam-mail/:candidateId", sendExamMailToCandidate);
router.post("/verify-token", verifyTokenAndLogin);
router.post("/start-exam", verifyCandidateToken, startExam);
// router.post("/login", loginCandidate);

module.exports = router;

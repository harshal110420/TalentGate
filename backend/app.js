const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/UserRoutes");
const roleRoutes = require("./routes/roleRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const menuRoutes = require("./routes/menuRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const userPermissionRoutes = require("./routes/userPermissionRoute");
const levelRoutes = require("./routes/levelRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const questionRoutes = require("./routes/questionRoutes");
const candidateRoute = require("./routes/candidateRoute");
const examRoutes = require("./routes/examRoutes");
const examResultRoutes = require("./routes/examResultRoutes");
// const websiteCareerRoutes = require("./routes/websiteCareerRoutes");
const jobOpeningRoutes = require("./routes/HR_Routes/jobOpeningRoutes");
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*", // Allow all origins for network access
    credentials: false, // Set to false when origin is '*'
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // User-related routes
app.use("/api/roles", roleRoutes); // User-related routes
app.use("/api/department", departmentRoutes); // User-related routes
app.use("/api/modules", moduleRoutes); // User-related routes
app.use("/api/menus", menuRoutes); // User-related routes
app.use("/api/permission", permissionRoutes); // User-related routes)
app.use("/api/userPermission", userPermissionRoutes); // User-related routes)
app.use("/api/level", levelRoutes); // User-related routes)
app.use("/api/subject", subjectRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/candidate", candidateRoute); // Candidate-related routes
app.use("/api/exam", examRoutes); // Exam-related routes
app.use("/api/exam_results", examResultRoutes); // Exam Result-related routes
// app.use("/api/website/careers", websiteCareerRoutes);
app.use("/api/job-openings", jobOpeningRoutes); // Job Opening-related routes
// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ✅ Export the configured app, don't start server here
module.exports = app;

// server.js
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");

const { dashMatrixSequelize } = require("./config/db");
const startExamExpiryCron = require("./cron/examExpiryJob");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// 1️⃣ Create HTTP server first
const server = http.createServer(app);

// 2️⃣ Attach socket on HTTP server
const io = new Server(server, {
  cors: { origin: "*" },
});

// 3️⃣ User joins room for personal notifications
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join_user", (userId) => {
    console.log(`👤 user_${userId} joined`);
    socket.join(`user_${userId}`);
  });
});

// 4️⃣ notification emitter handler
const sendNotificationToUser = (userId, notification) => {
  io.to(`user_${userId}`).emit("new_notification", notification);
};

// 5️⃣ make available everywhere
module.exports = { io, sendNotificationToUser };

// 6️⃣ START SERVER
const startServer = async () => {
  try {
    await dashMatrixSequelize.authenticate();
    console.log("✅ Connected to Talent Gate DB");

    startExamExpiryCron();

    server.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
};

startServer();

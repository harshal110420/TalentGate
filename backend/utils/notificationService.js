const { DashMatrixDB } = require("../models");
const { Notification } = DashMatrixDB;
const { io } = require("../server");

const sendNotification = async ({ userId, title, message, type }) => {
  console.log("📌 sendNotification CALLED for user:", userId);

  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
  });
  console.log("📤 EMIT to:", `user_${userId}`, "io?", !!global._io);
  // 🌍 global io access — always defined
  global._io.to(`user_${userId}`).emit("notification:new", notification);

  return notification;
};

module.exports = { sendNotification };

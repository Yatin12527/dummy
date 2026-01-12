import express from "express";
import Notification from "../models/Notification.js";
import validateToken from "../middlewares/authmiddleware.js";

const router = express.Router();

// Helper function to get user ID from request
const getUserId = (req) => {
  return req.user.id || req.user.user?.id || req.user._id || req.user;
};

// Mark all notifications as read
router.put("/mark-read-all", validateToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    const result = await Notification.updateMany(
      { recipient: userId },
      { $set: { read: true } }
    );

    res.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: "Error updating notifications" });
  }
});

// Get all notifications for current user
router.get("/", validateToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "name email")
      .populate("file", "name")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Mark single notification as read
router.put("/:id/read", validateToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      read: true,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
});

export default router;

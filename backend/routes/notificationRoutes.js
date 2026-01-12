import express from "express";
import Notification from "../models/Notification.js";
import validateToken from "../middlewares/authmiddleware.js";

const router = express.Router();

router.get("/", validateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "name email")
      .populate("file", "name")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

router.put("/:id/read", validateToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
});

export default router;

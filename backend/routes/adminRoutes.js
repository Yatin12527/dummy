import express from "express";
import { getAllFiles, getStats } from "../controllers/adminController.js";
import validateToken from "../middlewares/authMiddleware.js";

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

router.get("/all-files", validateToken, adminOnly, getAllFiles);
router.get("/stats", validateToken, adminOnly, getStats);

export default router;
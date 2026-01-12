import express from "express";
import { login, logout, signup, me } from "../controllers/authController.js";
import validateToken from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", validateToken, me);

export default router;

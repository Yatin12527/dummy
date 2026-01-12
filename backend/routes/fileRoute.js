import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import {
  uploadFile,
  getMyFiles,
  deleteFile,
  getFile,
  requestAccess,
  grantAccess,
  getFileRequests,
} from "../controllers/fileController.js";
import validateToken from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage });

router.post("/upload", validateToken, upload.single("file"), uploadFile);
router.get("/myfiles", validateToken, getMyFiles);
router.delete("/:id", validateToken, deleteFile);

router.get("/:id", validateToken, getFile);
router.post("/:id/request", validateToken, requestAccess);
router.post("/:id/grant", validateToken, grantAccess);
router.get("/:id/requests", validateToken, getFileRequests);

export default router;

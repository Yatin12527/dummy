import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import {
  uploadFile,
  getMyFiles,
  getSharedFiles,
  deleteFile,
  getFile,
  requestAccess,
  grantAccess,
  getFileRequests,
  shareFile,
  updateFile,
  updateGeneralAccess,
  manageUserAccess,
} from "../controllers/fileController.js";
import validateToken from "../middlewares/authmiddleware.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();
const upload = multer({ storage });

// SPECIFIC ROUTES FIRST (before /:id routes)
router.post("/upload", validateToken, upload.single("file"), uploadFile);
router.get("/myfiles", validateToken, getMyFiles);
router.get("/shared", validateToken, getSharedFiles);

// PARAMETERIZED ROUTES AFTER (/:id routes)
router.get("/:id", optionalAuth, getFile);
router.delete("/:id", validateToken, deleteFile);
router.put("/:id", validateToken, upload.single("file"), updateFile);
router.put("/:id/access", validateToken, updateGeneralAccess);
router.put("/:id/manage-access", validateToken, manageUserAccess);
router.post("/:id/request", validateToken, requestAccess);
router.post("/:id/grant", validateToken, grantAccess);
router.get("/:id/requests", validateToken, getFileRequests);
router.post("/:id/share", validateToken, shareFile);

export default router;
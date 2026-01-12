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
  shareFile,
  updateFile,
  updateGeneralAccess,
  manageUserAccess,
} from "../controllers/fileController.js";
import validateToken from "../middlewares/authmiddleware.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();
const upload = multer({ storage });

router.post("/upload", validateToken, upload.single("file"), uploadFile);
router.get("/myfiles", validateToken, getMyFiles);
router.delete("/:id", validateToken, deleteFile);

router.get("/:id", optionalAuth, getFile);
router.post("/:id/request", validateToken, requestAccess);
router.post("/:id/grant", validateToken, grantAccess);
router.get("/:id/requests", validateToken, getFileRequests);
router.post("/:id/share", validateToken, shareFile);
router.put("/:id", validateToken, upload.single("file"), updateFile);
router.put("/:id/access", validateToken, updateGeneralAccess);
router.put("/:id/manage-access", validateToken, manageUserAccess);

export default router;

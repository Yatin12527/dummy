import { cloudinary } from "../config/cloudinary.js";
import File from "../models/File.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const newFile = await File.create({
      name: req.file.originalname,
      url: req.file.path,
      publicId: req.file.filename,
      type: req.file.mimetype,
      size: req.file.size,
      owner: req.user.id,
    });

    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await cloudinary.uploader.destroy(file.publicId);
    await file.deleteOne();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const isOwner = file.owner.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    const isShared = file.sharedWith.includes(req.user.id);

    if (isOwner || isAdmin || isShared) {
      return res.json({
        hasAccess: true,
        file,
        isOwner,
      });
    }

    const hasRequested = file.accessRequests.includes(req.user.id);
    res.json({ hasAccess: false, hasRequested });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestAccess = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    if (!file.accessRequests.includes(req.user.id)) {
      file.accessRequests.push(req.user.id);
      await file.save();
    }
    res.json({ message: "Access requested successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const grantAccess = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = await File.findById(req.params.id);

    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can grant access" });
    }

    file.accessRequests = file.accessRequests.filter(
      (id) => id.toString() !== userId
    );
    if (!file.sharedWith.includes(userId)) {
      file.sharedWith.push(userId);
    }

    await file.save();
    res.json({ message: "Access granted!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFileRequests = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate(
      "accessRequests",
      "name email"
    );
    if (file.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    res.json(file.accessRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

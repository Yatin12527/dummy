import File from "../models/File.js";
import User from "../models/users.js";
import { cloudinary } from "../config/cloudinary.js";

export const getAllFiles = async (req, res) => {
  try {
    const files = await File.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalFiles = await File.countDocuments();
    const totalUsers = await User.countDocuments();
    res.json({ totalFiles, totalUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

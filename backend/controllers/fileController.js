import { cloudinary } from "../config/cloudinary.js";
import File from "../models/file.js";
import Notification from "../models/Notification.js";
import User from "../models/users.js";
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

export const getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate(
      "sharedWith.user",
      "name email"
    );

    if (!file) return res.status(404).json({ message: "File not found" });

    // robustly identify user (handles varying JWT structures)
    const userId = req.user
      ? req.user.id || req.user.user?.id || req.user._id || req.user
      : null;

    // Check Permissions
    const isOwner = userId && file.owner.toString() === userId.toString();
    const isAdmin = req.user?.role === "admin";
    const isPublic = file.accessType === "public";

    const sharedUser = userId
      ? file.sharedWith.find(
          (s) => s.user?._id.toString() === userId.toString()
        )
      : null;

    // Strict Access Gate
    if (!isPublic && !isOwner && !isAdmin && !sharedUser) {
      return res.status(403).json({ message: "Access Denied" });
    }

    // Determine Effective Role
    let role = "viewer";
    if (isOwner || isAdmin) {
      role = "owner";
    } else if (sharedUser) {
      role = sharedUser.role;
    } else if (isPublic) {
      role = file.publicPermission;
    }

    const hasRequested = userId && file.accessRequests.includes(userId);

    res.json({ hasAccess: true, role, file, hasRequested, isOwner });
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

    // Create Notification for Owner with user name from req.user
    await Notification.create({
      recipient: file.owner,
      sender: req.user.id,
      file: file._id,
      type: "request",
      message: `${req.user.name} requested access to ${file.name}`,
    });

    res.json({ message: "Access requested" });
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

    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Only owner can see requests" });
    }

    res.json(file.accessRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const grantAccess = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const file = await File.findById(req.params.id);

    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Add to sharedWith with specific Role
    const existing = file.sharedWith.find((s) => s.user.toString() === userId);
    if (existing) {
      existing.role = role || "view";
    } else {
      file.sharedWith.push({ user: userId, role: role || "view" });
    }

    // Remove from requests
    file.accessRequests = file.accessRequests.filter(
      (id) => id.toString() !== userId
    );
    await file.save();

    // Notify the Requester using req.user.name
    await Notification.create({
      recipient: userId,
      sender: req.user.id,
      file: file._id,
      type: "granted",
      message: `${req.user.name} granted you ${role} access to ${file.name}`,
    });

    res.json({ message: "Access granted!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const isOwner = file.owner.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    const sharedUser = file.sharedWith.find(
      (s) => s.user.toString() === req.user.id
    );

    const canDelete =
      isOwner ||
      isAdmin ||
      (sharedUser &&
        (sharedUser.role === "delete" || sharedUser.role === "edit"));

    if (!canDelete) {
      return res.status(403).json({ message: "Permission denied" });
    }

    if (file.publicId) {
      await cloudinary.uploader.destroy(file.publicId);
    }
    await file.deleteOne();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const shareFile = async (req, res) => {
  try {
    const { email, role } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Only owner (or admin) can share
    if (file.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only owner can share files" });
    }

    // Trim spaces and search case-insensitively
    const cleanEmail = email.trim();
    const userToShare = await User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });

    if (!userToShare) {
      return res.status(404).json({ message: `User not found: ${cleanEmail}` });
    }

    if (userToShare._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You already own this file" });
    }

    // Add or update permission
    const existingShare = file.sharedWith.find(
      (s) => s.user.toString() === userToShare._id.toString()
    );

    if (existingShare) {
      existingShare.role = role;
    } else {
      file.sharedWith.push({ user: userToShare._id, role });
    }

    await file.save();

    // Notify recipient using req.user.name
    await Notification.create({
      recipient: userToShare._id,
      sender: req.user.id,
      file: file._id,
      type: "granted",
      message: `${req.user.name} shared "${file.name}" with you (${role})`,
    });

    res.json({ message: `Shared with ${userToShare.email} successfully!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFile = async (req, res) => {
  try {
    const { name } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    // Check Permissions (Owner or Editor)
    const isOwner = file.owner.toString() === req.user.id;
    const sharedUser = file.sharedWith.find(
      (s) => s.user.toString() === req.user.id
    );
    const canEdit = isOwner || (sharedUser && sharedUser.role === "edit");

    if (!canEdit) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Handle Rename
    if (name) file.name = name;

    // Handle File Replacement (If a new file was uploaded)
    if (req.file) {
      // Delete old file from Cloudinary
      if (file.publicId) {
        await cloudinary.uploader.destroy(file.publicId);
      }
      // Update with new file info
      file.url = req.file.path;
      file.publicId = req.file.filename;
      file.type = req.file.mimetype;
      file.size = req.file.size;
    }

    await file.save();
    res.json({ message: "File updated successfully", file });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGeneralAccess = async (req, res) => {
  try {
    const { accessType, publicPermission } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    // Only Owner can change this
    if (file.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only owner can change general access" });
    }

    if (accessType) file.accessType = accessType;
    if (publicPermission) file.publicPermission = publicPermission;

    await file.save();
    res.json({ message: "General access updated", file });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const manageUserAccess = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    // Only Owner can manage access
    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can manage access" });
    }

    if (role === "remove") {
      // Filter out the user to remove them
      file.sharedWith = file.sharedWith.filter(
        (share) => share.user.toString() !== userId
      );
      await file.save();

      // Notify the user they were removed using req.user.name
      await Notification.create({
        recipient: userId,
        sender: req.user.id,
        file: file._id,
        type: "revoked",
        message: `${req.user.name} removed your access to "${file.name}"`,
      });

      return res.json({ message: "Access removed successfully" });
    }

    // Update Role
    const shareIndex = file.sharedWith.findIndex(
      (share) => share.user.toString() === userId
    );

    if (shareIndex !== -1) {
      const oldRole = file.sharedWith[shareIndex].role;

      // Only update and notify if the role is actually different
      if (oldRole !== role) {
        file.sharedWith[shareIndex].role = role;
        await file.save();

        // Notify the user of the update using req.user.name
        await Notification.create({
          recipient: userId,
          sender: req.user.id,
          file: file._id,
          type: "update",
          message: `${req.user.name} changed your access to "${role}" for "${file.name}"`,
        });

        res.json({ message: `Permission updated to ${role}` });
      } else {
        res.json({ message: "Role unchanged" });
      }
    } else {
      res.status(404).json({ message: "User not found in shared list" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSharedFiles = async (req, res) => {
  try {
    const files = await File.find({
      "sharedWith.user": req.user.id
    })
    .populate("owner", "name email")
    .sort({ createdAt: -1 });
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
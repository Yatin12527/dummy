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

    // 1. FETCH THE USER TO GET THE NAME
    // We use the ID from the token to find the full user profile
    const requestor = await User.findById(req.user.id);

    // Fallback to "Someone" if user isn't found (safety check)
    const requestorName = requestor ? requestor.name : "Someone";

    if (!file.accessRequests.includes(req.user.id)) {
      file.accessRequests.push(req.user.id);
      await file.save();
    }

    // 2. USE THE FETCHED NAME IN THE MESSAGE
    await Notification.create({
      recipient: file.owner,
      sender: req.user.id,
      file: file._id,
      type: "request",
      // Now it will say "Yatinder requested..." instead of "undefined requested..."
      message: `${requestorName} requested access to ${file.name}`,
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
    const { userId, role } = req.body; // Now accepting Role
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

    // Notify the Requester
    await Notification.create({
      recipient: userId,
      sender: req.user.id,
      file: file._id,
      type: "granted",
      message: `Access granted (${role}) for ${file.name}`,
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

    // CHANGED: Allow if role is 'delete' OR 'edit'
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

// NEW: Share File directly via Email (Improved Search)
export const shareFile = async (req, res) => {
  try {
    const { email, role } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    // Only Owner (or Admin) can share
    if (file.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only owner can share files" });
    }

    // 1. TRIM SPACES (Fixes copy-paste errors)
    const cleanEmail = email.trim();

    // 2. CASE INSENSITIVE SEARCH (Fixes Capital Letter issues)
    // This finds "bob@gmail.com" even if you type "Bob@Gmail.COM"
    const userToShare = await User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });

    if (!userToShare) {
      return res.status(404).json({ message: `User not found: ${cleanEmail}` });
    }

    if (userToShare._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You already own this file" });
    }

    // Add or Update permission in sharedWith array
    const existingShare = file.sharedWith.find(
      (s) => s.user.toString() === userToShare._id.toString()
    );

    if (existingShare) {
      existingShare.role = role;
    } else {
      file.sharedWith.push({ user: userToShare._id, role });
    }

    await file.save();

    // Notify the Recipient
    await Notification.create({
      recipient: userToShare._id,
      sender: req.user.id,
      file: file._id,
      type: "granted",
      message: `${req.user.name} shared a file with you: ${file.name} (${role})`,
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

    // 1. Handle Rename
    if (name) file.name = name;

    // 2. Handle File Replacement (If a new file was uploaded)
    if (req.file) {
      // Optional: Delete old file from Cloudinary to save space
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
// NEW: Update General Access (Restricted vs Public)
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
    const { userId, role } = req.body; // role can be "view", "edit", or "remove"
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    // Only Owner can manage access
    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can manage access" });
    }

    const owner = await User.findById(req.user.id);
    const ownerName = owner ? owner.name : "Owner";

    if (role === "remove") {
      // Filter out the user to remove them
      file.sharedWith = file.sharedWith.filter(
        (share) => share.user.toString() !== userId
      );
      await file.save();

      // NOTIFY: User removed
      await Notification.create({
        recipient: userId,
        sender: req.user.id,
        file: file._id,
        type: "revoked",
        // Use ownerName variable here
        message: `${ownerName} removed your access to "${file.name}"`,
      });

      return res.json({ message: "Access removed successfully" });
    }

    // --- CASE 2: UPDATE ROLE ---
    const shareIndex = file.sharedWith.findIndex(
      (share) => share.user.toString() === userId
    );

    if (shareIndex !== -1) {
      const oldRole = file.sharedWith[shareIndex].role;

      // Only notify if the role is actually different
      if (oldRole !== role) {
        file.sharedWith[shareIndex].role = role;
        await file.save();

        // NOTIFY: Role updated
        await Notification.create({
          recipient: userId,
          sender: req.user.id,
          file: file._id,
          type: "update",
          // Use ownerName variable here
          message: `${ownerName} changed your access to "${role}" for "${file.name}"`,
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

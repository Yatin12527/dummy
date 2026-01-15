import jwt from "jsonwebtoken";
import User from "../models/users.js";

const validateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details from database
    const user = await User.findById(verified.id).select("name email role");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

export default validateToken;

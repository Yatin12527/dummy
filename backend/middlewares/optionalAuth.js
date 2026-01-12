import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const optionalAuth = (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers.cookie) {
    const tokenCookie = req.headers.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));

    if (tokenCookie) {
      token = tokenCookie.split("=")[1];
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      console.error("Token verification failed:", err.message);
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

export default optionalAuth;

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const sessionExpirationTime = 30 * 60 * 1000; 

const verifyToken = (role) => async (req, res, next) => {
  console.error("token");
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token received:", token); // Debugging log
  
  if (!token) {
    console.log("Access Denied: No token provided");
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT);
    console.log("Token decoded:", decoded); // Log decoded token for debugging

    // Check if the token has expired based on session timeout
    const currentTime = Date.now();
    const tokenIssuedAt = decoded.iat * 1000; // Convert iat to milliseconds

    if (currentTime - tokenIssuedAt > sessionExpirationTime) {
      console.log("Session expired");
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    req.user = await User.findById(decoded.id);
    console.log("User found:", req.user); // Log user details for debugging

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role && req.user.role !== role) {
      console.log("Access Forbidden: Insufficient role");
      return res.status(403).json({ message: "Forbidden: Access is denied" });
    }

    next();
  } catch (err) {
    console.error("Invalid token:", err.message); 
    res.status(400).json({ message: "Invalid token" });
  }
};

export default verifyToken;

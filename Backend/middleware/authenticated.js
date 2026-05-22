import jwt from "jsonwebtoken";
import { User } from "../models/Usermodels.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeaders = req.headers.authorization;
    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing or invalid",
      });
    }

    const token = authHeaders.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.SECREAT_KEY);

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not Found!",
        });
      }

      req.userId = user._id.toString();
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access token has expired, please refresh",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Error in isAuthenticated middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// import jwt from "jsonwebtoken";
// import { User } from "../models/Usermodels.js";

// export const isAuthenticated = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization?.split(" ")[1];
//         if (!token) return res.status(401).json({ message: "Access Denied" });

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // Find user. Note: Check if you signed with 'id' or '_id' in login
//         const user = await User.findById(decoded.id || decoded._id);

//         if (!user) return res.status(401).json({ message: "User not found" });

//         req.user = user; // Attach user to request
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: "Invalid Token" });
//     }
// };

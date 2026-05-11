import { User } from "../models/Usermodels.js";

const ROLE_ALIASES = {
  client: ["client", "freelancer"],
  freelancer: ["freelancer", "client"],
  editor: ["editor"],
  admin: ["admin"],
};

const normalizeAllowedRoles = (roles) => {
  const expanded = new Set();
  roles.forEach((role) => {
    const key = String(role || "").toLowerCase();
    const aliases = ROLE_ALIASES[key] || [key];
    aliases.forEach((item) => expanded.add(item));
  });
  return [...expanded];
};

export const authorizeRole = (...roles) => {
  const allowedRoles = normalizeAllowedRoles(roles);

  return async (req, res, next) => {
    try {
      const currentUser = await User.findById(req.userId).select("role");
      if (!currentUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const userRole = String(currentUser.role || "").toLowerCase();
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied for role '${userRole}'. Required: ${roles.join(", ")}`,
        });
      }

      req.currentUserRole = userRole;
      return next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};

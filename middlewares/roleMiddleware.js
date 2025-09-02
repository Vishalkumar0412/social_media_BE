// roleMiddleware.js
export const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const user = req.user; // assume req.user JWT verify middleware se set hua hai

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No user found",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You don't have permission to access this resource",
        });
      }

      next(); // ✅ allowed → proceed
    } catch (error) {
      console.error("Role middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error in role check",
      });
    }
  };
};


const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify authentication token
const requireAuth = async (req, res, next) => {
    try {
        const token =
            req.cookies?.ngo_token ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.substring(7)
                : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in."
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");

            return res.status(500).json({
                success: false,
                message: "Authentication service is not configured."
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        // Retrieve authenticated user
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account not found or inactive."
            });
        }

        // Attach user information to request
        req.user = user;

        next();

    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token."
            });
        }

        console.error("Authentication Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to authenticate request."
        });
    }
};

// Restrict access based on user roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource."
            });
        }

        next();
    };
};

module.exports = {
    requireAuth,
    authorizeRoles
};

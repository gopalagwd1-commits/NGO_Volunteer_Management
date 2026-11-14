
const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");

const {
    requireAuth,
    authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

// ============================================
// USER MANAGEMENT
// ADMIN ONLY
// ============================================

const SAFE_USER_FIELDS =
    "name nameKannada email phone role isActive preferredLanguage createdAt updatedAt lastLogin";

// Validate phone number
function isValidPhone(phone) {
    return typeof phone === "string" &&
        /^\+?[0-9]{10,15}$/.test(phone.trim());
}

// Escape search input before creating regex
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Format user response
function formatUser(user) {
    return {
        id: user._id,
        name: user.name,
        nameKannada: user.nameKannada || "",
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        preferredLanguage: user.preferredLanguage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
    };
}


// ============================================
// GET /api/users/stats
// Retrieve user statistics
// ============================================

router.get(
    "/stats",
    requireAuth,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const [total, admins, coordinators, volunteers, active, inactive] =
                await Promise.all([
                    User.countDocuments(),
                    User.countDocuments({ role: "admin" }),
                    User.countDocuments({ role: "coordinator" }),
                    User.countDocuments({ role: "volunteer" }),
                    User.countDocuments({ isActive: true }),
                    User.countDocuments({ isActive: false })
                ]);

            return res.status(200).json({
                success: true,
                statistics: {
                    total,
                    admins,
                    coordinators,
                    volunteers,
                    active,
                    inactive
                }
            });

        } catch (error) {
            console.error("User Statistics Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve user statistics."
            });
        }
    }
);


// ============================================
// GET /api/users
// Search and list all users
// ============================================

router.get(
    "/",
    requireAuth,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const search =
                typeof req.query.search === "string"
                    ? req.query.search.trim().slice(0, 100)
                    : "";

            const role =
                typeof req.query.role === "string"
                    ? req.query.role
                    : "all";

            const status =
                typeof req.query.status === "string"
                    ? req.query.status
                    : "all";

            const page = Math.max(
                1,
                parseInt(req.query.page, 10) || 1
            );

            const limit = Math.min(
                100,
                Math.max(1, parseInt(req.query.limit, 10) || 10)
            );

            const filter = {};

            if (role !== "all") {
                if (!["admin", "coordinator", "volunteer"].includes(role)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid role filter."
                    });
                }

                filter.role = role;
            }

            if (status === "active") {
                filter.isActive = true;
            } else if (status === "inactive") {
                filter.isActive = false;
            } else if (status !== "all") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid account status filter."
                });
            }

            if (search) {
                const regex = new RegExp(
                    escapeRegex(search),
                    "i"
                );

                filter.$or = [
                    { name: regex },
                    { email: regex },
                    { phone: regex }
                ];
            }

            const total = await User.countDocuments(filter);

            const users = await User.find(filter)
                .select(SAFE_USER_FIELDS)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            return res.status(200).json({
                success: true,
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error("User List Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve users."
            });
        }
    }
);


// ============================================
// POST /api/users
// Create coordinator or volunteer account
// ============================================

router.post(
    "/",
    requireAuth,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const {
                name,
                nameKannada,
                email,
                phone,
                password,
                role,
                preferredLanguage
            } = req.body;
            if (
                typeof name !== "string" ||
                name.trim().length < 2 ||
                name.trim().length > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Name must contain 2 to 100 characters."
                });
            }

            if (
                typeof email !== "string" ||
                email.trim().length > 150 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address."
                });
            }

            if (!isValidPhone(phone)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid phone number."
                });
            }

            if (
                typeof password !== "string" ||
                password.length < 8
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Password must contain at least 8 characters."
                });
            }

            // Administrators cannot be created through this module.
            if (!["coordinator", "volunteer"].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Only coordinator and volunteer accounts can be created."
                });
            }

            const language = preferredLanguage || "en";

            if (!["en", "kn"].includes(language)) {
                return res.status(400).json({
                    success: false,
                    message: "Preferred language must be en or kn."
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            const existingUser = await User.findOne({
                email: normalizedEmail
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email already exists."
                });
            }


            let kannadaName = "";

            if (role === "volunteer" && nameKannada !== undefined) {
                if (
                    typeof nameKannada !== "string" ||
                    nameKannada.trim().length > 100
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Kannada name must not exceed 100 characters."
                    });
                }

                kannadaName = nameKannada.trim();
            }
            const user = new User({
                name: name.trim(),
                nameKannada: kannadaName,
                email: normalizedEmail,
                phone: phone.trim(),
                password,
                role,
                preferredLanguage: language,
                isActive: true,
                createdBy: req.user._id
            });

            // User model pre-save hook hashes the password.
            await user.save();

            return res.status(201).json({
                success: true,
                message: "User account created successfully.",
                user: formatUser(user)
            });

        } catch (error) {
            console.error("Create User Error:", error);

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email already exists."
                });
            }

            if (error.name === "ValidationError") {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Unable to create user account."
            });
        }
    }
);


// ============================================
// GET /api/users/:id
// Retrieve user profile
// ============================================

router.get(
    "/:id",
    requireAuth,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID."
                });
            }

            const user = await User.findById(id)
                .select(SAFE_USER_FIELDS)
                .lean();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            return res.status(200).json({
                success: true,
                user
            });

        } catch (error) {
            console.error("User Profile Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve user profile."
            });
        }
    }
);


// ============================================
// PATCH /api/users/:id
// Update user details, role and status
// ============================================

router.patch(
    "/:id",
    requireAuth,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID."
                });
            }

            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            const {
                name,
                nameKannada,
                phone,
                preferredLanguage,
                role,
                isActive
            } = req.body;

            // Administrator accounts are protected.
            if (
                user.role === "admin" &&
                (role !== undefined || isActive !== undefined)
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Administrator roles and account status cannot be changed here."
                });
            }

            if (name !== undefined) {
                if (
                    typeof name !== "string" ||
                    name.trim().length < 2 ||
                    name.trim().length > 100
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Name must contain 2 to 100 characters."
                    });
                }

                user.name = name.trim();
            }

            if (nameKannada !== undefined) {

                if (
                    typeof nameKannada !== "string" ||
                    nameKannada.trim().length > 100
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Kannada name must not exceed 100 characters."
                    });
                }

                const targetRole = role !== undefined ? role : user.role;

                if (targetRole !== "volunteer" && nameKannada.trim() !== "") {
                    return res.status(400).json({
                        success: false,
                        message: "Kannada name is only supported for volunteer accounts."
                    });
                }

                user.nameKannada =
                    targetRole === "volunteer" ? nameKannada.trim() : "";
            }

            if (phone !== undefined) {
                if (!isValidPhone(phone)) {
                    return res.status(400).json({
                        success: false,
                        message: "Please provide a valid phone number."
                    });
                }

                user.phone = phone.trim();
            }

            if (preferredLanguage !== undefined) {
                if (!["en", "kn"].includes(preferredLanguage)) {
                    return res.status(400).json({
                        success: false,
                        message: "Language must be en or kn."
                    });
                }

                user.preferredLanguage = preferredLanguage;
            }

            if (role !== undefined) {
                if (!["coordinator", "volunteer"].includes(role)) {
                    return res.status(400).json({
                        success: false,
                        message: "Role must be coordinator or volunteer."
                    });
                }

                user.role = role;
            }

            if (isActive !== undefined) {
                if (typeof isActive !== "boolean") {
                    return res.status(400).json({
                        success: false,
                        message: "isActive must be true or false."
                    });
                }

                user.isActive = isActive;
            }

            await user.save();

            return res.status(200).json({
                success: true,
                message: "User updated successfully.",
                user: formatUser(user)
            });

        } catch (error) {
            console.error("Update User Error:", error);

            if (error.name === "ValidationError") {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Unable to update user."
            });
        }
    }
);

module.exports = router;

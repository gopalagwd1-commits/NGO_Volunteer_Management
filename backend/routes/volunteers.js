
const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");

const EventRegistration = require("../models/EventRegistration");
const {
    requireAuth,
    authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

// ============================================
// VOLUNTEER MANAGEMENT
// ============================================

// GET /api/volunteers/stats
// Admin and Coordinator: Volunteer statistics

router.get(
    "/stats",
    requireAuth,
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {
        try {
            const [total, active, inactive] = await Promise.all([
                User.countDocuments({ role: "volunteer" }),
                User.countDocuments({
                    role: "volunteer",
                    isActive: true
                }),
                User.countDocuments({
                    role: "volunteer",
                    isActive: false
                })
            ]);

            return res.status(200).json({
                success: true,
                statistics: {
                    total,
                    active,
                    inactive
                }
            });

        } catch (error) {
            console.error("Volunteer Statistics Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve volunteer statistics."
            });
        }
    }
);


// GET /api/volunteers
// Admin and Coordinator: Search and list volunteers

router.get(
    "/",
    requireAuth,
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {
        try {
            const search =
                typeof req.query.search === "string"
                    ? req.query.search.trim().slice(0, 100)
                    : "";

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

            const filter = {
                role: "volunteer"
            };

            if (status === "active") {
                filter.isActive = true;
            } else if (status === "inactive") {
                filter.isActive = false;
            } else if (status !== "all") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid volunteer status filter."
                });
            }

            if (search) {
                const escapedSearch = search.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

                const searchRegex = new RegExp(
                    escapedSearch,
                    "i"
                );

                filter.$or = [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phone: searchRegex }
                ];
            }

            const total = await User.countDocuments(filter);

            const volunteers = await User.find(filter)
                .select(
                    "name nameKannada email phone role isActive preferredLanguage createdAt lastLogin"
                )
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            return res.status(200).json({
                success: true,
                volunteers,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error("Volunteer List Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve volunteers."
            });
        }
    }
);


// ============================================
// VOLUNTEER PERFORMANCE REPORT
// GET /api/volunteers/:id/performance
// Admin and Coordinator access
// ============================================

router.get(
    "/:id/performance",
    requireAuth,
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Validate volunteer ID
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid volunteer ID."
                });
            }

            // Retrieve volunteer profile
            const volunteer = await User.findOne({
                _id: id,
                role: "volunteer"
            }).select(
                "name nameKannada email phone role isActive preferredLanguage createdAt lastLogin"
            ).lean();

            if (!volunteer) {
                return res.status(404).json({
                    success: false,
                    message: "Volunteer not found."
                });
            }

            // Retrieve complete registration history
            const registrations = await EventRegistration.find({
                volunteer: id
            })
                .populate({
                    path: "event",
                    select: "title category eventDate startTime endTime venue address status"
                })
                .populate({
                    path: "reviewedBy",
                    select: "name"
                })
                .populate({
                    path: "attendanceMarkedBy",
                    select: "name"
                })
                .sort({ registrationDate: -1 })
                .lean();

            // Registration statistics
            const totalRegistrations = registrations.length;

            const pending = registrations.filter(
                item => item.status === "Pending"
            ).length;

            const approved = registrations.filter(
                item => item.status === "Approved"
            ).length;

            const rejected = registrations.filter(
                item => item.status === "Rejected"
            ).length;

            const cancelled = registrations.filter(
                item => item.status === "Cancelled"
            ).length;

            // Attendance statistics
            const present = registrations.filter(
                item =>
                    item.status === "Approved" &&
                    item.attendance === "Present"
            ).length;

            const absent = registrations.filter(
                item =>
                    item.status === "Approved" &&
                    item.attendance === "Absent"
            ).length;

            const notMarked = registrations.filter(
                item =>
                    item.status === "Approved" &&
                    item.attendance === "Not Marked"
            ).length;

            const attendanceMarked = present + absent;

            const attendancePercentage = attendanceMarked > 0
                ? Number(
                    ((present / attendanceMarked) * 100).toFixed(2)
                )
                : 0;

            // Final report
            return res.status(200).json({
                success: true,
                reportGeneratedAt: new Date(),

                volunteer,

                statistics: {
                    totalRegistrations,
                    pending,
                    approved,
                    rejected,
                    cancelled,

                    eventsAttended: present,

                    attendance: {
                        present,
                        absent,
                        notMarked,
                        totalMarked: attendanceMarked,
                        percentage: attendancePercentage
                    }
                },

                registrations
            });

        } catch (error) {
            console.error("Volunteer Performance Report Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to generate volunteer performance report."
            });
        }
    }
);


// GET /api/volunteers/:id
// Admin and Coordinator: View volunteer profile

router.get(
    "/:id",
    requireAuth,
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid volunteer ID."
                });
            }

            const volunteer = await User.findOne({
                _id: id,
                role: "volunteer"
            }).select(
                "name nameKannada email phone role isActive preferredLanguage createdAt updatedAt lastLogin"
            );

            if (!volunteer) {
                return res.status(404).json({
                    success: false,
                    message: "Volunteer not found."
                });
            }

            return res.status(200).json({
                success: true,
                volunteer
            });

        } catch (error) {
            console.error("Volunteer Profile Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve volunteer profile."
            });
        }
    }
);


// PATCH /api/volunteers/:id
// Admin only: Update volunteer details and account status

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
                    message: "Invalid volunteer ID."
                });
            }

            const volunteer = await User.findOne({
                _id: id,
                role: "volunteer"
            });

            if (!volunteer) {
                return res.status(404).json({
                    success: false,
                    message: "Volunteer not found."
                });
            }

            const {
                name,
                nameKannada,
                phone,
                preferredLanguage,
                isActive
            } = req.body;

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

                volunteer.name = name.trim();
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

                volunteer.nameKannada = nameKannada.trim();
            }

            if (phone !== undefined) {
                if (
                    typeof phone !== "string" ||
                    !/^\+?[0-9]{10,15}$/.test(phone.trim())
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Please provide a valid phone number."
                    });
                }

                volunteer.phone = phone.trim();
            }

            if (preferredLanguage !== undefined) {
                if (!["en", "kn"].includes(preferredLanguage)) {
                    return res.status(400).json({
                        success: false,
                        message: "Language must be en or kn."
                    });
                }

                volunteer.preferredLanguage = preferredLanguage;
            }

            if (isActive !== undefined) {
                if (typeof isActive !== "boolean") {
                    return res.status(400).json({
                        success: false,
                        message: "isActive must be true or false."
                    });
                }

                volunteer.isActive = isActive;
            }

            await volunteer.save();

            return res.status(200).json({
                success: true,
                message: "Volunteer updated successfully.",
                volunteer: {
                    id: volunteer._id,
                    name: volunteer.name,
                    nameKannada: volunteer.nameKannada || "",
                    email: volunteer.email,
                    phone: volunteer.phone,
                    role: volunteer.role,
                    isActive: volunteer.isActive,
                    preferredLanguage: volunteer.preferredLanguage
                }
            });

        } catch (error) {
            console.error("Volunteer Update Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to update volunteer."
            });
        }
    }
);

module.exports = router;


const express = require("express");

const SMSLog = require("../models/SMSLog");
const User = require("../models/User");
const { sendSMS } = require("../services/smsService");

const {
    requireAuth,
    authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

const VALID_TYPES = [
    "Manual",
    "Announcement",
    "Registration",
    "Event Reminder",
    "Event Cancellation",
    "Attendance",
    "System"
];

const isAdmin = req => req.user.role === "admin";
const isCoordinator = req => req.user.role === "coordinator";

// All SMS routes require authentication.
router.use(requireAuth);

// ============================================
// GET /api/sms/status
// Admin only: Check SMS gateway configuration
// ============================================

router.get(
    "/status",
    authorizeRoles("admin"),
    (req, res) => {
        const enabled =
            String(process.env.SMS_ENABLED).toLowerCase() === "true";

        const configured = Boolean(
            process.env.TEXTBEE_API_KEY &&
            process.env.TEXTBEE_DEVICE_ID &&
            !process.env.TEXTBEE_API_KEY.startsWith("YOUR_") &&
            !process.env.TEXTBEE_DEVICE_ID.startsWith("YOUR_")
        );

        return res.status(200).json({
            success: true,
            gateway: "TextBee",
            enabled,
            configured,
            ready: enabled && configured
        });
    }
);

// ============================================
// GET /api/sms/stats
// Admin: All statistics
// Coordinator: Own sent-message statistics
// ============================================

router.get(
    "/stats",
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {
        try {
            const filter = isAdmin(req)
                ? {}
                : { sentBy: req.user._id };

            const [total, accepted, failed] = await Promise.all([
                SMSLog.countDocuments(filter),
                SMSLog.countDocuments({ ...filter, status: "Accepted" }),
                SMSLog.countDocuments({ ...filter, status: "Failed" })
            ]);

            const recipientResult = await SMSLog.aggregate([
                {
                    $match: {
                        ...filter,
                        status: "Accepted"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRecipients: { $sum: "$recipientCount" }
                    }
                }
            ]);

            return res.status(200).json({
                success: true,
                statistics: {
                    total,
                    accepted,
                    failed,
                    totalRecipients:
                        recipientResult[0]?.totalRecipients || 0
                }
            });

        } catch (error) {
            console.error("SMS Statistics Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve SMS statistics."
            });
        }
    }
);

// ============================================
// GET /api/sms/logs
// Admin: All SMS history
// Coordinator: Own SMS history
// ============================================

router.get(
    "/logs",
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {
        try {
            const page = Math.max(
                1,
                parseInt(req.query.page, 10) || 1
            );

            const limit = Math.min(
                100,
                Math.max(1, parseInt(req.query.limit, 10) || 10)
            );

            const filter = isAdmin(req)
                ? {}
                : { sentBy: req.user._id };

            if (req.query.status) {
                if (!["Accepted", "Failed"].includes(req.query.status)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid SMS status filter."
                    });
                }

                filter.status = req.query.status;
            }

            if (req.query.type) {
                if (!VALID_TYPES.includes(req.query.type)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid SMS type filter."
                    });
                }

                filter.type = req.query.type;
            }

            const total = await SMSLog.countDocuments(filter);

            const logs = await SMSLog.find(filter)
                .select("-__v")
                .populate("sentBy", "name email")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            return res.status(200).json({
                success: true,
                logs,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error("SMS Logs Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve SMS history."
            });
        }
    }
);

// ============================================
// GET /api/sms/volunteers
// Admin and Coordinator: Active volunteers
// Used by Coordinator Communication UI
// ============================================

router.get(
    "/volunteers",
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {
        try {
            const volunteers = await User.find({
                role: "volunteer",
                isActive: true,
                phone: { $exists: true, $ne: "" }
            })
                .select("name phone")
                .sort({ name: 1 })
                .lean();

            return res.status(200).json({
                success: true,
                volunteers
            });

        } catch (error) {
            console.error("SMS Volunteer List Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve active volunteers."
            });
        }
    }
);

// ============================================
// POST /api/sms/send
// Admin: Existing manual and bulk SMS
// Coordinator: Active volunteers only
// ============================================

router.post(
    "/send",
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {
        let recipients = [];
        let message = "";
        let type = "Manual";

        try {
            const {
                recipients: requestedRecipients,
                volunteerIds,
                audience
            } = req.body;

            message = req.body.message;
            type = req.body.type || "Manual";

            if (
                typeof message !== "string" ||
                !message.trim() ||
                message.length > 5000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Message must contain 1 to 5000 characters."
                });
            }

            message = message.trim();

            if (!VALID_TYPES.includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid notification type."
                });
            }

            if (isCoordinator(req)) {
                // Coordinators cannot submit arbitrary phone numbers.
                if (requestedRecipients !== undefined) {
                    return res.status(403).json({
                        success: false,
                        message: "Coordinators must select active volunteers."
                    });
                }

                if (audience === "all_active") {
                    if (type !== "Announcement") {
                        return res.status(400).json({
                            success: false,
                            message: "Bulk volunteer messages must be announcements."
                        });
                    }

                    const volunteers = await User.find({
                        role: "volunteer",
                        isActive: true,
                        phone: { $exists: true, $ne: "" }
                    }).select("phone").lean();

                    recipients = volunteers.map(v => v.phone);

                } else if (Array.isArray(volunteerIds) &&
                    volunteerIds.length > 0) {

                    if (volunteerIds.length > 100) {
                        return res.status(400).json({
                            success: false,
                            message: "A maximum of 100 volunteers is allowed."
                        });
                    }

                    const uniqueIds = [...new Set(volunteerIds.map(String))];

                    if (uniqueIds.some(id =>
                        !/^[a-f\d]{24}$/i.test(id)
                    )) {
                        return res.status(400).json({
                            success: false,
                            message: "One or more volunteer IDs are invalid."
                        });
                    }

                    const volunteers = await User.find({
                        _id: { $in: uniqueIds },
                        role: "volunteer",
                        isActive: true,
                        phone: { $exists: true, $ne: "" }
                    }).select("_id phone").lean();

                    if (volunteers.length !== uniqueIds.length) {
                        return res.status(400).json({
                            success: false,
                            message: "One or more selected volunteers are inactive or unavailable."
                        });
                    }

                    recipients = volunteers.map(v => v.phone);

                } else {
                    return res.status(400).json({
                        success: false,
                        message: "Select one or more active volunteers."
                    });
                }

                if (recipients.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "No active volunteers with phone numbers were found."
                    });
                }

                if (recipients.length > 100) {
                    return res.status(400).json({
                        success: false,
                        message: "A maximum of 100 recipients is allowed per SMS request."
                    });
                }

                if (audience === "all_active" && type !== "Announcement") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid announcement request."
                    });
                }

            } else {
                // Preserve existing Admin behavior.
                if (!Array.isArray(requestedRecipients) ||
                    requestedRecipients.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Provide at least one recipient phone number."
                    });
                }

                if (requestedRecipients.length > 100) {
                    return res.status(400).json({
                        success: false,
                        message: "A maximum of 100 recipients is allowed per request."
                    });
                }

                if (requestedRecipients.some(number =>
                    typeof number !== "string" ||
                    !/^\+?[0-9]{10,15}$/.test(number.trim())
                )) {
                    return res.status(400).json({
                        success: false,
                        message: "One or more recipient phone numbers are invalid."
                    });
                }

                recipients = requestedRecipients.map(number => number.trim());
            }

            recipients = [...new Set(recipients)];

            const result = await sendSMS(recipients, message);

            const log = await SMSLog.create({
                recipients,
                message,
                type,
                status: result.success ? "Accepted" : "Failed",
                smsBatchId: result.smsBatchId || null,
                errorMessage: result.success ? "" : result.error,
                recipientCount: result.success ? recipients.length : 0,
                sentBy: req.user._id
            });

            if (!result.success) {
                return res.status(502).json({
                    success: false,
                    message: result.error || "SMS sending failed.",
                    logId: log._id
                });
            }

            return res.status(200).json({
                success: true,
                message: "SMS accepted by TextBee.",
                status: "Accepted",
                recipientCount: recipients.length,
                smsBatchId: result.smsBatchId || null,
                logId: log._id
            });

        } catch (error) {
            console.error("Send SMS Route Error:", error);

            if (recipients.length > 0 && message) {
                try {
                    await SMSLog.create({
                        recipients,
                        message,
                        type: VALID_TYPES.includes(type) ? type : "Manual",
                        status: "Failed",
                        errorMessage: "Unexpected server error while sending SMS.",
                        recipientCount: 0,
                        sentBy: req.user._id
                    });
                } catch (logError) {
                    console.error("SMS Failure Logging Error:", logError.message);
                }
            }

            return res.status(500).json({
                success: false,
                message: "Unable to process SMS request."
            });
        }
    }
);

module.exports = router;

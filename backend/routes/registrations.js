
const express = require("express");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const { requireAuth, authorizeRoles } = require("../middleware/auth");

const router = express.Router();
const SMSLog = require("../models/SMSLog");
const { sendSMS } = require("../services/smsService");

router.use(requireAuth);


// --------------------------------------------------
// IST DATE HELPER
// --------------------------------------------------

function getISTDateKey(date) {

    if (!date) {
        return "";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "";
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(value);

    const result = Object.fromEntries(
        parts.map(part => [part.type, part.value])
    );

    return `${result.year}-${result.month}-${result.day}`;
}


// --------------------------------------------------
// VOLUNTEER REGISTERS FOR AN EVENT
// --------------------------------------------------

router.post(
    "/event/:eventId",
    authorizeRoles("volunteer"),
    async (req, res) => {

        let reservedEventId = null;

        try {

            const { eventId } = req.params;

            // Validate event ID.
            if (!mongoose.isValidObjectId(eventId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid event ID."
                });
            }

            const now = new Date();

            // Atomically reserve a seat only when:
            // 1. Event exists.
            // 2. Event is published.
            // 3. Registration deadline has not passed.
            // 4. Event has available capacity.

            const event = await Event.findOneAndUpdate(
                {
                    _id: eventId,
                    status: "Published",
                    registrationDeadline: {
                        $gt: now
                    },
                    $expr: {
                        $lt: [
                            "$registeredCount",
                            "$capacity"
                        ]
                    }
                },
                {
                    $inc: {
                        registeredCount: 1
                    }
                },
                {
                    new: true
                }
            );

            // Handle unavailable registration.
            if (!event) {

                const existingEvent = await Event.findById(
                    eventId
                ).lean();

                if (!existingEvent) {
                    return res.status(404).json({
                        success: false,
                        message: "Event not found."
                    });
                }

                if (existingEvent.status !== "Published") {
                    return res.status(400).json({
                        success: false,
                        message: "This event is not open for registration."
                    });
                }

                if (
                    !existingEvent.registrationDeadline ||
                    new Date(existingEvent.registrationDeadline) <= now
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "The registration deadline has passed."
                    });
                }

                return res.status(409).json({
                    success: false,
                    message: "Event capacity is full."
                });
            }

            reservedEventId = event._id;

            // Create volunteer registration.
            const registration = await EventRegistration.create({
                event: event._id,
                volunteer: req.user._id,
                status: "Pending"
            });

            // Registration created successfully.
            // Do not release the reserved seat.
            reservedEventId = null;

            return res.status(201).json({
                success: true,
                message: "Event registration submitted successfully.",
                registration
            });

        } catch (error) {

            // Release reserved capacity if registration creation fails.
            if (reservedEventId) {

                await Event.updateOne(
                    {
                        _id: reservedEventId,
                        registeredCount: {
                            $gt: 0
                        }
                    },
                    {
                        $inc: {
                            registeredCount: -1
                        }
                    }
                );

            }

            // Duplicate registration.
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "You have already registered for this event."
                });
            }

            console.error("Event registration error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to complete event registration."
            });

        }
    }
);


// --------------------------------------------------
// VOLUNTEER VIEWS THEIR OWN REGISTRATIONS
// --------------------------------------------------

router.get(
    "/my",
    authorizeRoles("volunteer"),
    async (req, res) => {

        try {

            const registrations = await EventRegistration.find({
                volunteer: req.user._id
            })
                .populate({
                    path: "event",
                    select: "title category eventDate startTime endTime venue status"
                })
                .sort({
                    registrationDate: -1
                })
                .lean();

            return res.json({
                success: true,
                registrations
            });

        } catch (error) {

            console.error("My registrations error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve your registrations."
            });

        }
    }
);


// --------------------------------------------------
// VIEW ALL REGISTRATIONS FOR AN EVENT
// ADMIN AND COORDINATOR
// --------------------------------------------------

router.get(
    "/event/:eventId",
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {

        try {

            const { eventId } = req.params;

            if (!mongoose.isValidObjectId(eventId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid event ID."
                });
            }

            const event = await Event.findById(eventId);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found."
                });
            }

            const registrations = await EventRegistration.find({
                event: eventId
            })
                .populate(
                    "volunteer",
                    "name email phone isActive"
                )
                .populate(
                    "volunteer",
                    "name nameKannada email phone isActive"
                )
                .sort({
                    registrationDate: -1
                })
                .lean();

            return res.json({

                success: true,

                event: {
                    id: event._id,
                    title: event.title,
                    capacity: event.capacity,
                    registeredCount: event.registeredCount
                },

                registrations

            });

        } catch (error) {

            console.error("Event registrations error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve event registrations."
            });

        }
    }
);


// --------------------------------------------------
// APPROVE OR REJECT A REGISTRATION
// ADMIN AND COORDINATOR
// --------------------------------------------------

router.patch(
    "/:id/review",
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {

        try {

            const { id } = req.params;
            const { status, remarks } = req.body;

            // Validate registration ID.
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid registration ID."
                });
            }

            // Validate review status.
            if (!["Approved", "Rejected"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Status must be Approved or Rejected."
                });
            }

            // Validate remarks.
            if (
                remarks !== undefined &&
                (
                    typeof remarks !== "string" ||
                    remarks.length > 500
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Remarks must not exceed 500 characters."
                });
            }

            // Atomically update only pending registrations.
            const updateFields = {
                status,
                reviewedBy: req.user._id,
                reviewedAt: new Date()
            };

            if (remarks !== undefined) {
                updateFields.remarks = remarks.trim();
            }

            const registration = await EventRegistration.findOneAndUpdate(
                {
                    _id: id,
                    status: "Pending"
                },
                {
                    $set: updateFields
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!registration) {

                const existing = await EventRegistration.findById(id);

                if (!existing) {
                    return res.status(404).json({
                        success: false,
                        message: "Registration not found."
                    });
                }

                return res.status(409).json({
                    success: false,
                    message: "Only pending registrations can be reviewed."
                });

            }

            // Release reserved capacity when rejected.
            if (status === "Rejected") {

                const event = await Event.findOneAndUpdate(
                    {
                        _id: registration.event,
                        registeredCount: {
                            $gt: 0
                        }
                    },
                    {
                        $inc: {
                            registeredCount: -1
                        }
                    },
                    {
                        new: true
                    }
                );

                if (!event) {

                    console.error(
                        "Unable to release event reservation for registration:",
                        registration._id
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Registration was rejected, but event capacity could not be updated. Administrator attention is required."
                    });

                }

            }

            return res.json({
                success: true,
                message: `Registration ${status.toLowerCase()} successfully.`,
                registration
            });

        } catch (error) {

            console.error("Review registration error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to review registration."
            });

        }
    }
);


// --------------------------------------------------
// EVENT-WISE ATTENDANCE SUMMARY
// ADMIN AND COORDINATOR
// GET /api/registrations/event/:eventId/attendance
// --------------------------------------------------

router.get(
    "/event/:eventId/attendance",
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {
        try {
            const { eventId } = req.params;

            if (!mongoose.isValidObjectId(eventId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid event ID."
                });
            }

            const event = await Event.findById(eventId)
                .select("title eventDate capacity")
                .lean();

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found."
                });
            }

            const filter = {
                event: eventId,
                status: "Approved"
            };

            const [
                totalApproved,
                present,
                absent,
                notMarked
            ] = await Promise.all([
                EventRegistration.countDocuments(filter),

                EventRegistration.countDocuments({
                    ...filter,
                    attendance: "Present"
                }),

                EventRegistration.countDocuments({
                    ...filter,
                    attendance: "Absent"
                }),

                EventRegistration.countDocuments({
                    ...filter,
                    attendance: {
                        $nin: ["Present", "Absent"]
                    }
                })
            ]);

            const totalMarked = present + absent;

            const attendancePercentage = totalApproved > 0
                ? Number(
                    ((present / totalApproved) * 100).toFixed(2)
                )
                : 0;

            const markingCoveragePercentage = totalApproved > 0
                ? Number(
                    ((totalMarked / totalApproved) * 100).toFixed(2)
                )
                : 0;

            return res.status(200).json({
                success: true,

                event: {
                    id: event._id,
                    title: event.title,
                    eventDate: event.eventDate,
                    capacity: event.capacity
                },

                attendance: {
                    totalApproved,
                    present,
                    absent,
                    notMarked,
                    totalMarked,
                    attendancePercentage,
                    markingCoveragePercentage
                }
            });

        } catch (error) {
            console.error(
                "Event Attendance Summary Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve attendance summary."
            });
        }
    }
);



// --------------------------------------------------
// MARK OR UPDATE ATTENDANCE
// ADMIN AND COORDINATOR
// PATCH /api/registrations/:id/attendance
// --------------------------------------------------

router.patch(
    "/:id/attendance",
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { attendance } = req.body;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid registration ID."
                });
            }

            if (!["Present", "Absent", "Late"].includes(attendance)) {
                return res.status(400).json({
                    success: false,
                    message: "Attendance must be Present, Absent, or Late."
                });
            }

            // Retrieve registration and validate approval.
            const existing = await EventRegistration.findById(id)
                .select("event status attendance");

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: "Registration not found."
                });
            }

            if (existing.status !== "Approved") {
                return res.status(400).json({
                    success: false,
                    message: "Attendance can only be marked for approved registrations."
                });
            }


            // --------------------------------------------------
            // PREVENT DUPLICATE ATTENDANCE SMS
            // --------------------------------------------------

            if (existing.attendance === attendance) {
                return res.status(200).json({
                    success: true,
                    message: `Attendance is already marked as ${attendance}. No duplicate SMS sent.`,
                    attendanceUnchanged: true,
                    smsNotification: {
                        attempted: false,
                        status: "Skipped",
                        message: "Attendance has not changed. Duplicate SMS prevented."
                    }
                });
            }

            // Retrieve associated event.
            const event = await Event.findById(existing.event)
                .select("title eventDate")
                .lean();

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "The associated event was not found."
                });
            }

            // Validate event date using IST.
            const eventDay = getISTDateKey(event.eventDate);
            const today = getISTDateKey(new Date());

            if (!eventDay || !today) {
                return res.status(400).json({
                    success: false,
                    message: "Unable to validate the event date."
                });
            }

            if (today < eventDay) {
                return res.status(400).json({
                    success: false,
                    message: `Attendance cannot be marked before the event date (${eventDay}).`
                });
            }

            // Atomically update only approved registrations.
            const registration = await EventRegistration.findOneAndUpdate(
                {
                    _id: id,
                    status: "Approved",
                    attendance: { $ne: attendance }
                },
                {
                    $set: {
                        attendance,
                        attendanceMarkedBy: req.user._id,
                        attendanceMarkedAt: new Date()
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate(
                    "volunteer",
                    "name email phone preferredLanguage"
                )
                .populate("attendanceMarkedBy", "name");

            if (!registration) {

                // Check whether another request already applied this attendance.
                const latestRegistration = await EventRegistration.findById(id)
                    .select("status attendance");

                if (
                    latestRegistration &&
                    latestRegistration.status === "Approved" &&
                    latestRegistration.attendance === attendance
                ) {
                    return res.status(200).json({
                        success: true,
                        message: `Attendance is already marked as ${attendance}. No duplicate SMS sent.`,
                        attendanceUnchanged: true,
                        smsNotification: {
                            attempted: false,
                            status: "Skipped",
                            message: "Another request already applied this attendance. Duplicate SMS prevented."
                        }
                    });
                }

                return res.status(409).json({
                    success: false,
                    message: "Registration status changed. Please refresh and try again."
                });
            }


            // --------------------------------------------------
            // AUTOMATIC ATTENDANCE SMS NOTIFICATION
            // --------------------------------------------------

            let smsNotification = {
                attempted: false,
                status: "Skipped",
                message: "SMS notification was not attempted."
            };

            try {

                const volunteer = registration.volunteer;

                if (volunteer && volunteer.phone) {

                    smsNotification.attempted = true;

                    const language =
                        volunteer.preferredLanguage === "kn" ? "kn" : "en";

                    const attendanceKannada = {
                        Present: "ಹಾಜರಿದ್ದಾರೆ",
                        Absent: "ಗೈರುಹಾಜರಾಗಿದ್ದಾರೆ",
                        Late: "ತಡವಾಗಿ ಹಾಜರಾಗಿದ್ದಾರೆ"
                    };

                    const smsMessage = language === "kn"
                        ? `ನಮಸ್ಕಾರ ${volunteer.name}, ${event.title} ಕಾರ್ಯಕ್ರಮದಲ್ಲಿ ನಿಮ್ಮ ಹಾಜರಾತಿಯನ್ನು ${attendanceKannada[attendance]} ಎಂದು ದಾಖಲಿಸಲಾಗಿದೆ. NGO Volunteer Management System.`
                        : `Hello ${volunteer.name}, your attendance for "${event.title}" has been marked as ${attendance}. Thank you. - NGO Volunteer Management System`;

                    const smsResult = await sendSMS(
                        [volunteer.phone],
                        smsMessage
                    );

                    smsNotification.status =
                        smsResult.success ? "Accepted" : "Failed";

                    smsNotification.message = smsResult.success
                        ? "Attendance SMS accepted by TextBee."
                        : smsResult.error || "Attendance SMS failed.";

                    // Record SMS attempt independently.
                    try {

                        const smsLog = await SMSLog.create({

                            recipients: [volunteer.phone],

                            message: smsMessage,

                            type: "Attendance",

                            status: smsResult.success
                                ? "Accepted"
                                : "Failed",

                            smsBatchId: smsResult.smsBatchId || null,

                            errorMessage: smsResult.success
                                ? ""
                                : smsResult.error || "SMS sending failed.",

                            recipientCount: smsResult.success ? 1 : 0,

                            sentBy: req.user._id

                        });

                        smsNotification.logId = smsLog._id;

                    } catch (logError) {

                        console.error(
                            "Attendance SMS Logging Error:",
                            logError.message
                        );

                        smsNotification.logError =
                            "SMS attempt could not be recorded.";

                    }

                } else {

                    smsNotification.message =
                        "Volunteer phone number is unavailable.";

                }

            } catch (smsError) {

                console.error(
                    "Attendance SMS Notification Error:",
                    smsError.message
                );

                smsNotification.status = "Failed";

                smsNotification.message =
                    "Attendance updated, but SMS notification failed.";

            }


            return res.status(200).json({
                success: true,

                message: `Attendance marked as ${attendance} successfully.`,

                registration,

                smsNotification
            });

        } catch (error) {
            console.error("Mark Attendance Error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to update attendance."
            });
        }
    }
);


// --------------------------------------------------
// EXPORT ROUTER
// --------------------------------------------------

module.exports = router;

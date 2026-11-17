
const express = require("express");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const { requireAuth, authorizeRoles } = require("../middleware/auth");

const router = express.Router();
const User = require("../models/User");
const SMSLog = require("../models/SMSLog");
const { sendSMS } = require("../services/smsService");

router.use(requireAuth);

// --------------------------------------------------
// EVENT CATEGORIES AND STATUSES
// --------------------------------------------------

const eventCategories = [
    "Education",
    "Healthcare",
    "Environment",
    "Community Development",
    "Food Distribution",
    "Animal Welfare",
    "Other"
];

const eventStatuses = [
    "Draft",
    "Published",
    "Cancelled",
    "Completed"
];


// --------------------------------------------------
// DUPLICATE EVENT KEY
// --------------------------------------------------

function createEventKey(title, eventDate, venue) {

    const dateKey = getISTDateKey(eventDate);

    const normalizedTitle = String(title || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const normalizedVenue = String(venue || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    return [
        dateKey,
        normalizedTitle,
        normalizedVenue
    ].join("|");
}


function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


// --------------------------------------------------
// CHECK NEW AND LEGACY DUPLICATE EVENTS
// --------------------------------------------------

async function findDuplicateEvent({
    eventKey,
    title,
    eventDate,
    venue,
    excludeId = null
}) {

    const normalizedTitle = String(title || "")
        .trim()
        .replace(/\s+/g, " ");

    const normalizedVenue = String(venue || "")
        .trim()
        .replace(/\s+/g, " ");

    // Determine the complete IST calendar-day range.
    const dateKey = getISTDateKey(eventDate);

    const dayStart = parseISTDate(dateKey);
    const dayEnd = parseISTDate(dateKey, true);

    // Allow different amounts of whitespace in legacy records.
    const titlePattern = normalizedTitle
        .split(/\s+/)
        .map(escapeRegex)
        .join("\\s+");

    const venuePattern = normalizedVenue
        .split(/\s+/)
        .map(escapeRegex)
        .join("\\s+");

    const filter = {
        $or: [
            // Exact duplicate key for newer records.
            { eventKey },

            // Legacy records without eventKey.
            {
                eventDate: {
                    $gte: dayStart,
                    $lte: dayEnd
                },
                title: {
                    $regex: `^${titlePattern}$`,
                    $options: "i"
                },
                venue: {
                    $regex: `^${venuePattern}$`,
                    $options: "i"
                }
            }
        ]
    };

    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    return Event.findOne(filter)
        .select("_id title eventDate venue");
}


// --------------------------------------------------
// ATOMIC EVENT ANNOUNCEMENT
// --------------------------------------------------

async function claimAndAnnounceEvent(eventId, sentBy) {

    const event = await Event.findOneAndUpdate(
        {
            _id: eventId,
            status: "Published",
            announcementClaimedAt: null
        },
        {
            $set: {
                announcementClaimedAt: new Date()
            }
        },
        {
            new: true
        }
    );

    // Another request has already claimed this announcement.
    if (!event) {
        return false;
    }

    await announcePublishedEvent(event, sentBy);

    return true;
}
// --------------------------------------------------
// IST DATE HELPERS
// --------------------------------------------------

/**
 * Convert YYYY-MM-DD into a JavaScript Date representing
 * the selected date in Indian Standard Time (UTC +05:30).
 *
 * endOfDay = false:
 *     Start of the selected IST calendar day.
 *
 * endOfDay = true:
 *     Last millisecond of the selected IST calendar day.
 */
function parseISTDate(dateString, endOfDay = false) {

    if (typeof dateString !== "string") {
        return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    // Validate the actual calendar date.
    const check = new Date(Date.UTC(year, month - 1, day));

    if (
        check.getUTCFullYear() !== year ||
        check.getUTCMonth() !== month - 1 ||
        check.getUTCDate() !== day
    ) {
        return null;
    }

    // IST = UTC +05:30.
    const istOffsetMinutes = 330;

    if (endOfDay) {

        return new Date(
            Date.UTC(year, month - 1, day + 1) -
            istOffsetMinutes * 60 * 1000 -
            1
        );

    }

    return new Date(
        Date.UTC(year, month - 1, day) -
        istOffsetMinutes * 60 * 1000
    );
}


/**
 * Convert a Date into its IST calendar date key.
 *
 * Returns YYYY-MM-DD.
 */
function getISTDateKey(value) {

    if (!value) {
        return "";
    }

    // Handle YYYY-MM-DD strings directly.
    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return parseISTDate(value) ? value : "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map(part => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
}


// --------------------------------------------------
// EVENT VALIDATION
// --------------------------------------------------

function validateEventData(data, checkPastDates = false) {

    const errors = [];

    // Title
    if (
        typeof data.title !== "string" ||
        !data.title.trim()
    ) {
        errors.push("Event title is required.");
    } else if (data.title.trim().length > 150) {
        errors.push("Event title cannot exceed 150 characters.");
    }

    // Description
    if (
        typeof data.description !== "string" ||
        !data.description.trim()
    ) {
        errors.push("Event description is required.");
    }

    // Category
    if (!eventCategories.includes(data.category)) {
        errors.push("Please select a valid event category.");
    }

    // Event date
    const eventDateKey = getISTDateKey(data.eventDate);

    if (!eventDateKey) {
        errors.push("Please provide a valid event date.");
    }

    // Registration deadline
    const deadlineDateKey = getISTDateKey(
        data.registrationDeadline
    );

    if (!deadlineDateKey) {
        errors.push("Please provide a valid registration deadline.");
    }

    // Prevent past dates when creating a new event.
    const todayIST = getISTDateKey(new Date());

    if (checkPastDates && eventDateKey && deadlineDateKey) {

        if (eventDateKey < todayIST) {
            errors.push("Event date cannot be in the past.");
        }

        if (deadlineDateKey < todayIST) {
            errors.push("Registration deadline cannot be in the past.");
        }
    }

    // Registration deadline must not be later than event date.
    if (
        eventDateKey &&
        deadlineDateKey &&
        deadlineDateKey > eventDateKey
    ) {
        errors.push(
            "Registration deadline cannot be later than the event date."
        );
    }

    // Time validation
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (
        typeof data.startTime !== "string" ||
        !timePattern.test(data.startTime)
    ) {
        errors.push("Please provide a valid start time.");
    }

    if (
        typeof data.endTime !== "string" ||
        !timePattern.test(data.endTime)
    ) {
        errors.push("Please provide a valid end time.");
    }

    if (
        typeof data.startTime === "string" &&
        typeof data.endTime === "string" &&
        timePattern.test(data.startTime) &&
        timePattern.test(data.endTime) &&
        data.startTime >= data.endTime
    ) {
        errors.push("Event end time must be later than start time.");
    }

    // Venue
    if (
        typeof data.venue !== "string" ||
        !data.venue.trim()
    ) {
        errors.push("Event venue is required.");
    }

    // Capacity
    const capacity = Number(data.capacity);

    if (
        !Number.isInteger(capacity) ||
        capacity < 1
    ) {
        errors.push("Event capacity must be a positive whole number.");
    }

    // Required volunteers
    const requiredVolunteers = Number(
        data.requiredVolunteers
    );

    if (
        !Number.isInteger(requiredVolunteers) ||
        requiredVolunteers < 1
    ) {
        errors.push(
            "Required volunteers must be a positive whole number."
        );
    } else if (
        Number.isInteger(capacity) &&
        capacity >= 1 &&
        requiredVolunteers > capacity
    ) {
        errors.push(
            "Required volunteers cannot exceed event capacity."
        );
    }

    // Status
    if (
        data.status !== undefined &&
        !eventStatuses.includes(data.status)
    ) {
        errors.push("Please select a valid event status.");
    }

    return errors;
}


// --------------------------------------------------
// CREATE EVENT
// --------------------------------------------------

router.post(
    "/",
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {

        try {

            const errors = validateEventData(req.body, true);

            if (errors.length) {
                return res.status(400).json({
                    success: false,
                    message: errors[0],
                    errors
                });
            }

            // Convert event date to IST midnight.
            const eventDate = parseISTDate(
                req.body.eventDate
            );

            const eventKey = createEventKey(
                req.body.title,
                eventDate,
                req.body.venue
            );

            // Convert registration deadline to IST end of day.
            const registrationDeadline = parseISTDate(
                req.body.registrationDeadline,
                true
            );

            if (!eventDate || !registrationDeadline) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid event date or registration deadline."
                });
            }


            // Check whether this event already exists.
            const duplicateEvent = await findDuplicateEvent({
                eventKey,
                title: req.body.title,
                eventDate,
                venue: req.body.venue
            });

            if (duplicateEvent) {
                return res.status(409).json({
                    success: false,
                    message: "A similar event already exists for this date and venue.",
                    duplicateEventId: duplicateEvent._id
                });
            }

            const event = await Event.create({

                title: req.body.title.trim(),

                titleKannada:
                    typeof req.body.titleKannada === "string"
                        ? req.body.titleKannada.trim()
                        : "",

                description: req.body.description.trim(),

                category: req.body.category,

                eventDate,

                registrationDeadline,

                startTime: req.body.startTime,

                endTime: req.body.endTime,

                venue: req.body.venue.trim(),

                address: req.body.address || "",

                capacity: Number(req.body.capacity),

                requiredVolunteers: Number(
                    req.body.requiredVolunteers || 1
                ),

                status: req.body.status || "Draft",

                createdBy: req.user._id,

                eventKey

            });

            // Send announcement only when the event is created as Published.
            if (event.status === "Published") {
                await claimAndAnnounceEvent(
                    event._id,
                    req.user._id
                );
            }

            return res.status(201).json({
                success: true,
                message: "Event created successfully.",
                event
            });

        } catch (error) {

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "This event already exists. Duplicate creation prevented."
                });
            }
            console.error("Create event error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to create event."
            });

        }
    }
);


// --------------------------------------------------
// LIST EVENTS
// --------------------------------------------------

router.get("/", async (req, res) => {

    try {

        const page = Math.max(
            1,
            Number.parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            100,
            Math.max(
                1,
                Number.parseInt(req.query.limit, 10) || 10
            )
        );

        const filter = {};

        // Volunteers can only see published events.
        if (req.user.role === "volunteer") {

            filter.status = "Published";

        } else {

            if (
                req.query.status &&
                eventStatuses.includes(req.query.status)
            ) {
                filter.status = req.query.status;
            }

            if (
                req.query.category &&
                eventCategories.includes(req.query.category)
            ) {
                filter.category = req.query.category;
            }

        }

        // Search events.
        if (req.query.search) {

            const search = req.query.search.trim().slice(0, 100);

            if (search) {

                filter.$or = [
                    {
                        title: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        venue: {
                            $regex: search,
                            $options: "i"
                        }
                    }
                ];

            }
        }

        const [events, total] = await Promise.all([

            Event.find(filter)
                .populate("createdBy", "name email")
                .sort({
                    eventDate: 1,
                    createdAt: -1
                })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),

            Event.countDocuments(filter)

        ]);

        return res.json({

            success: true,

            events,

            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }

        });

    } catch (error) {

        console.error("List events error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve events."
        });

    }
});


// --------------------------------------------------
// GET EVENT DETAILS
// --------------------------------------------------

router.get("/:id", async (req, res) => {

    try {

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const event = await Event.findById(req.params.id)
            .populate("createdBy", "name email");

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        // Volunteers cannot access unpublished events.
        if (
            req.user.role === "volunteer" &&
            event.status !== "Published"
        ) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        return res.json({
            success: true,
            event
        });

    } catch (error) {

        console.error("Get event error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve event."
        });

    }
});


// --------------------------------------------------
// UPDATE EVENT
// --------------------------------------------------

router.patch(
    "/:id",
    authorizeRoles("admin", "coordinator"),
    async (req, res) => {

        try {

            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid event ID."
                });
            }

            const event = await Event.findById(req.params.id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found."
                });
            }

            const allowedFields = [
                "title",
                "titleKannada",
                "description",
                "category",
                "eventDate",
                "startTime",
                "endTime",
                "venue",
                "address",
                "capacity",
                "requiredVolunteers",
                "registrationDeadline",
                "status"
            ];

            const updates = {};

            // Accept only permitted fields.
            for (const field of allowedFields) {

                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }

            }

            // ------------------------------------------
            // NORMALIZE SUPPLIED DATES BEFORE VALIDATION
            // ------------------------------------------

            if (updates.eventDate !== undefined) {

                const parsedEventDate = parseISTDate(
                    updates.eventDate
                );

                if (!parsedEventDate) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid event date. Use YYYY-MM-DD format."
                    });
                }

                updates.eventDate = parsedEventDate;

            }

            if (updates.registrationDeadline !== undefined) {

                const parsedDeadline = parseISTDate(
                    updates.registrationDeadline,
                    true
                );

                if (!parsedDeadline) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid registration deadline. Use YYYY-MM-DD format."
                    });
                }

                updates.registrationDeadline = parsedDeadline;

            }

            // ------------------------------------------
            // NORMALIZE OTHER EDITABLE FIELDS
            // ------------------------------------------

            if (updates.title !== undefined) {
                updates.title = updates.title.trim();
            }

            if (updates.titleKannada !== undefined) {
                if (typeof updates.titleKannada !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Kannada event title must be text."
                    });
                }

                updates.titleKannada = updates.titleKannada.trim();
            }

            if (updates.description !== undefined) {
                updates.description = updates.description.trim();
            }

            if (updates.venue !== undefined) {
                updates.venue = updates.venue.trim();
            }

            if (updates.capacity !== undefined) {
                updates.capacity = Number(updates.capacity);
            }

            if (updates.requiredVolunteers !== undefined) {
                updates.requiredVolunteers = Number(
                    updates.requiredVolunteers
                );
            }

            // Generate a duplicate-prevention key for the updated event.
            const proposedEventDate =
                updates.eventDate !== undefined
                    ? updates.eventDate
                    : event.eventDate;

            const proposedTitle =
                updates.title !== undefined
                    ? updates.title
                    : event.title;

            const proposedVenue =
                updates.venue !== undefined
                    ? updates.venue
                    : event.venue;

            const proposedEventKey = createEventKey(
                proposedTitle,
                proposedEventDate,
                proposedVenue
            );

            // Do not allow an update to create a duplicate event.
            const duplicateEvent = await findDuplicateEvent({
                eventKey: proposedEventKey,
                title: proposedTitle,
                eventDate: proposedEventDate,
                venue: proposedVenue,
                excludeId: event._id
            });

            if (duplicateEvent) {
                return res.status(409).json({
                    success: false,
                    message: "Another event with the same title, date and venue already exists."
                });
            }

            updates.eventKey = proposedEventKey;
            // ------------------------------------------
            // VALIDATE THE COMPLETE PROPOSED EVENT
            // ------------------------------------------

            const merged = {
                ...event.toObject(),
                ...updates
            };

            const errors = validateEventData(merged);

            if (errors.length) {
                return res.status(400).json({
                    success: false,
                    message: errors[0],
                    errors
                });
            }

            // ------------------------------------------
            // SAVE VALIDATED UPDATES
            // ------------------------------------------

            // Remember the status before applying updates.
            const previousStatus = event.status;

            Object.assign(event, updates);

            event.updatedBy = req.user._id;

            await event.save();

            // Send announcement only when the event becomes Published.
            if (
                previousStatus !== "Published" &&
                event.status === "Published"
            ) {
                await claimAndAnnounceEvent(
                    event._id,
                    req.user._id
                );
            }

            return res.json({
                success: true,
                message: "Event updated successfully.",
                event
            });

        }



        catch (error) {

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Another event with the same title, date and venue already exists."
                });
            }

            console.error("Update event error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to update event."
            });

        }
    }
);


// --------------------------------------------------
// DELETE EVENT (ADMIN ONLY)
// --------------------------------------------------

router.delete(
    "/:id",
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid event ID."
                });
            }

            const event = await Event.findById(req.params.id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found."
                });
            }

            await event.deleteOne();

            return res.json({
                success: true,
                message: "Event deleted successfully."
            });

        } catch (error) {

            console.error("Delete event error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to delete event."
            });

        }
    }
);


function formatEventDate(date, language = "en") {
    return new Date(date).toLocaleDateString(
        language === "kn" ? "kn-IN" : "en-IN",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Kolkata"
        }
    );
}

async function sendAndLogEventSMS(recipients, message, sentBy) {
    try {
        const result = await sendSMS(recipients, message);

        try {
            await SMSLog.create({
                recipients,
                message,
                type: "Announcement",
                status: result.success ? "Accepted" : "Failed",
                smsBatchId: result.smsBatchId || null,
                errorMessage: result.success
                    ? ""
                    : result.error || "SMS failed",
                recipientCount: recipients.length,
                sentBy: sentBy || null
            });
        } catch (logError) {
            console.error(
                "Event SMS log creation failed:",
                logError.message
            );
        }

        return result;

    } catch (error) {
        console.error("Event announcement failed:", error.message);

        return {
            success: false,
            error: error.message
        };
    }
}

async function announcePublishedEvent(event, sentBy) {
    try {
        // Announcements are restricted to Published events.
        if (event.status !== "Published") {
            return;
        }

        // Retrieve all active coordinators and volunteers.
        const users = await User.find({
            role: {
                $in: ["coordinator", "volunteer"]
            },
            isActive: true
        })
            .select("phone preferredLanguage")
            .sort({ createdAt: 1, _id: 1 })
            .lean();

        // Deduplicate phone numbers across all accounts.
        const seenPhones = new Set();

        const recipientsByLanguage = {
            en: [],
            kn: []
        };

        for (const user of users) {
            const phone = String(user.phone || "").trim();

            if (!/^\+?\d{8,15}$/.test(phone)) {
                continue;
            }

            if (seenPhones.has(phone)) {
                continue;
            }

            seenPhones.add(phone);

            const language = user.preferredLanguage === "kn"
                ? "kn"
                : "en";

            recipientsByLanguage[language].push(phone);
        }

        const eventDate = formatEventDate(event.eventDate, "en");
        const deadline = formatEventDate(
            event.registrationDeadline,
            "en"
        );

        // English announcement.
        if (recipientsByLanguage.en.length > 0) {
            const message = [
                `NEW VOLUNTEER OPPORTUNITY`,
                `Event: ${event.title}`,
                `Date: ${eventDate}`,
                `Time: ${event.startTime} - ${event.endTime}`,
                `Venue: ${event.venue}`,
                `Registration Deadline: ${deadline}`,
                `To participate, log in to the NGO Volunteer Management System and register for this event.`,
                `Thank you.`
            ].join("\n");

            await sendAndLogEventSMS(
                recipientsByLanguage.en,
                message,
                sentBy
            );
        }

        // Kannada announcement.
        if (recipientsByLanguage.kn.length > 0) {
            const kannadaDate = formatEventDate(
                event.eventDate,
                "kn"
            );

            const kannadaDeadline = formatEventDate(
                event.registrationDeadline,
                "kn"
            );

            const eventTitle = event.titleKannada || event.title;

            const message = [
                `ಹೊಸ ಸ್ವಯಂಸೇವಕರ ಅವಕಾಶ`,
                `ಕಾರ್ಯಕ್ರಮ: ${eventTitle}`,
                `ದಿನಾಂಕ: ${kannadaDate}`,
                `ಸಮಯ: ${event.startTime} - ${event.endTime}`,
                `ಸ್ಥಳ: ${event.venue}`,
                `ನೋಂದಣಿಯ ಕೊನೆಯ ದಿನಾಂಕ: ${kannadaDeadline}`,
                `ಭಾಗವಹಿಸಲು NGO Volunteer Management System ಗೆ ಲಾಗಿನ್ ಮಾಡಿ ಮತ್ತು ಈ ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ನೋಂದಾಯಿಸಿಕೊಳ್ಳಿ.`,
                `ಧನ್ಯವಾದಗಳು.`
            ].join("\n");

            await sendAndLogEventSMS(
                recipientsByLanguage.kn,
                message,
                sentBy
            );
        }

        console.log(
            `Event announcement processed: ${event.title}. ` +
            `Unique recipients: ${seenPhones.size}`
        );

    } catch (error) {
        // Notification failures must never undo event creation.
        console.error(
            "Published event notification error:",
            error.message
        );
    }
}

// --------------------------------------------------
// EXPORT ROUTER
// --------------------------------------------------

module.exports = router;

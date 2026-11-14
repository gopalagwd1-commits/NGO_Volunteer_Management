
const express = require("express");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const { requireAuth, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

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

                createdBy: req.user._id

            });

            return res.status(201).json({
                success: true,
                message: "Event created successfully.",
                event
            });

        } catch (error) {

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

            Object.assign(event, updates);

            event.updatedBy = req.user._id;

            await event.save();

            return res.json({
                success: true,
                message: "Event updated successfully.",
                event
            });

        } catch (error) {

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


// --------------------------------------------------
// EXPORT ROUTER
// --------------------------------------------------

module.exports = router;

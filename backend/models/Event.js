
const mongoose = require("mongoose");

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
// EVENT SCHEMA
// --------------------------------------------------

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
            minlength: 3,
            maxlength: 150
        },

        titleKannada: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
        },

        description: {
            type: String,
            required: [true, "Event description is required"],
            trim: true,
            maxlength: 3000
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Education",
                "Healthcare",
                "Environment",
                "Community Development",
                "Food Distribution",
                "Animal Welfare",
                "Other"
            ]
        },

        eventDate: {
            type: Date,
            required: [true, "Event date is required"]
        },

        startTime: {
            type: String,
            required: true,
            match: [
                /^([01]\d|2[0-3]):[0-5]\d$/,
                "Invalid start time"
            ]
        },

        endTime: {
            type: String,
            required: true,
            match: [
                /^([01]\d|2[0-3]):[0-5]\d$/,
                "Invalid end time"
            ]
        },

        venue: {
            type: String,
            required: [true, "Event venue is required"],
            trim: true,
            maxlength: 200
        },

        address: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        capacity: {
            type: Number,
            required: true,
            min: 1,
            max: 10000
        },

        registeredCount: {
            type: Number,
            default: 0,
            min: 0
        },

        requiredVolunteers: {
            type: Number,
            default: 1,
            min: 1
        },

        registrationDeadline: {
            type: Date,
            required: [
                true,
                "Registration deadline is required"
            ]
        },

        status: {
            type: String,
            enum: [
                "Draft",
                "Published",
                "Cancelled",
                "Completed"
            ],
            default: "Draft"
        },

                // Unique key used to prevent duplicate event creation.
        eventKey: {
            type: String,
            default: undefined
        },

        // Atomic announcement protection.
        announcementClaimedAt: {
            type: Date,
            default: null
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);


// --------------------------------------------------
// INDEXES
// --------------------------------------------------

eventSchema.index({
    eventDate: 1,
    status: 1
});

eventSchema.index({
    category: 1
});

eventSchema.index({
    createdBy: 1
});

// Prevent duplicate events with the same title, date and venue.
eventSchema.index(
    { eventKey: 1 },
    {
        unique: true,
        sparse: true
    }
);

// --------------------------------------------------
// PRE-VALIDATION MIDDLEWARE
// --------------------------------------------------

eventSchema.pre("validate", function () {

    // 1. Validate event time.
    if (
        this.startTime &&
        this.endTime &&
        this.startTime >= this.endTime
    ) {

        this.invalidate(
            "endTime",
            "End time must be later than start time"
        );

    }


    // 2. Validate required volunteers against capacity.
    if (
        this.requiredVolunteers !== undefined &&
        this.capacity !== undefined &&
        this.requiredVolunteers > this.capacity
    ) {

        this.invalidate(
            "requiredVolunteers",
            "Required volunteers cannot exceed event capacity"
        );

    }


    // 3. Validate registered count against capacity.
    if (
        this.registeredCount !== undefined &&
        this.capacity !== undefined &&
        this.registeredCount > this.capacity
    ) {

        this.invalidate(
            "capacity",
            "Capacity cannot be lower than existing registrations"
        );

    }


    // 4. Validate event date and registration deadline.
    if (
        this.eventDate &&
        this.registrationDeadline
    ) {

        const eventDateKey = getISTDateKey(
            this.eventDate
        );

        const deadlineDateKey = getISTDateKey(
            this.registrationDeadline
        );

        if (!eventDateKey || !deadlineDateKey) {

            this.invalidate(
                "registrationDeadline",
                "Invalid event date or registration deadline"
            );

        } else if (deadlineDateKey > eventDateKey) {

            this.invalidate(
                "registrationDeadline",
                "Registration deadline cannot be after the event date"
            );

        }

    }

});


// --------------------------------------------------
// EXPORT MODEL
// --------------------------------------------------

module.exports =
    mongoose.models.Event ||
    mongoose.model("Event", eventSchema);

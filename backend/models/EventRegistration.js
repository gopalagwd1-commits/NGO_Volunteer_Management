
const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        volunteer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Cancelled"],
            default: "Pending"
        },

        attendance: {
            type: String,
            enum: ["Not Marked", "Present", "Absent", "Late"],
            default: "Not Marked"
        },

        registrationDate: {
            type: Date,
            default: Date.now
        },

        remarks: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        attendanceMarkedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        attendanceMarkedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// A volunteer can register only once for a particular event.
eventRegistrationSchema.index(
    { event: 1, volunteer: 1 },
    { unique: true }
);

eventRegistrationSchema.index({ volunteer: 1, status: 1 });
eventRegistrationSchema.index({ event: 1, status: 1 });

module.exports =
    mongoose.models.EventRegistration ||
    mongoose.model("EventRegistration", eventRegistrationSchema);

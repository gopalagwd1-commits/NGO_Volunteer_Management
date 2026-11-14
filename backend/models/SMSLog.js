const mongoose = require("mongoose");

const smsLogSchema = new mongoose.Schema({
    recipients: {
        type: [String],
        required: true
    },

    message: {
        type: String,
        required: true,
        maxlength: 5000
    },

    type: {
        type: String,
        enum: [
            "Manual",
            "Announcement",
            "Registration",
            "Event Reminder",
            "Event Cancellation",
            "Attendance",
            "System"
        ],
        default: "Manual"
    },

    status: {
        type: String,
        enum: ["Accepted", "Failed"],
        required: true
    },

    smsBatchId: {
        type: String,
        default: null
    },

    errorMessage: {
        type: String,
        default: ""
    },

    recipientCount: {
        type: Number,
        default: 0
    },

    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }

}, {
    timestamps: true
});

smsLogSchema.index({ createdAt: -1 });
smsLogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.SMSLog ||
    mongoose.model("SMSLog", smsLogSchema);

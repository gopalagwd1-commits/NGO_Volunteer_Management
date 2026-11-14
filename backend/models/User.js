
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        nameKannada: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 150,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address"
            ]
        },

        phone: {
            type: String,
            trim: true,
            required: [true, "Phone number is required"],
            match: [
                /^\+?[0-9]{10,15}$/,
                "Please enter a valid phone number"
            ]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false
        },

        role: {
            type: String,
            enum: ["admin", "coordinator", "volunteer"],
            default: "volunteer",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        profileImage: {
            type: String,
            default: ""
        },

        preferredLanguage: {
            type: String,
            enum: ["en", "kn"],
            default: "en"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
});

// Compare entered password with stored password hash
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Avoid model recompilation errors
module.exports =
    mongoose.models.User ||
    mongoose.model("User", userSchema);

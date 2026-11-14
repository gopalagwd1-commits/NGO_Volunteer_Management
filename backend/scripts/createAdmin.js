
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

async function createInitialAdmin() {
    const {
        ADMIN_NAME,
        ADMIN_EMAIL,
        ADMIN_PHONE,
        ADMIN_PASSWORD
    } = process.env;

    // Validate environment variables
    if (
        !ADMIN_NAME ||
        !ADMIN_EMAIL ||
        !ADMIN_PHONE ||
        !ADMIN_PASSWORD
    ) {
        throw new Error(
            "Admin details are missing. Please provide all required values."
        );
    }

    if (ADMIN_PASSWORD.length < 8) {
        throw new Error(
            "Admin password must contain at least 8 characters."
        );
    }

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not configured.");
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    // Prevent accidental creation of multiple initial administrators
    const existingAdmin = await User.findOne({
        role: "admin"
    }).select("_id email");

    if (existingAdmin) {
        console.log(
            "An administrator already exists. No account was created."
        );
        console.log("Existing administrator email:", existingAdmin.email);
        return;
    }

    // Prevent duplicate email addresses
    const existingUser = await User.findOne({
        email: ADMIN_EMAIL.trim().toLowerCase()
    });

    if (existingUser) {
        throw new Error(
            "This email already belongs to an existing account."
        );
    }

    // Create the initial administrator
    const admin = await User.create({
        name: ADMIN_NAME.trim(),
        email: ADMIN_EMAIL.trim().toLowerCase(),
        phone: ADMIN_PHONE.trim(),
        password: ADMIN_PASSWORD,
        role: "admin",
        isActive: true,
        preferredLanguage: "en"
    });

    console.log("");
    console.log("====================================");
    console.log(" INITIAL ADMIN CREATED SUCCESSFULLY");
    console.log("====================================");
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Account Active:", admin.isActive);
    console.log("====================================");
}

createInitialAdmin()
    .catch((error) => {
        console.error("Admin Setup Failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

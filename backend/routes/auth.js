
const express = require("express");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Cookie configuration
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000
});

// Generate JWT
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return jwt.sign(
        { userId: userId.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

// Safe user response
const getSafeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    preferredLanguage: user.preferredLanguage,
    lastLogin: user.lastLogin
});

// ============================================
// REGISTER VOLUNTEER
// POST /api/auth/register
// ============================================

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            preferredLanguage
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields."
            });
        }

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof phone !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration details."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Public registration always creates a volunteer.
        // Never accept role from the request body.
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password,
            role: "volunteer",
            preferredLanguage:
                preferredLanguage === "kn" ? "kn" : "en"
        });

        return res.status(201).json({
            success: true,
            message: "Volunteer account created successfully.",
            user: getSafeUser(user)
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error("Registration Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create account."
        });
    }
});

// ============================================
// LOGIN
// POST /api/auth/login
// ============================================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email and password."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        // Use a generic error to avoid revealing account existence.
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches =
            await user.comparePassword(password);

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.cookie(
            "ngo_token",
            token,
            getCookieOptions()
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: getSafeUser(user)
        });

    } catch (error) {
        console.error("Login Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to process login."
        });
    }
});

// ============================================
// LOGOUT
// POST /api/auth/logout
// ============================================

router.post("/logout", (req, res) => {
    const options = getCookieOptions();

    delete options.maxAge;

    res.clearCookie("ngo_token", options);

    return res.status(200).json({
        success: true,
        message: "Logout successful."
    });
});

// ============================================
// CURRENT LOGGED-IN USER
// GET /api/auth/me
// ============================================

router.get("/me", requireAuth, (req, res) => {
    return res.status(200).json({
        success: true,
        user: getSafeUser(req.user)
    });
});

module.exports = router;

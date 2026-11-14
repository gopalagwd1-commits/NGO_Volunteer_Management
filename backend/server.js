
require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const path = require("path");

const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const volunteerRoutes = require("./routes/volunteers");
const eventRoutes = require("./routes/events");
const registrationRoutes = require("./routes/registrations");
const userRoutes = require("./routes/users");
const smsRoutes = require("./routes/sms");
const transliterationRoutes = require("./routes/transliteration");

const app = express();

const PORT = process.env.PORT || 5013;

// ======================================
// APPLICATION PATHS
// ======================================

const frontendPath = path.join(__dirname, "../frontend");

// ======================================
// SECURITY CONFIGURATION
// ======================================

app.disable("x-powered-by");

app.use(helmet());

// ======================================
// GENERAL MIDDLEWARE
// ======================================

app.use(express.json({
    limit: "1mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "1mb"
}));

app.use(cookieParser());

// ======================================
// API RATE LIMITING
// ======================================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);

// ======================================
// HEALTH CHECK
// ======================================

app.get("/api/health", (req, res) => {

    const databaseConnected =
        mongoose.connection.readyState === 1;

    res.status(databaseConnected ? 200 : 503).json({
        success: databaseConnected,
        application: "NGO Volunteer Connect",
        backend: "running",
        database: databaseConnected
            ? "connected"
            : "disconnected",
        databaseName: databaseConnected
            ? mongoose.connection.name
            : null,
        port: PORT,
        timestamp: new Date().toISOString()
    });

});

// ======================================
// AUTHENTICATION ROUTES
// ======================================

app.use("/api/auth", authRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/transliteration", transliterationRoutes);

// ======================================
// FRONTEND STATIC FILES
// ======================================

app.use(express.static(frontendPath));

// ======================================
// HOME PAGE
// ======================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(frontendPath, "index.html")
    );

});

// ======================================
// 404 HANDLER
// ======================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Requested page or API endpoint not found."
    });

});

// ======================================
// GLOBAL ERROR HANDLER
// ======================================

app.use((err, req, res, next) => {

    console.error("Server Error:", err);

    res.status(err.status || 500).json({
        success: false,
        message: "An internal server error occurred."
    });

});

// ======================================
// START SERVER
// ======================================

const startServer = async () => {

    try {

        await connectDB();

        app.listen(PORT, () => {

            console.log("");
            console.log("====================================");
            console.log(" NGO VOLUNTEER CONNECT");
            console.log("====================================");
            console.log(`Application: http://localhost:${PORT}`);
            console.log(`Login:       http://localhost:${PORT}/login.html`);
            console.log(`Health:      http://localhost:${PORT}/api/health`);
            console.log("Database:    MongoDB Atlas");
            console.log("====================================");
            console.log("");

        });

    } catch (error) {

        console.error("Failed to start server:", error.message);
        process.exit(1);

    }

};

startServer();

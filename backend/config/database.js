
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            console.warn("WARNING: MONGODB_URI is not configured.");
            return false;
        }

        const connection = await mongoose.connect(mongoURI);

        console.log("====================================");
        console.log("MongoDB Connected Successfully");
        console.log("Database:", connection.connection.name);
        console.log("====================================");

        return true;

    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        return false;
    }
};

module.exports = connectDB;

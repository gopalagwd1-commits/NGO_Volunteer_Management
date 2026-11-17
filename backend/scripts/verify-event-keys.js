
require("dotenv").config();

const mongoose = require("mongoose");
const Event = require("../models/Event");

async function verifyEventKeys() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("\n===== EVENT KEY VERIFICATION =====\n");

        const total = await Event.countDocuments();

        const missing = await Event.countDocuments({
            $or: [
                { eventKey: { $exists: false } },
                { eventKey: null }
            ]
        });

        const indexes = await Event.collection.indexes();

        const uniqueIndex = indexes.find(
            index => index.name === "eventKey_1"
        );

        console.log("Total events:", total);
        console.log("Events missing eventKey:", missing);

        console.log("\nUnique eventKey index:");

        if (uniqueIndex) {
            console.log(uniqueIndex);
        } else {
            console.log("NOT FOUND");
        }

        console.log("\n===== VERIFICATION RESULT =====");

        if (
            total > 0 &&
            missing === 0 &&
            uniqueIndex &&
            uniqueIndex.unique === true &&
            uniqueIndex.sparse === true
        ) {
            console.log("SUCCESS: All events have eventKey.");
            console.log("SUCCESS: Unique sparse index is active.");
        } else {
            console.log("WARNING: Verification needs attention.");
        }

    } catch (error) {
        console.error("Verification error:", error);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
}

verifyEventKeys();


require("dotenv").config();

const mongoose = require("mongoose");
const Event = require("../models/Event");

function getISTDateKey(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid event date: ${value}`);
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

function createEventKey(event) {
    const dateKey = getISTDateKey(event.eventDate);

    const title = String(event.title || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const venue = String(event.venue || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    if (!title || !venue) {
        throw new Error(
            `Event ${event._id} has an empty title or venue.`
        );
    }

    return `${dateKey}|${title}|${venue}`;
}

async function migrateEventKeys() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected.");

        const events = await Event.find({
            $or: [
                { eventKey: { $exists: false } },
                { eventKey: null }
            ]
        }).select("_id title eventDate venue eventKey").lean();

        console.log(`Legacy events found: ${events.length}`);

        const existingKeys = await Event.find({
            eventKey: { $exists: true, $ne: null }
        }).select("_id eventKey").lean();

        const usedKeys = new Map(
            existingKeys.map(e => [e.eventKey, String(e._id)])
        );

        const operations = [];

        for (const event of events) {
            const eventKey = createEventKey(event);

            if (usedKeys.has(eventKey)) {
                throw new Error(
                    `Duplicate event key detected: ${eventKey}`
                );
            }

            usedKeys.set(eventKey, String(event._id));

            operations.push({
                updateOne: {
                    filter: {
                        _id: event._id,
                        $or: [
                            { eventKey: { $exists: false } },
                            { eventKey: null }
                        ]
                    },
                    update: {
                        $set: { eventKey }
                    }
                }
            });
        }

        if (operations.length === 0) {
            console.log("No migration required.");
        } else {
            const result = await Event.bulkWrite(
                operations,
                { ordered: true }
            );

            console.log("Migration completed.");
            console.log("Matched:", result.matchedCount);
            console.log("Modified:", result.modifiedCount);
        }

        const remaining = await Event.countDocuments({
            $or: [
                { eventKey: { $exists: false } },
                { eventKey: null }
            ]
        });

        console.log("Events still missing eventKey:", remaining);

        if (remaining !== 0) {
            throw new Error(
                "Migration incomplete. Please investigate."
            );
        }

        console.log("All events now have eventKey.");

    } catch (error) {
        console.error("Migration failed:", error);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
}

migrateEventKeys();

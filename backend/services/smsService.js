const TEXTBEE_URL = "https://api.textbee.dev/api/v1/gateway/send-sms";

const sendSMS = async (recipients, message) => {
    try {
        // Check whether SMS is enabled.
        if (String(process.env.SMS_ENABLED).toLowerCase() !== "true") {
            return {
                success: false,
                error: "SMS notifications are disabled."
            };
        }

        const apiKey = process.env.TEXTBEE_API_KEY;
        const deviceId = process.env.TEXTBEE_DEVICE_ID;

        if (!apiKey || !deviceId ||
            apiKey.startsWith("YOUR_") ||
            deviceId.startsWith("YOUR_")) {
            return {
                success: false,
                error: "TextBee configuration is incomplete."
            };
        }

        // Normalize recipients.
        const numbers = Array.isArray(recipients)
            ? recipients
            : [recipients];

        if (
            numbers.length === 0 ||
            numbers.some(number =>
                typeof number !== "string" ||
                !/^\+?\d{8,15}$/.test(number.trim())
            )
        ) {
            return {
                success: false,
                error: "Invalid recipient phone number."
            };
        }

        // Validate message.
        if (
            typeof message !== "string" ||
            !message.trim() ||
            message.length > 5000
        ) {
            return {
                success: false,
                error: "Message must contain 1–5000 characters."
            };
        }

        const response = await fetch(TEXTBEE_URL, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                recipients: numbers.map(number => number.trim()),
                message: message.trim(),
                deviceId
            }),
            signal: AbortSignal.timeout(15000)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            return {
                success: false,
                error: result.error ||
                    result.message ||
                    `TextBee request failed (${response.status}).`,
                statusCode: response.status
            };
        }

        const data = result.data || {};

        if (data.success === false) {
            return {
                success: false,
                error: data.message || "TextBee did not accept the SMS."
            };
        }

        return {
            success: true,
            accepted: true,
            message: data.message || "SMS accepted by TextBee.",
            smsBatchId: data.smsBatchId || null,
            recipientCount: data.recipientCount || numbers.length,
            status: "Accepted"
        };

    } catch (error) {
        console.error("SMS Service Error:", error.message);

        return {
            success: false,
            error: error.name === "TimeoutError" ||
                error.name === "AbortError"
                ? "TextBee request timed out."
                : "Unable to connect to the SMS gateway."
        };
    }
};

module.exports = { sendSMS };

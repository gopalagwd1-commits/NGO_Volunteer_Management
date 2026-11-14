const express = require("express");

const {
    requireAuth,
    authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

let cachedPipelineConfig = null;

// ============================================
// BHASHINI PIPELINE CONFIGURATION
// ============================================

async function getPipelineConfig() {

    if (cachedPipelineConfig) {
        return cachedPipelineConfig;
    }

    const userId = process.env.BHASHINI_USER_ID;
    const apiKey = process.env.BHASHINI_ULCA_API_KEY;
    const pipelineId = process.env.BHASHINI_PIPELINE_ID;

    if (!userId || !apiKey || !pipelineId) {
        throw new Error("BHASHINI configuration is incomplete.");
    }

    const response = await fetch(
        "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "userID": userId,
                "ulcaApiKey": apiKey
            },
            body: JSON.stringify({
                pipelineTasks: [
                    {
                        taskType: "transliteration"
                    }
                ],
                pipelineRequestConfig: {
                    pipelineId
                }
            }),
            signal: AbortSignal.timeout(20000)
        }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
        throw new Error("Unable to retrieve BHASHINI pipeline configuration.");
    }

    const task = (data.pipelineResponseConfig || [])
        .find(item => item.taskType === "transliteration");

    const configurations = Array.isArray(task?.config)
        ? task.config
        : [];

    const languageConfig = configurations.find(item =>
        item.language?.sourceLanguage === "en" &&
        item.language?.targetLanguage === "kn"
    );

    const endpoint = Array.isArray(data.pipelineInferenceAPIEndPoint)
        ? data.pipelineInferenceAPIEndPoint[0]
        : data.pipelineInferenceAPIEndPoint;

    const callbackUrl =
        endpoint?.callbackUrl ||
        endpoint?.callbackURL;

    const inferenceApiKey = endpoint?.inferenceApiKey;

    if (
        !languageConfig?.serviceId ||
        !callbackUrl ||
        !inferenceApiKey?.name ||
        !inferenceApiKey?.value
    ) {
        throw new Error("BHASHINI returned an incomplete pipeline configuration.");
    }

    const parsedUrl = new URL(callbackUrl);

    if (
        parsedUrl.protocol !== "https:" ||
        !parsedUrl.hostname.endsWith(".bhashini.gov.in")
    ) {
        throw new Error("BHASHINI returned an untrusted inference endpoint.");
    }

    cachedPipelineConfig = {
        callbackUrl,
        serviceId: languageConfig.serviceId,
        inferenceApiKey
    };

    return cachedPipelineConfig;
}


// ============================================
// POST /api/transliteration
// ENGLISH TO KANNADA
// ADMIN ONLY
// ============================================

router.post(
    "/",
    requireAuth,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            const text = typeof req.body.text === "string"
                ? req.body.text.trim()
                : "";

            const type = req.body.type || "name";

            const maximumLength = type === "title" ? 150 : 100;

            if (!["name", "title"].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid transliteration type."
                });
            }

            if (!text || text.length > maximumLength) {
                return res.status(400).json({
                    success: false,
                    message: `Text must contain between 1 and ${maximumLength} characters.`
                });
            }

            const config = await getPipelineConfig();

            const response = await fetch(
                config.callbackUrl,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        [config.inferenceApiKey.name]:
                            config.inferenceApiKey.value
                    },
                    body: JSON.stringify({
                        pipelineTasks: [
                            {
                                taskType: "transliteration",
                                config: {
                                    language: {
                                        sourceLanguage: "en",
                                        targetLanguage: "kn"
                                    },
                                    serviceId: config.serviceId,
                                    isSentence: type === "title",
                                    numSuggestions: 5
                                }
                            }
                        ],
                        inputData: {
                            input: [
                                {
                                    source: text
                                }
                            ]
                        }
                    }),
                    signal: AbortSignal.timeout(20000)
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok || !data) {
                return res.status(502).json({
                    success: false,
                    message: "BHASHINI transliteration service is unavailable."
                });
            }

            const taskResult = (data.pipelineResponse || [])
                .find(item => item.taskType === "transliteration");

            const target = taskResult?.output?.[0]?.target;

            const suggestions = (
                Array.isArray(target) ? target : [target]
            )
                .filter(item =>
                    typeof item === "string" && item.trim()
                )
                .map(item => item.trim());

            if (!suggestions.length) {
                return res.status(502).json({
                    success: false,
                    message: "No Kannada transliteration was returned."
                });
            }

            return res.status(200).json({
                success: true,
                original: text,
                transliteration: suggestions[0],
                suggestions
            });

        } catch (error) {

            console.error(
                "Transliteration Error:",
                error.name === "AbortError" ||
                error.name === "TimeoutError"
                    ? "BHASHINI request timed out."
                    : error.message
            );

            return res.status(503).json({
                success: false,
                message: "Kannada transliteration is currently unavailable."
            });

        }
    }
);

module.exports = router;

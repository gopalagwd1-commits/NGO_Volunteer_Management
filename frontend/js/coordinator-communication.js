"use strict";

// ============================================
// COORDINATOR COMMUNICATION
// NGO Volunteer Connect
// ============================================

const AUTH_API = "/api/auth";
const SMS_API = "/api/sms";

const PAGE_SIZE = 10;
const MAX_RECIPIENTS = 100;

let currentUser = null;
let volunteers = [];
let currentPage = 1;
let totalPages = 1;
let isSending = false;

const elements = {
    language: document.getElementById("dashboardLanguage"),
    logout: document.getElementById("logoutButton"),

    globalMessage: document.getElementById("globalMessage"),

    totalCount: document.getElementById("totalCount"),
    acceptedCount: document.getElementById("acceptedCount"),
    failedCount: document.getElementById("failedCount"),
    recipientsCount: document.getElementById("recipientsCount"),

    smsForm: document.getElementById("smsForm"),
    recipientMode: document.getElementById("recipientMode"),
    volunteerGroup: document.getElementById("volunteerSelectionGroup"),
    volunteerSelect: document.getElementById("volunteerSelect"),
    refreshVolunteers: document.getElementById("refreshVolunteersButton"),
    selectedVolunteerCount: document.getElementById("selectedVolunteerCount"),

    smsType: document.getElementById("smsType"),
    smsMessage: document.getElementById("smsMessage"),
    characterCount: document.getElementById("characterCount"),

    smsFormMessage: document.getElementById("smsFormMessage"),
    sendButton: document.getElementById("sendSMSButton"),
    sendButtonText: document.getElementById("sendSMSText"),
    clearButton: document.getElementById("clearSMSButton"),

    filterForm: document.getElementById("smsFilterForm"),
    statusFilter: document.getElementById("statusFilter"),
    typeFilter: document.getElementById("typeFilter"),
    refreshLogs: document.getElementById("refreshLogsButton"),
    historyMessage: document.getElementById("historyMessage"),
    tableBody: document.getElementById("smsTableBody"),

    paginationInfo: document.getElementById("paginationInfo"),
    previousButton: document.getElementById("previousButton"),
    nextButton: document.getElementById("nextButton")
};



// ============================================
// ENGLISH / KANNADA TRANSLATIONS
// ============================================

const translations = {
    "Back to Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    "Sign Out": "ಲಾಗ್ ಔಟ್",
    "COORDINATOR WORKSPACE": "ಸಂಯೋಜಕರ ಕಾರ್ಯಸ್ಥಳ",
    "Volunteer Communication": "ಸ್ವಯಂಸೇವಕರ ಸಂವಹನ",
    "Send messages to selected volunteers or announce important updates to all active volunteers.":
        "ಆಯ್ಕೆ ಮಾಡಿದ ಸ್ವಯಂಸೇವಕರಿಗೆ ಸಂದೇಶಗಳನ್ನು ಕಳುಹಿಸಿ ಅಥವಾ ಎಲ್ಲಾ ಸಕ್ರಿಯ ಸ್ವಯಂಸೇವಕರಿಗೆ ಪ್ರಮುಖ ಪ್ರಕಟಣೆಗಳನ್ನು ನೀಡಿ.",
    "Total Messages": "ಒಟ್ಟು ಸಂದೇಶಗಳು",
    "Accepted Messages": "ಸ್ವೀಕರಿಸಲಾದ ಸಂದೇಶಗಳು",
    "Failed Messages": "ವಿಫಲವಾದ ಸಂದೇಶಗಳು",
    "Total Recipients": "ಒಟ್ಟು ಸ್ವೀಕರಿಸುವವರು",
    "Compose Message": "ಸಂದೇಶ ರಚಿಸಿ",
    "Choose your audience and write your SMS.": "ಸ್ವೀಕರಿಸುವವರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು SMS ಬರೆಯಿರಿ.",
    "Recipient Selection": "ಸ್ವೀಕರಿಸುವವರ ಆಯ್ಕೆ",
    "Selected Volunteers": "ಆಯ್ಕೆ ಮಾಡಿದ ಸ್ವಯಂಸೇವಕರು",
    "All Active Volunteers": "ಎಲ್ಲಾ ಸಕ್ರಿಯ ಸ್ವಯಂಸೇವಕರು",
    "All-active announcements are sent only to active volunteers with registered phone numbers.":
        "ಎಲ್ಲಾ ಸಕ್ರಿಯ ಸ್ವಯಂಸೇವಕರ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗಳಿಗಷ್ಟೇ ಪ್ರಕಟಣೆಗಳನ್ನು ಕಳುಹಿಸಲಾಗುತ್ತದೆ.",
    "Select Volunteers": "ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "Refresh Volunteers": "ಸ್ವಯಂಸೇವಕರ ಪಟ್ಟಿಯನ್ನು ನವೀಕರಿಸಿ",
    "Hold Ctrl (Windows) while clicking to select multiple volunteers.":
        "ಹಲವು ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆ ಮಾಡಲು Ctrl ಕೀಲಿಯನ್ನು ಒತ್ತಿಹಿಡಿದು ಕ್ಲಿಕ್ ಮಾಡಿ.",
    "Notification Type": "ಅಧಿಸೂಚನೆಯ ಪ್ರಕಾರ",
    "Manual": "ಹಸ್ತಚಾಲಿತ",
    "Announcement": "ಪ್ರಕಟಣೆ",
    "Registration": "ನೋಂದಣಿ",
    "Event Reminder": "ಕಾರ್ಯಕ್ರಮದ ಜ್ಞಾಪನೆ",
    "Event Cancellation": "ಕಾರ್ಯಕ್ರಮ ರದ್ದತಿ",
    "Attendance": "ಹಾಜರಾತಿ",
    "System": "ವ್ಯವಸ್ಥೆ",
    "Message Length": "ಸಂದೇಶದ ಉದ್ದ",
    "SMS Message": "SMS ಸಂದೇಶ",
    "Enter your message here...": "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ...",
    "Clear": "ಅಳಿಸಿ",
    "Send SMS": "SMS ಕಳುಹಿಸಿ",
    "My Communication History": "ನನ್ನ ಸಂವಹನ ಇತಿಹಾಸ",
    "Review messages sent from your coordinator account.":
        "ನಿಮ್ಮ ಸಂಯೋಜಕ ಖಾತೆಯಿಂದ ಕಳುಹಿಸಿದ ಸಂದೇಶಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    "Refresh": "ನವೀಕರಿಸಿ",
    "All Statuses": "ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು",
    "Accepted": "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    "Failed": "ವಿಫಲವಾಗಿದೆ",
    "All Types": "ಎಲ್ಲಾ ಪ್ರಕಾರಗಳು",
    "Filter": "ಫಿಲ್ಟರ್",
    "Date": "ದಿನಾಂಕ",
    "Type": "ಪ್ರಕಾರ",
    "Recipients": "ಸ್ವೀಕರಿಸುವವರು",
    "Message": "ಸಂದೇಶ",
    "Status": "ಸ್ಥಿತಿ",
    "Previous": "ಹಿಂದಿನ",
    "Next": "ಮುಂದಿನ",
    "Loading volunteers...": "ಸ್ವಯಂಸೇವಕರ ಪಟ್ಟಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "No active volunteers with phone numbers found.":
        "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಹೊಂದಿರುವ ಸಕ್ರಿಯ ಸ್ವಯಂಸೇವಕರು ಕಂಡುಬಂದಿಲ್ಲ.",
    "Unable to load volunteers.": "ಸ್ವಯಂಸೇವಕರ ಪಟ್ಟಿಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    "No communication records found.": "ಯಾವುದೇ ಸಂವಹನ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    "Loading communication history...": "ಸಂವಹನ ಇತಿಹಾಸ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "Unable to load communication history.": "ಸಂವಹನ ಇತಿಹಾಸವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    "Sending...": "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
    "Submitting SMS request...": "SMS ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
    "Please enter an SMS message.": "ದಯವಿಟ್ಟು SMS ಸಂದೇಶವನ್ನು ನಮೂದಿಸಿ.",
    "The message cannot exceed 5000 characters.":
        "ಸಂದೇಶವು 5000 ಅಕ್ಷರಗಳನ್ನು ಮೀರಬಾರದು.",
    "There are no active volunteers available.":
        "ಯಾವುದೇ ಸಕ್ರಿಯ ಸ್ವಯಂಸೇವಕರು ಲಭ್ಯವಿಲ್ಲ.",
    "The announcement has not been sent.": "ಪ್ರಕಟಣೆಯನ್ನು ಕಳುಹಿಸಲಾಗಿಲ್ಲ.",
    "Please select at least one volunteer.":
        "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಬ್ಬ ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    "Your session has expired. Please log in again.":
        "ನಿಮ್ಮ ಸೆಷನ್ ಅವಧಿ ಮುಗಿದಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
    "The request could not be completed.": "ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    "Unable to verify your account. Please refresh the page.":
        "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುಟವನ್ನು ನವೀಕರಿಸಿ.",
    "Logout failed.": "ಲಾಗ್ ಔಟ್ ವಿಫಲವಾಗಿದೆ.",
    "Unable to sign out. Please try again.":
        "ಲಾಗ್ ಔಟ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    "SMS accepted.": "SMS ಸ್ವೀಕರಿಸಲಾಗಿದೆ.",
    "Unknown": "ಅಜ್ಞಾತ",
    "Unnamed Volunteer": "ಹೆಸರಿಲ್ಲದ ಸ್ವಯಂಸೇವಕ",
    "No phone": "ದೂರವಾಣಿ ಸಂಖ್ಯೆ ಇಲ್ಲ"
};

function getLanguage() {
    return localStorage.getItem("ngoLanguage") === "kn" ? "kn" : "en";
}

function translateText(value) {
    const language = getLanguage();

    if (language === "en") {
        const original = Object.keys(translations).find(
            key => translations[key] === value
        );
        return original || value;
    }

    return translations[value] || value;
}

function translatePage() {
    const language = getLanguage();

    // Translate existing visible text without changing
    // user-entered SMS messages or volunteer names.
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
    );

    let node;

    while ((node = walker.nextNode())) {
        const original = node.nodeValue;
        const trimmed = original.trim();

        if (!trimmed) continue;

        const translated = language === "kn"
            ? translations[trimmed]
            : Object.keys(translations).find(
                key => translations[key] === trimmed
            );

        if (translated) {
            node.nodeValue = original.replace(trimmed, translated);
        }
    }

    // Translate placeholder attributes.
    if (elements.smsMessage) {
        elements.smsMessage.placeholder =
            language === "kn"
                ? translations["Enter your message here..."]
                : "Enter your message here...";
    }
}


// ============================================
// GENERAL HELPERS
// ============================================

function showGlobalMessage(message, type = "info") {
    elements.globalMessage.textContent = message;
    elements.globalMessage.className =
        `sms-global-message ${type}`;
}

function showFormMessage(message, type = "info") {
    elements.smsFormMessage.textContent = message;
    elements.smsFormMessage.className =
        `sms-form-message ${type}`;
}

function showHistoryMessage(message, type = "info") {
    elements.historyMessage.textContent = message;
    elements.historyMessage.className =
        `sms-history-message ${type}`;
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...(options.headers || {})
        }
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (response.status === 401) {
        window.location.replace("login.html");
        throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok || data.success === false) {
        throw new Error(
            data.message || "The request could not be completed."
        );
    }

    return data;
}

function formatDate(dateValue) {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function createCell(value, className = "") {
    const cell = document.createElement("td");
    cell.textContent = value ?? "—";

    if (className) {
        cell.className = className;
    }

    return cell;
}

// ============================================
// SESSION AND ROLE VERIFICATION
// ============================================

async function verifyCoordinatorSession() {
    try {
        const data = await apiRequest(`${AUTH_API}/me`);

        if (!data.user) {
            window.location.replace("login.html");
            return false;
        }

        if (data.user.role !== "coordinator") {
            const correctPages = {
                admin: "admin-dashboard.html",
                volunteer: "volunteer-dashboard.html"
            };

            window.location.replace(
                correctPages[data.user.role] || "login.html"
            );

            return false;
        }

        currentUser = data.user;

        return true;

    } catch (error) {
        console.error("Coordinator session verification:", error);

        if (error.message.includes("session has expired")) {
            return false;
        }

        showGlobalMessage(
            "Unable to verify your account. Please refresh the page.",
            "error"
        );

        return false;
    }
}

function initializeLanguage() {
    elements.language.value = getLanguage();

    translatePage();

    elements.language.addEventListener("change", event => {
        localStorage.setItem(
            "ngoLanguage",
            event.target.value === "kn" ? "kn" : "en"
        );

        translatePage();

        updateRecipientCount();
        updatePaginationText();
        loadHistory();
    });
}
// ============================================
// LOGOUT
// ============================================

async function logoutCoordinator() {
    elements.logout.disabled = true;

    try {
        const response = await fetch(`${AUTH_API}/logout`, {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Logout failed.");
        }

        window.location.replace("login.html");

    } catch (error) {
        console.error("Coordinator logout:", error);

        showGlobalMessage(
            "Unable to sign out. Please try again.",
            "error"
        );

        elements.logout.disabled = false;
    }
}

// ============================================
// LOAD ACTIVE VOLUNTEERS
// ============================================

async function loadVolunteers() {
    elements.refreshVolunteers.disabled = true;

    elements.volunteerSelect.replaceChildren();

    const loadingOption = document.createElement("option");
    loadingOption.textContent = "Loading volunteers...";
    loadingOption.disabled = true;

    elements.volunteerSelect.appendChild(loadingOption);

    try {
        const data = await apiRequest(`${SMS_API}/volunteers`);

        volunteers = Array.isArray(data.volunteers)
            ? data.volunteers
            : [];

        elements.volunteerSelect.replaceChildren();

        if (volunteers.length === 0) {
            const option = document.createElement("option");
            option.textContent =
                "No active volunteers with phone numbers found.";
            option.disabled = true;

            elements.volunteerSelect.appendChild(option);

        } else {
            volunteers.forEach(volunteer => {
                const option = document.createElement("option");

                option.value = volunteer._id;

                option.textContent =
                    `${volunteer.name || "Unnamed Volunteer"} ` +
                    `(${volunteer.phone || "No phone"})`;

                elements.volunteerSelect.appendChild(option);
            });
        }

        updateRecipientCount();

    } catch (error) {
        console.error("Loading volunteers:", error);

        elements.volunteerSelect.replaceChildren();

        const option = document.createElement("option");
        option.textContent = "Unable to load volunteers.";
        option.disabled = true;

        elements.volunteerSelect.appendChild(option);

        showFormMessage(error.message, "error");

    } finally {
        elements.refreshVolunteers.disabled = false;
    }
}

// ============================================
// RECIPIENT SELECTION
// ============================================

function getSelectedVolunteerIds() {
    return Array.from(
        elements.volunteerSelect.selectedOptions
    ).map(option => option.value);
}

function updateRecipientCount() {
    const mode = elements.recipientMode.value;

    const count = mode === "all_active"
        ? volunteers.length
        : getSelectedVolunteerIds().length;

    const language = getLanguage();

    elements.selectedVolunteerCount.textContent =
        mode === "all_active"
            ? (language === "kn"
                ? `${count} ಸಕ್ರಿಯ ಸ್ವಯಂಸೇವಕರು ಲಭ್ಯವಿದ್ದಾರೆ`
                : `${count} active volunteers available`)
            : (language === "kn"
                ? `${count} ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ`
                : `${count} volunteers selected`);
}

function updateRecipientMode() {
    const allActive =
        elements.recipientMode.value === "all_active";

    elements.volunteerGroup.hidden = allActive;

    if (allActive) {
        elements.smsType.value = "Announcement";
        elements.smsType.disabled = true;
    } else {
        elements.smsType.disabled = false;
    }

    updateRecipientCount();
}

// ============================================
// MESSAGE CHARACTER COUNTER
// ============================================

function updateCharacterCount() {
    elements.characterCount.textContent =
        elements.smsMessage.value.length;
}

// ============================================
// SMS STATISTICS
// ============================================

async function loadStatistics() {
    try {
        const data = await apiRequest(`${SMS_API}/stats`);

        const stats = data.statistics || {};

        elements.totalCount.textContent = stats.total ?? 0;
        elements.acceptedCount.textContent = stats.accepted ?? 0;
        elements.failedCount.textContent = stats.failed ?? 0;
        elements.recipientsCount.textContent =
            stats.totalRecipients ?? 0;

    } catch (error) {
        console.error("Loading SMS statistics:", error);

        elements.totalCount.textContent = "—";
        elements.acceptedCount.textContent = "—";
        elements.failedCount.textContent = "—";
        elements.recipientsCount.textContent = "—";
    }
}

// ============================================
// SEND SMS
// ============================================

async function sendSMS(event) {
    event.preventDefault();

    if (isSending) return;

    const mode = elements.recipientMode.value;
    const message = elements.smsMessage.value.trim();

    const type = mode === "all_active"
        ? "Announcement"
        : elements.smsType.value;

    if (!message) {
        showFormMessage("Please enter an SMS message.", "error");
        elements.smsMessage.focus();
        return;
    }

    if (message.length > 5000) {
        showFormMessage(
            "The message cannot exceed 5000 characters.",
            "error"
        );
        return;
    }

    let payload;

    if (mode === "all_active") {
        if (volunteers.length === 0) {
            showFormMessage(
                "There are no active volunteers available.",
                "error"
            );
            return;
        }

        if (volunteers.length > MAX_RECIPIENTS) {
            showFormMessage(
                `There are ${volunteers.length} eligible volunteers. ` +
                `The current backend limit is ${MAX_RECIPIENTS} per SMS request. ` +
                "The announcement has not been sent.",
                "error"
            );
            return;
        }

        const confirmed = window.confirm(
            `You are about to send an announcement to ` +
            `${volunteers.length} active volunteers.\n\n` +
            "Do you want to continue?"
        );

        if (!confirmed) return;

        payload = {
            audience: "all_active",
            type: "Announcement",
            message
        };

    } else {
        const volunteerIds = getSelectedVolunteerIds();

        if (volunteerIds.length === 0) {
            showFormMessage(
                "Please select at least one volunteer.",
                "error"
            );
            return;
        }

        if (volunteerIds.length > MAX_RECIPIENTS) {
            showFormMessage(
                `Select no more than ${MAX_RECIPIENTS} volunteers.`,
                "error"
            );
            return;
        }

        payload = {
            volunteerIds,
            type,
            message
        };
    }

    const recipientCount = mode === "all_active"
        ? volunteers.length
        : payload.volunteerIds.length;

    const confirmed = mode === "all_active"
        ? true
        : window.confirm(
            `Send this SMS to ${recipientCount} selected volunteer(s)?`
        );

    if (!confirmed) return;

    isSending = true;
    elements.sendButton.disabled = true;
    elements.sendButtonText.textContent = "Sending...";

    showFormMessage("Submitting SMS request...", "info");

    try {
        const data = await apiRequest(`${SMS_API}/send`, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        showFormMessage(
            `${data.message || "SMS accepted."} ` +
            `Recipients: ${data.recipientCount ?? recipientCount}.`,
            "success"
        );

        elements.smsForm.reset();

        elements.recipientMode.value = "selected";
        elements.smsType.disabled = false;

        updateRecipientMode();
        updateCharacterCount();

        currentPage = 1;

        await Promise.all([
            loadStatistics(),
            loadHistory()
        ]);

    } catch (error) {
        console.error("Sending coordinator SMS:", error);

        showFormMessage(error.message, "error");

        // Refresh history and statistics because a failed SMS
        // request may also have been recorded by the backend.
        await Promise.all([
            loadStatistics(),
            loadHistory()
        ]);

    } finally {
        isSending = false;
        elements.sendButton.disabled = false;
        elements.sendButtonText.textContent = "Send SMS";
    }
}

// ============================================
// SMS HISTORY TABLE
// ============================================

function renderHistory(logs) {
    elements.tableBody.replaceChildren();

    if (!Array.isArray(logs) || logs.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "sms-empty-cell";
        cell.textContent = "No communication records found.";

        row.appendChild(cell);
        elements.tableBody.appendChild(row);

        return;
    }

    logs.forEach(log => {
        const row = document.createElement("tr");

        row.appendChild(createCell(formatDate(log.createdAt)));
        row.appendChild(createCell(log.type || "—"));

        const recipientCount =
            log.recipientCount ||
            (Array.isArray(log.recipients)
                ? log.recipients.length
                : 0);

        row.appendChild(
            createCell(String(recipientCount))
        );

        const messageCell = createCell(
            log.message || "—",
            "sms-message-cell"
        );

        messageCell.title = log.message || "";
        row.appendChild(messageCell);

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        const status = String(log.status || "Unknown").trim();

        const normalizedStatus =
            status.charAt(0).toUpperCase() +
            status.slice(1).toLowerCase();

        console.log("SMS STATUS DEBUG:", {
            originalStatus: log.status,
            normalizedStatus,
            language: getLanguage(),
            translation: translations[normalizedStatus]
        });

        const kannadaStatus = {
            Accepted: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
            Failed: "ವಿಫಲವಾಗಿದೆ",
            Unknown: "ಅಜ್ಞಾತ"
        };

        statusBadge.textContent =
            getLanguage() === "kn"
                ? (kannadaStatus[normalizedStatus] || status)
                : status;

        statusBadge.className =
            `sms-status-badge status-${status.toLowerCase()}`;

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        elements.tableBody.appendChild(row);
    });
}

function updatePaginationText() {
    const language = getLanguage();

    elements.paginationInfo.textContent =
        language === "kn"
            ? `ಪುಟ ${currentPage} / ${totalPages}`
            : `Page ${currentPage} of ${totalPages}`;
}
// ============================================
// LOAD SMS HISTORY
// ============================================

async function loadHistory() {
    elements.refreshLogs.disabled = true;

    showHistoryMessage("Loading communication history...");

    const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE)
    });

    if (elements.statusFilter.value) {
        params.set("status", elements.statusFilter.value);
    }

    if (elements.typeFilter.value) {
        params.set("type", elements.typeFilter.value);
    }

    try {
        const data = await apiRequest(
            `${SMS_API}/logs?${params.toString()}`
        );

        renderHistory(data.logs || []);

        const pagination = data.pagination || {};

        currentPage = pagination.page || 1;
        totalPages = Math.max(1, pagination.totalPages || 1);

        updatePaginationText();

        elements.previousButton.disabled = currentPage <= 1;
        elements.nextButton.disabled = currentPage >= totalPages;

        showHistoryMessage("");

    } catch (error) {
        console.error("Loading SMS history:", error);

        elements.tableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "sms-empty-cell";
        cell.textContent = "Unable to load communication history.";

        row.appendChild(cell);
        elements.tableBody.appendChild(row);

        showHistoryMessage(error.message, "error");

    } finally {
        elements.refreshLogs.disabled = false;
    }
}

// ============================================
// FILTERS AND PAGINATION
// ============================================

function applyFilters(event) {
    event.preventDefault();

    currentPage = 1;
    loadHistory();
}

function goToPreviousPage() {
    if (currentPage <= 1) return;

    currentPage--;
    loadHistory();
}

function goToNextPage() {
    if (currentPage >= totalPages) return;

    currentPage++;
    loadHistory();
}

// ============================================
// EVENT LISTENERS
// ============================================

function attachEventListeners() {
    elements.logout.addEventListener(
        "click",
        logoutCoordinator
    );

    elements.recipientMode.addEventListener(
        "change",
        updateRecipientMode
    );

    elements.volunteerSelect.addEventListener(
        "change",
        updateRecipientCount
    );

    elements.refreshVolunteers.addEventListener(
        "click",
        loadVolunteers
    );

    elements.smsMessage.addEventListener(
        "input",
        updateCharacterCount
    );

    elements.smsForm.addEventListener(
        "submit",
        sendSMS
    );

    elements.clearButton.addEventListener("click", () => {
        setTimeout(() => {
            elements.recipientMode.value = "selected";
            elements.smsType.disabled = false;

            updateRecipientMode();
            updateCharacterCount();

            showFormMessage("");
        }, 0);
    });

    elements.filterForm.addEventListener(
        "submit",
        applyFilters
    );

    elements.refreshLogs.addEventListener("click", () => {
        loadHistory();
    });

    elements.previousButton.addEventListener(
        "click",
        goToPreviousPage
    );

    elements.nextButton.addEventListener(
        "click",
        goToNextPage
    );
}

// ============================================
// INITIALIZE PAGE
// ============================================

async function initializeCoordinatorCommunication() {
    initializeLanguage();
    attachEventListeners();

    const authorized = await verifyCoordinatorSession();

    if (!authorized) return;

    showGlobalMessage("");

    updateRecipientMode();
    updateCharacterCount();
    translatePage();

    await Promise.all([
        loadVolunteers(),
        loadStatistics(),
        loadHistory()
    ]);
}

initializeCoordinatorCommunication();

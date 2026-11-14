
"use strict";

// ============================================
// API CONFIGURATION
// ============================================

const AUTH_API = "/api/auth";
const SMS_API = "/api/sms";

let language = localStorage.getItem("ngoLanguage") || "en";

if (!["en", "kn"].includes(language)) {
    language = "en";
}

let currentUser = null;
let currentPage = 1;
let totalPages = 1;

const pageSize = 10;


// ============================================
// TRANSLATIONS
// ============================================

const translations = {
    en: {
        pageEyebrow: "COMMUNICATION",
        pageTitle: "SMS Notifications",
        pageDescription: "Send announcements and notifications to NGO volunteers.",
        backLinkText: "Back to Dashboard",
        signOut: "Sign Out",

        gatewayTitle: "TextBee Gateway",
        gatewayDescription: "SMS gateway connection status",
        checking: "Checking...",
        gatewayReady: "Gateway Ready",
        gatewayDisabled: "SMS Gateway Disabled",
        gatewayNotConfigured: "Gateway Not Configured",
        gatewayUnavailable: "Gateway Not Ready",
        gatewayReadyMessage: "TextBee is configured and ready to send SMS messages.",
        gatewayDisabledMessage: "SMS sending is currently disabled.",
        gatewayConfigMessage: "TextBee API credentials or device configuration are missing.",
        gatewayUnavailableMessage: "The SMS gateway is not ready. Check its configuration.",
        refresh: "Refresh",

        totalLabel: "Total Messages",
        acceptedLabel: "Accepted Messages",
        failedLabel: "Failed Messages",
        recipientsLabel: "Total Recipients",

        composeTitle: "Compose SMS",
        composeDescription: "Send an SMS to one or multiple recipients.",
        recipientModeLabel: "Recipient Selection",
        manualRecipients: "Enter Phone Numbers",
        recipientModeHelp: "Enter phone numbers separated by commas or new lines.",
        recipientsInputLabel: "Recipient Phone Numbers",
        recipientCount: "recipients",
        smsTypeLabel: "Notification Type",
        messageLengthLabel: "Message Limit",
        smsMessageLabel: "SMS Message",
        messagePlaceholder: "Enter your SMS message here...",
        recipientsPlaceholder: "Example: +919876543210, +919876543211",

        manual: "Manual",
        announcement: "Announcement",
        registration: "Registration",
        eventReminder: "Event Reminder",
        eventCancellation: "Event Cancellation",
        attendance: "Attendance",
        system: "System",

        clear: "Clear",
        sendSMS: "Send SMS",
        sending: "Sending...",
        sendSuccess: "SMS request submitted successfully.",
        sendError: "Unable to send SMS.",
        invalidRecipients: "Enter valid phone numbers containing 10 to 15 digits.",
        recipientLimit: "You can send an SMS to a maximum of 100 recipients.",
        duplicateRemoved: "Duplicate phone numbers were removed.",
        messageRequired: "Please enter an SMS message.",
        messageLimit: "The message must contain between 1 and 5000 characters.",

        historyTitle: "SMS History",
        historyDescription: "Review previously submitted SMS notifications.",
        allStatuses: "All Statuses",
        allTypes: "All Types",
        accepted: "Accepted",
        failed: "Failed",
        filter: "Filter",

        date: "Date",
        type: "Type",
        recipients: "Recipients",
        message: "Message",
        status: "Status",
        sentBy: "Sent By",

        loading: "Loading SMS history...",
        noLogs: "No SMS records found.",
        historyError: "Unable to load SMS history.",
        statisticsError: "Unable to load SMS statistics.",
        previous: "Previous",
        next: "Next",
        page: "Page",
        of: "of",

        sessionError: "Your session has expired. Please log in again.",
        unauthorized: "Administrator access is required.",
        refreshSuccess: "SMS information refreshed.",
        refreshFailed: "Refresh failed.",
        logoutError: "Logout failed.",
        networkError: "Unable to connect to the server."
    },

    kn: {
        pageEyebrow: "ಸಂವಹನ",
        pageTitle: "SMS ಅಧಿಸೂಚನೆಗಳು",
        pageDescription: "ಸ್ವಯಂಸೇವಕರಿಗೆ ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ಅಧಿಸೂಚನೆಗಳನ್ನು ಕಳುಹಿಸಿ.",
        backLinkText: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
        signOut: "ಲಾಗ್ ಔಟ್",

        gatewayTitle: "TextBee ಗೇಟ್‌ವೇ",
        gatewayDescription: "SMS ಗೇಟ್‌ವೇ ಸಂಪರ್ಕ ಸ್ಥಿತಿ",
        checking: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
        gatewayReady: "ಗೇಟ್‌ವೇ ಸಿದ್ಧವಾಗಿದೆ",
        gatewayDisabled: "SMS ಗೇಟ್‌ವೇ ನಿಷ್ಕ್ರಿಯವಾಗಿದೆ",
        gatewayNotConfigured: "ಗೇಟ್‌ವೇ ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ",
        gatewayUnavailable: "ಗೇಟ್‌ವೇ ಸಿದ್ಧವಾಗಿಲ್ಲ",
        gatewayReadyMessage: "TextBee SMS ಕಳುಹಿಸಲು ಸಿದ್ಧವಾಗಿದೆ.",
        gatewayDisabledMessage: "SMS ಕಳುಹಿಸುವಿಕೆ ಪ್ರಸ್ತುತ ನಿಷ್ಕ್ರಿಯವಾಗಿದೆ.",
        gatewayConfigMessage: "TextBee API ಅಥವಾ ಸಾಧನದ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ.",
        gatewayUnavailableMessage: "SMS ಗೇಟ್‌ವೇ ಸಿದ್ಧವಾಗಿಲ್ಲ. ಸಂರಚನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
        refresh: "ಮರುಲೋಡ್",

        totalLabel: "ಒಟ್ಟು ಸಂದೇಶಗಳು",
        acceptedLabel: "ಸ್ವೀಕರಿಸಿದ ಸಂದೇಶಗಳು",
        failedLabel: "ವಿಫಲವಾದ ಸಂದೇಶಗಳು",
        recipientsLabel: "ಒಟ್ಟು ಸ್ವೀಕರಿಸುವವರು",

        composeTitle: "SMS ರಚಿಸಿ",
        composeDescription: "ಒಬ್ಬರಿಗೆ ಅಥವಾ ಹಲವರಿಗೆ SMS ಕಳುಹಿಸಿ.",
        recipientModeLabel: "ಸ್ವೀಕರಿಸುವವರ ಆಯ್ಕೆ",
        manualRecipients: "ಫೋನ್ ಸಂಖ್ಯೆಗಳನ್ನು ನಮೂದಿಸಿ",
        recipientModeHelp: "ಅಲ್ಪವಿರಾಮ ಅಥವಾ ಹೊಸ ಸಾಲು ಬಳಸಿ ಫೋನ್ ಸಂಖ್ಯೆಗಳನ್ನು ನಮೂದಿಸಿ.",
        recipientsInputLabel: "ಸ್ವೀಕರಿಸುವವರ ಫೋನ್ ಸಂಖ್ಯೆಗಳು",
        recipientCount: "ಸ್ವೀಕರಿಸುವವರು",
        smsTypeLabel: "ಅಧಿಸೂಚನೆಯ ಪ್ರಕಾರ",
        messageLengthLabel: "ಸಂದೇಶದ ಮಿತಿ",
        smsMessageLabel: "SMS ಸಂದೇಶ",
        messagePlaceholder: "ನಿಮ್ಮ SMS ಸಂದೇಶವನ್ನು ನಮೂದಿಸಿ...",
        recipientsPlaceholder: "ಉದಾಹರಣೆ: +919876543210, +919876543211",

        manual: "ಹಸ್ತಚಾಲಿತ",
        announcement: "ಪ್ರಕಟಣೆ",
        registration: "ನೋಂದಣಿ",
        eventReminder: "ಕಾರ್ಯಕ್ರಮದ ಜ್ಞಾಪನೆ",
        eventCancellation: "ಕಾರ್ಯಕ್ರಮ ರದ್ದತಿ",
        attendance: "ಹಾಜರಾತಿ",
        system: "ವ್ಯವಸ್ಥೆ",

        clear: "ಅಳಿಸಿ",
        sendSMS: "SMS ಕಳುಹಿಸಿ",
        sending: "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
        sendSuccess: "SMS ವಿನಂತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.",
        sendError: "SMS ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        invalidRecipients: "10 ರಿಂದ 15 ಅಂಕೆಗಳ ಮಾನ್ಯ ಫೋನ್ ಸಂಖ್ಯೆಗಳನ್ನು ನಮೂದಿಸಿ.",
        recipientLimit: "ಗರಿಷ್ಠ 100 ಸ್ವೀಕರಿಸುವವರಿಗೆ ಮಾತ್ರ SMS ಕಳುಹಿಸಬಹುದು.",
        duplicateRemoved: "ಪುನರಾವರ್ತಿತ ಫೋನ್ ಸಂಖ್ಯೆಗಳನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.",
        messageRequired: "ದಯವಿಟ್ಟು SMS ಸಂದೇಶವನ್ನು ನಮೂದಿಸಿ.",
        messageLimit: "ಸಂದೇಶವು 1 ರಿಂದ 5000 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.",

        historyTitle: "SMS ಇತಿಹಾಸ",
        historyDescription: "ಹಿಂದೆ ಕಳುಹಿಸಿದ SMS ಅಧಿಸೂಚನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
        allStatuses: "ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು",
        allTypes: "ಎಲ್ಲಾ ಪ್ರಕಾರಗಳು",
        accepted: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
        failed: "ವಿಫಲವಾಗಿದೆ",
        filter: "ಫಿಲ್ಟರ್",

        date: "ದಿನಾಂಕ",
        type: "ಪ್ರಕಾರ",
        recipients: "ಸ್ವೀಕರಿಸುವವರು",
        message: "ಸಂದೇಶ",
        status: "ಸ್ಥಿತಿ",
        sentBy: "ಕಳುಹಿಸಿದವರು",

        loading: "SMS ಇತಿಹಾಸ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        noLogs: "ಯಾವುದೇ SMS ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
        historyError: "SMS ಇತಿಹಾಸ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        statisticsError: "SMS ಅಂಕಿಅಂಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        previous: "ಹಿಂದಿನ",
        next: "ಮುಂದಿನ",
        page: "ಪುಟ",
        of: "ರಲ್ಲಿ",

        sessionError: "ನಿಮ್ಮ ಸೆಷನ್ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
        unauthorized: "ನಿರ್ವಾಹಕರಿಗೆ ಮಾತ್ರ ಈ ಪುಟವನ್ನು ಪ್ರವೇಶಿಸಲು ಅನುಮತಿ ಇದೆ.",
        refreshSuccess: "SMS ಮಾಹಿತಿ ಮರುಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
        refreshFailed: "ಮರುಲೋಡ್ ವಿಫಲವಾಗಿದೆ.",
        logoutError: "ಲಾಗ್ ಔಟ್ ವಿಫಲವಾಗಿದೆ.",
        networkError: "ಸರ್ವರ್ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
    }
};


// ============================================
// TRANSLATION HELPERS
// ============================================

function t(key) {
    return translations[language][key] ||
        translations.en[key] ||
        key;
}


function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function showMessage(id, message, isError = false) {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = message;

    element.style.color = isError
        ? "#b34c35"
        : "#08776d";
}


function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        language === "kn" ? "kn-IN" : "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}


// ============================================
// API REQUEST HANDLER
// ============================================

async function apiRequest(url, options = {}) {

    const response = await fetch(url, {
        ...options,

        credentials: "include",

        headers: {
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),

            ...options.headers
        }
    });

    let data;

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (response.status === 401) {
        window.location.replace("login.html");
        throw new Error(t("sessionError"));
    }

    if (response.status === 403) {
        throw new Error(data.message || t("unauthorized"));
    }

    if (!response.ok || data.success === false) {
        throw new Error(data.message || t("networkError"));
    }

    return data;
}


// ============================================
// APPLY TRANSLATIONS
// ============================================

function applyTranslations() {

    document.documentElement.lang = language;

    const labels = {
        pageEyebrow: "pageEyebrow",
        pageTitle: "pageTitle",
        pageDescription: "pageDescription",
        backLinkText: "backLinkText",
        logoutButton: "signOut",

        gatewayTitle: "gatewayTitle",
        gatewayDescription: "gatewayDescription",
        refreshStatusText: "refresh",

        totalLabel: "totalLabel",
        acceptedLabel: "acceptedLabel",
        failedLabel: "failedLabel",
        recipientsLabel: "recipientsLabel",

        composeTitle: "composeTitle",
        composeDescription: "composeDescription",
        recipientModeLabel: "recipientModeLabel",
        recipientModeHelp: "recipientModeHelp",
        recipientsInputLabel: "recipientsInputLabel",
        smsTypeLabel: "smsTypeLabel",
        messageLengthLabel: "messageLengthLabel",
        smsMessageLabel: "smsMessageLabel",

        clearSMSButton: "clear",
        sendSMSText: "sendSMS",

        historyTitle: "historyTitle",
        historyDescription: "historyDescription",
        refreshLogsText: "refresh",

        thDate: "date",
        thType: "type",
        thRecipients: "recipients",
        thMessage: "message",
        thStatus: "status",
        thSentBy: "sentBy",

        filterButton: "filter",
        previousText: "previous",
        nextText: "next"
    };

    Object.entries(labels).forEach(([id, key]) => {
        setText(id, t(key));
    });

    const recipientMode = document.getElementById("recipientMode");
    recipientMode.options[0].textContent = t("manualRecipients");

    const smsType = document.getElementById("smsType");

    const typeLabels = {
        Manual: "manual",
        Announcement: "announcement",
        Registration: "registration",
        "Event Reminder": "eventReminder",
        "Event Cancellation": "eventCancellation",
        Attendance: "attendance",
        System: "system"
    };

    Array.from(smsType.options).forEach(option => {
        if (typeLabels[option.value]) {
            option.textContent = t(typeLabels[option.value]);
        }
    });

    const statusFilter = document.getElementById("statusFilter");

    statusFilter.options[0].textContent = t("allStatuses");
    statusFilter.options[1].textContent = t("accepted");
    statusFilter.options[2].textContent = t("failed");

    const typeFilter = document.getElementById("typeFilter");

    typeFilter.options[0].textContent = t("allTypes");

    Array.from(typeFilter.options).forEach(option => {
        if (typeLabels[option.value]) {
            option.textContent = t(typeLabels[option.value]);
        }
    });

    document.getElementById("recipients").placeholder =
        t("recipientsPlaceholder");

    document.getElementById("smsMessage").placeholder =
        t("messagePlaceholder");

    document.getElementById("dashboardLanguage").value = language;

    updatePaginationText();
    updateRecipientCount();
    updateCharacterCount();
}


// ============================================
// ADMIN SESSION VERIFICATION
// ============================================

async function verifyAdminSession() {

    try {
        const data = await apiRequest(`${AUTH_API}/me`);

        if (!data.user || data.user.role !== "admin") {

            showMessage("globalMessage", t("unauthorized"), true);

            const destination =
                data.user?.role === "coordinator"
                    ? "coordinator-dashboard.html"
                    : data.user?.role === "volunteer"
                        ? "volunteer-dashboard.html"
                        : "login.html";

            window.location.replace(destination);

            return false;
        }

        currentUser = data.user;

        return true;

    } catch (error) {

        console.error("Admin session verification:", error);

        showMessage(
            "globalMessage",
            error.message || t("sessionError"),
            true
        );

        return false;
    }
}


// ============================================
// GATEWAY STATUS
// ============================================

async function loadGatewayStatus() {

    const indicator =
        document.getElementById("gatewayStatusIndicator");

    setText("gatewayStatusText", t("checking"));

    try {

        const data = await apiRequest(`${SMS_API}/status`);

        const ready = data.ready === true;
        const enabled = data.enabled === true;
        const configured = data.configured === true;

        indicator.style.backgroundColor = ready
            ? "#16865b"
            : "#c65a45";

        indicator.style.boxShadow = ready
            ? "0 0 0 4px rgba(22,134,91,0.15)"
            : "0 0 0 4px rgba(198,90,69,0.15)";

        if (ready) {

            setText("gatewayStatusText", t("gatewayReady"));

            showMessage(
                "gatewayMessage",
                t("gatewayReadyMessage")
            );

        } else if (!enabled) {

            setText("gatewayStatusText", t("gatewayDisabled"));

            showMessage(
                "gatewayMessage",
                t("gatewayDisabledMessage"),
                true
            );

        } else if (!configured) {

            setText("gatewayStatusText", t("gatewayNotConfigured"));

            showMessage(
                "gatewayMessage",
                t("gatewayConfigMessage"),
                true
            );

        } else {

            setText("gatewayStatusText", t("gatewayUnavailable"));

            showMessage(
                "gatewayMessage",
                t("gatewayUnavailableMessage"),
                true
            );
        }

        document.getElementById("sendSMSButton").disabled = !ready;

    } catch (error) {

        console.error("Gateway status:", error);

        indicator.style.backgroundColor = "#c65a45";

        setText("gatewayStatusText", t("gatewayUnavailable"));

        showMessage(
            "gatewayMessage",
            error.message || t("gatewayUnavailableMessage"),
            true
        );

        document.getElementById("sendSMSButton").disabled = true;
    }
}


// ============================================
// LOAD SMS STATISTICS
// ============================================

async function loadStatistics() {

    try {

        const data = await apiRequest(`${SMS_API}/stats`);

        const stats = data.statistics || {};

        setText("totalCount", stats.total ?? 0);
        setText("acceptedCount", stats.accepted ?? 0);
        setText("failedCount", stats.failed ?? 0);
        setText("recipientsCount", stats.totalRecipients ?? 0);

    } catch (error) {

        console.error("SMS statistics:", error);

        showMessage(
            "globalMessage",
            error.message || t("statisticsError"),
            true
        );
    }
}


// ============================================
// RECIPIENT AND MESSAGE COUNTS
// ============================================

function getRecipients() {

    const raw = document.getElementById("recipients").value;

    const numbers = raw
        .split(/[,\s;]+/)
        .map(number => number.trim())
        .filter(Boolean);

    return [...new Set(numbers)];
}


function updateRecipientCount() {

    const count = getRecipients().length;

    setText(
        "recipientCount",
        `${count} ${t("recipientCount")}`
    );
}


function updateCharacterCount() {

    const count = document.getElementById("smsMessage").value.length;

    setText("characterCount", count);
}


// ============================================
// TABLE HELPERS
// ============================================

function createCell(content) {

    const cell = document.createElement("td");

    cell.textContent = content ?? "—";

    return cell;
}


// ============================================
// RENDER SMS HISTORY
// ============================================

function renderSMSLogs(logs) {

    const tbody = document.getElementById("smsTableBody");

    tbody.replaceChildren();

    if (!logs.length) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "sms-empty-cell";
        cell.textContent = t("noLogs");

        row.appendChild(cell);
        tbody.appendChild(row);

        return;
    }

    logs.forEach(log => {

        const row = document.createElement("tr");

        row.appendChild(createCell(formatDate(log.createdAt)));

        const typeTranslations = {
            Manual: "manual",
            Announcement: "announcement",
            Registration: "registration",
            "Event Reminder": "eventReminder"
        };

        const typeKey = typeTranslations[log.type || "Manual"];

        row.appendChild(
            createCell(typeKey ? t(typeKey) : (log.type || "—"))
        );

        row.appendChild(
            createCell(
                Array.isArray(log.recipients)
                    ? log.recipients.join(", ")
                    : "—"
            )
        );

        row.appendChild(createCell(log.message || "—"));

        const statusTranslations = {
            Accepted: "accepted",
            Failed: "failed"
        };

        const statusKey = statusTranslations[log.status];

        const statusCell = createCell(
            statusKey ? t(statusKey) : (log.status || "—")
        );

        statusCell.style.fontWeight = "600";
        statusCell.style.color = log.status === "Accepted"
            ? "#16865b"
            : "#c65a45";

        row.appendChild(statusCell);

        row.appendChild(
            createCell(
                log.sentBy?.name ||
                log.sentBy?.email ||
                "—"
            )
        );

        tbody.appendChild(row);
    });
}


// ============================================
// PAGINATION
// ============================================

function updatePaginationText() {

    setText(
        "paginationInfo",
        `${t("page")} ${currentPage} ${t("of")} ${totalPages}`
    );
}


// ============================================
// LOAD SMS HISTORY
// ============================================

async function loadSMSLogs() {

    const tbody = document.getElementById("smsTableBody");

    tbody.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = document.createElement("td");

    loadingCell.colSpan = 6;
    loadingCell.className = "sms-empty-cell";
    loadingCell.textContent = t("loading");

    loadingRow.appendChild(loadingCell);
    tbody.appendChild(loadingRow);

    const status = document.getElementById("statusFilter").value;
    const type = document.getElementById("typeFilter").value;

    const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        status,
        type
    });

    try {

        const data = await apiRequest(
            `${SMS_API}/logs?${params.toString()}`
        );

        renderSMSLogs(data.logs || []);

        const pagination = data.pagination || {};

        currentPage = pagination.page || 1;

        totalPages = Math.max(
            1,
            pagination.totalPages || 1
        );

        updatePaginationText();

        document.getElementById("previousButton").disabled =
            currentPage <= 1;

        document.getElementById("nextButton").disabled =
            currentPage >= totalPages;

        showMessage("historyMessage", "");

    } catch (error) {

        console.error("SMS history:", error);

        tbody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "sms-empty-cell";
        cell.textContent = error.message || t("historyError");

        row.appendChild(cell);
        tbody.appendChild(row);

        showMessage(
            "historyMessage",
            error.message || t("historyError"),
            true
        );
    }
}


// ============================================
// LOAD PAGE DATA
// ============================================

async function loadPage() {

    await Promise.all([
        loadGatewayStatus(),
        loadStatistics(),
        loadSMSLogs()
    ]);
}


// ============================================
// VALIDATE SMS FORM
// ============================================

function validateSMSForm() {

    const recipients = getRecipients();

    const message =
        document.getElementById("smsMessage").value.trim();

    if (!recipients.length) {
        throw new Error(t("invalidRecipients"));
    }

    if (recipients.length > 100) {
        throw new Error(t("recipientLimit"));
    }

    const invalidNumber = recipients.some(
        number => !/^\+?[0-9]{10,15}$/.test(number)
    );

    if (invalidNumber) {
        throw new Error(t("invalidRecipients"));
    }

    if (!message.length) {
        throw new Error(t("messageRequired"));
    }

    if (message.length > 5000) {
        throw new Error(t("messageLimit"));
    }

    return {
        recipients,
        message,
        type: document.getElementById("smsType").value
    };
}


// ============================================
// SEND SMS
// ============================================

async function sendSMS(event) {

    event.preventDefault();

    const button = document.getElementById("sendSMSButton");
    const buttonText = document.getElementById("sendSMSText");

    const originalText = buttonText.textContent;

    showMessage("smsFormMessage", "");
    showMessage("globalMessage", "");

    try {

        const payload = validateSMSForm();

        button.disabled = true;
        buttonText.textContent = t("sending");

        const data = await apiRequest(`${SMS_API}/send`, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        document.getElementById("smsForm").reset();

        updateRecipientCount();
        updateCharacterCount();

        showMessage(
            "smsFormMessage",
            data.message || t("sendSuccess")
        );

        currentPage = 1;

        await Promise.all([
            loadStatistics(),
            loadSMSLogs(),
            loadGatewayStatus()
        ]);

    } catch (error) {

        console.error("Send SMS:", error);

        showMessage(
            "smsFormMessage",
            error.message || t("sendError"),
            true
        );

    } finally {

        buttonText.textContent = originalText;

        // Respect the latest gateway status.
        await loadGatewayStatus();
    }
}


// ============================================
// EVENT LISTENERS
// ============================================

// Compose SMS
document.getElementById("smsForm").addEventListener(
    "submit",
    sendSMS
);


// Recipient count
document.getElementById("recipients").addEventListener(
    "input",
    updateRecipientCount
);


// Character count
document.getElementById("smsMessage").addEventListener(
    "input",
    updateCharacterCount
);


// Clear form
document.getElementById("smsForm").addEventListener(
    "reset",
    () => {
        setTimeout(() => {
            updateRecipientCount();
            updateCharacterCount();
            showMessage("smsFormMessage", "");
        }, 0);
    }
);


// Refresh gateway status
document.getElementById("refreshStatusButton").addEventListener(
    "click",
    loadGatewayStatus
);


// Refresh SMS history and statistics
document.getElementById("refreshLogsButton").addEventListener(
    "click",
    async () => {

        await loadPage();

        showMessage(
            "globalMessage",
            t("refreshSuccess")
        );
    }
);


// Filter SMS history
document.getElementById("smsFilterForm").addEventListener(
    "submit",
    event => {

        event.preventDefault();

        currentPage = 1;

        loadSMSLogs();
    }
);


// Previous page
document.getElementById("previousButton").addEventListener(
    "click",
    () => {

        if (currentPage > 1) {
            currentPage--;
            loadSMSLogs();
        }
    }
);


// Next page
document.getElementById("nextButton").addEventListener(
    "click",
    () => {

        if (currentPage < totalPages) {
            currentPage++;
            loadSMSLogs();
        }
    }
);


// Language switching
document.getElementById("dashboardLanguage").addEventListener(
    "change",
    event => {

        language = event.target.value;

        localStorage.setItem("ngoLanguage", language);

        applyTranslations();

        loadPage();
    }
);


// Logout
document.getElementById("logoutButton").addEventListener(
    "click",
    async () => {

        const button = document.getElementById("logoutButton");

        button.disabled = true;

        try {

            await apiRequest(`${AUTH_API}/logout`, {
                method: "POST"
            });

            window.location.replace("login.html");

        } catch (error) {

            console.error("Logout:", error);

            showMessage(
                "globalMessage",
                error.message || t("logoutError"),
                true
            );

            button.disabled = false;
        }
    }
);


// ============================================
// INITIALIZE PAGE
// ============================================

async function initializePage() {

    applyTranslations();

    const authorized = await verifyAdminSession();

    if (!authorized) return;

    await loadPage();
}


initializePage();

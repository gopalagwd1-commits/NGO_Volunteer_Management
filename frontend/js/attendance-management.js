
/* =========================================================
   NGO VOLUNTEER CONNECT
   ATTENDANCE MANAGEMENT
   Frontend - Backend Integration
   ========================================================= */

"use strict";

// ---------------------------------------------------------
// 1. DOM ELEMENTS
// ---------------------------------------------------------

const eventSelect = document.getElementById("eventSelect");
const attendanceFilter = document.getElementById("attendanceFilter");
const volunteerSearch = document.getElementById("volunteerSearch");

const attendanceTableBody = document.getElementById("attendanceTableBody");
const attendanceMessage = document.getElementById("attendanceMessage");

const refreshAttendanceButton = document.getElementById(
    "refreshAttendanceButton"
);

const logoutButton = document.getElementById("logoutButton");
const dashboardLink = document.getElementById("dashboardLink");
const attendanceLanguage = document.getElementById("attendanceLanguage");

const selectedEventInfo = document.getElementById("selectedEventInfo");

const totalApprovedElement = document.getElementById("totalApproved");
const totalPresentElement = document.getElementById("totalPresent");
const totalAbsentElement = document.getElementById("totalAbsent");
const totalLateElement = document.getElementById("totalLate");
const totalNotMarkedElement = document.getElementById("totalNotMarked");

const volunteerCountElement = document.getElementById("volunteerCount");


// ---------------------------------------------------------
// 2. APPLICATION STATE
// ---------------------------------------------------------

let currentUser = null;
let currentRole = null;

let events = [];
let registrations = [];

let selectedEvent = null;

let isLoading = false;


// ---------------------------------------------------------
// 3. LANGUAGE SUPPORT
// ---------------------------------------------------------

let language = localStorage.getItem("ngoLanguage") || "en";

const translations = {
    en: {
        pageTitle: "Attendance Management",
        pageDescription:
            "Track volunteer participation and manage event attendance.",
        eventSelection: "Select Event",
        attendanceRegister: "Volunteer Attendance Register",
        selectEvent: "Select an event",
        loadingEvents: "Loading events...",
        loadingAttendance: "Loading attendance records...",
        noEvents: "No eligible events available.",
        noVolunteers: "No approved volunteers found for this event.",
        selectEventMessage: "Select an event to view attendance.",
        searchPlaceholder: "Search by name or email...",
        allStatuses: "All Statuses",
        notMarked: "Not Marked",
        present: "Present",
        absent: "Absent",
        late: "Late",
        approved: "Approved",
        refresh: "Refresh",
        signOut: "Sign out",
        totalApproved: "Total Approved",
        markedAt: "Marked At",
        action: "Action",
        volunteer: "Volunteer",
        email: "Email",
        registrationStatus: "Registration Status",
        attendance: "Attendance",
        save: "Save",
        saving: "Saving...",
        volunteers: "Volunteers",
        onlyApproved: "Only approved volunteers are displayed.",
        event: "EVENT",
        date: "DATE",
        venue: "VENUE",
        registered: "REGISTERED",
        attendanceUpdated: "Attendance updated successfully.",
        selectAttendance: "Select an attendance status.",
        noSearchResults: "No volunteers match your search.",
        loginRequired: "Your session has expired. Please log in again.",
        loadError: "Unable to load data. Please try again.",
        updateError: "Unable to update attendance.",
        networkError: "Network error. Please check your connection.",
        confirmLogout: "Are you sure you want to sign out?",
        dateNotAvailable: "Not available",
        never: "Not marked yet",
        all: "All",
        select: "Select"
    },

    kn: {
        pageTitle: "ಹಾಜರಾತಿ ನಿರ್ವಹಣೆ",
        pageDescription:
            "ಸ್ವಯಂಸೇವಕರ ಭಾಗವಹಿಸುವಿಕೆಯನ್ನು ಮತ್ತು ಕಾರ್ಯಕ್ರಮದ ಹಾಜರಾತಿಯನ್ನು ನಿರ್ವಹಿಸಿ.",
        eventSelection: "ಕಾರ್ಯಕ್ರಮ ಆಯ್ಕೆಮಾಡಿ",
        attendanceRegister: "ಸ್ವಯಂಸೇವಕರ ಹಾಜರಾತಿ ಪಟ್ಟಿ",
        selectEvent: "ಕಾರ್ಯಕ್ರಮ ಆಯ್ಕೆಮಾಡಿ",
        loadingEvents: "ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        loadingAttendance: "ಹಾಜರಾತಿ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        noEvents: "ಯಾವುದೇ ಕಾರ್ಯಕ್ರಮ ಲಭ್ಯವಿಲ್ಲ.",
        noVolunteers: "ಈ ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಅನುಮೋದಿತ ಸ್ವಯಂಸೇವಕರು ಲಭ್ಯವಿಲ್ಲ.",
        selectEventMessage: "ಹಾಜರಾತಿ ವೀಕ್ಷಿಸಲು ಕಾರ್ಯಕ್ರಮ ಆಯ್ಕೆಮಾಡಿ.",
        searchPlaceholder: "ಹೆಸರು ಅಥವಾ ಇಮೇಲ್ ಮೂಲಕ ಹುಡುಕಿ...",
        allStatuses: "ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು",
        notMarked: "ಗುರುತಿಸಿಲ್ಲ",
        present: "ಹಾಜರಿದ್ದಾರೆ",
        absent: "ಗೈರುಹಾಜರಿ",
        late: "ತಡವಾಗಿ ಬಂದಿದ್ದಾರೆ",
        approved: "ಅನುಮೋದಿಸಲಾಗಿದೆ",
        refresh: "ಮರುಲೋಡ್",
        signOut: "ಲಾಗ್ ಔಟ್",
        totalApproved: "ಒಟ್ಟು ಅನುಮೋದಿತ",
        markedAt: "ಗುರುತಿಸಿದ ಸಮಯ",
        action: "ಕ್ರಿಯೆ",
        volunteer: "ಸ್ವಯಂಸೇವಕ",
        email: "ಇಮೇಲ್",
        registrationStatus: "ನೋಂದಣಿ ಸ್ಥಿತಿ",
        attendance: "ಹಾಜರಾತಿ",
        save: "ಉಳಿಸಿ",
        saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
        volunteers: "ಸ್ವಯಂಸೇವಕರು",
        onlyApproved: "ಅನುಮೋದಿತ ಸ್ವಯಂಸೇವಕರನ್ನು ಮಾತ್ರ ತೋರಿಸಲಾಗುತ್ತದೆ.",
        event: "ಕಾರ್ಯಕ್ರಮ",
        date: "ದಿನಾಂಕ",
        venue: "ಸ್ಥಳ",
        registered: "ನೋಂದಾಯಿತರು",
        attendanceUpdated: "ಹಾಜರಾತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
        selectAttendance: "ಹಾಜರಾತಿ ಸ್ಥಿತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        noSearchResults: "ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದುವ ಸ್ವಯಂಸೇವಕರು ಇಲ್ಲ.",
        loginRequired: "ನಿಮ್ಮ ಸೆಷನ್ ಮುಗಿದಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
        loadError: "ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        updateError: "ಹಾಜರಾತಿಯನ್ನು ನವೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        networkError: "ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.",
        confirmLogout: "ನೀವು ಲಾಗ್ ಔಟ್ ಮಾಡಲು ಖಚಿತವೇ?",
        dateNotAvailable: "ಲಭ್ಯವಿಲ್ಲ",
        never: "ಇನ್ನೂ ಗುರುತಿಸಿಲ್ಲ",
        all: "ಎಲ್ಲಾ",
        select: "ಆಯ್ಕೆಮಾಡಿ"
    }
};

function t(key) {
    return translations[language]?.[key] ||
        translations.en[key] ||
        key;
}

function applyLanguage() {
    document.documentElement.lang = language;

    document.getElementById("pageTitle").textContent = t("pageTitle");

    document.getElementById("pageDescription").textContent =
        t("pageDescription");

    document.getElementById("eventSelectionTitle").textContent =
        t("eventSelection");

    document.getElementById("attendanceRegisterTitle").textContent =
        t("attendanceRegister");

    document.getElementById("refreshAttendanceButton").textContent =
        "↻ " + t("refresh");

    document.getElementById("dashboardLink").textContent =
        language === "kn" ? "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" : "Dashboard";

    document.getElementById("logoutButton").textContent = t("signOut");

    volunteerSearch.placeholder = t("searchPlaceholder");

    // Translate attendance filter options without changing their values.
    const filterLabels = {
        "All": t("all"),
        "Not Marked": t("notMarked"),
        "Present": t("present"),
        "Absent": t("absent"),
        "Late": t("late")
    };

    Array.from(attendanceFilter.options).forEach(option => {
        if (filterLabels[option.value]) {
            option.textContent = filterLabels[option.value];
        }
    });

    document.getElementById("attendanceFooterMessage").textContent =
        t("onlyApproved");

    const labels = document.querySelectorAll(".attendance-stat-card p");

    const statLabels = [
        t("totalApproved"),
        t("present"),
        t("absent"),
        t("late"),
        t("notMarked")
    ];

    labels.forEach((label, index) => {
        label.textContent = statLabels[index];
    });

    if (selectedEvent) {
        renderSelectedEventInfo();
        renderAttendanceTable();
    }
}

attendanceLanguage.value = language;

attendanceLanguage.addEventListener("change", event => {
    language = event.target.value;

    localStorage.setItem("ngoLanguage", language);

    applyLanguage();

    renderEventOptions();
});


// ---------------------------------------------------------
// 4. UTILITY FUNCTIONS
// ---------------------------------------------------------

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

function formatDate(value) {
    if (!value) {
        return t("dateNotAvailable");
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return t("dateNotAvailable");
    }

    return date.toLocaleDateString(
        language === "kn" ? "kn-IN" : "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function formatDateTime(value) {
    if (!value) {
        return t("never");
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return t("never");
    }

    return date.toLocaleString(
        language === "kn" ? "kn-IN" : "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function showMessage(message, type = "info") {
    attendanceMessage.textContent = message;
    attendanceMessage.className = `attendance-message ${type}`;
    attendanceMessage.hidden = false;
}

function hideMessage() {
    attendanceMessage.hidden = true;
    attendanceMessage.textContent = "";
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        credentials: "include",
        ...options,
        headers: {
            ...(options.body ? {
                "Content-Type": "application/json"
            } : {}),
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
        window.location.href = "login.html";
        throw new Error(t("loginRequired"));
    }

    if (!response.ok || data.success === false) {
        throw new Error(
            data.message ||
            data.error ||
            `Request failed (${response.status})`
        );
    }

    return data;
}


// ---------------------------------------------------------
// 5. SESSION AND ROLE VERIFICATION
// ---------------------------------------------------------

async function verifySession() {
    const data = await apiRequest("/api/auth/me");

    currentUser = data.user || data;

    currentRole = String(
        currentUser.role || ""
    ).toLowerCase();

    if (!["admin", "coordinator"].includes(currentRole)) {
        if (currentRole === "volunteer") {
            window.location.href = "volunteer-dashboard.html";
        } else {
            window.location.href = "login.html";
        }

        return false;
    }

    if (dashboardLink) {
        dashboardLink.href = currentRole === "coordinator"
            ? "coordinator-dashboard.html"
            : "admin-dashboard.html";
    }

    return true;
}


// ---------------------------------------------------------
// 6. LOAD EVENTS
// ---------------------------------------------------------

async function loadEvents() {
    eventSelect.innerHTML = `
        <option value="">${escapeHtml(t("loadingEvents"))}</option>
    `;

    try {
        const data = await apiRequest("/api/events");

        events = Array.isArray(data.events)
            ? data.events
            : Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                    ? data
                    : [];

        // Draft and cancelled events are not shown.
        events = events.filter(event =>
            ["Published", "Completed"].includes(event.status)
        );

        renderEventOptions();

    } catch (error) {
        eventSelect.innerHTML = `
            <option value="">${escapeHtml(t("loadError"))}</option>
        `;

        showMessage(error.message || t("loadError"), "error");
    }
}


function getDisplayEventTitle(event) {
    if (
        language === "kn" &&
        event.titleKannada &&
        event.titleKannada.trim()
    ) {
        return event.titleKannada.trim();
    }

    return event.title || "Untitled Event";
}

function renderEventOptions() {
    const previousValue = eventSelect.value;

    eventSelect.innerHTML = `
        <option value="">${escapeHtml(t("selectEvent"))}</option>
    `;

    if (events.length === 0) {
        eventSelect.innerHTML = `
            <option value="">${escapeHtml(t("noEvents"))}</option>
        `;

        return;
    }

    events.forEach(event => {
        const option = document.createElement("option");

        option.value = event._id || event.id;

        option.textContent =
            `${getDisplayEventTitle(event)} - ${formatDate(event.eventDate)}`;

        eventSelect.appendChild(option);
    });

    if (previousValue && events.some(event =>
        String(event._id || event.id) === previousValue
    )) {
        eventSelect.value = previousValue;
    }
}


// ---------------------------------------------------------
// 7. EVENT SELECTION
// ---------------------------------------------------------

eventSelect.addEventListener("change", async () => {
    const eventId = eventSelect.value;

    hideMessage();

    if (!eventId) {
        selectedEvent = null;
        registrations = [];

        selectedEventInfo.hidden = true;

        resetStatistics();
        renderAttendanceTable();

        return;
    }

    selectedEvent = events.find(event =>
        String(event._id || event.id) === eventId
    );

    renderSelectedEventInfo();

    await loadEventAttendance(eventId);
});

function renderSelectedEventInfo() {
    if (!selectedEvent) {
        selectedEventInfo.hidden = true;
        return;
    }

    selectedEventInfo.hidden = false;

    document.getElementById("selectedEventName").textContent =
        getDisplayEventTitle(selectedEvent);

    document.getElementById("selectedEventDate").textContent =
        formatDate(selectedEvent.eventDate);

    document.getElementById("selectedEventVenue").textContent =
        selectedEvent.venue || selectedEvent.address || "-";

    document.getElementById("selectedEventRegistered").textContent =
        selectedEvent.registeredCount ?? 0;
}


// ---------------------------------------------------------
// 8. LOAD EVENT REGISTRATIONS
// ---------------------------------------------------------

async function loadEventAttendance(eventId) {
    if (isLoading) return;

    isLoading = true;

    attendanceTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="table-placeholder">
                ${escapeHtml(t("loadingAttendance"))}
            </td>
        </tr>
    `;

    try {
        const data = await apiRequest(
            `/api/registrations/event/${encodeURIComponent(eventId)}`
        );

        const allRegistrations = Array.isArray(data.registrations)
            ? data.registrations
            : [];

        // Only approved volunteers are eligible for attendance.
        registrations = allRegistrations.filter(registration =>
            registration.status === "Approved"
        );

        updateStatistics();

        renderAttendanceTable();

    } catch (error) {
        registrations = [];

        resetStatistics();

        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="table-placeholder">
                    ${escapeHtml(error.message || t("loadError"))}
                </td>
            </tr>
        `;

        showMessage(error.message || t("loadError"), "error");

    } finally {
        isLoading = false;
    }
}


// ---------------------------------------------------------
// 9. ATTENDANCE STATISTICS
// ---------------------------------------------------------

function updateStatistics() {
    const totalApproved = registrations.length;

    const present = registrations.filter(
        registration => registration.attendance === "Present"
    ).length;

    const absent = registrations.filter(
        registration => registration.attendance === "Absent"
    ).length;

    const late = registrations.filter(
        registration => registration.attendance === "Late"
    ).length;

    const notMarked = totalApproved - present - absent - late;

    totalApprovedElement.textContent = totalApproved;
    totalPresentElement.textContent = present;
    totalAbsentElement.textContent = absent;
    totalLateElement.textContent = late;
    totalNotMarkedElement.textContent = notMarked;
}

function resetStatistics() {
    totalApprovedElement.textContent = "0";
    totalPresentElement.textContent = "0";
    totalAbsentElement.textContent = "0";
    totalLateElement.textContent = "0";
    totalNotMarkedElement.textContent = "0";

    volunteerCountElement.textContent = `0 ${t("volunteers")}`;
}


// ---------------------------------------------------------
// 10. ATTENDANCE TABLE
// ---------------------------------------------------------

function getAttendanceClass(status) {
    switch (status) {
        case "Present":
            return "status-present";

        case "Absent":
            return "status-absent";

        case "Late":
            return "status-late";

        default:
            return "status-not-marked";
    }
}

function renderAttendanceTable() {
    if (!selectedEvent) {
        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="table-placeholder">
                    ${escapeHtml(t("selectEventMessage"))}
                </td>
            </tr>
        `;

        volunteerCountElement.textContent = `0 ${t("volunteers")}`;

        return;
    }

    const searchValue = volunteerSearch.value
        .trim()
        .toLowerCase();

    const filterValue = attendanceFilter.value;

    const filteredRegistrations = registrations.filter(registration => {
        const volunteer = registration.volunteer || {};

        const volunteerName = String(
            volunteer.name || volunteer.fullName || ""
        ).toLowerCase();

        const volunteerKannadaName = String(
            volunteer.nameKannada || ""
        ).toLowerCase();

        const email = String(
            volunteer.email || ""
        ).toLowerCase();

        const searchMatch =
            volunteerName.includes(searchValue) ||
            volunteerKannadaName.includes(searchValue) ||
            email.includes(searchValue);

        const attendanceStatus = registration.attendance || "Not Marked";

        const statusMatch =
            filterValue === "All" ||
            attendanceStatus === filterValue;

        return searchMatch && statusMatch;
    });

    volunteerCountElement.textContent =
        `${filteredRegistrations.length} ${t("volunteers")}`;

    if (filteredRegistrations.length === 0) {
        const message = registrations.length === 0
            ? t("noVolunteers")
            : t("noSearchResults");

        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="table-placeholder">
                    ${escapeHtml(message)}
                </td>
            </tr>
        `;

        return;
    }

    attendanceTableBody.innerHTML = filteredRegistrations
        .map((registration, index) => {
            const volunteer = registration.volunteer || {};

            const name =
                language === "kn" && volunteer.nameKannada &&
                    volunteer.nameKannada.trim()
                    ? volunteer.nameKannada.trim()
                    : volunteer.name || volunteer.fullName || "Volunteer";

            const email = volunteer.email || "-";

            const attendance = registration.attendance || "Not Marked";

            const markedAt = formatDateTime(
                registration.attendanceMarkedAt
            );

            const registrationId =
                registration._id || registration.id;

            return `
                <tr>
                    <td>${index + 1}</td>

                    <td>
                        <strong>${escapeHtml(name)}</strong>
                    </td>

                    <td>${escapeHtml(email)}</td>

                    <td>
                        <span class="attendance-status registration-approved">
                            ${escapeHtml(t("approved"))}
                        </span>
                    </td>

                    <td>
                        <span class="attendance-status ${getAttendanceClass(attendance)}">
                            ${escapeHtml(t(attendance.toLowerCase().replace(" ", "")) || attendance)}
                        </span>
                    </td>

                    <td>${escapeHtml(markedAt)}</td>

                    <td>
                        <div class="attendance-action">
                            <select
                                class="attendance-choice"
                                data-registration-id="${escapeHtml(registrationId)}"
                                aria-label="Attendance status for ${escapeHtml(name)}">

                                <option value="">${escapeHtml(t("select"))}</option>

<option value="Present"
    ${attendance === "Present" ? "selected" : ""}>
    ${escapeHtml(t("present"))}
</option>

<option value="Absent"
    ${attendance === "Absent" ? "selected" : ""}>
    ${escapeHtml(t("absent"))}
</option>

<option value="Late"
    ${attendance === "Late" ? "selected" : ""}>
    ${escapeHtml(t("late"))}
</option>
                            </select>

                            <button
                                type="button"
                                class="save-attendance-button"
                                data-registration-id="${escapeHtml(registrationId)}">
                                ${escapeHtml(t("save"))}
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
}


// ---------------------------------------------------------
// 11. SAVE ATTENDANCE
// ---------------------------------------------------------

attendanceTableBody.addEventListener("click", async event => {
    const button = event.target.closest(".save-attendance-button");

    if (!button) return;

    const registrationId = button.dataset.registrationId;

    const select = attendanceTableBody.querySelector(
        `.attendance-choice[data-registration-id="${CSS.escape(registrationId)}"]`
    );

    if (!select || !select.value) {
        showMessage(t("selectAttendance"), "error");
        return;
    }

    const attendance = select.value;

    await saveAttendance(registrationId, attendance, button, select);
});

async function saveAttendance(registrationId, attendance, button, select) {
    const originalText = button.textContent;

    button.disabled = true;
    select.disabled = true;

    button.textContent = t("saving");
    button.classList.add("saving");

    hideMessage();

    try {
        await apiRequest(
            `/api/registrations/${encodeURIComponent(registrationId)}/attendance`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    attendance
                })
            }
        );

        showMessage(t("attendanceUpdated"), "success");

        // Reload from the backend to display the saved database value.
        await loadEventAttendance(eventSelect.value);

    } catch (error) {
        showMessage(
            error.message || t("updateError"),
            "error"
        );

        button.disabled = false;
        select.disabled = false;
        button.textContent = originalText;
        button.classList.remove("saving");
    }
}


// ---------------------------------------------------------
// 12. SEARCH AND FILTER
// ---------------------------------------------------------

volunteerSearch.addEventListener("input", renderAttendanceTable);

attendanceFilter.addEventListener("change", renderAttendanceTable);


// ---------------------------------------------------------
// 13. REFRESH
// ---------------------------------------------------------

refreshAttendanceButton.addEventListener("click", async () => {
    hideMessage();

    await loadEvents();

    if (eventSelect.value) {
        await loadEventAttendance(eventSelect.value);
    } else {
        resetStatistics();
        renderAttendanceTable();
    }
});


// ---------------------------------------------------------
// 14. LOGOUT
// ---------------------------------------------------------

logoutButton.addEventListener("click", async () => {
    if (!confirm(t("confirmLogout"))) {
        return;
    }

    try {
        await apiRequest("/api/auth/logout", {
            method: "POST"
        });
    } catch (error) {
        console.error("Logout error:", error);
    }

    window.location.href = "login.html";
});


// ---------------------------------------------------------
// 15. INITIALIZE APPLICATION
// ---------------------------------------------------------

async function initializeAttendanceManagement() {
    try {
        applyLanguage();

        const authorized = await verifySession();

        if (!authorized) return;

        await loadEvents();

        if (events.length > 0) {
            eventSelect.selectedIndex = 1;

            const eventId = eventSelect.value;

            selectedEvent = events.find(event =>
                String(event._id || event.id) === eventId
            );

            renderSelectedEventInfo();

            await loadEventAttendance(eventId);
        } else {
            resetStatistics();
            renderAttendanceTable();
        }

    } catch (error) {
        console.error("Attendance initialization error:", error);

        showMessage(
            error.message || t("loadError"),
            "error"
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    initializeAttendanceManagement
);

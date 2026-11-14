
"use strict";

const AUTH_API = "/api/auth";
const EVENT_API = "/api/events";
const REGISTRATION_API = "/api/registrations";

let currentUser = null;
let currentPage = 1;
const pageLimit = 10;
let totalPages = 1;
let selectedEventId = null;
let searchTimer = null;
let language = localStorage.getItem("ngoLanguage") || "en";

const translations = {
    en: {
        eyebrow: "NGO OPERATIONS",
        title: "Event Management",
        description: "Plan, organize and monitor NGO activities.",
        totalEvents: "Total Events",
        publishedEvents: "Published Events",
        registrations: "Registrations",
        upcomingEvents: "Upcoming Events",
        createTitle: "Create New Event",
        createDescription: "Enter the details of your NGO activity.",
        eventTitle: "Event Title *",
        titleKannada: "Event Title in Kannada (Optional)",
        descriptionLabel: "Description *",
        category: "Category *",
        venue: "Venue *",
        address: "Complete Address",
        date: "Event Date *",
        deadline: "Registration Deadline *",
        startTime: "Start Time *",
        endTime: "End Time *",
        capacity: "Maximum Volunteers *",
        required: "Required Volunteers *",
        status: "Event Status *",
        save: "Save Event",
        update: "Update Event",
        clear: "Clear Form",
        listTitle: "Event Directory",
        listDescription: "View and manage all NGO events.",
        refresh: "↻ Refresh",
        search: "Search events...",
        allStatuses: "All Statuses",
        allCategories: "All Categories",
        event: "Event",
        dateHeading: "Date",
        venueHeading: "Venue",
        capacityHeading: "Capacity",
        statusHeading: "Status",
        actions: "Actions",
        previous: "Previous",
        next: "Next",
        page: "Page",
        registrationsTitle: "Volunteer Registrations",
        registrationsDescription: "Select an event to review volunteer registrations.",
        noEvent: "No event selected",
        volunteer: "Volunteer",
        email: "Email",
        registeredOn: "Registered On",
        attendance: "Attendance",
        registrationActions: "Actions",
        loading: "Loading...",
        noEvents: "No events found.",
        noRegistrations: "No registrations found for this event.",
        selectEvent: "Select an event to view registrations.",
        view: "Registrations",
        edit: "Edit",
        delete: "Delete",
        approve: "Approve",
        reject: "Reject",
        present: "Present",
        absent: "Absent",
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        cancelled: "Cancelled",
        completed: "Completed",
        draft: "Draft",
        published: "Published",
        notMarked: "Not Marked",
        created: "Event created successfully.",
        updated: "Event updated successfully.",
        deleted: "Event deleted successfully.",
        deleteConfirm: "Are you sure you want to delete this event?",
        reviewConfirm: "Are you sure you want to ",
        attendanceConfirm: "Mark attendance as ",
        saveError: "Unable to save event.",
        loadError: "Unable to load events.",
        sessionError: "Please log in to continue.",
        accessDenied: "You do not have permission to access this page.",
        requiredFields: "Please complete all required fields.",
        invalidTime: "End time must be later than start time.",
        invalidDates: "Registration deadline cannot be after the event date.",
        invalidCapacity: "Required volunteers cannot exceed maximum capacity.",
        empty: "No data available.",
        dashboard: "Back to Dashboard",
        logout: "Sign Out"
    },

    kn: {
        eyebrow: "ಎನ್‌ಜಿಒ ಕಾರ್ಯಾಚರಣೆಗಳು",
        title: "ಕಾರ್ಯಕ್ರಮ ನಿರ್ವಹಣೆ",
        description: "ಎನ್‌ಜಿಒ ಚಟುವಟಿಕೆಗಳನ್ನು ಯೋಜಿಸಿ ಮತ್ತು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.",
        totalEvents: "ಒಟ್ಟು ಕಾರ್ಯಕ್ರಮಗಳು",
        publishedEvents: "ಪ್ರಕಟಿತ ಕಾರ್ಯಕ್ರಮಗಳು",
        registrations: "ನೋಂದಣಿಗಳು",
        upcomingEvents: "ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳು",
        createTitle: "ಹೊಸ ಕಾರ್ಯಕ್ರಮ ರಚಿಸಿ",
        createDescription: "ನಿಮ್ಮ ಎನ್‌ಜಿಒ ಚಟುವಟಿಕೆಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.",
        eventTitle: "ಕಾರ್ಯಕ್ರಮದ ಹೆಸರು *",
        titleKannada: "ಕನ್ನಡದಲ್ಲಿ ಕಾರ್ಯಕ್ರಮದ ಹೆಸರು (ಐಚ್ಛಿಕ)",
        descriptionLabel: "ವಿವರಣೆ *",
        category: "ವರ್ಗ *",
        venue: "ಸ್ಥಳ *",
        address: "ಪೂರ್ಣ ವಿಳಾಸ",
        date: "ಕಾರ್ಯಕ್ರಮದ ದಿನಾಂಕ *",
        deadline: "ನೋಂದಣಿ ಕೊನೆಯ ದಿನಾಂಕ *",
        startTime: "ಪ್ರಾರಂಭ ಸಮಯ *",
        endTime: "ಮುಕ್ತಾಯ ಸಮಯ *",
        capacity: "ಗರಿಷ್ಠ ಸ್ವಯಂಸೇವಕರು *",
        required: "ಅಗತ್ಯವಿರುವ ಸ್ವಯಂಸೇವಕರು *",
        status: "ಕಾರ್ಯಕ್ರಮದ ಸ್ಥಿತಿ *",
        save: "ಕಾರ್ಯಕ್ರಮ ಉಳಿಸಿ",
        update: "ಕಾರ್ಯಕ್ರಮ ನವೀಕರಿಸಿ",
        clear: "ಫಾರ್ಮ್ ತೆರವುಗೊಳಿಸಿ",
        listTitle: "ಕಾರ್ಯಕ್ರಮಗಳ ಪಟ್ಟಿ",
        listDescription: "ಎಲ್ಲಾ ಎನ್‌ಜಿಒ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ.",
        refresh: "↻ ನವೀಕರಿಸಿ",
        search: "ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಹುಡುಕಿ...",
        allStatuses: "ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು",
        allCategories: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
        event: "ಕಾರ್ಯಕ್ರಮ",
        dateHeading: "ದಿನಾಂಕ",
        venueHeading: "ಸ್ಥಳ",
        capacityHeading: "ಸಾಮರ್ಥ್ಯ",
        statusHeading: "ಸ್ಥಿತಿ",
        actions: "ಕ್ರಿಯೆಗಳು",
        previous: "ಹಿಂದಿನ",
        next: "ಮುಂದಿನ",
        page: "ಪುಟ",
        registrationsTitle: "ಸ್ವಯಂಸೇವಕರ ನೋಂದಣಿಗಳು",
        registrationsDescription: "ನೋಂದಣಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಕಾರ್ಯಕ್ರಮವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        noEvent: "ಯಾವುದೇ ಕಾರ್ಯಕ್ರಮ ಆಯ್ಕೆಯಾಗಿಲ್ಲ",
        volunteer: "ಸ್ವಯಂಸೇವಕ",
        email: "ಇಮೇಲ್",
        registeredOn: "ನೋಂದಣಿ ದಿನಾಂಕ",
        attendance: "ಹಾಜರಾತಿ",
        registrationActions: "ಕ್ರಿಯೆಗಳು",
        loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        noEvents: "ಯಾವುದೇ ಕಾರ್ಯಕ್ರಮಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
        noRegistrations: "ಈ ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ನೋಂದಣಿಗಳಿಲ್ಲ.",
        selectEvent: "ನೋಂದಣಿಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಕಾರ್ಯಕ್ರಮ ಆಯ್ಕೆಮಾಡಿ.",
        view: "ನೋಂದಣಿಗಳು",
        edit: "ತಿದ್ದುಪಡಿ",
        delete: "ಅಳಿಸಿ",
        approve: "ಅನುಮೋದಿಸಿ",
        reject: "ತಿರಸ್ಕರಿಸಿ",
        present: "ಹಾಜರು",
        absent: "ಗೈರು",
        pending: "ಬಾಕಿ",
        approved: "ಅನುಮೋದಿಸಲಾಗಿದೆ",
        rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
        cancelled: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
        completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
        draft: "ಕರಡು",
        published: "ಪ್ರಕಟಿಸಲಾಗಿದೆ",
        notMarked: "ಗುರುತಿಸಿಲ್ಲ",
        created: "ಕಾರ್ಯಕ್ರಮ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ.",
        updated: "ಕಾರ್ಯಕ್ರಮ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
        deleted: "ಕಾರ್ಯಕ್ರಮ ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.",
        deleteConfirm: "ಈ ಕಾರ್ಯಕ್ರಮವನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿದ್ದೀರಾ?",
        reviewConfirm: "ನೀವು ಖಚಿತವಾಗಿ ",
        attendanceConfirm: "ಹಾಜರಾತಿಯನ್ನು ",
        saveError: "ಕಾರ್ಯಕ್ರಮ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        loadError: "ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        sessionError: "ಮುಂದುವರಿಯಲು ಲಾಗಿನ್ ಮಾಡಿ.",
        accessDenied: "ಈ ಪುಟವನ್ನು ಪ್ರವೇಶಿಸಲು ನಿಮಗೆ ಅನುಮತಿ ಇಲ್ಲ.",
        requiredFields: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಅಗತ್ಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.",
        invalidTime: "ಮುಕ್ತಾಯ ಸಮಯವು ಪ್ರಾರಂಭ ಸಮಯಕ್ಕಿಂತ ನಂತರ ಇರಬೇಕು.",
        invalidDates: "ನೋಂದಣಿ ಕೊನೆಯ ದಿನಾಂಕವು ಕಾರ್ಯಕ್ರಮದ ದಿನಾಂಕಕ್ಕಿಂತ ನಂತರ ಇರಬಾರದು.",
        invalidCapacity: "ಅಗತ್ಯವಿರುವ ಸ್ವಯಂಸೇವಕರ ಸಂಖ್ಯೆ ಗರಿಷ್ಠ ಸಾಮರ್ಥ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬಾರದು.",
        empty: "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.",
        dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
        logout: "ಲಾಗ್ ಔಟ್"
    }
};

function t(key) {
    return translations[language]?.[key] || translations.en[key] || key;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function setPlaceholder(id, value) {
    const element = document.getElementById(id);
    if (element) element.placeholder = value;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

async function apiRequest(url, options = {}) {
    const config = {
        credentials: "same-origin",
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    };

    const response = await fetch(url, config);

    let data;

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (response.status === 401) {
        window.location.href = "login.html";
        throw new Error(t("sessionError"));
    }

    if (!response.ok || data.success === false) {
        throw new Error(
            data.message ||
            data.errors?.join(" ") ||
            "Request failed."
        );
    }

    return data;
}

function showMessage(message, isError = false) {
    const element = document.getElementById("eventMessage");

    element.textContent = message;
    element.classList.toggle("error", isError);

    element.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

const APP_TIME_ZONE = "Asia/Kolkata";

function getISTDateKey(value) {
    if (!value) return "";

    // Preserve an HTML date input's YYYY-MM-DD value.
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        return String(value);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: APP_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map(part => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
}

function dateInputValue(value) {
    return getISTDateKey(value);
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat(
        language === "kn" ? "kn-IN" : "en-IN",
        {
            timeZone: APP_TIME_ZONE,
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);
}


function statusClass(status) {
    return `status-${String(status).toLowerCase()}`;
}

function statusText(status) {
    const keys = {
        Draft: "draft",
        Published: "published",
        Cancelled: "cancelled",
        Completed: "completed",
        Pending: "pending",
        Approved: "approved",
        Rejected: "rejected",
        "Not Marked": "notMarked",
        Present: "present",
        Absent: "absent"
    };

    return t(keys[status] || status);
}

function applyTranslations() {
    document.documentElement.lang = language;

    const mappings = {
        pageEyebrow: "eyebrow",
        pageTitle: "title",
        pageDescription: "description",
        totalEventsLabel: "totalEvents",
        publishedEventsLabel: "publishedEvents",
        registrationsLabel: "registrations",
        upcomingEventsLabel: "upcomingEvents",
        createEventTitle: "createTitle",
        createEventDescription: "createDescription",
        titleLabel: "eventTitle",
        titleKannadaLabel: "titleKannada",
        descriptionLabel: "descriptionLabel",
        categoryLabel: "category",
        venueLabel: "venue",
        addressLabel: "address",
        dateLabel: "date",
        deadlineLabel: "deadline",
        startTimeLabel: "startTime",
        endTimeLabel: "endTime",
        capacityLabel: "capacity",
        requiredLabel: "required",
        statusLabel: "status",
        eventListTitle: "listTitle",
        eventListDescription: "listDescription",
        registrationTitle: "registrationsTitle",
        registrationDescription: "registrationsDescription",
        dashboardLinkText: "dashboard"
    };

    for (const [id, key] of Object.entries(mappings)) {
        setText(id, t(key));
    }

    setPlaceholder(
        "eventTitleKannada",
        language === "kn"
            ? "ಕನ್ನಡದಲ್ಲಿ ಕಾರ್ಯಕ್ರಮದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ"
            : "Enter event title in Kannada"
    );

    const saveButton = document.getElementById("saveEventButton");
    if (saveButton) {
        saveButton.textContent = document.getElementById("eventId").value
            ? t("update")
            : t("save");
    }

    setText("resetEventButton", t("clear"));
    setText("refreshEventsButton", t("refresh"));
    setText("previousPageButton", t("previous"));
    setText("nextPageButton", t("next"));
    setText("eventNameHeading", t("event"));
    setText("eventDateHeading", t("dateHeading"));
    setText("eventVenueHeading", t("venueHeading"));
    setText("eventCapacityHeading", t("capacityHeading"));
    setText("eventStatusHeading", t("statusHeading"));
    setText("eventActionsHeading", t("actions"));
    setText("volunteerNameHeading", t("volunteer"));
    setText("volunteerEmailHeading", t("email"));
    setText("registrationDateHeading", t("registeredOn"));
    setText("registrationStatusHeading", t("statusHeading"));
    setText("attendanceHeading", t("attendance"));
    setText("registrationActionsHeading", t("registrationActions"));

    setPlaceholder("eventSearch", t("search"));

    const languageSelect = document.getElementById("eventLanguage");
    if (languageSelect) languageSelect.value = language;

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) logoutButton.textContent = t("logout");

    const statusFilter = document.getElementById("eventStatusFilter");
    if (statusFilter) {
        statusFilter.options[0].textContent = t("allStatuses");

        for (let i = 1; i < statusFilter.options.length; i++) {
            statusFilter.options[i].textContent =
                statusText(statusFilter.options[i].value);
        }
    }

    const categoryFilter = document.getElementById("eventCategoryFilter");
    if (categoryFilter) {
        categoryFilter.options[0].textContent = t("allCategories");
    }

    const categorySelect = document.getElementById("eventCategory");
    if (categorySelect) {
        const categoryTranslations = {
            Education: "Education",
            Healthcare: "Healthcare",
            Environment: "Environment",
            "Community Development": "Community Development",
            "Food Distribution": "Food Distribution",
            "Animal Welfare": "Animal Welfare",
            Other: "Other"
        };

        const kannadaCategories = {
            Education: "ಶಿಕ್ಷಣ",
            Healthcare: "ಆರೋಗ್ಯ ಸೇವೆ",
            Environment: "ಪರಿಸರ",
            "Community Development": "ಸಮುದಾಯ ಅಭಿವೃದ್ಧಿ",
            "Food Distribution": "ಆಹಾರ ವಿತರಣೆ",
            "Animal Welfare": "ಪ್ರಾಣಿ ಕಲ್ಯಾಣ",
            Other: "ಇತರೆ"
        };

        for (let i = 1; i < categorySelect.options.length; i++) {
            const value = categorySelect.options[i].value;

            categorySelect.options[i].textContent =
                language === "kn"
                    ? kannadaCategories[value]
                    : categoryTranslations[value];
        }
    }

    setText(
        "selectedEventName",
        selectedEventId
            ? document.getElementById("selectedEventName").dataset.eventName
            : t("noEvent")
    );

    if (document.getElementById("registrationTableBody").children.length === 0) {
        setText("registrationTableBody", t("selectEvent"));
    }
}

async function verifySession() {
    const data = await apiRequest(`${AUTH_API}/me`);

    currentUser = data.user;

    if (!currentUser || !["admin", "coordinator"].includes(currentUser.role)) {
        window.location.href =
            currentUser?.role === "volunteer"
                ? "volunteer-dashboard.html"
                : "login.html";

        return false;
    }

    const dashboardLink = document.getElementById("dashboardLink");

    dashboardLink.href =
        currentUser.role === "admin"
            ? "admin-dashboard.html"
            : "coordinator-dashboard.html";

    return true;
}

function getFormData() {
    return {
        title: document.getElementById("eventTitle").value.trim(),
        titleKannada:
            document.getElementById("eventTitleKannada").value.trim(),
        description: document.getElementById("eventDescription").value.trim(),
        category: document.getElementById("eventCategory").value,
        venue: document.getElementById("eventVenue").value.trim(),
        address: document.getElementById("eventAddress").value.trim(),
        eventDate: document.getElementById("eventDate").value,
        registrationDeadline:
            document.getElementById("registrationDeadline").value,
        startTime: document.getElementById("startTime").value,
        endTime: document.getElementById("endTime").value,
        capacity: Number(document.getElementById("eventCapacity").value),
        requiredVolunteers:
            Number(document.getElementById("requiredVolunteers").value),
        status: document.getElementById("eventStatus").value
    };
}

function validateForm(data) {
    if (
        !data.title ||
        !data.description ||
        !data.category ||
        !data.venue ||
        !data.eventDate ||
        !data.registrationDeadline ||
        !data.startTime ||
        !data.endTime ||
        !data.capacity ||
        !data.requiredVolunteers
    ) {
        throw new Error(t("requiredFields"));
    }

    if (data.startTime >= data.endTime) {
        throw new Error(t("invalidTime"));
    }

    if (data.registrationDeadline > data.eventDate) {
        throw new Error(t("invalidDates"));
    }

    if (data.requiredVolunteers > data.capacity) {
        throw new Error(t("invalidCapacity"));
    }

    return data;
}

function resetForm() {
    document.getElementById("eventForm").reset();
    document.getElementById("eventId").value = "";

    document.getElementById("eventCapacity").value = 50;
    document.getElementById("requiredVolunteers").value = 10;
    document.getElementById("eventStatus").value = "Draft";

    applyTranslations();
}

async function saveEvent(event) {
    event.preventDefault();

    const button = document.getElementById("saveEventButton");
    const originalText = button.textContent;

    button.disabled = true;

    try {
        const data = validateForm(getFormData());

        const eventId = document.getElementById("eventId").value;

        const url = eventId
            ? `${EVENT_API}/${encodeURIComponent(eventId)}`
            : EVENT_API;

        const result = await apiRequest(url, {
            method: eventId ? "PATCH" : "POST",
            body: JSON.stringify(data)
        });

        resetForm();

        showMessage(
            eventId ? t("updated") : t("created")
        );

        await loadPage();

    } catch (error) {
        showMessage(error.message || t("saveError"), true);
    } finally {
        button.disabled = false;
        button.textContent = originalText;
        applyTranslations();
    }
}

function populateEditForm(event) {
    document.getElementById("eventId").value = event._id;
    document.getElementById("eventTitle").value = event.title;
    document.getElementById("eventTitleKannada").value =
    event.titleKannada || "";
    document.getElementById("eventDescription").value = event.description;
    document.getElementById("eventCategory").value = event.category;
    document.getElementById("eventVenue").value = event.venue;
    document.getElementById("eventAddress").value = event.address || "";

    document.getElementById("eventDate").value =
        dateInputValue(event.eventDate);

    document.getElementById("registrationDeadline").value =
        dateInputValue(event.registrationDeadline);

    document.getElementById("startTime").value = event.startTime;
    document.getElementById("endTime").value = event.endTime;
    document.getElementById("eventCapacity").value = event.capacity;
    document.getElementById("requiredVolunteers").value =
        event.requiredVolunteers;
    document.getElementById("eventStatus").value = event.status;

    applyTranslations();

    document.getElementById("eventForm").scrollIntoView({
        behavior: "smooth"
    });
}

async function deleteEvent(eventId) {
    if (!confirm(t("deleteConfirm"))) return;

    try {
        await apiRequest(`${EVENT_API}/${encodeURIComponent(eventId)}`, {
            method: "DELETE"
        });

        showMessage(t("deleted"));

        if (selectedEventId === eventId) {
            selectedEventId = null;
            setText("selectedEventName", t("noEvent"));
            document.getElementById("registrationTableBody").innerHTML =
                `<tr><td colspan="6">${escapeHTML(t("selectEvent"))}</td></tr>`;
        }

        await loadPage();

    } catch (error) {
        showMessage(error.message, true);
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

function renderEvents(events) {
    const body = document.getElementById("eventTableBody");

    if (!events.length) {
        body.innerHTML =
            `<tr><td colspan="6">${escapeHTML(t("noEvents"))}</td></tr>`;
        return;
    }

    body.innerHTML = events.map(event => {
        const actions = `
            <div class="action-buttons">
                <button class="table-action"
                    data-action="registrations"
                    data-id="${escapeHTML(event._id)}"
                    data-name="${escapeHTML(getDisplayEventTitle(event))}">
                    ${escapeHTML(t("view"))}
                </button>
                <button class="table-action"
                    data-action="edit"
                    data-id="${escapeHTML(event._id)}">
                    ${escapeHTML(t("edit"))}
                </button>
                ${currentUser.role === "admin" ? `
                    <button class="table-action danger"
                        data-action="delete"
                        data-id="${escapeHTML(event._id)}">
                        ${escapeHTML(t("delete"))}
                    </button>
                ` : ""}
            </div>
        `;

        return `
            <tr>
                <td>
                    <span class="event-name">${escapeHTML(getDisplayEventTitle(event))}</span>
                    <span class="event-category">${escapeHTML(event.category)}</span>
                </td>
                <td>${escapeHTML(formatDate(event.eventDate))}</td>
                <td>${escapeHTML(event.venue)}</td>
                <td>${Number(event.registeredCount || 0)} / ${Number(event.capacity)}</td>
                <td>
                    <span class="status-badge ${statusClass(event.status)}">
                        ${escapeHTML(statusText(event.status))}
                    </span>
                </td>
                <td>${actions}</td>
            </tr>
        `;
    }).join("");
}

async function loadEvents() {
    const params = new URLSearchParams({
        page: currentPage,
        limit: pageLimit
    });

    const search = document.getElementById("eventSearch").value.trim();
    const status = document.getElementById("eventStatusFilter").value;
    const category = document.getElementById("eventCategoryFilter").value;

    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (category) params.set("category", category);

    const body = document.getElementById("eventTableBody");

    body.innerHTML =
        `<tr><td colspan="6">${escapeHTML(t("loading"))}</td></tr>`;

    const data = await apiRequest(`${EVENT_API}?${params.toString()}`);

    totalPages = Math.max(1, data.pagination.totalPages);

    renderEvents(data.events);

    setText(
        "pageInformation",
        `${t("page")} ${currentPage} / ${totalPages}`
    );

    document.getElementById("previousPageButton").disabled =
        currentPage <= 1;

    document.getElementById("nextPageButton").disabled =
        currentPage >= totalPages;
}

async function loadStatistics() {
    const firstPage = await apiRequest(
        `${EVENT_API}?page=1&limit=100`
    );

    let events = firstPage.events || [];

    const totalPages = Math.max(
        1,
        Number(firstPage.pagination?.totalPages || 1)
    );

    if (totalPages > 1) {
        const remainingPages = await Promise.all(
            Array.from(
                { length: totalPages - 1 },
                (_, index) => index + 2
            ).map(page =>
                apiRequest(`${EVENT_API}?page=${page}&limit=100`)
            )
        );

        for (const result of remainingPages) {
            events.push(...(result.events || []));
        }
    }

    const todayIST = getISTDateKey(new Date());

    const published = events.filter(
        event => event.status === "Published"
    ).length;

    const upcoming = events.filter(event => {
        return (
            event.status === "Published" &&
            getISTDateKey(event.eventDate) >= todayIST
        );
    }).length;

    const registrations = events.reduce(
        (total, event) =>
            total + Number(event.registeredCount || 0),
        0
    );

    setText(
        "totalEvents",
        firstPage.pagination?.total ?? events.length
    );

    setText("publishedEvents", published);
    setText("totalRegistrations", registrations);
    setText("upcomingEvents", upcoming);
}

async function loadPage() {
    await Promise.all([
        loadEvents(),
        loadStatistics()
    ]);
}

async function loadRegistrations(eventId, eventName) {
    selectedEventId = eventId;

    const nameElement = document.getElementById("selectedEventName");

    nameElement.dataset.eventName = eventName;
    nameElement.textContent = eventName;

    const body = document.getElementById("registrationTableBody");

    body.innerHTML =
        `<tr><td colspan="6">${escapeHTML(t("loading"))}</td></tr>`;

    try {
        const data = await apiRequest(
            `${REGISTRATION_API}/event/${encodeURIComponent(eventId)}`
        );

        const registrations = data.registrations || [];

        if (!registrations.length) {
            body.innerHTML =
                `<tr><td colspan="6">${escapeHTML(t("noRegistrations"))}</td></tr>`;
            return;
        }

        body.innerHTML = registrations.map(registration => {
            const volunteer = registration.volunteer || {};

            let actions = "";

            if (registration.status === "Pending") {
                actions = `
                    <button class="table-action"
                        data-action="approve"
                        data-id="${escapeHTML(registration._id)}">
                        ${escapeHTML(t("approve"))}
                    </button>
                    <button class="table-action danger"
                        data-action="reject"
                        data-id="${escapeHTML(registration._id)}">
                        ${escapeHTML(t("reject"))}
                    </button>
                `;
            }

            if (registration.status === "Approved") {
                actions = `
                    <button class="table-action"
                        data-action="present"
                        data-id="${escapeHTML(registration._id)}">
                        ${escapeHTML(t("present"))}
                    </button>
                    <button class="table-action danger"
                        data-action="absent"
                        data-id="${escapeHTML(registration._id)}">
                        ${escapeHTML(t("absent"))}
                    </button>
                `;
            }

            return `
                <tr>
                    <td>${escapeHTML(volunteer.name || "Unavailable")}</td>
                    <td>${escapeHTML(volunteer.email || "-")}</td>
                    <td>${escapeHTML(formatDate(registration.registrationDate))}</td>
                    <td>
                        <span class="status-badge ${statusClass(registration.status)}">
                            ${escapeHTML(statusText(registration.status))}
                        </span>
                    </td>
                    <td>${escapeHTML(statusText(registration.attendance))}</td>
                    <td><div class="action-buttons">${actions}</div></td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        body.innerHTML =
            `<tr><td colspan="6">${escapeHTML(error.message)}</td></tr>`;
    }
}

async function reviewRegistration(id, status) {
    if (!confirm(`${t("reviewConfirm")}${status.toLowerCase()}?`)) return;

    try {
        await apiRequest(
            `${REGISTRATION_API}/${encodeURIComponent(id)}/review`,
            {
                method: "PATCH",
                body: JSON.stringify({ status })
            }
        );

        showMessage(
            `${t(status.toLowerCase())} successfully.`
        );

        if (selectedEventId) {
            await loadRegistrations(
                selectedEventId,
                document.getElementById("selectedEventName").dataset.eventName
            );
        }

        await loadStatistics();

    } catch (error) {
        showMessage(error.message, true);
    }
}

async function markAttendance(id, attendance) {
    if (!confirm(
        `${t("attendanceConfirm")}${t(attendance.toLowerCase())}?`
    )) return;

    try {
        await apiRequest(
            `${REGISTRATION_API}/${encodeURIComponent(id)}/attendance`,
            {
                method: "PATCH",
                body: JSON.stringify({ attendance })
            }
        );

        showMessage("Attendance updated successfully.");

        if (selectedEventId) {
            await loadRegistrations(
                selectedEventId,
                document.getElementById("selectedEventName").dataset.eventName
            );
        }

    } catch (error) {
        showMessage(error.message, true);
    }
}

function handleEventTableClick(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const { action, id, name } = button.dataset;

    if (action === "edit") {
        const row = button.closest("tr");

        // Fetch the full event details before editing.
        apiRequest(`${EVENT_API}/${encodeURIComponent(id)}`)
            .then(data => populateEditForm(data.event))
            .catch(error => showMessage(error.message, true));
    }

    if (action === "delete") {
        deleteEvent(id);
    }

    if (action === "registrations") {
        loadRegistrations(id, name);

        document.getElementById("registrationPanel").scrollIntoView({
            behavior: "smooth"
        });
    }
}

function handleRegistrationTableClick(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const { action, id } = button.dataset;

    if (action === "approve") reviewRegistration(id, "Approved");
    if (action === "reject") reviewRegistration(id, "Rejected");
    if (action === "present") markAttendance(id, "Present");
    if (action === "absent") markAttendance(id, "Absent");
}

function attachEventListeners() {
    document.getElementById("eventForm")
        .addEventListener("submit", saveEvent);

    document.getElementById("resetEventButton")
        .addEventListener("click", resetForm);

    document.getElementById("eventTableBody")
        .addEventListener("click", handleEventTableClick);

    document.getElementById("registrationTableBody")
        .addEventListener("click", handleRegistrationTableClick);

    document.getElementById("refreshEventsButton")
        .addEventListener("click", () => {
            currentPage = 1;
            loadPage().catch(error => showMessage(error.message, true));
        });

    document.getElementById("eventSearch")
        .addEventListener("input", () => {
            clearTimeout(searchTimer);

            searchTimer = setTimeout(() => {
                currentPage = 1;
                loadPage().catch(error => showMessage(error.message, true));
            }, 350);
        });

    document.getElementById("eventStatusFilter")
        .addEventListener("change", () => {
            currentPage = 1;
            loadPage().catch(error => showMessage(error.message, true));
        });

    document.getElementById("eventCategoryFilter")
        .addEventListener("change", () => {
            currentPage = 1;
            loadPage().catch(error => showMessage(error.message, true));
        });

    document.getElementById("previousPageButton")
        .addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                loadEvents().catch(error => showMessage(error.message, true));
            }
        });

    document.getElementById("nextPageButton")
        .addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadEvents().catch(error => showMessage(error.message, true));
            }
        });

    document.getElementById("eventLanguage")
        .addEventListener("change", event => {
            language = event.target.value;

            localStorage.setItem("ngoLanguage", language);

            applyTranslations();

            loadPage().catch(error => showMessage(error.message, true));

            if (selectedEventId) {
                loadRegistrations(
                    selectedEventId,
                    document.getElementById("selectedEventName").dataset.eventName
                );
            }
        });

    document.getElementById("logoutButton")
        .addEventListener("click", async () => {
            try {
                await apiRequest(`${AUTH_API}/logout`, {
                    method: "POST"
                });
            } catch (error) {
                console.error(error);
            }

            window.location.href = "login.html";
        });
}

async function initializePage() {
    applyTranslations();
    attachEventListeners();

    try {
        const authorized = await verifySession();

        if (!authorized) return;

        await loadPage();

    } catch (error) {
        showMessage(error.message || t("loadError"), true);
    }
}

document.addEventListener("DOMContentLoaded", initializePage);

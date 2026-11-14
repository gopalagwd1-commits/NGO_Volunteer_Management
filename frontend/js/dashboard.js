
const API_URL = "/api/auth";

let language = localStorage.getItem("ngoLanguage") || "en";
let currentUser = null;

const translations = {
    en: {
        admin: "ADMINISTRATOR",
        coordinator: "COORDINATOR",
        volunteer: "VOLUNTEER",
        welcome: "Welcome back, ",
        description: "Manage your NGO activities from one place.",
        profile: "User Profile",
        modules: "Management Modules",
        signOut: "Sign Out",
        status: "Available module",
        adminCards: [
            ["👥", "Volunteer Management", "Manage volunteer accounts and profiles."],
            ["📅", "Event Management", "Create, schedule and manage NGO events."],
            ["✓", "Attendance Management", "Monitor event attendance and participation."],
            ["📊", "Reports and Analytics", "Review volunteer activities and performance."],
            ["👤", "User Management", "Manage coordinators and volunteer access."],
            ["✉", "SMS Notifications", "Manage communication and notifications."]
        ],
        coordinatorCards: [
            ["👥", "Volunteer Coordination", "Coordinate volunteers and their activities."],
            ["📅", "Event Scheduling", "Organize and schedule NGO events."],
            ["✓", "Attendance", "Record and review event attendance."],
            ["📊", "Activity Reports", "Review volunteer participation reports."],
            ["✉", "Communication", "Coordinate messages and announcements."]
        ],
        volunteerCards: [
            ["👤", "My Profile", "View and manage your personal information."],
            ["📅", "Available Events", "Explore upcoming volunteering opportunities."],
            ["✓", "My Registrations", "Review your event registrations."],
            ["⏱", "My Activities", "Review your volunteering history."],
            ["📊", "My Contributions", "View your participation summary."]
        ],
        loading: "Verifying your account...",
        unauthorized: "You are not authorized to access this dashboard.",
        sessionError: "Your session has expired. Please log in again.",
        logoutError: "Unable to sign out. Please try again."
    },

    kn: {
        admin: "ನಿರ್ವಾಹಕರು",
        coordinator: "ಸಂಯೋಜಕರು",
        volunteer: "ಸ್ವಯಂಸೇವಕರು",
        welcome: "ಮತ್ತೆ ಸ್ವಾಗತ, ",
        description: "ನಿಮ್ಮ NGO ಚಟುವಟಿಕೆಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ನಿರ್ವಹಿಸಿ.",
        profile: "ಬಳಕೆದಾರರ ವಿವರ",
        modules: "ನಿರ್ವಹಣಾ ವಿಭಾಗಗಳು",
        signOut: "ಲಾಗ್‌ಔಟ್",
        status: "ಲಭ್ಯವಿರುವ ವಿಭಾಗ",
        adminCards: [
            ["👥", "ಸ್ವಯಂಸೇವಕರ ನಿರ್ವಹಣೆ", "ಸ್ವಯಂಸೇವಕರ ಖಾತೆ ಮತ್ತು ವಿವರಗಳನ್ನು ನಿರ್ವಹಿಸಿ."],
            ["📅", "ಕಾರ್ಯಕ್ರಮ ನಿರ್ವಹಣೆ", "NGO ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ರಚಿಸಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ."],
            ["✓", "ಹಾಜರಾತಿ ನಿರ್ವಹಣೆ", "ಕಾರ್ಯಕ್ರಮಗಳ ಹಾಜರಾತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ."],
            ["📊", "ವರದಿಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ", "ಚಟುವಟಿಕೆಗಳ ವರದಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."],
            ["👤", "ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ", "ಸಂಯೋಜಕರು ಮತ್ತು ಸ್ವಯಂಸೇವಕರ ಪ್ರವೇಶವನ್ನು ನಿರ್ವಹಿಸಿ."],
            ["✉", "SMS ಅಧಿಸೂಚನೆಗಳು", "ಸಂದೇಶ ಮತ್ತು ಅಧಿಸೂಚನೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ."]
        ],
        coordinatorCards: [
            ["👥", "ಸ್ವಯಂಸೇವಕರ ಸಮನ್ವಯ", "ಸ್ವಯಂಸೇವಕರ ಚಟುವಟಿಕೆಗಳನ್ನು ಸಂಯೋಜಿಸಿ."],
            ["📅", "ಕಾರ್ಯಕ್ರಮ ವೇಳಾಪಟ್ಟಿ", "NGO ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಆಯೋಜಿಸಿ."],
            ["✓", "ಹಾಜರಾತಿ", "ಕಾರ್ಯಕ್ರಮಗಳ ಹಾಜರಾತಿಯನ್ನು ದಾಖಲಿಸಿ."],
            ["📊", "ಚಟುವಟಿಕೆ ವರದಿಗಳು", "ಸ್ವಯಂಸೇವಕರ ಭಾಗವಹಿಸುವಿಕೆಯನ್ನು ಪರಿಶೀಲಿಸಿ."],
            ["✉", "ಸಂವಹನ", "ಸಂದೇಶ ಮತ್ತು ಪ್ರಕಟಣೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ."]
        ],
        volunteerCards: [
            ["👤", "ನನ್ನ ವಿವರಗಳು", "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ."],
            ["📅", "ಲಭ್ಯವಿರುವ ಕಾರ್ಯಕ್ರಮಗಳು", "ಮುಂಬರುವ ಸೇವಾ ಅವಕಾಶಗಳನ್ನು ವೀಕ್ಷಿಸಿ."],
            ["✓", "ನನ್ನ ನೋಂದಣಿಗಳು", "ನಿಮ್ಮ ಕಾರ್ಯಕ್ರಮ ನೋಂದಣಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."],
            ["⏱", "ನನ್ನ ಚಟುವಟಿಕೆಗಳು", "ನಿಮ್ಮ ಸ್ವಯಂಸೇವಾ ಸೇವಾ ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ."],
            ["📊", "ನನ್ನ ಕೊಡುಗೆಗಳು", "ನಿಮ್ಮ ಸೇವಾ ಭಾಗವಹಿಸುವಿಕೆಯ ಸಾರಾಂಶವನ್ನು ವೀಕ್ಷಿಸಿ."]
        ],
        loading: "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
        unauthorized: "ಈ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಲು ನಿಮಗೆ ಅನುಮತಿ ಇಲ್ಲ.",
        sessionError: "ನಿಮ್ಮ ಸೆಷನ್ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
        logoutError: "ಲಾಗ್‌ಔಟ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
    }
};

function t(key) {
    return translations[language][key] || translations.en[key];
}

function showError(message) {
    document.getElementById("dashboardMessage").textContent = message;
}

function renderDashboard(user) {
    currentUser = user;

    const role = user.role;
    const roleName = t(role);

    document.getElementById("roleLabel").textContent = roleName;
    document.getElementById("welcomeTitle").textContent =
        t("welcome") + user.name;

    document.getElementById("welcomeDescription").textContent =
        t("description");

    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileAvatar").textContent =
        user.name.charAt(0).toUpperCase();

    document.getElementById("profileRole").textContent = roleName;
    document.getElementById("modulesTitle").textContent = t("modules");
    document.getElementById("logoutButton").textContent = t("signOut");

    const cards = t(role + "Cards");
    const grid = document.getElementById("dashboardModules");

    grid.replaceChildren();

    cards.forEach(([icon, title, description], index) => {
        const card = document.createElement("article");
        card.className = "module-card";

        // Open Event Management from the Admin or Coordinator dashboard.
        // Open Event Management / Event Scheduling for Admin and Coordinator.
        if (
            (role === "admin" || role === "coordinator") &&
            index === 1
        ) {


            card.classList.add("module-card-link");
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", "Open Event Management");

            card.addEventListener("click", () => {
                window.location.href = "event-management.html";
            });

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.location.href = "event-management.html";
                }
            });
        }

        // Open Attendance Management from Admin or Coordinator dashboard.
        if (
            (role === "admin" || role === "coordinator") &&
            (
                /Attendance Management|Attendance/i.test(title) ||
                /ಹಾಜರಾತಿ/.test(title)
            )
        ) {
            card.classList.add("module-card-link");
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            card.setAttribute(
                "aria-label",
                "Open Attendance Management"
            );

            card.addEventListener("click", () => {
                window.location.href = "attendance-management.html";
            });

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.location.href = "attendance-management.html";
                }
            });
        }



        if (role === "admin" && index === 0) {
            card.classList.add("module-card-link");
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", "Open Volunteer Management");

            card.addEventListener("click", () => {
                window.location.href = "volunteer-management.html";
            });

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.location.href = "volunteer-management.html";
                }
            });
        }


        // Open Volunteer Management from Coordinator Dashboard.
        if (role === "coordinator" && index === 0) {
            card.classList.add("module-card-link");
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", "Open Volunteer Management");

            card.addEventListener("click", () => {
                window.location.href = "volunteer-management.html";
            });

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.location.href = "volunteer-management.html";
                }
            });
        }

        // Open User Management for Admin.
        if (role === "admin" && index === 4) {
            card.classList.add("module-card-link");
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", "Open User Management");

            card.addEventListener("click", () => {
                window.location.href = "user-management.html";
            });

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.location.href = "user-management.html";
                }
            });
        }


        // Open SMS Notifications for Admin.
        if (role === "admin" && index === 5) {
            card.classList.add("module-card-link");
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", "Open SMS Notifications");

            card.addEventListener("click", () => {
                window.location.href = "sms-notifications.html";
            });

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.location.href = "sms-notifications.html";
                }
            });
        }

        // Open Communication for Coordinator.
        if (role === "coordinator" && index === 4) {
            card.classList.add("module-card-link");
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", "Open Coordinator Communication");

            card.addEventListener("click", () => {
                window.location.href = "coordinator-communication.html";
            });

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.location.href = "coordinator-communication.html";
                }
            });
        }
        // Open Volunteer Performance Reports for Admin and Coordinator.
        if (
            (role === "admin" || role === "coordinator") &&
            index === 3
        ) {
            card.classList.add("module-card-link");
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            card.setAttribute(
                "aria-label",
                "Open Volunteer Performance Reports"
            );

            card.addEventListener("click", () => {
                window.location.href = "volunteer-performance.html";
            });

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.location.href = "volunteer-performance.html";
                }
            });
        }


        const moduleIcon = document.createElement("div");
        moduleIcon.className = "module-icon";
        moduleIcon.textContent = icon;

        const heading = document.createElement("h3");
        heading.textContent = title;

        const detail = document.createElement("p");
        detail.textContent = description;

        const status = document.createElement("span");
        status.className = "module-status";
        status.textContent = t("status");


        card.append(moduleIcon, heading, detail, status);

        // Activate all five Volunteer Dashboard cards.
        if (role === "volunteer") {
            const volunteerModules = [
                "profile",
                "events",
                "registrations",
                "activities",
                "contributions"
            ];

            card.classList.add("module-card-link");
            card.dataset.volunteerModule = volunteerModules[index];
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");

            card.addEventListener("click", () => {
                openVolunteerModule(index);
            });

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openVolunteerModule(index);
                }
            });
        }

        grid.appendChild(card);

    });

    // Load available events once after rendering volunteer cards.
    if (role === "volunteer") {
        loadVolunteerEvents();
    }
}



// =========================================
// VOLUNTEER AVAILABLE EVENTS
// =========================================

const EVENT_API = "/api/events";
const REGISTRATION_API = "/api/registrations";

function eventText(key) {
    const labels = {
        en: {
            eyebrow: "VOLUNTEER OPPORTUNITIES",
            title: "Available Events",
            description: "Discover upcoming events and register to volunteer.",
            loading: "Loading available events...",
            noEvents: "There are currently no published events available.",
            registered: "Already Registered",
            register: "Register Now",
            registering: "Registering...",
            date: "Date",
            time: "Time",
            venue: "Venue",
            deadline: "Registration Deadline",
            capacity: "Available Seats",
            full: "Fully Booked",
            success: "Registration submitted successfully!",
            error: "Unable to load or register for events. Please try again.",
            login: "Please log in again.",
            closed: "Registration Closed"
        },
        kn: {
            eyebrow: "ಸ್ವಯಂಸೇವಕರ ಅವಕಾಶಗಳು",
            title: "ಲಭ್ಯವಿರುವ ಕಾರ್ಯಕ್ರಮಗಳು",
            description: "ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಸ್ವಯಂಸೇವಕರಾಗಿ ನೋಂದಾಯಿಸಿ.",
            loading: "ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
            noEvents: "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಪ್ರಕಟಿತ ಕಾರ್ಯಕ್ರಮಗಳು ಲಭ್ಯವಿಲ್ಲ.",
            registered: "ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ",
            register: "ಈಗ ನೋಂದಾಯಿಸಿ",
            registering: "ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...",
            date: "ದಿನಾಂಕ",
            time: "ಸಮಯ",
            venue: "ಸ್ಥಳ",
            deadline: "ನೋಂದಣಿ ಕೊನೆಯ ದಿನಾಂಕ",
            capacity: "ಲಭ್ಯವಿರುವ ಸ್ಥಾನಗಳು",
            full: "ಸ್ಥಾನಗಳು ಭರ್ತಿಯಾಗಿವೆ",
            success: "ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!",
            error: "ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಅಥವಾ ನೋಂದಾಯಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
            login: "ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
            closed: "ನೋಂದಣಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ"
        }
    };

    return labels[language]?.[key] || labels.en[key];
}

function formatEventDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(
        language === "kn" ? "kn-IN" : "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function getRegistrationEventId(registration) {
    if (!registration || !registration.event) {
        return "";
    }

    const eventId = typeof registration.event === "object"
        ? registration.event._id
        : registration.event;

    return eventId ? String(eventId).trim() : "";
}

async function loadVolunteerEvents() {
    const section = document.getElementById("availableEventsSection");
    const grid = document.getElementById("volunteerEventsGrid");
    const count = document.getElementById("availableEventsCount");

    if (!section || !grid || currentUser?.role !== "volunteer") {
        return;
    }

    section.hidden = false;

    document.getElementById("eventsEyebrow").textContent =
        eventText("eyebrow");

    document.getElementById("availableEventsTitle").textContent =
        eventText("title");

    document.getElementById("availableEventsDescription").textContent =
        eventText("description");

    grid.textContent = eventText("loading");

    try {
        const [eventResponse, registrationResponse] = await Promise.all([
            fetch(EVENT_API, {
                method: "GET",
                credentials: "include"
            }),

            fetch(`${REGISTRATION_API}/my`, {
                method: "GET",
                credentials: "include"
            })
        ]);

        if (
            eventResponse.status === 401 ||
            registrationResponse.status === 401
        ) {
            window.location.replace("login.html");
            return;
        }

        // Both APIs must succeed before displaying registration buttons.
        if (!eventResponse.ok) {
            throw new Error("Unable to retrieve available events.");
        }

        if (!registrationResponse.ok) {
            throw new Error(
                "Unable to verify your registration status. Please refresh the page."
            );
        }

        const [eventData, registrationData] = await Promise.all([
            eventResponse.json(),
            registrationResponse.json()
        ]);

        if (!eventData.success || !registrationData.success) {
            throw new Error(
                eventData.message ||
                registrationData.message ||
                "Unable to retrieve event information."
            );
        }

        const events = Array.isArray(eventData.events)
            ? eventData.events
            : [];

        const registrations = Array.isArray(
            registrationData.registrations
        )
            ? registrationData.registrations
            : [];

        // Normalize event IDs to strings.
        const registeredEventIds = new Set(
            registrations
                .map(getRegistrationEventId)
                .filter(Boolean)
        );

        count.textContent =
            `${events.length} ${language === "kn" ? "ಕಾರ್ಯಕ್ರಮಗಳು" : "Events"
            }`;

        renderVolunteerEvents(events, registeredEventIds);

    } catch (error) {
        console.error("Volunteer event loading error:", error);

        grid.replaceChildren();

        const message = document.createElement("p");
        message.className = "events-error";
        message.textContent = error.message || eventText("error");

        grid.appendChild(message);
    }
}

function getDisplayEventTitle(event) {
    if (
        language === "kn" &&
        typeof event.titleKannada === "string" &&
        event.titleKannada.trim()
    ) {
        return event.titleKannada.trim();
    }

    return event.title || "Untitled Event";
}


function renderVolunteerEvents(events, registeredEventIds) {
    const grid = document.getElementById("volunteerEventsGrid");
    grid.replaceChildren();

    if (!events.length) {
        const empty = document.createElement("div");
        empty.className = "events-empty-state";
        empty.textContent = eventText("noEvents");
        grid.appendChild(empty);
        return;
    }

    // Get today's date in Indian Standard Time (YYYY-MM-DD).
    function getTodayIST() {
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(new Date());

        const year = parts.find(p => p.type === "year").value;
        const month = parts.find(p => p.type === "month").value;
        const day = parts.find(p => p.type === "day").value;

        return `${year}-${month}-${day}`;
    }

    // Convert an event deadline to an IST date-only value.
    function getDeadlineDate(deadline) {
        if (!deadline) return null;

        const date = new Date(deadline);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(date);

        const year = parts.find(p => p.type === "year").value;
        const month = parts.find(p => p.type === "month").value;
        const day = parts.find(p => p.type === "day").value;

        return `${year}-${month}-${day}`;
    }

    const todayIST = getTodayIST();

    events.forEach(event => {
        const card = document.createElement("article");
        card.className = "volunteer-event-card";

        const category = document.createElement("span");
        category.className = "volunteer-event-category";
        category.textContent = event.category || "General";

        const title = document.createElement("h3");
        title.textContent = getDisplayEventTitle(event);

        const description = document.createElement("p");
        description.className = "volunteer-event-description";
        description.textContent = event.description || "";

        const details = document.createElement("div");
        details.className = "volunteer-event-details";

        const date = document.createElement("span");
        date.textContent =
            `📅 ${eventText("date")}: ${formatEventDate(event.eventDate)}`;

        const time = document.createElement("span");
        time.textContent =
            `⏰ ${eventText("time")}: ${event.startTime || "—"} – ${event.endTime || "—"}`;

        const venue = document.createElement("span");
        venue.textContent =
            `📍 ${eventText("venue")}: ${event.venue || "—"}`;

        const deadline = document.createElement("span");
        deadline.textContent =
            `🗓 ${eventText("deadline")}: ${formatEventDate(event.registrationDeadline)}`;

        const availableSeats = Math.max(
            0,
            Number(event.capacity) - Number(event.registeredCount || 0)
        );

        const capacity = document.createElement("span");
        capacity.textContent =
            `👥 ${eventText("capacity")}: ${availableSeats}`;

        details.append(date, time, venue, deadline, capacity);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "volunteer-event-register";

        const alreadyRegistered = registeredEventIds.has(
            String(event._id).trim()
        );

        const full = availableSeats <= 0;
        const deadlineDate = getDeadlineDate(event.registrationDeadline);

        // Keep registration open throughout the deadline day in IST.
        const deadlinePassed =
            !deadlineDate || todayIST > deadlineDate;

        if (alreadyRegistered) {
            button.textContent = eventText("registered");
            button.disabled = true;
            button.classList.add("already-registered");

        } else if (deadlinePassed || full) {
            button.textContent = deadlinePassed
                ? eventText("closed")
                : eventText("full");

            button.disabled = true;
            button.classList.add("registration-unavailable");

        } else {
            button.textContent = eventText("register");
            button.disabled = false;

            button.addEventListener("click", () => {
                registerForEvent(event._id, button);
            });
        }

        card.append(
            category,
            title,
            description,
            details,
            button
        );

        grid.appendChild(card);
    });
}

async function registerForEvent(eventId, button) {
    button.disabled = true;
    button.textContent = eventText("registering");

    try {
        const response = await fetch(
            `${REGISTRATION_API}/event/${encodeURIComponent(eventId)}`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            window.location.replace("login.html");
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || eventText("error")
            );
        }

        // Invalidate previously cached registration information.
        volunteerRegistrationsCache = null;

        showError(eventText("success"));

        // Reload events and registration records from MongoDB.
        await loadVolunteerEvents();

    } catch (error) {
        console.error("Event registration error:", error);

        showError(error.message || eventText("error"));

        // Refresh the actual registration and seat availability.
        await loadVolunteerEvents();
    }
}

// =============================================
// VOLUNTEER DASHBOARD WORKSPACE
// =============================================

const volunteerPanelIds = {
    profile: "volunteerProfileSection",
    registrations: "myRegistrationsSection",
    activities: "myActivitiesSection",
    contributions: "myContributionsSection"
};

let volunteerRegistrationsCache = null;

function hideVolunteerPanels() {
    Object.values(volunteerPanelIds).forEach(id => {
        const panel = document.getElementById(id);
        if (panel) panel.hidden = true;
    });
}

function createWorkspaceElement(tag, className, value) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;

    return element;
}

function openVolunteerModule(index) {
    if (currentUser?.role !== "volunteer") return;

    hideVolunteerPanels();

    const targets = [
        "profile",
        "events",
        "registrations",
        "activities",
        "contributions"
    ];

    const selected = targets[index];

    if (selected === "events") {
        loadVolunteerEvents();

        document.getElementById("availableEventsSection")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });

        return;
    }

    const panel = document.getElementById(
        volunteerPanelIds[selected]
    );

    if (!panel) return;

    panel.hidden = false;

    if (selected === "profile") {
        renderVolunteerProfile();
    }

    if (selected === "registrations") {
        loadVolunteerWorkspaceData("registrations");
    }

    if (selected === "activities") {
        loadVolunteerWorkspaceData("activities");
    }

    if (selected === "contributions") {
        loadVolunteerWorkspaceData("contributions");
    }

    panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// ---------------------------------------------
// MY PROFILE
// ---------------------------------------------

function renderVolunteerProfile() {
    const container = document.getElementById(
        "volunteerProfileContent"
    );

    if (!container || !currentUser) return;

    container.replaceChildren();

    const fields = [
        ["Name", currentUser.name],
        ["Email", currentUser.email],
        ["Phone", currentUser.phone || "Not provided"],
        ["Role", currentUser.role],
        [
            "Preferred Language",
            currentUser.preferredLanguage === "kn"
                ? "ಕನ್ನಡ"
                : "English"
        ],
        [
            "Account Status",
            currentUser.isActive ? "Active" : "Inactive"
        ]
    ];

    fields.forEach(([label, value]) => {
        const item = createWorkspaceElement(
            "div",
            "workspace-info-item"
        );

        item.append(
            createWorkspaceElement("strong", "", label),
            createWorkspaceElement("span", "", value)
        );

        container.appendChild(item);
    });
}

// ---------------------------------------------
// LOAD VOLUNTEER REGISTRATIONS
// ---------------------------------------------

async function loadVolunteerWorkspaceData(view) {
    const containerIds = {
        registrations: "myRegistrationsContent",
        activities: "myActivitiesContent",
        contributions: "myContributionsContent"
    };

    const container = document.getElementById(containerIds[view]);

    if (!container) return;

    container.textContent = "Loading your information...";

    try {
        if (!volunteerRegistrationsCache) {
            const response = await fetch(
                "/api/registrations/my",
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (response.status === 401) {
                window.location.replace("login.html");
                return;
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to load registrations."
                );
            }

            volunteerRegistrationsCache =
                data.registrations || [];
        }

        if (view === "registrations") {
            renderMyRegistrations(
                volunteerRegistrationsCache,
                container
            );
        }

        if (view === "activities") {
            renderMyActivities(
                volunteerRegistrationsCache,
                container
            );
        }

        if (view === "contributions") {
            renderMyContributions(
                volunteerRegistrationsCache,
                container
            );
        }

    } catch (error) {
        console.error("Volunteer workspace error:", error);

        container.textContent =
            error.message || "Unable to load information.";
    }
}

// ---------------------------------------------
// REGISTRATION DISPLAY
// ---------------------------------------------

function createRegistrationCard(registration) {
    const event = registration.event || {};

    const card = createWorkspaceElement(
        "article",
        "workspace-record-card"
    );

    const title = createWorkspaceElement(
        "h3",
        "",
        getDisplayEventTitle(event)
    );

    const category = createWorkspaceElement(
        "p",
        "",
        event.category || "—"
    );

    const date = createWorkspaceElement(
        "p",
        "",
        "Date: " + (
            event.eventDate
                ? formatEventDate(event.eventDate)
                : "—"
        )
    );

    const status = createWorkspaceElement(
        "span",
        "workspace-status",
        "Registration: " + registration.status
    );

    const attendance = createWorkspaceElement(
        "p",
        "",
        "Attendance: " + registration.attendance
    );

    card.append(title, category, date, status, attendance);

    return card;
}

function renderMyRegistrations(registrations, container) {
    container.replaceChildren();

    if (!registrations.length) {
        container.textContent =
            "You have not registered for any events yet.";
        return;
    }

    registrations.forEach(registration => {
        container.appendChild(
            createRegistrationCard(registration)
        );
    });
}

// ---------------------------------------------
// MY ACTIVITIES
// ---------------------------------------------

function renderMyActivities(registrations, container) {
    container.replaceChildren();

    const activities = registrations.filter(
        registration => registration.status === "Approved"
    );

    if (!activities.length) {
        container.textContent =
            "No approved volunteering activities are available yet.";
        return;
    }

    activities.forEach(registration => {
        container.appendChild(
            createRegistrationCard(registration)
        );
    });
}

// ---------------------------------------------
// MY CONTRIBUTIONS
// ---------------------------------------------

function renderMyContributions(registrations, container) {
    container.replaceChildren();

    const total = registrations.length;

    const approved = registrations.filter(
        item => item.status === "Approved"
    ).length;

    const pending = registrations.filter(
        item => item.status === "Pending"
    ).length;

    const rejected = registrations.filter(
        item => item.status === "Rejected"
    ).length;

    const attended = registrations.filter(
        item =>
            item.status === "Approved" &&
            item.attendance === "Present"
    ).length;

    const absent = registrations.filter(
        item =>
            item.status === "Approved" &&
            item.attendance === "Absent"
    ).length;

    const statistics = [
        ["Total Registrations", total],
        ["Approved Activities", approved],
        ["Pending Approvals", pending],
        ["Rejected Registrations", rejected],
        ["Events Attended", attended],
        ["Absences Recorded", absent]
    ];

    statistics.forEach(([label, value]) => {
        const item = createWorkspaceElement(
            "div",
            "workspace-stat-card"
        );

        item.append(
            createWorkspaceElement("strong", "", value),
            createWorkspaceElement("span", "", label)
        );

        container.appendChild(item);
    });
}


async function verifySession() {
    showError(t("loading"));

    try {
        const response = await fetch(`${API_URL}/me`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
            window.location.replace("login.html");
            return;
        }

        const requiredRole =
            document.body.dataset.requiredRole;

        if (data.user.role !== requiredRole) {
            document.getElementById("dashboardMessage").textContent =
                t("unauthorized");

            const correctPages = {
                admin: "admin-dashboard.html",
                coordinator: "coordinator-dashboard.html",
                volunteer: "volunteer-dashboard.html"
            };

            setTimeout(() => {
                window.location.replace(
                    correctPages[data.user.role] || "login.html"
                );
            }, 1200);

            return;
        }

        showError("");
        renderDashboard(data.user);

    } catch (error) {
        console.error("Session verification error:", error);
        showError(t("sessionError"));
    }
}

document.getElementById("dashboardLanguage")
    .addEventListener("change", event => {
        language = event.target.value;
        localStorage.setItem("ngoLanguage", language);

        if (currentUser) {
            renderDashboard(currentUser);
        }
    });

document.getElementById("dashboardLanguage").value = language;

document.getElementById("logoutButton")
    .addEventListener("click", async () => {
        const button = document.getElementById("logoutButton");
        button.disabled = true;

        try {
            const response = await fetch(`${API_URL}/logout`, {
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Logout failed");
            }

            window.location.replace("login.html");

        } catch (error) {
            console.error(error);
            showError(t("logoutError"));
            button.disabled = false;
        }
    });

verifySession();

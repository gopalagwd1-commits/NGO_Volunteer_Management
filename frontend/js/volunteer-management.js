
const AUTH_API = "/api/auth";
const VOLUNTEER_API = "/api/volunteers";

let language = localStorage.getItem("ngoLanguage") || "en";
let currentUser = null;
let currentPage = 1;
let totalPages = 1;
let selectedVolunteer = null;

const pageSize = 10;

const translations = {
    en: {
        pageEyebrow: "ADMINISTRATION",
        pageTitle: "Volunteer Management",
        pageDescription: "Manage registered volunteers, review profiles and control account status.",
        backLink: "Dashboard",
        signOut: "Sign Out",
        totalLabel: "Total Volunteers",
        activeLabel: "Active Volunteers",
        inactiveLabel: "Inactive Volunteers",
        directoryTitle: "Volunteer Directory",
        directoryDescription: "Search and manage registered volunteer accounts.",
        refreshText: "Refresh",
        searchPlaceholder: "Search by name, email or phone",
        all: "All Volunteers",
        active: "Active",
        inactive: "Inactive",
        searchButton: "Search",
        volunteer: "Volunteer",
        phone: "Phone",
        language: "Language",
        joined: "Registered",
        status: "Status",
        action: "Action",
        view: "View Profile",
        previous: "Previous",
        next: "Next",
        page: "Page",
        of: "of",
        loading: "Loading volunteers...",
        noVolunteers: "No volunteers found.",
        loadError: "Unable to load volunteer information.",
        sessionError: "Your session has expired. Please log in again.",
        unauthorized: "Administrator access is required.",
        profileEyebrow: "VOLUNTEER DETAILS",
        profileDialogTitle: "Volunteer Profile",
        phoneLabel: "Phone Number",
        languageLabel: "Preferred Language",
        statusLabel: "Account Status",
        joinedLabel: "Registration Date",
        loginLabel: "Last Login",
        english: "English",
        kannada: "Kannada",
        never: "Never logged in",
        close: "Close",
        activate: "Activate Account",
        deactivate: "Deactivate Account",
        confirmActivate: "Are you sure you want to activate this volunteer account?",
        confirmDeactivate: "Are you sure you want to deactivate this volunteer account?",
        updateSuccess: "Volunteer account status updated successfully.",
        updateError: "Unable to update volunteer account status.",
        activeStatus: "Active",
        inactiveStatus: "Inactive",
        registered: "Registered",
        loadingProfile: "Loading profile...",
        profileError: "Unable to load volunteer profile.",
        refreshSuccess: "Volunteer information refreshed."
    },

    kn: {
        pageEyebrow: "ನಿರ್ವಹಣೆ",
        pageTitle: "ಸ್ವಯಂಸೇವಕರ ನಿರ್ವಹಣೆ",
        pageDescription: "ನೋಂದಾಯಿತ ಸ್ವಯಂಸೇವಕರ ವಿವರಗಳು ಮತ್ತು ಖಾತೆಯ ಸ್ಥಿತಿಯನ್ನು ನಿರ್ವಹಿಸಿ.",
        backLink: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        signOut: "ಲಾಗ್‌ಔಟ್",
        totalLabel: "ಒಟ್ಟು ಸ್ವಯಂಸೇವಕರು",
        activeLabel: "ಸಕ್ರಿಯ ಸ್ವಯಂಸೇವಕರು",
        inactiveLabel: "ನಿಷ್ಕ್ರಿಯ ಸ್ವಯಂಸೇವಕರು",
        directoryTitle: "ಸ್ವಯಂಸೇವಕರ ಪಟ್ಟಿ",
        directoryDescription: "ನೋಂದಾಯಿತ ಸ್ವಯಂಸೇವಕರನ್ನು ಹುಡುಕಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ.",
        refreshText: "ಮರುಲೋಡ್",
        searchPlaceholder: "ಹೆಸರು, ಇಮೇಲ್ ಅಥವಾ ಫೋನ್ ಮೂಲಕ ಹುಡುಕಿ",
        all: "ಎಲ್ಲಾ ಸ್ವಯಂಸೇವಕರು",
        active: "ಸಕ್ರಿಯ",
        inactive: "ನಿಷ್ಕ್ರಿಯ",
        searchButton: "ಹುಡುಕಿ",
        volunteer: "ಸ್ವಯಂಸೇವಕರು",
        phone: "ಫೋನ್",
        language: "ಭಾಷೆ",
        joined: "ನೋಂದಣಿ",
        status: "ಸ್ಥಿತಿ",
        action: "ಕ್ರಿಯೆ",
        view: "ವಿವರ ವೀಕ್ಷಿಸಿ",
        previous: "ಹಿಂದಿನ",
        next: "ಮುಂದಿನ",
        page: "ಪುಟ",
        of: "ರಲ್ಲಿ",
        loading: "ಸ್ವಯಂಸೇವಕರ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        noVolunteers: "ಯಾವುದೇ ಸ್ವಯಂಸೇವಕರು ಕಂಡುಬಂದಿಲ್ಲ.",
        loadError: "ಸ್ವಯಂಸೇವಕರ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        sessionError: "ನಿಮ್ಮ ಸೆಷನ್ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
        unauthorized: "ನಿರ್ವಾಹಕರಿಗೆ ಮಾತ್ರ ಈ ಪುಟವನ್ನು ಪ್ರವೇಶಿಸಲು ಅನುಮತಿ ಇದೆ.",
        profileEyebrow: "ಸ್ವಯಂಸೇವಕರ ವಿವರಗಳು",
        profileDialogTitle: "ಸ್ವಯಂಸೇವಕರ ಪ್ರೊಫೈಲ್",
        phoneLabel: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
        languageLabel: "ಆದ್ಯತೆಯ ಭಾಷೆ",
        statusLabel: "ಖಾತೆಯ ಸ್ಥಿತಿ",
        joinedLabel: "ನೋಂದಣಿ ದಿನಾಂಕ",
        loginLabel: "ಕೊನೆಯ ಲಾಗಿನ್",
        english: "ಇಂಗ್ಲಿಷ್",
        kannada: "ಕನ್ನಡ",
        never: "ಇನ್ನೂ ಲಾಗಿನ್ ಆಗಿಲ್ಲ",
        close: "ಮುಚ್ಚಿ",
        activate: "ಖಾತೆ ಸಕ್ರಿಯಗೊಳಿಸಿ",
        deactivate: "ಖಾತೆ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ",
        confirmActivate: "ಈ ಸ್ವಯಂಸೇವಕರ ಖಾತೆಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲು ಖಚಿತವೇ?",
        confirmDeactivate: "ಈ ಸ್ವಯಂಸೇವಕರ ಖಾತೆಯನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲು ಖಚಿತವೇ?",
        updateSuccess: "ಸ್ವಯಂಸೇವಕರ ಖಾತೆಯ ಸ್ಥಿತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
        updateError: "ಖಾತೆಯ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        activeStatus: "ಸಕ್ರಿಯ",
        inactiveStatus: "ನಿಷ್ಕ್ರಿಯ",
        registered: "ನೋಂದಾಯಿಸಲಾಗಿದೆ",
        loadingProfile: "ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        profileError: "ಸ್ವಯಂಸೇವಕರ ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        refreshSuccess: "ಸ್ವಯಂಸೇವಕರ ವಿವರಗಳನ್ನು ಮರುಲೋಡ್ ಮಾಡಲಾಗಿದೆ."
    }
};

function t(key) {
    return translations[language][key] || translations.en[key] || key;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function showMessage(message, isError = false) {
    const element = document.getElementById("pageMessage");
    element.textContent = message;
    element.style.color = isError ? "#b34c35" : "#08776d";
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(
        language === "kn" ? "kn-IN" : "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
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
        throw new Error(t("unauthorized"));
    }

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

function applyTranslations() {
    document.documentElement.lang = language;

    const labels = [
        "pageEyebrow",
        "pageTitle",
        "pageDescription",
        "backLink",
        "totalLabel",
        "activeLabel",
        "inactiveLabel",
        "directoryTitle",
        "directoryDescription",
        "refreshText",
        "searchButton",
        "thVolunteer",
        "thPhone",
        "thLanguage",
        "thJoined",
        "thStatus",
        "thAction",
        "previousText",
        "nextText",
        "profileEyebrow",
        "profileDialogTitle",
        "profilePhoneLabel",
        "profileLanguageLabel",
        "profileStatusLabel",
        "profileJoinedLabel",
        "profileLoginLabel",
        "closeProfileButton"
    ];

    labels.forEach(id => {
        setText(id, t(id));
    });

    setText("closeProfileButton", t("close"));

    // Explicit mappings for HTML IDs that differ from translation keys
    setText("logoutButton", t("signOut"));
    setText("profileDoneButton", t("close"));

    document.getElementById("searchInput").placeholder =
        t("searchPlaceholder");

    const statusFilter = document.getElementById("statusFilter");
    statusFilter.options[0].textContent = t("all");
    statusFilter.options[1].textContent = t("active");
    statusFilter.options[2].textContent = t("inactive");

    document.getElementById("dashboardLanguage").value = language;

    if (selectedVolunteer) {
        updateProfileDialog(selectedVolunteer);
    }

    updatePaginationText();
}

async function verifyAdminSession() {
    try {
        const data = await apiRequest(`${AUTH_API}/me`);

        if (
            !data.user ||
            !["admin", "coordinator"].includes(data.user.role)
        ) {
            document.getElementById("globalMessage").textContent =
                t("unauthorized");

            window.location.replace(
                data.user?.role === "coordinator"
                    ? "coordinator-dashboard.html"
                    : data.user?.role === "volunteer"
                        ? "volunteer-dashboard.html"
                        : "login.html"
            );

            return false;
        }

        currentUser = data.user;
        return true;

    } catch (error) {
        console.error("Session verification:", error);
        document.getElementById("globalMessage").textContent =
            error.message || t("sessionError");
        return false;
    }
}

async function loadStatistics() {
    const data = await apiRequest(`${VOLUNTEER_API}/stats`);
    const stats = data.statistics;

    setText("totalCount", stats.total ?? 0);
    setText("activeCount", stats.active ?? 0);
    setText("inactiveCount", stats.inactive ?? 0);
}

function getDisplayVolunteerName(volunteer) {
    if (
        language === "kn" &&
        volunteer.nameKannada &&
        volunteer.nameKannada.trim()
    ) {
        return volunteer.nameKannada.trim();
    }

    return volunteer.name || "—";
}

function createCell(content) {
    const cell = document.createElement("td");
    cell.textContent = content;
    return cell;
}

function createVolunteerCell(volunteer) {
    const cell = document.createElement("td");

    const name = document.createElement("span");
    name.className = "vm-volunteer-name";
    name.textContent = getDisplayVolunteerName(volunteer);

    const email = document.createElement("span");
    email.className = "vm-volunteer-email";
    email.textContent = volunteer.email || "—";

    cell.append(name, email);
    return cell;
}

function renderVolunteers(volunteers) {
    const tbody = document.getElementById("volunteerTableBody");
    tbody.replaceChildren();

    if (!volunteers.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "vm-empty-cell";
        cell.textContent = t("noVolunteers");

        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    volunteers.forEach(volunteer => {
        const row = document.createElement("tr");

        row.appendChild(createVolunteerCell(volunteer));
        row.appendChild(createCell(volunteer.phone || "—"));

        row.appendChild(createCell(
            volunteer.preferredLanguage === "kn"
                ? t("kannada")
                : t("english")
        ));

        row.appendChild(createCell(formatDate(volunteer.createdAt)));

        const statusCell = document.createElement("td");
        const status = document.createElement("span");

        status.className = `vm-status ${volunteer.isActive ? "active" : "inactive"
            }`;

        status.textContent = volunteer.isActive
            ? t("activeStatus")
            : t("inactiveStatus");

        statusCell.appendChild(status);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.className = "vm-view-button";
        viewButton.textContent = t("view");

        viewButton.addEventListener("click", () => {
            openVolunteerProfile(volunteer._id);
        });

        actionCell.appendChild(viewButton);
        row.appendChild(actionCell);

        tbody.appendChild(row);
    });
}

async function loadVolunteers() {
    showMessage(t("loading"));

    const search = document.getElementById("searchInput").value.trim();
    const status = document.getElementById("statusFilter").value;

    const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        search,
        status
    });

    try {
        const data = await apiRequest(
            `${VOLUNTEER_API}?${params.toString()}`
        );

        renderVolunteers(data.volunteers || []);

        const pagination = data.pagination || {};

        currentPage = pagination.page || 1;
        totalPages = pagination.totalPages || 1;

        updatePaginationText();

        document.getElementById("previousButton").disabled =
            currentPage <= 1;

        document.getElementById("nextButton").disabled =
            currentPage >= totalPages;

        showMessage("");

    } catch (error) {
        console.error("Volunteer list:", error);
        showMessage(error.message || t("loadError"), true);
    }
}

function updatePaginationText() {
    const pageText = totalPages > 0 ? totalPages : 1;

    setText(
        "paginationInfo",
        `${t("page")} ${currentPage} ${t("of")} ${pageText}`
    );
}

async function loadPage() {
    try {
        await Promise.all([
            loadStatistics(),
            loadVolunteers()
        ]);
    } catch (error) {
        console.error("Dashboard data:", error);
        showMessage(error.message || t("loadError"), true);
    }
}

async function openVolunteerProfile(id) {
    const dialog = document.getElementById("profileDialog");

    setText("profileName", t("loadingProfile"));
    setText("profileEmail", "—");

    try {
        const data = await apiRequest(`${VOLUNTEER_API}/${encodeURIComponent(id)}`);

        selectedVolunteer = data.volunteer;

        if (!selectedVolunteer) {
            throw new Error(t("profileError"));
        }

        updateProfileDialog(selectedVolunteer);

        if (!dialog.open) {
            dialog.showModal();
        }

    } catch (error) {
        console.error("Volunteer profile:", error);
        showMessage(error.message || t("profileError"), true);
    }
}

function updateProfileDialog(volunteer) {
    const displayName = getDisplayVolunteerName(volunteer);

    setText("profileName", displayName);
    setText("profileEmail", volunteer.email || "—");

    setText("profilePhone", volunteer.phone || "—");

    setText(
        "profileLanguage",
        volunteer.preferredLanguage === "kn"
            ? t("kannada")
            : t("english")
    );

    setText(
        "profileStatus",
        volunteer.isActive ? t("activeStatus") : t("inactiveStatus")
    );

    setText("profileJoined", formatDate(volunteer.createdAt));

    setText(
        "profileLastLogin",
        volunteer.lastLogin
            ? formatDate(volunteer.lastLogin)
            : t("never")
    );

    setText(
        "profileAvatar",
        (displayName || "V").charAt(0).toUpperCase()
    );

    const statusButton = document.getElementById("profileStatusButton");

    // Only Admin can activate or deactivate volunteer accounts.
    statusButton.hidden = currentUser?.role !== "admin";

    statusButton.textContent = volunteer.isActive
        ? t("deactivate")
        : t("activate");
}

async function changeVolunteerStatus() {
    if (!selectedVolunteer) return;

    const willActivate = !selectedVolunteer.isActive;

    const confirmation = window.confirm(
        willActivate ? t("confirmActivate") : t("confirmDeactivate")
    );

    if (!confirmation) return;

    const button = document.getElementById("profileStatusButton");
    button.disabled = true;

    try {
        await apiRequest(
            `${VOLUNTEER_API}/${encodeURIComponent(selectedVolunteer._id)}`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    isActive: willActivate
                })
            }
        );

        selectedVolunteer.isActive = willActivate;
        updateProfileDialog(selectedVolunteer);

        await loadPage();

        document.getElementById("globalMessage").textContent =
            t("updateSuccess");

    } catch (error) {
        console.error("Status update:", error);
        showMessage(error.message || t("updateError"), true);

    } finally {
        button.disabled = false;
    }
}

document.getElementById("filterForm").addEventListener("submit", event => {
    event.preventDefault();
    currentPage = 1;
    loadVolunteers();
});

document.getElementById("statusFilter").addEventListener("change", () => {
    currentPage = 1;
    loadVolunteers();
});

document.getElementById("refreshButton").addEventListener("click", async () => {
    await loadPage();
    setText("globalMessage", t("refreshSuccess"));
});

document.getElementById("previousButton").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadVolunteers();
    }
});

document.getElementById("nextButton").addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadVolunteers();
    }
});

document.getElementById("closeProfileButton").addEventListener("click", () => {
    document.getElementById("profileDialog").close();
});

document.getElementById("profileDoneButton").addEventListener("click", () => {
    document.getElementById("profileDialog").close();
});

document.getElementById("profileStatusButton").addEventListener(
    "click",
    changeVolunteerStatus
);

document.getElementById("dashboardLanguage").addEventListener("change", event => {
    language = event.target.value;
    localStorage.setItem("ngoLanguage", language);

    applyTranslations();

    loadPage();
});

document.getElementById("logoutButton").addEventListener("click", async () => {
    const button = document.getElementById("logoutButton");
    button.disabled = true;

    try {
        await apiRequest(`${AUTH_API}/logout`, {
            method: "POST"
        });

        window.location.replace("login.html");

    } catch (error) {
        console.error("Logout:", error);
        setText("globalMessage", error.message || "Logout failed.");
        button.disabled = false;
    }
});

async function initializePage() {
    applyTranslations();

    const authorized = await verifyAdminSession();

    if (!authorized) return;

    await loadPage();
}

initializePage();

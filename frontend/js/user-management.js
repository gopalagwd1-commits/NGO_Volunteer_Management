
"use strict";

// ============================================
// API CONFIGURATION
// ============================================

const AUTH_API = "/api/auth";
const USER_API = "/api/users";

let language = localStorage.getItem("ngoLanguage") || "en";

if (!["en", "kn"].includes(language)) {
    language = "en";
}

let currentUser = null;
let currentPage = 1;
let totalPages = 1;
let selectedUser = null;
let users = [];

const pageSize = 10;


// ============================================
// TRANSLATIONS
// ============================================

const translations = {

    en: {
        pageEyebrow: "ADMINISTRATION",
        pageTitle: "User Management",
        pageDescription: "Manage administrator, coordinator and volunteer accounts.",
        backLinkText: "Back to Dashboard",
        signOut: "Sign Out",

        totalLabel: "Total Users",
        adminLabel: "Administrators",
        coordinatorLabel: "Coordinators",
        volunteerLabel: "Volunteers",
        activeLabel: "Active Users",
        inactiveLabel: "Inactive Users",

        directoryTitle: "User Directory",
        directoryDescription: "Search, review and manage registered user accounts.",
        refreshText: "Refresh",
        addUserText: "Add User",

        searchPlaceholder: "Search by name, email or phone",
        allRoles: "All Roles",
        allStatuses: "All Statuses",
        administrator: "Administrator",
        coordinator: "Coordinator",
        volunteer: "Volunteer",
        active: "Active",
        inactive: "Inactive",
        searchButton: "Search",

        user: "User",
        phone: "Phone",
        role: "Role",
        language: "Language",
        joined: "Registered",
        status: "Status",
        action: "Action",
        view: "View Profile",

        previous: "Previous",
        next: "Next",
        page: "Page",
        of: "of",

        loading: "Loading users...",
        noUsers: "No users found.",
        loadError: "Unable to load user information.",
        statisticsError: "Unable to load user statistics.",
        sessionError: "Your session has expired. Please log in again.",
        unauthorized: "Administrator access is required.",

        english: "English",
        kannada: "Kannada",
        never: "Never logged in",

        formEyebrow: "USER ADMINISTRATION",
        createTitle: "Create User Account",
        editTitle: "Edit User Account",

        nameLabel: "Full Name",
        nameKannadaLabel: "Volunteer Name in Kannada (Optional)",
        nameKannadaPlaceholder: "Enter volunteer name in Kannada",
        emailLabel: "Email Address",
        phoneLabel: "Phone Number",
        roleLabel: "User Role",
        passwordLabel: "Initial Password",
        passwordHelp: "Password must contain at least 8 characters.",
        languageLabel: "Preferred Language",

        namePlaceholder: "Enter full name",
        emailPlaceholder: "Enter email address",
        phonePlaceholder: "Enter phone number",
        passwordPlaceholder: "Minimum 8 characters",

        createAccount: "Create Account",
        saveChanges: "Save Changes",
        cancel: "Cancel",
        close: "Close",
        editUser: "Edit User",

        profileEyebrow: "USER DETAILS",
        profileTitle: "User Profile",
        profilePhoneLabel: "Phone Number",
        profileRoleLabel: "User Role",
        profileLanguageLabel: "Preferred Language",
        profileStatusLabel: "Account Status",
        profileJoinedLabel: "Registration Date",
        profileLoginLabel: "Last Login",

        activate: "Activate Account",
        deactivate: "Deactivate Account",

        confirmActivate: "Are you sure you want to activate this account?",
        confirmDeactivate: "Are you sure you want to deactivate this account?",

        createSuccess: "User account created successfully.",
        updateSuccess: "User account updated successfully.",
        statusSuccess: "Account status updated successfully.",
        refreshSuccess: "User information refreshed.",

        createError: "Unable to create user account.",
        updateError: "Unable to update user account.",
        statusError: "Unable to update account status.",
        profileError: "Unable to load user profile.",

        invalidName: "Name must contain 2 to 100 characters.",
        invalidPhone: "Please provide a valid phone number.",
        invalidPassword: "Password must contain at least 8 characters.",
        passwordRequired: "Please enter an initial password.",
        adminProtected: "Administrator role and status cannot be changed here.",

        loadingProfile: "Loading profile...",
        creating: "Creating...",
        saving: "Saving...",
        neverLoggedIn: "Never logged in",

        refreshFailed: "Refresh failed."
    },


    kn: {
        pageEyebrow: "ನಿರ್ವಹಣೆ",
        pageTitle: "ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ",
        pageDescription: "ನಿರ್ವಾಹಕರು, ಸಂಯೋಜಕರು ಮತ್ತು ಸ್ವಯಂಸೇವಕರ ಖಾತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
        backLinkText: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
        signOut: "ಲಾಗ್‌ಔಟ್",

        totalLabel: "ಒಟ್ಟು ಬಳಕೆದಾರರು",
        adminLabel: "ನಿರ್ವಾಹಕರು",
        coordinatorLabel: "ಸಂಯೋಜಕರು",
        volunteerLabel: "ಸ್ವಯಂಸೇವಕರು",
        activeLabel: "ಸಕ್ರಿಯ ಬಳಕೆದಾರರು",
        inactiveLabel: "ನಿಷ್ಕ್ರಿಯ ಬಳಕೆದಾರರು",

        directoryTitle: "ಬಳಕೆದಾರರ ಪಟ್ಟಿ",
        directoryDescription: "ನೋಂದಾಯಿತ ಬಳಕೆದಾರರನ್ನು ಹುಡುಕಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ.",
        refreshText: "ಮರುಲೋಡ್",
        addUserText: "ಬಳಕೆದಾರರನ್ನು ಸೇರಿಸಿ",

        searchPlaceholder: "ಹೆಸರು, ಇಮೇಲ್ ಅಥವಾ ಫೋನ್ ಮೂಲಕ ಹುಡುಕಿ",
        allRoles: "ಎಲ್ಲಾ ಪಾತ್ರಗಳು",
        allStatuses: "ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು",
        administrator: "ನಿರ್ವಾಹಕರು",
        coordinator: "ಸಂಯೋಜಕರು",
        volunteer: "ಸ್ವಯಂಸೇವಕರು",
        active: "ಸಕ್ರಿಯ",
        inactive: "ನಿಷ್ಕ್ರಿಯ",
        searchButton: "ಹುಡುಕಿ",

        user: "ಬಳಕೆದಾರರು",
        phone: "ಫೋನ್",
        role: "ಪಾತ್ರ",
        language: "ಭಾಷೆ",
        joined: "ನೋಂದಣಿ",
        status: "ಸ್ಥಿತಿ",
        action: "ಕ್ರಿಯೆ",
        view: "ವಿವರ ವೀಕ್ಷಿಸಿ",

        previous: "ಹಿಂದಿನ",
        next: "ಮುಂದಿನ",
        page: "ಪುಟ",
        of: "ರಲ್ಲಿ",

        loading: "ಬಳಕೆದಾರರ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        noUsers: "ಯಾವುದೇ ಬಳಕೆದಾರರು ಕಂಡುಬಂದಿಲ್ಲ.",
        loadError: "ಬಳಕೆದಾರರ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        statisticsError: "ಅಂಕಿಅಂಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        sessionError: "ನಿಮ್ಮ ಸೆಷನ್ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
        unauthorized: "ನಿರ್ವಾಹಕರಿಗೆ ಮಾತ್ರ ಈ ಪುಟವನ್ನು ಪ್ರವೇಶಿಸಲು ಅನುಮತಿ ಇದೆ.",

        english: "ಇಂಗ್ಲಿಷ್",
        kannada: "ಕನ್ನಡ",
        never: "ಇನ್ನೂ ಲಾಗಿನ್ ಆಗಿಲ್ಲ",

        formEyebrow: "ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ",
        createTitle: "ಹೊಸ ಬಳಕೆದಾರ ಖಾತೆ",
        editTitle: "ಬಳಕೆದಾರರ ಖಾತೆ ಸಂಪಾದಿಸಿ",

        nameLabel: "ಪೂರ್ಣ ಹೆಸರು",
        nameKannadaLabel: "ಸ್ವಯಂಸೇವಕರ ಹೆಸರು ಕನ್ನಡದಲ್ಲಿ (ಐಚ್ಛಿಕ)",
        nameKannadaPlaceholder: "ಸ್ವಯಂಸೇವಕರ ಕನ್ನಡ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
        emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
        phoneLabel: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
        roleLabel: "ಬಳಕೆದಾರರ ಪಾತ್ರ",
        passwordLabel: "ಆರಂಭಿಕ ಪಾಸ್‌ವರ್ಡ್",
        passwordHelp: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.",
        languageLabel: "ಆದ್ಯತೆಯ ಭಾಷೆ",

        namePlaceholder: "ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
        emailPlaceholder: "ಇಮೇಲ್ ನಮೂದಿಸಿ",
        phonePlaceholder: "ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
        passwordPlaceholder: "ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು",

        createAccount: "ಖಾತೆ ರಚಿಸಿ",
        saveChanges: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
        cancel: "ರದ್ದುಮಾಡಿ",
        close: "ಮುಚ್ಚಿ",
        editUser: "ಬಳಕೆದಾರರನ್ನು ಸಂಪಾದಿಸಿ",

        profileEyebrow: "ಬಳಕೆದಾರರ ವಿವರಗಳು",
        profileTitle: "ಬಳಕೆದಾರರ ಪ್ರೊಫೈಲ್",
        profilePhoneLabel: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
        profileRoleLabel: "ಬಳಕೆದಾರರ ಪಾತ್ರ",
        profileLanguageLabel: "ಆದ್ಯತೆಯ ಭಾಷೆ",
        profileStatusLabel: "ಖಾತೆಯ ಸ್ಥಿತಿ",
        profileJoinedLabel: "ನೋಂದಣಿ ದಿನಾಂಕ",
        profileLoginLabel: "ಕೊನೆಯ ಲಾಗಿನ್",

        activate: "ಖಾತೆ ಸಕ್ರಿಯಗೊಳಿಸಿ",
        deactivate: "ಖಾತೆ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ",

        confirmActivate: "ಈ ಖಾತೆಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲು ಖಚಿತವೇ?",
        confirmDeactivate: "ಈ ಖಾತೆಯನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲು ಖಚಿತವೇ?",

        createSuccess: "ಬಳಕೆದಾರರ ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ.",
        updateSuccess: "ಬಳಕೆದಾರರ ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
        statusSuccess: "ಖಾತೆಯ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.",
        refreshSuccess: "ಬಳಕೆದಾರರ ವಿವರಗಳನ್ನು ಮರುಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",

        createError: "ಬಳಕೆದಾರರ ಖಾತೆಯನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        updateError: "ಬಳಕೆದಾರರ ಖಾತೆಯನ್ನು ನವೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        statusError: "ಖಾತೆಯ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        profileError: "ಬಳಕೆದಾರರ ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",

        invalidName: "ಹೆಸರು 2 ರಿಂದ 100 ಅಕ್ಷರಗಳ ನಡುವೆ ಇರಬೇಕು.",
        invalidPhone: "ಸರಿಯಾದ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
        invalidPassword: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.",
        passwordRequired: "ಆರಂಭಿಕ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.",
        adminProtected: "ನಿರ್ವಾಹಕರ ಪಾತ್ರ ಮತ್ತು ಸ್ಥಿತಿಯನ್ನು ಇಲ್ಲಿ ಬದಲಾಯಿಸಲಾಗುವುದಿಲ್ಲ.",

        loadingProfile: "ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        creating: "ರಚಿಸಲಾಗುತ್ತಿದೆ...",
        saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
        neverLoggedIn: "ಇನ್ನೂ ಲಾಗಿನ್ ಆಗಿಲ್ಲ",

        refreshFailed: "ಮರುಲೋಡ್ ವಿಫಲವಾಗಿದೆ."
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


function showMessage(message, isError = false) {
    const element = document.getElementById("pageMessage");

    element.textContent = message;

    element.style.color = isError
        ? "#b34c35"
        : "#08776d";
}


function showGlobalMessage(message, isError = false) {
    const element = document.getElementById("globalMessage");

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
            year: "numeric"
        }
    ).format(date);
}


function roleLabel(role) {
    const labels = {
        admin: t("administrator"),
        coordinator: t("coordinator"),
        volunteer: t("volunteer")
    };

    return labels[role] || role;
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

        throw new Error(
            data.message || "Request failed."
        );
    }

    return data;
}


// ============================================
// APPLY TRANSLATIONS
// ============================================

function applyTranslations() {

    document.documentElement.lang = language;

    const labels = [
        "pageEyebrow",
        "pageTitle",
        "pageDescription",
        "backLinkText",
        "logoutButton",

        "totalLabel",
        "adminLabel",
        "coordinatorLabel",
        "volunteerLabel",
        "activeLabel",
        "inactiveLabel",

        "directoryTitle",
        "directoryDescription",
        "refreshText",
        "addUserText",

        "searchButton",

        "thUser",
        "thPhone",
        "thRole",
        "thLanguage",
        "thJoined",
        "thStatus",
        "thAction",

        "previousText",
        "nextText",

        "formEyebrow",
        "userFormTitle",
        "nameLabel",
        "nameKannadaLabel",
        "emailLabel",
        "phoneLabel",
        "roleLabel",
        "passwordLabel",
        "passwordHelp",
        "languageLabel",

        "cancelUserFormButton",
        "profileEyebrow",
        "profileDialogTitle",
        "profilePhoneLabel",
        "profileRoleLabel",
        "profileLanguageLabel",
        "profileStatusLabel",
        "profileJoinedLabel",
        "profileLoginLabel",

        "profileDoneButton",
        "profileEditButton"
    ];

    labels.forEach(id => {

        const element = document.getElementById(id);

        if (!element) return;

        const key = id === "logoutButton"
            ? "signOut"
            : id === "cancelUserFormButton"
                ? "cancel"
                : id === "profileDoneButton"
                    ? "close"
                    : id === "profileEditButton"
                        ? "editUser"
                        : id === "userFormTitle"
                            ? "createTitle"
                            : id === "profileDialogTitle"
                                ? "profileTitle"
                                : id;

        if (element.tagName === "BUTTON") {
            element.textContent = t(key);
        } else {
            element.textContent = t(key);
        }
    });


    const searchInput = document.getElementById("searchInput");

    searchInput.placeholder = t("searchPlaceholder");


    const roleFilter = document.getElementById("roleFilter");

    roleFilter.options[0].textContent = t("allRoles");
    roleFilter.options[1].textContent = t("administrator");
    roleFilter.options[2].textContent = t("coordinator");
    roleFilter.options[3].textContent = t("volunteer");


    const statusFilter = document.getElementById("statusFilter");

    statusFilter.options[0].textContent = t("allStatuses");
    statusFilter.options[1].textContent = t("active");
    statusFilter.options[2].textContent = t("inactive");


    const userRole = document.getElementById("userRole");

    userRole.options[0].textContent = t("coordinator");
    userRole.options[1].textContent = t("volunteer");


    const userLanguage = document.getElementById("userLanguage");

    userLanguage.options[0].textContent = t("english");
    userLanguage.options[1].textContent = t("kannada");


    setText("userName", document.getElementById("userName").value);

    document.getElementById("userName").placeholder =
        t("namePlaceholder");

    document.getElementById("userNameKannada").placeholder =
        t("nameKannadaPlaceholder");

    document.getElementById("userEmail").placeholder =
        t("emailPlaceholder");

    document.getElementById("userPhone").placeholder =
        t("phonePlaceholder");

    document.getElementById("userPassword").placeholder =
        t("passwordPlaceholder");


    document.getElementById("dashboardLanguage").value = language;


    updatePaginationText();

    if (selectedUser) {
        updateProfileDialog(selectedUser);
    }
}


// ============================================
// ADMIN SESSION VERIFICATION
// ============================================

async function verifyAdminSession() {

    try {

        const data = await apiRequest(`${AUTH_API}/me`);

        if (!data.user || data.user.role !== "admin") {

            showGlobalMessage(t("unauthorized"), true);

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

        console.error("Session verification:", error);

        showGlobalMessage(
            error.message || t("sessionError"),
            true
        );

        return false;
    }
}


// ============================================
// LOAD STATISTICS
// ============================================

async function loadStatistics() {

    const data = await apiRequest(`${USER_API}/stats`);

    const stats = data.statistics || {};

    setText("totalCount", stats.total ?? 0);
    setText("adminCount", stats.admins ?? 0);
    setText("coordinatorCount", stats.coordinators ?? 0);
    setText("volunteerCount", stats.volunteers ?? 0);
    setText("activeCount", stats.active ?? 0);
    setText("inactiveCount", stats.inactive ?? 0);
}


// ============================================
// TABLE HELPERS
// ============================================

function createCell(content) {

    const cell = document.createElement("td");

    cell.textContent = content;

    return cell;
}

function getDisplayUserName(user) {
    return language === "kn" && user.nameKannada?.trim()
        ? user.nameKannada
        : user.name || "—";
}

function createUserCell(user) {

    const cell = document.createElement("td");

    const name = document.createElement("span");

    name.className = "um-user-name";
    name.textContent = getDisplayUserName(user);

    const email = document.createElement("span");

    email.className = "um-user-email";
    email.textContent = user.email || "—";

    cell.append(name, email);

    return cell;
}


// ============================================
// RENDER USER TABLE
// ============================================

function renderUsers(userList) {

    const tbody = document.getElementById("userTableBody");

    tbody.replaceChildren();

    if (!userList.length) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.className = "um-empty-cell";
        cell.textContent = t("noUsers");

        row.appendChild(cell);

        tbody.appendChild(row);

        return;
    }


    userList.forEach(user => {

        const row = document.createElement("tr");

        row.appendChild(createUserCell(user));

        row.appendChild(createCell(user.phone || "—"));


        const roleCell = document.createElement("td");

        const roleBadge = document.createElement("span");

        roleBadge.className = `um-role ${user.role}`;

        roleBadge.textContent = roleLabel(user.role);

        roleCell.appendChild(roleBadge);

        row.appendChild(roleCell);


        row.appendChild(
            createCell(
                user.preferredLanguage === "kn"
                    ? t("kannada")
                    : t("english")
            )
        );


        row.appendChild(
            createCell(formatDate(user.createdAt))
        );


        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.className = `um-status ${user.isActive ? "active" : "inactive"
            }`;

        statusBadge.textContent = user.isActive
            ? t("active")
            : t("inactive");

        statusCell.appendChild(statusBadge);

        row.appendChild(statusCell);


        const actionCell = document.createElement("td");

        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.className = "um-view-button";
        viewButton.textContent = t("view");

        viewButton.addEventListener("click", () => {

            openUserProfile(user._id);

        });

        actionCell.appendChild(viewButton);

        row.appendChild(actionCell);

        tbody.appendChild(row);

    });
}


// ============================================
// LOAD USER DIRECTORY
// ============================================

async function loadUsers() {

    showMessage(t("loading"));

    const search =
        document.getElementById("searchInput").value.trim();

    const role =
        document.getElementById("roleFilter").value;

    const status =
        document.getElementById("statusFilter").value;


    const params = new URLSearchParams({

        page: currentPage,
        limit: pageSize,
        search,
        role,
        status

    });


    try {

        const data = await apiRequest(
            `${USER_API}?${params.toString()}`
        );

        users = data.users || [];

        renderUsers(users);


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


        showMessage("");

    } catch (error) {

        console.error("User directory:", error);

        showMessage(
            error.message || t("loadError"),
            true
        );

    }
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
// LOAD PAGE DATA
// ============================================

async function loadPage() {

    try {

        await Promise.all([

            loadStatistics(),

            loadUsers()

        ]);

    } catch (error) {

        console.error("User Management data:", error);

        showMessage(
            error.message || t("loadError"),
            true
        );

    }
}


// ============================================
// USER PROFILE
// ============================================

async function openUserProfile(id) {

    const dialog = document.getElementById("userProfileDialog");

    setText("profileName", t("loadingProfile"));

    setText("profileEmail", "—");


    try {

        const data = await apiRequest(
            `${USER_API}/${encodeURIComponent(id)}`
        );

        selectedUser = data.user;

        if (!selectedUser) {
            throw new Error(t("profileError"));
        }

        updateProfileDialog(selectedUser);

        if (!dialog.open) {
            dialog.showModal();
        }

    } catch (error) {

        console.error("User profile:", error);

        showMessage(
            error.message || t("profileError"),
            true
        );

    }
}


function updateProfileDialog(user) {

    setText("profileName", getDisplayUserName(user));

    setText("profileEmail", user.email || "—");

    setText("profilePhone", user.phone || "—");

    setText("profileRole", roleLabel(user.role));


    setText(
        "profileLanguage",
        user.preferredLanguage === "kn"
            ? t("kannada")
            : t("english")
    );


    setText(
        "profileStatus",
        user.isActive ? t("active") : t("inactive")
    );


    setText(
        "profileJoined",
        formatDate(user.createdAt)
    );


    setText(
        "profileLastLogin",
        user.lastLogin
            ? formatDate(user.lastLogin)
            : t("neverLoggedIn")
    );


    setText(
        "profileAvatar",
        getDisplayUserName(user).charAt(0).toUpperCase()
    );


    const statusButton =
        document.getElementById("profileStatusButton");


    // Administrator accounts cannot be activated/deactivated here.
    if (user.role === "admin") {

        statusButton.hidden = true;

    } else {

        statusButton.hidden = false;

        statusButton.textContent = user.isActive
            ? t("deactivate")
            : t("activate");

    }

}

function updateKannadaNameVisibility() {
    const role = document.getElementById("userRole").value;

    const kannadaGroup =
        document.getElementById("nameKannadaGroup");

    kannadaGroup.hidden = role !== "volunteer";
}


// ============================================
// AUTOMATIC ENGLISH TO KANNADA TRANSLITERATION
// ============================================

let kannadaNameRequestId = 0;

async function generateKannadaNameIfNeeded() {

    const roleInput = document.getElementById("userRole");
    const englishInput = document.getElementById("userName");
    const kannadaInput = document.getElementById("userNameKannada");

    const englishName = englishInput.value.trim();

    // Generate only for volunteers with a non-empty English name.
    if (
        roleInput.value !== "volunteer" ||
        !englishName ||
        kannadaInput.value.trim()
    ) {
        return;
    }

    const requestId = ++kannadaNameRequestId;

    try {

        const data = await apiRequest("/api/transliteration", {
            method: "POST",
            body: JSON.stringify({
                text: englishName,
                type: "name"
            })
        });

        // Do not overwrite manual input or use an outdated response.
        if (
            requestId !== kannadaNameRequestId ||
            roleInput.value !== "volunteer" ||
            englishInput.value.trim() !== englishName ||
            kannadaInput.value.trim()
        ) {
            return;
        }

        if (data.transliteration) {
            kannadaInput.value = data.transliteration;
        }

    } catch (error) {

        // Transliteration is optional. User creation must remain available.
        console.warn(
            "Kannada name transliteration is currently unavailable."
        );
    }
}
// ============================================
// CREATE USER DIALOG
// ============================================

function openCreateUserDialog() {

    selectedUser = null;

    const form = document.getElementById("userForm");

    form.reset();

    setText("formMessage", "");

    setText("userFormTitle", t("createTitle"));

    setText("saveUserButton", t("createAccount"));


    document.getElementById("userId").value = "";

    document.getElementById("userEmail").disabled = false;

    document.getElementById("userPassword").required = true;

    document.getElementById("passwordGroup").hidden = false;

    document.getElementById("userRole").disabled = false;

    document.getElementById("userRole").value = "coordinator";

    document.getElementById("userNameKannada").value = "";
    updateKannadaNameVisibility();

    document.getElementById("userLanguage").value = "en";


    document.getElementById("userFormDialog").showModal();

}


// ============================================
// EDIT USER DIALOG
// ============================================

function openEditUserDialog(user) {

    if (!user) return;

    selectedUser = user;

    const form = document.getElementById("userForm");

    form.reset();

    setText("formMessage", "");

    setText("userFormTitle", t("editTitle"));

    setText("saveUserButton", t("saveChanges"));


    document.getElementById("userId").value = user._id;

    document.getElementById("userName").value = user.name || "";

    document.getElementById("userEmail").value = user.email || "";

    document.getElementById("userPhone").value = user.phone || "";

    document.getElementById("userLanguage").value =
        user.preferredLanguage || "en";


    document.getElementById("userEmail").disabled = true;

    document.getElementById("userPassword").required = false;

    document.getElementById("passwordGroup").hidden = true;


    const roleSelect = document.getElementById("userRole");

    // Add Admin as a temporary option only when editing an Admin account.
    let adminOption = roleSelect.querySelector('option[value="admin"]');

    if (user.role === "admin") {

        if (!adminOption) {
            adminOption = document.createElement("option");
            adminOption.value = "admin";
            adminOption.textContent = t("administrator");
            roleSelect.appendChild(adminOption);
        }

        roleSelect.value = "admin";
        roleSelect.disabled = true;

    } else {

        if (adminOption) {
            adminOption.remove();
        }

        roleSelect.value = user.role;
        roleSelect.disabled = false;
    }


    // Admin role is protected.
    roleSelect.disabled = user.role === "admin";

    document.getElementById("userNameKannada").value =
        user.nameKannada || "";

    updateKannadaNameVisibility();


    document.getElementById("userFormDialog").showModal();

}


// ============================================
// VALIDATE USER FORM
// ============================================

function validateUserForm(isEditing) {

    const name =
        document.getElementById("userName").value.trim();

    const phone =
        document.getElementById("userPhone").value.trim();

    const password =
        document.getElementById("userPassword").value;


    if (name.length < 2 || name.length > 100) {

        throw new Error(t("invalidName"));

    }


    if (!/^\+?[0-9]{10,15}$/.test(phone)) {

        throw new Error(t("invalidPhone"));

    }


    if (!isEditing && password.length < 8) {

        throw new Error(t("invalidPassword"));

    }

}


// ============================================
// SAVE USER
// ============================================

async function saveUser(event) {

    event.preventDefault();

    const button = document.getElementById("saveUserButton");

    const originalText = button.textContent;

    const userId =
        document.getElementById("userId").value;

    const isEditing = Boolean(userId);


    setText("formMessage", "");


    try {

        validateUserForm(isEditing);

        button.disabled = true;

        button.textContent = isEditing
            ? t("saving")
            : t("creating");


        const payload = {

            name: document.getElementById("userName").value.trim(),

            nameKannada:
                document.getElementById("userRole").value === "volunteer"
                    ? document.getElementById("userNameKannada").value.trim()
                    : "",

            phone: document.getElementById("userPhone").value.trim(),

            preferredLanguage:
                document.getElementById("userLanguage").value

        };


        let url = USER_API;

        let method = "POST";


        if (isEditing) {

            url = `${USER_API}/${encodeURIComponent(userId)}`;

            method = "PATCH";


            // Never submit role changes for administrator accounts.
            if (selectedUser?.role !== "admin") {

                payload.role =
                    document.getElementById("userRole").value;

            }

        } else {

            payload.email =
                document.getElementById("userEmail").value.trim();

            payload.password =
                document.getElementById("userPassword").value;

            payload.role =
                document.getElementById("userRole").value;

        }


        const data = await apiRequest(url, {

            method,

            body: JSON.stringify(payload)

        });


        document.getElementById("userFormDialog").close();


        currentPage = 1;

        await loadPage();


        showGlobalMessage(
            isEditing
                ? t("updateSuccess")
                : t("createSuccess")
        );


    } catch (error) {

        console.error("Save user:", error);

        setText(
            "formMessage",
            error.message || (
                isEditing
                    ? t("updateError")
                    : t("createError")
            )
        );

    } finally {

        button.disabled = false;

        button.textContent = originalText;

    }

}


// ============================================
// ACTIVATE / DEACTIVATE USER
// ============================================

async function changeUserStatus() {

    if (!selectedUser) return;


    if (selectedUser.role === "admin") {

        showGlobalMessage(t("adminProtected"), true);

        return;

    }


    const willActivate = !selectedUser.isActive;

    const confirmation = window.confirm(

        willActivate
            ? t("confirmActivate")
            : t("confirmDeactivate")

    );


    if (!confirmation) return;


    const button =
        document.getElementById("profileStatusButton");

    button.disabled = true;


    try {

        await apiRequest(

            `${USER_API}/${encodeURIComponent(selectedUser._id)}`,

            {

                method: "PATCH",

                body: JSON.stringify({

                    isActive: willActivate

                })

            }

        );


        selectedUser.isActive = willActivate;

        updateProfileDialog(selectedUser);


        await loadPage();


        showGlobalMessage(t("statusSuccess"));


    } catch (error) {

        console.error("Account status:", error);

        showGlobalMessage(
            error.message || t("statusError"),
            true
        );

    } finally {

        button.disabled = false;

    }

}


// ============================================
// CLOSE DIALOGS
// ============================================

function closeUserFormDialog() {

    document.getElementById("userFormDialog").close();

}


function closeUserProfileDialog() {

    document.getElementById("userProfileDialog").close();

}


// ============================================
// EVENT LISTENERS
// ============================================

// Search
document.getElementById("filterForm").addEventListener(
    "submit",
    event => {

        event.preventDefault();

        currentPage = 1;

        loadUsers();

    }
);


// Role filter
document.getElementById("roleFilter").addEventListener(
    "change",
    () => {

        currentPage = 1;

        loadUsers();

    }
);


// Status filter
document.getElementById("statusFilter").addEventListener(
    "change",
    () => {

        currentPage = 1;

        loadUsers();

    }
);


// Add user
document.getElementById("addUserButton").addEventListener(
    "click",
    openCreateUserDialog
);


// Save user
document.getElementById("userForm").addEventListener(
    "submit",
    saveUser
);


// Refresh
document.getElementById("refreshButton").addEventListener(
    "click",
    async () => {

        await loadPage();

        showGlobalMessage(t("refreshSuccess"));

    }
);


// Previous page
document.getElementById("previousButton").addEventListener(
    "click",
    () => {

        if (currentPage > 1) {

            currentPage--;

            loadUsers();

        }

    }
);


// Next page
document.getElementById("nextButton").addEventListener(
    "click",
    () => {

        if (currentPage < totalPages) {

            currentPage++;

            loadUsers();

        }

    }
);


// Profile actions
document.getElementById("profileStatusButton").addEventListener(
    "click",
    changeUserStatus
);


document.getElementById("profileEditButton").addEventListener(
    "click",
    () => {

        if (!selectedUser) return;

        const user = selectedUser;

        closeUserProfileDialog();

        openEditUserDialog(user);

    }
);


document.getElementById("profileDoneButton").addEventListener(
    "click",
    closeUserProfileDialog
);


document.getElementById("closeProfileButton").addEventListener(
    "click",
    closeUserProfileDialog
);


// Toggle Kannada name field and generate Kannada when role becomes Volunteer.
document.getElementById("userRole").addEventListener(
    "change",
    () => {
        const role = document.getElementById("userRole").value;
        const kannadaInput = document.getElementById("userNameKannada");

        updateKannadaNameVisibility();

        if (role !== "volunteer") {
            kannadaInput.value = "";
        } else {
            generateKannadaNameIfNeeded();
        }
    }
);

// Generate Kannada name when the English name field loses focus.
document.getElementById("userName").addEventListener(
    "blur",
    generateKannadaNameIfNeeded
);

// User form actions
document.getElementById("closeUserFormButton").addEventListener(
    "click",
    closeUserFormDialog
);


document.getElementById("cancelUserFormButton").addEventListener(
    "click",
    closeUserFormDialog
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

            showGlobalMessage(
                error.message || "Logout failed.",
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

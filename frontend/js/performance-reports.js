
"use strict";

/* =========================================================
   NGO VOLUNTEER CONNECT
   VOLUNTEER PERFORMANCE REPORTS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const API = {
        me: "/api/auth/me",
        logout: "/api/auth/logout",
        volunteers: "/api/volunteers"
    };

    let currentLanguage = "en";
    let selectedVolunteerId = null;
    let currentReport = null;
    let volunteerList = [];

    const translations = {
        en: {
            eyebrow: "ANALYTICS AND REPORTING",
            pageTitle: "Volunteer Performance",
            pageDescription: "Review volunteer participation, event registrations, and attendance records.",
            download: "Download PDF",
            selectVolunteer: "Select Volunteer",
            selectDescription: "Search and select a volunteer to generate an individual report.",
            search: "Search Volunteer",
            searchPlaceholder: "Enter name, email or phone",
            status: "Volunteer Status",
            all: "All Volunteers",
            active: "Active",
            inactive: "Inactive",
            searchButton: "Search",
            initialMessage: "Search for a volunteer to view their performance report.",
            statistics: "Performance Overview",
            statisticsDescription: "Summary of registrations and event participation.",
            totalRegistrations: "Total Registrations",
            approved: "Approved",
            attended: "Events Attended",
            attendance: "Attendance",
            attendanceTitle: "Attendance Analysis",
            present: "Present",
            absent: "Absent",
            notMarked: "Not Marked",
            registrationSummary: "Registration Summary",
            pending: "Pending",
            rejected: "Rejected",
            cancelled: "Cancelled",
            eventHistory: "Event Participation History",
            eventHistoryDescription: "Event registrations and attendance details.",
            event: "Event",
            eventDate: "Event Date",
            category: "Category",
            registration: "Registration",
            attendanceStatus: "Attendance",
            noRecords: "No registration records found.",
            noVolunteers: "No volunteers found.",
            loading: "Loading...",
            selectPrompt: "Select a volunteer to view the report.",
            activeBadge: "Active",
            inactiveBadge: "Inactive",
            generated: "Report generated",
            signOut: "Sign Out",
            dashboard: "← Dashboard",
            loginRequired: "Your session has expired. Please log in again.",
            accessDenied: "This page is available only to administrators and coordinators.",
            loadError: "Unable to load data. Please try again.",
            reportError: "Unable to generate the volunteer report.",
            pdfMessage: "Use the Print dialog and choose Save as PDF.",
            searchError: "Unable to search volunteers.",
            unknown: "Not available"
        },

        kn: {
            eyebrow: "ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ವರದಿಗಳು",
            pageTitle: "ಸ್ವಯಂಸೇವಕರ ಕಾರ್ಯಕ್ಷಮತೆ",
            pageDescription: "ಸ್ವಯಂಸೇವಕರ ಭಾಗವಹಿಸುವಿಕೆ, ಕಾರ್ಯಕ್ರಮ ನೋಂದಣಿ ಮತ್ತು ಹಾಜರಾತಿ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
            download: "PDF ಡೌನ್‌ಲೋಡ್",
            selectVolunteer: "ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ",
            selectDescription: "ವೈಯಕ್ತಿಕ ವರದಿಯನ್ನು ರಚಿಸಲು ಸ್ವಯಂಸೇವಕರನ್ನು ಹುಡುಕಿ ಮತ್ತು ಆಯ್ಕೆಮಾಡಿ.",
            search: "ಸ್ವಯಂಸೇವಕರ ಹುಡುಕಾಟ",
            searchPlaceholder: "ಹೆಸರು, ಇಮೇಲ್ ಅಥವಾ ದೂರವಾಣಿ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
            status: "ಸ್ವಯಂಸೇವಕರ ಸ್ಥಿತಿ",
            all: "ಎಲ್ಲಾ ಸ್ವಯಂಸೇವಕರು",
            active: "ಸಕ್ರಿಯ",
            inactive: "ನಿಷ್ಕ್ರಿಯ",
            searchButton: "ಹುಡುಕಿ",
            initialMessage: "ಕಾರ್ಯಕ್ಷಮತೆಯ ವರದಿಯನ್ನು ವೀಕ್ಷಿಸಲು ಸ್ವಯಂಸೇವಕರನ್ನು ಹುಡುಕಿ.",
            statistics: "ಕಾರ್ಯಕ್ಷಮತೆಯ ಅವಲೋಕನ",
            statisticsDescription: "ನೋಂದಣಿ ಮತ್ತು ಕಾರ್ಯಕ್ರಮದ ಭಾಗವಹಿಸುವಿಕೆಯ ಸಾರಾಂಶ.",
            totalRegistrations: "ಒಟ್ಟು ನೋಂದಣಿಗಳು",
            approved: "ಅನುಮೋದಿತ",
            attended: "ಭಾಗವಹಿಸಿದ ಕಾರ್ಯಕ್ರಮಗಳು",
            attendance: "ಹಾಜರಾತಿ",
            attendanceTitle: "ಹಾಜರಾತಿ ವಿಶ್ಲೇಷಣೆ",
            present: "ಹಾಜರು",
            absent: "ಗೈರು",
            notMarked: "ಗುರುತಿಸಿಲ್ಲ",
            registrationSummary: "ನೋಂದಣಿ ಸಾರಾಂಶ",
            pending: "ಬಾಕಿ",
            rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
            cancelled: "ರದ್ದುಪಡಿಸಲಾಗಿದೆ",
            eventHistory: "ಕಾರ್ಯಕ್ರಮ ಭಾಗವಹಿಸುವಿಕೆ ಇತಿಹಾಸ",
            eventHistoryDescription: "ಕಾರ್ಯಕ್ರಮ ನೋಂದಣಿ ಮತ್ತು ಹಾಜರಾತಿ ವಿವರಗಳು.",
            event: "ಕಾರ್ಯಕ್ರಮ",
            eventDate: "ಕಾರ್ಯಕ್ರಮದ ದಿನಾಂಕ",
            category: "ವರ್ಗ",
            registration: "ನೋಂದಣಿ",
            attendanceStatus: "ಹಾಜರಾತಿ",
            noRecords: "ಯಾವುದೇ ನೋಂದಣಿ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
            noVolunteers: "ಯಾವುದೇ ಸ್ವಯಂಸೇವಕರು ಕಂಡುಬಂದಿಲ್ಲ.",
            loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
            selectPrompt: "ವರದಿಯನ್ನು ವೀಕ್ಷಿಸಲು ಸ್ವಯಂಸೇವಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
            activeBadge: "ಸಕ್ರಿಯ",
            inactiveBadge: "ನಿಷ್ಕ್ರಿಯ",
            generated: "ವರದಿ ರಚಿಸಿದ ದಿನಾಂಕ",
            signOut: "ಲಾಗ್ ಔಟ್",
            dashboard: "← ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
            loginRequired: "ನಿಮ್ಮ ಸೆಷನ್ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
            accessDenied: "ಈ ಪುಟ ನಿರ್ವಾಹಕರು ಮತ್ತು ಸಂಯೋಜಕರಿಗೆ ಮಾತ್ರ ಲಭ್ಯವಿದೆ.",
            loadError: "ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
            reportError: "ಸ್ವಯಂಸೇವಕರ ವರದಿಯನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
            pdfMessage: "Print ವಿಂಡೋದಲ್ಲಿ Save as PDF ಆಯ್ಕೆಮಾಡಿ.",
            searchError: "ಸ್ವಯಂಸೇವಕರನ್ನು ಹುಡುಕಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
            unknown: "ಲಭ್ಯವಿಲ್ಲ"
        }
    };

    const $ = id => document.getElementById(id);

    function t(key) {
        return translations[currentLanguage][key] ||
            translations.en[key] ||
            key;
    }

    async function apiRequest(url, options = {}) {
        const response = await fetch(url, {
            credentials: "include",
            ...options,
            headers: {
                ...(options.headers || {})
            }
        });

        let data;

        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (response.status === 401) {
            window.location.href = "login.html";
            throw new Error(t("loginRequired"));
        }

        if (!response.ok) {
            throw new Error(data.message || t("loadError"));
        }

        return data;
    }

    function showMessage(message, duration = 3500) {
        const element = $("reportMessage");

        if (!element) return;

        element.textContent = message;
        element.classList.add("show");

        window.clearTimeout(showMessage.timer);

        showMessage.timer = window.setTimeout(() => {
            element.classList.remove("show");
        }, duration);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function getInitials(name) {
        return String(name || "V")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("");
    }

    function formatDate(value) {
        if (!value) return t("unknown");

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return t("unknown");
        }

        return new Intl.DateTimeFormat(
            currentLanguage === "kn" ? "kn-IN" : "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(date);
    }

    function formatStatus(value) {
        if (!value) return t("unknown");

        const statusTranslations = {
            Pending: "pending",
            Approved: "approved",
            Rejected: "rejected",
            Cancelled: "cancelled",
            Present: "present",
            Absent: "absent",
            "Not Marked": "notMarked"
        };

        const key = statusTranslations[value];

        return key ? t(key) : value;
    }

    function statusClass(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    function applyTranslations() {
        const textMap = {
            reportEyebrow: "eyebrow",
            pageTitle: "pageTitle",
            pageDescription: "pageDescription",
            downloadReportText: "download",
            selectVolunteerTitle: "selectVolunteer",
            selectVolunteerDescription: "selectDescription",
            searchLabel: "search",
            statusLabel: "status",
            searchVolunteersButton: "searchButton",
            initialSearchMessage: "initialMessage",
            statisticsTitle: "statistics",
            statisticsDescription: "statisticsDescription",
            totalRegistrationsLabel: "totalRegistrations",
            approvedRegistrationsLabel: "approved",
            eventsAttendedLabel: "attended",
            attendancePercentageLabel: "attendance",
            attendanceTitle: "attendanceTitle",
            attendanceRingLabel: "attendance",
            presentLabel: "present",
            absentLabel: "absent",
            notMarkedLabel: "notMarked",
            registrationSummaryTitle: "registrationSummary",
            pendingLabel: "pending",
            approvedLabel: "approved",
            rejectedLabel: "rejected",
            cancelledLabel: "cancelled",
            eventHistoryTitle: "eventHistory",
            eventHistoryDescription: "eventHistoryDescription",
            eventNameHeader: "event",
            eventDateHeader: "eventDate",
            eventCategoryHeader: "category",
            registrationStatusHeader: "registration",
            attendanceStatusHeader: "attendanceStatus"
        };

        Object.entries(textMap).forEach(([id, key]) => {
            const element = $(id);
            if (element) element.textContent = t(key);
        });

        $("volunteerSearch").placeholder = t("searchPlaceholder");

        const statusSelect = $("volunteerStatus");

        statusSelect.options[0].textContent = t("all");
        statusSelect.options[1].textContent = t("active");
        statusSelect.options[2].textContent = t("inactive");

        $("logoutButton").textContent = t("signOut");
        $("dashboardLink").textContent = t("dashboard");

        if (currentReport) {
            renderReport(currentReport);
        }

        if (selectedVolunteerId) {
            renderVolunteerResults(volunteerList);
        }
    }

    async function checkAuthorization() {
        try {
            const data = await apiRequest(API.me);

            const user = data.user || data.data?.user || data.data;

            if (!user || !["admin", "coordinator"].includes(user.role)) {
                showMessage(t("accessDenied"), 5000);
                window.setTimeout(() => {
                    window.location.href = "login.html";
                }, 1800);
                return false;
            }

            $("dashboardLink").href =
                user.role === "admin"
                    ? "admin-dashboard.html"
                    : "coordinator-dashboard.html";

            return true;

        } catch (error) {
            console.error("Authorization Error:", error);
            return false;
        }
    }

    async function loadVolunteers() {
        const search = $("volunteerSearch").value.trim();
        const status = $("volunteerStatus").value;

        const results = $("volunteerSearchResults");

        results.innerHTML =
            `<p class="empty-message">${escapeHTML(t("loading"))}</p>`;

        const params = new URLSearchParams({
            search,
            status,
            page: "1",
            limit: "100"
        });

        try {
            const data = await apiRequest(
                `${API.volunteers}?${params.toString()}`
            );

            const volunteers =
                data.volunteers ||
                data.data?.volunteers ||
                data.data ||
                [];

            if (!Array.isArray(volunteers)) {
                throw new Error(t("searchError"));
            }

            volunteerList = volunteers;
            renderVolunteerResults(volunteers);

        } catch (error) {
            console.error("Volunteer Search Error:", error);
            results.innerHTML =
                `<p class="empty-message">${escapeHTML(error.message || t("searchError"))}</p>`;
        }
    }

    function renderVolunteerResults(volunteers) {
        const results = $("volunteerSearchResults");

        if (!volunteers.length) {
            results.innerHTML =
                `<p class="empty-message">${escapeHTML(t("noVolunteers"))}</p>`;
            return;
        }

        results.innerHTML = volunteers.map(volunteer => {
            const id = escapeHTML(volunteer._id || volunteer.id);
            const name = escapeHTML(volunteer.name);
            const email = escapeHTML(volunteer.email || "");
            const initials = escapeHTML(getInitials(volunteer.name));

            return `
                <button
                    type="button"
                    class="volunteer-result-card"
                    data-volunteer-id="${id}">

                    <span class="volunteer-result-avatar">
                        ${initials}
                    </span>

                    <span class="volunteer-result-info">
                        <strong>${name}</strong>
                        <span>${email}</span>
                    </span>
                </button>
            `;
        }).join("");

        results.querySelectorAll("[data-volunteer-id]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    loadPerformanceReport(
                        button.dataset.volunteerId
                    );
                });
            });
    }

    async function loadPerformanceReport(volunteerId) {
        selectedVolunteerId = volunteerId;

        $("reportContent").hidden = true;
        $("downloadReportButton").disabled = true;

        try {
            const data = await apiRequest(
                `${API.volunteers}/${encodeURIComponent(volunteerId)}/performance`
            );

            if (!data.success || !data.volunteer) {
                throw new Error(t("reportError"));
            }

            currentReport = data;

            renderReport(data);

            $("reportContent").hidden = false;
            $("downloadReportButton").disabled = false;

            $("reportContent").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {
            console.error("Performance Report Error:", error);
            currentReport = null;
            showMessage(error.message || t("reportError"), 5000);
        }
    }

    function renderReport(data) {
        const volunteer = data.volunteer || {};
        const stats = data.statistics || {};
        const attendance = stats.attendance || {};
        const registrations = Array.isArray(data.registrations)
            ? data.registrations
            : [];

        $("volunteerAvatar").textContent =
            getInitials(volunteer.name);

        $("volunteerName").textContent =
            volunteer.name || t("unknown");

        $("volunteerEmail").textContent =
            volunteer.email || t("unknown");

        $("volunteerPhone").textContent =
            volunteer.phone || t("unknown");

        const isActive = volunteer.isActive !== false;

        $("volunteerStatusBadge").textContent =
            isActive ? t("activeBadge") : t("inactiveBadge");

        $("volunteerStatusBadge").classList.toggle(
            "inactive",
            !isActive
        );

        $("totalRegistrations").textContent =
            stats.totalRegistrations ?? registrations.length;

        $("approvedRegistrations").textContent =
            stats.approved ?? 0;

        $("eventsAttended").textContent =
            stats.eventsAttended ?? 0;

        const percentage = Number(attendance.percentage || 0);

        $("attendancePercentage").textContent =
            `${percentage.toFixed(2)}%`;

        $("attendanceRingValue").textContent =
            `${percentage.toFixed(1)}%`;

        const safePercentage = Math.max(
            0,
            Math.min(100, percentage)
        );

        const degrees = safePercentage * 3.6;

        $("attendanceRing").style.background =
            `conic-gradient(var(--report-accent) ${degrees}deg, #e9eef2 ${degrees}deg)`;

        $("presentCount").textContent =
            attendance.present ?? 0;

        $("absentCount").textContent =
            attendance.absent ?? 0;

        $("notMarkedCount").textContent =
            attendance.notMarked ?? 0;

        $("pendingCount").textContent =
            stats.pending ?? 0;

        $("approvedCount").textContent =
            stats.approved ?? 0;

        $("rejectedCount").textContent =
            stats.rejected ?? 0;

        $("cancelledCount").textContent =
            stats.cancelled ?? 0;

        renderRegistrationHistory(registrations);

        $("reportGeneratedAt").textContent =
            `${t("generated")}: ${formatDate(data.reportGeneratedAt || new Date())}`;
    }

    function renderRegistrationHistory(registrations) {
        const tbody = $("performanceTableBody");

        if (!registrations.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">
                        ${escapeHTML(t("noRecords"))}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = registrations.map(registration => {
            const event = registration.event || {};

            const eventTitle = event.title || t("unknown");
            const eventDate = event.eventDate
                ? formatDate(event.eventDate)
                : t("unknown");

            const category = event.category || t("unknown");
            const registrationStatus =
                registration.status || t("unknown");

            const attendanceStatus =
                registration.attendance || "Not Marked";

            return `
                <tr>
                    <td>${escapeHTML(eventTitle)}</td>

                    <td>${escapeHTML(eventDate)}</td>

                    <td>${escapeHTML(category)}</td>

                    <td>
                        <span class="table-status ${escapeHTML(statusClass(registrationStatus))}">
                            ${escapeHTML(formatStatus(registrationStatus))}
                        </span>
                    </td>

                    <td>
                        <span class="table-status ${escapeHTML(statusClass(attendanceStatus))}">
                            ${escapeHTML(formatStatus(attendanceStatus))}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function preparePrint() {
        if (!currentReport) {
            showMessage(t("selectPrompt"));
            return;
        }

        showMessage(t("pdfMessage"), 5000);

        window.print();
    }

    function addPrintStyles() {
        const style = document.createElement("style");

        style.textContent = `
            @media print {
                body.performance-page {
                    background: #ffffff !important;
                    color: #000000 !important;
                }

                .performance-header,
                .report-filter-panel,
                .performance-heading .download-button,
                .report-message {
                    display: none !important;
                }

                .performance-container {
                    width: 100% !important;
                    margin: 0 !important;
                }

                .report-content {
                    display: block !important;
                }

                .report-panel,
                .stat-card,
                .selected-volunteer-panel {
                    box-shadow: none !important;
                    break-inside: avoid;
                }

                .report-grid {
                    grid-template-columns: 1fr 1fr !important;
                }

                .statistics-grid {
                    grid-template-columns: repeat(4, 1fr) !important;
                }

                .table-responsive {
                    overflow: visible !important;
                }

                .performance-table {
                    min-width: 0 !important;
                }

                .performance-table th,
                .performance-table td {
                    font-size: 9px !important;
                    padding: 7px !important;
                }

                .report-footer {
                    margin-top: 20px;
                }

                @page {
                    size: A4 landscape;
                    margin: 12mm;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function setupEventListeners() {
        $("searchVolunteersButton").addEventListener(
            "click",
            loadVolunteers
        );

        $("volunteerSearch").addEventListener("keydown", event => {
            if (event.key === "Enter") {
                loadVolunteers();
            }
        });

        $("volunteerStatus").addEventListener(
            "change",
            loadVolunteers
        );

        $("reportLanguage").addEventListener("change", event => {
            currentLanguage = event.target.value === "kn"
                ? "kn"
                : "en";

            applyTranslations();
        });

        $("downloadReportButton").addEventListener(
            "click",
            preparePrint
        );

        $("logoutButton").addEventListener("click", async () => {
            try {
                await fetch(API.logout, {
                    method: "POST",
                    credentials: "include"
                });
            } catch (error) {
                console.error("Logout Error:", error);
            }

            window.location.href = "login.html";
        });
    }

    async function initialize() {
        addPrintStyles();
        setupEventListeners();
        applyTranslations();

        const authorized = await checkAuthorization();

        if (!authorized) return;

        await loadVolunteers();
    }

    initialize();

});

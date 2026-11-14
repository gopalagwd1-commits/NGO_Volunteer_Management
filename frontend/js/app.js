
const translations = {
    en: {
        about: "About",
        login: "Login",
        tagline: "Together, We Make a Difference",
        heading: "Connect People.<br>Empower Communities.",
        description: "A smarter way to organize volunteers, manage events and measure the impact of your NGO activities.",
        getStarted: "Get Started",
        learnMore: "Learn More",
        community: "Building stronger communities through service",
        volunteerTitle: "Volunteer Together",
        volunteerText: "Every helping hand creates a better tomorrow.",
        ready: "Ready to make an impact",
        growth: "Community Growth",
        service: "Service with Purpose",
        platform: "OUR PLATFORM",
        platformHeading: "Everything your NGO needs",
        platformDescription: "Manage your volunteer activities through one organized digital platform.",
        feature1: "Volunteer Management",
        feature1Text: "Register volunteers and manage their profiles.",
        feature2: "Event Scheduling",
        feature2Text: "Organize community events and activities.",
        feature3: "Reports and Impact",
        feature3Text: "Monitor participation and activity outcomes.",
        feature4: "SMS Notifications",
        feature4Text: "Keep volunteers informed about events.",
        footer: "NGO Volunteer Connect | Making a difference together."
    },

    kn: {
        about: "ನಮ್ಮ ಬಗ್ಗೆ",
        login: "ಲಾಗಿನ್",
        tagline: "ಒಟ್ಟಾಗಿ, ನಾವು ಬದಲಾವಣೆ ತರೋಣ",
        heading: "ಜನರನ್ನು ಸಂಪರ್ಕಿಸಿ.<br>ಸಮುದಾಯವನ್ನು ಸಬಲಗೊಳಿಸಿ.",
        description: "ಸ್ವಯಂಸೇವಕರನ್ನು ಸಂಘಟಿಸಲು, ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ನಿರ್ವಹಿಸಲು ಮತ್ತು ನಿಮ್ಮ NGO ಚಟುವಟಿಕೆಗಳ ಪರಿಣಾಮವನ್ನು ಅಳೆಯಲು ಸುಲಭವಾದ ವೇದಿಕೆ.",
        getStarted: "ಪ್ರಾರಂಭಿಸಿ",
        learnMore: "ಹೆಚ್ಚಿನ ಮಾಹಿತಿ",
        community: "ಸೇವೆಯ ಮೂಲಕ ಬಲವಾದ ಸಮುದಾಯ ನಿರ್ಮಾಣ",
        volunteerTitle: "ಒಟ್ಟಾಗಿ ಸ್ವಯಂಸೇವೆ ಮಾಡೋಣ",
        volunteerText: "ಪ್ರತಿಯೊಂದು ಸಹಾಯವೂ ಉತ್ತಮ ನಾಳೆಯನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.",
        ready: "ಬದಲಾವಣೆ ತರಲು ಸಿದ್ಧ",
        growth: "ಸಮುದಾಯದ ಬೆಳವಣಿಗೆ",
        service: "ಉದ್ದೇಶಪೂರ್ಣ ಸೇವೆ",
        platform: "ನಮ್ಮ ವೇದಿಕೆ",
        platformHeading: "ನಿಮ್ಮ NGOಗೆ ಬೇಕಾದ ಎಲ್ಲವೂ",
        platformDescription: "ನಿಮ್ಮ ಸ್ವಯಂಸೇವಾ ಚಟುವಟಿಕೆಗಳನ್ನು ಒಂದೇ ಡಿಜಿಟಲ್ ವೇದಿಕೆಯಲ್ಲಿ ನಿರ್ವಹಿಸಿ.",
        feature1: "ಸ್ವಯಂಸೇವಕರ ನಿರ್ವಹಣೆ",
        feature1Text: "ಸ್ವಯಂಸೇವಕರನ್ನು ನೋಂದಾಯಿಸಿ ಮತ್ತು ಅವರ ವಿವರಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
        feature2: "ಕಾರ್ಯಕ್ರಮಗಳ ವೇಳಾಪಟ್ಟಿ",
        feature2Text: "ಸಮುದಾಯ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಚಟುವಟಿಕೆಗಳನ್ನು ಆಯೋಜಿಸಿ.",
        feature3: "ವರದಿಗಳು ಮತ್ತು ಪರಿಣಾಮ",
        feature3Text: "ಭಾಗವಹಿಸುವಿಕೆ ಮತ್ತು ಚಟುವಟಿಕೆಗಳ ಫಲಿತಾಂಶಗಳನ್ನು ಗಮನಿಸಿ.",
        feature4: "SMS ಅಧಿಸೂಚನೆಗಳು",
        feature4Text: "ಕಾರ್ಯಕ್ರಮಗಳ ಕುರಿತು ಸ್ವಯಂಸೇವಕರಿಗೆ ಮಾಹಿತಿ ನೀಡಿ.",
        footer: "NGO Volunteer Connect | ಒಟ್ಟಾಗಿ ಬದಲಾವಣೆ ತರೋಣ."
    }
};

const languageSelect = document.getElementById("languageSelect");

function setLanguage(language) {
    const selected = translations[language] ? language : "en";

    document.documentElement.lang = selected;
    document.body.classList.toggle("kn", selected === "kn");

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;

        if (translations[selected][key]) {
            element.innerHTML = translations[selected][key];
        }
    });

    languageSelect.value = selected;

    localStorage.setItem("ngo_language", selected);
}

languageSelect.addEventListener("change", event => {
    setLanguage(event.target.value);
});

const savedLanguage = localStorage.getItem("ngo_language") || "en";
setLanguage(savedLanguage);

// ======================================
// BACKEND CONNECTION STATUS
// ======================================

async function checkBackend() {
    const statusElement = document.getElementById("backendStatus");

    try {
        const response = await fetch("http://localhost:5013/api/health");

        const data = await response.json();

        if (data.database === "connected") {
            statusElement.textContent =
                "Backend connected | MongoDB Atlas connected";
        } else {
            statusElement.textContent =
                "Backend running | MongoDB connection pending";
        }

    } catch (error) {
        statusElement.textContent =
            "Backend unavailable. Start the backend server.";
    }
}

checkBackend();

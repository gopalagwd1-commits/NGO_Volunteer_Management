
const API_URL = "/api/auth";

let currentLanguage =
    localStorage.getItem("ngoLanguage") || "en";

let currentMode = "login";

const translations = {
    en: {
        home: "Home",
        welcomeLabel: "MAKE A DIFFERENCE",
        welcomeHeading: "Together, We Can Create a Better Tomorrow.",
        welcomeDescription:
            "Connect with meaningful causes, participate in community activities and make every volunteer hour count.",
        statOne: "Serve Communities",
        statTwo: "Create Impact",
        statThree: "Build Connections",
        loginTitle: "Welcome Back",
        loginSubtitle: "Sign in to continue to your account.",
        email: "Email Address",
        emailPlaceholder: "Enter your email",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        loginButton: "Sign In",
        fullName: "Full Name",
        namePlaceholder: "Enter your full name",
        phone: "Phone Number",
        phonePlaceholder: "Enter phone number",
        registerButton: "Create Volunteer Account",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        registerLink: "Register",
        loginLink: "Sign In",
        backHome: "← Back to Home",
        show: "Show",
        hide: "Hide",
        loginSuccess: "Login successful.",
        registrationSuccess: "Registration successful. Please sign in.",
        invalidLogin: "Invalid email or password.",
        networkError: "Unable to connect to the server. Please try again.",
        loginError: "Login failed. Please try again.",
        registrationError: "Registration failed. Please check your details.",
        requiredFields: "Please complete all required fields.",
        registering: "Creating account...",
        signingIn: "Signing in..."
    },

    kn: {
        home: "ಮುಖಪುಟ",
        welcomeLabel: "ಬದಲಾವಣೆಗೆ ಕೈಜೋಡಿಸಿ",
        welcomeHeading: "ಒಟ್ಟಾಗಿ ಉತ್ತಮ ನಾಳೆಯನ್ನು ನಿರ್ಮಿಸೋಣ.",
        welcomeDescription:
            "ಸಮುದಾಯ ಸೇವೆಯಲ್ಲಿ ಭಾಗವಹಿಸಿ, ಅರ್ಥಪೂರ್ಣ ಚಟುವಟಿಕೆಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಪ್ರತಿಯೊಂದು ಸೇವಾ ಗಂಟೆಯನ್ನೂ ಸಾರ್ಥಕಗೊಳಿಸಿ.",
        statOne: "ಸಮುದಾಯ ಸೇವೆ",
        statTwo: "ಪರಿಣಾಮಕಾರಿ ಸೇವೆ",
        statThree: "ಸಂಪರ್ಕ ಬೆಳೆಸಿ",
        loginTitle: "ಮತ್ತೆ ಸ್ವಾಗತ",
        loginSubtitle: "ನಿಮ್ಮ ಖಾತೆಗೆ ಮುಂದುವರಿಯಲು ಪ್ರವೇಶಿಸಿ.",
        email: "ಇಮೇಲ್ ವಿಳಾಸ",
        emailPlaceholder: "ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ",
        password: "ಪಾಸ್‌ವರ್ಡ್",
        passwordPlaceholder: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
        loginButton: "ಲಾಗಿನ್",
        fullName: "ಪೂರ್ಣ ಹೆಸರು",
        namePlaceholder: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
        phone: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
        phonePlaceholder: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
        registerButton: "ಸ್ವಯಂಸೇವಕರ ಖಾತೆ ರಚಿಸಿ",
        noAccount: "ಖಾತೆ ಇಲ್ಲವೇ?",
        haveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
        registerLink: "ನೋಂದಣಿ",
        loginLink: "ಲಾಗಿನ್",
        backHome: "← ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
        show: "ತೋರಿಸಿ",
        hide: "ಮರೆಮಾಡಿ",
        loginSuccess: "ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ.",
        registrationSuccess: "ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.",
        invalidLogin: "ತಪ್ಪಾದ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್.",
        networkError: "ಸರ್ವರ್ ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        loginError: "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        registrationError: "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
        requiredFields: "ದಯವಿಟ್ಟು ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
        registering: "ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
        signingIn: "ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ..."
    }
};

const getText = (key) =>
    translations[currentLanguage][key] ||
    translations.en[key] ||
    key;

// Apply translations
function applyTranslations() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        element.textContent = getText(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.dataset.i18nPlaceholder;
        element.placeholder = getText(key);
    });

    document.querySelectorAll(".password-toggle").forEach(button => {
        const target = document.getElementById(button.dataset.target);

        if (target) {
            button.textContent =
                target.type === "password"
                    ? getText("show")
                    : getText("hide");
        }
    });

    updateFormMode();
}

// Language selector
const languageSelector =
    document.getElementById("languageSelector");

languageSelector.value = currentLanguage;

languageSelector.addEventListener("change", event => {
    currentLanguage = event.target.value;

    localStorage.setItem("ngoLanguage", currentLanguage);

    applyTranslations();
});

// Display message
function showMessage(message, type = "error") {
    const messageBox = document.getElementById("authMessage");

    messageBox.textContent = message;
    messageBox.className = `auth-message ${type}`;
}

function clearMessage() {
    const messageBox = document.getElementById("authMessage");

    messageBox.textContent = "";
    messageBox.className = "auth-message";
}

// Switch login/register mode
function updateFormMode() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const formTitle = document.getElementById("formTitle");
    const formSubtitle = document.getElementById("formSubtitle");

    const switchText = document.getElementById("switchText");
    const switchButton = document.getElementById("switchAuthMode");

    loginForm.hidden = currentMode !== "login";
    registerForm.hidden = currentMode !== "register";

    formTitle.textContent = getText(
        currentMode === "login" ? "loginTitle" : "registerButton"
    );

    formSubtitle.textContent = getText(
        currentMode === "login" ? "loginSubtitle" : "namePlaceholder"
    );

    switchText.textContent = getText(
        currentMode === "login" ? "noAccount" : "haveAccount"
    );

    switchButton.textContent = getText(
        currentMode === "login" ? "registerLink" : "loginLink"
    );

    clearMessage();
}

document.getElementById("switchAuthMode")
    .addEventListener("click", () => {
        currentMode =
            currentMode === "login" ? "register" : "login";

        updateFormMode();
    });

// Password visibility
document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);

        input.type =
            input.type === "password" ? "text" : "password";

        button.textContent =
            input.type === "password"
                ? getText("show")
                : getText("hide");
    });
});

// Role-based dashboard redirection
function redirectUser(user) {
    const dashboards = {
        admin: "admin-dashboard.html",
        coordinator: "coordinator-dashboard.html",
        volunteer: "volunteer-dashboard.html"
    };

    window.location.href =
        dashboards[user.role] || "index.html";
}

// Login
document.getElementById("loginForm")
    .addEventListener("submit", async event => {
        event.preventDefault();
        clearMessage();

        const button = document.getElementById("loginButton");

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            showMessage(getText("requiredFields"));
            return;
        }

        button.disabled = true;
        button.textContent = getText("signingIn");

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(
                    response.status === 401
                        ? getText("invalidLogin")
                        : (data.message || getText("loginError"))
                );
                return;
            }

            showMessage(getText("loginSuccess"), "success");

            setTimeout(() => {
                redirectUser(data.user);
            }, 700);

        } catch (error) {
            console.error("Login Error:", error);
            showMessage(getText("networkError"));

        } finally {
            button.disabled = false;
            button.textContent = getText("loginButton");
        }
    });

// Volunteer registration
document.getElementById("registerForm")
    .addEventListener("submit", async event => {
        event.preventDefault();
        clearMessage();

        const button = document.getElementById("registerButton");

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const phone = document.getElementById("registerPhone").value.trim();
        const password = document.getElementById("registerPassword").value;

        if (!name || !email || !phone || !password) {
            showMessage(getText("requiredFields"));
            return;
        }

        button.disabled = true;
        button.textContent = getText("registering");

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password,
                    preferredLanguage: currentLanguage
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(
                    data.message || getText("registrationError")
                );
                return;
            }

            showMessage(
                getText("registrationSuccess"),
                "success"
            );

            document.getElementById("registerForm").reset();

            setTimeout(() => {
                currentMode = "login";
                updateFormMode();

                document.getElementById("loginEmail").value = email;
            }, 1200);

        } catch (error) {
            console.error("Registration Error:", error);
            showMessage(getText("networkError"));

        } finally {
            button.disabled = false;
            button.textContent = getText("registerButton");
        }
    });

// Initial translations
applyTranslations();

const registerModal = document.getElementById("registerModal");
const openRegister = document.getElementById("openRegister");
const closeRegister = document.getElementById("closeRegister");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const normalState = document.getElementById("normalState");
const registeredState = document.getElementById("registeredState");
const openPortfolio = document.getElementById("openPortfolio");
const savedUser = document.getElementById("savedUser");
const registerStatus = document.getElementById("registerStatus");

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    let cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + "; expires=" + date.toUTCString() + "; path=/; SameSite=Lax";

    if (window.location.protocol === "https:") {
        cookie += "; Secure";
    }

    document.cookie = cookie;
}

function getCookie(name) {
    const cookieName = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        cookie = cookie.trim();

        if (cookie.indexOf(cookieName) === 0) {
            return decodeURIComponent(cookie.substring(cookieName.length));
        }
    }

    return null;
}

function validEmail(email) {
    const emailPattern = /^[A-Za-z0-9._%+-]+@(gmail\.com|mail\.ru)$/i;
    return emailPattern.test(email);
}

function clearErrors() {
    const errors = document.querySelectorAll(".error");
    const inputs = document.querySelectorAll(".field input");

    errors.forEach(function(error) {
        error.textContent = "";
    });

    inputs.forEach(function(input) {
        input.classList.remove("input-error");
    });
}

function showError(inputId, errorId, text) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input) {
        input.classList.add("input-error");
    }

    error.textContent = text;
}

function goToPortfolio(username, email) {
    const params = new URLSearchParams();
    params.set("user", username || "");
    params.set("email", email || "");
    window.location.href = "portfolio-index.html?" + params.toString();
}

function checkRegisteredUser() {
    const registered = getCookie("registered");
    const username = getCookie("username");
    const email = getCookie("email");

    if (registered === "true" && username && email) {
        normalState.style.display = "none";
        registeredState.style.display = "block";
        savedUser.textContent = username + " • " + email;

        openPortfolio.onclick = function() {
            goToPortfolio(username, email);
        };
    } else {
        normalState.style.display = "block";
        registeredState.style.display = "none";
    }
}

openRegister.addEventListener("click", function() {
    clearErrors();
    registerStatus.textContent = "";
    registerModal.classList.add("show");
});

closeRegister.addEventListener("click", function() {
    registerModal.classList.remove("show");
});

registerModal.addEventListener("click", function(event) {
    if (event.target === registerModal) {
        registerModal.classList.remove("show");
    }
});

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    clearErrors();
    registerStatus.textContent = "";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreement = document.getElementById("agreement").checked;

    let valid = true;

    if (name.length < 2) {
        showError("name", "nameError", "Имя должно содержать минимум 2 символа");
        valid = false;
    }

    if (!validEmail(email)) {
        showError("email", "emailError", "Разрешены только @gmail.com и @mail.ru");
        valid = false;
    }

    if (password.length < 6) {
        showError("password", "passwordError", "Пароль должен содержать минимум 6 символов");
        valid = false;
    }

    if (confirmPassword !== password) {
        showError("confirmPassword", "confirmPasswordError", "Пароли не совпадают");
        valid = false;
    }

    if (!agreement) {
        document.getElementById("agreementError").textContent = "Необходимо принять условия";
        valid = false;
    }

    if (!valid) {
        return;
    }

    try {
        const response = await fetch("./register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email
            })
        });

        const result = await response.json();

        if (!result.success) {
            registerStatus.textContent = "Ошибка регистрации";
            return;
        }

        setCookie("username", name, 30);
        setCookie("email", email, 30);
        setCookie("registered", "true", 30);

        registerStatus.textContent = "Регистрация выполнена";

        setTimeout(function() {
            goToPortfolio(name, email);
        }, 500);
    } catch (error) {
        registerStatus.textContent = "Service Worker ещё не готов. Обновите страницу.";
    }
});

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    document.getElementById("loginEmailError").textContent = "";
    document.getElementById("loginPasswordError").textContent = "";

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    let valid = true;

    if (!validEmail(email)) {
        document.getElementById("loginEmailError").textContent = "Введите @gmail.com или @mail.ru";
        valid = false;
    }

    if (password.length < 6) {
        document.getElementById("loginPasswordError").textContent = "Минимум 6 символов";
        valid = false;
    }

    if (!valid) {
        return;
    }

    const registered = getCookie("registered");
    const savedEmailValue = getCookie("email");
    const username = getCookie("username");

    if (registered !== "true") {
        document.getElementById("loginEmailError").textContent = "Сначала зарегистрируйтесь";
        return;
    }

    if (email !== savedEmailValue) {
        document.getElementById("loginEmailError").textContent = "Email не совпадает с зарегистрированным";
        return;
    }

    goToPortfolio(username, savedEmailValue);
});

async function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        try {
            await navigator.serviceWorker.register("./sw.js");
            await navigator.serviceWorker.ready;

            if (!navigator.serviceWorker.controller && !sessionStorage.getItem("swReloaded")) {
                sessionStorage.setItem("swReloaded", "true");
                window.location.reload();
            }
        } catch (error) {
            console.log("Service Worker error", error);
        }
    }
}

registerServiceWorker();
checkRegisteredUser();

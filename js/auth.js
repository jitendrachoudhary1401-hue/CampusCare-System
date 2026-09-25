import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


const registerForm =
    document.getElementById("registerForm");

const message =
    document.getElementById("message");

const registerBtn =
    document.getElementById("registerBtn");

const registerBtnText =
    document.getElementById("registerBtnText");

const registerLoader =
    document.getElementById("registerLoader");

const password =
    document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

const passwordToggle =
    document.getElementById("passwordToggle");

const passwordStrength =
    document.getElementById("passwordStrength");

const strengthText =
    document.getElementById("strengthText");


/* =====================================
   MESSAGE
===================================== */

function showMessage(text, type = "error") {

    message.textContent = text;

    message.className =
        `form-message ${type}`;

}


/* =====================================
   LOADING
===================================== */

function setLoading(isLoading) {

    registerBtn.disabled = isLoading;

    if (isLoading) {

        registerBtnText.textContent =
            "Creating Account...";

        registerLoader.classList.remove(
            "hidden"
        );

    } else {

        registerBtnText.textContent =
            "Create Account";

        registerLoader.classList.add(
            "hidden"
        );

    }

}


/* =====================================
   PASSWORD VISIBILITY
===================================== */

passwordToggle.addEventListener(
    "click",
    function () {

        const isPassword =
            password.type === "password";

        password.type =
            isPassword
                ? "text"
                : "password";

        passwordToggle.textContent =
            isPassword
                ? "Hide"
                : "Show";

    }
);


/* =====================================
   PASSWORD STRENGTH
===================================== */

password.addEventListener(
    "input",
    function () {

        const value =
            password.value;

        const bars =
            passwordStrength.querySelectorAll(
                ".strength-bars span"
            );

        let score = 0;


        if (value.length >= 6) {
            score++;
        }

        if (value.length >= 8) {
            score++;
        }

        if (/[A-Z]/.test(value)) {
            score++;
        }

        if (/[0-9]/.test(value)) {
            score++;
        }


        bars.forEach(
            (bar, index) => {

                bar.classList.toggle(
                    "active",
                    index < score
                );

            }
        );


        if (!value) {

            strengthText.textContent =
                "Use at least 6 characters";

        }

        else if (score <= 1) {

            strengthText.textContent =
                "Weak password";

        }

        else if (score <= 2) {

            strengthText.textContent =
                "Moderate password";

        }

        else if (score === 3) {

            strengthText.textContent =
                "Good password";

        }

        else {

            strengthText.textContent =
                "Strong password";

        }

    }
);


/* =====================================
   FORM SUBMISSION
===================================== */

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document
                .getElementById("name")
                .value
                .trim();

        const studentId =
            document
                .getElementById("studentId")
                .value
                .trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const passwordValue =
            password.value;

        const confirmPasswordValue =
            confirmPassword.value;


        /* ---------------------------------
           VALIDATION
        --------------------------------- */

        if (!name) {

            showMessage(
                "Please enter your full name."
            );

            return;
        }


        if (!studentId) {

            showMessage(
                "Please enter your student ID."
            );

            return;
        }


        if (!email) {

            showMessage(
                "Please enter your college email."
            );

            return;
        }


        if (passwordValue.length < 6) {

            showMessage(
                "Password must contain at least 6 characters."
            );

            return;
        }


        if (
            passwordValue !==
            confirmPasswordValue
        ) {

            showMessage(
                "Passwords do not match."
            );

            return;
        }


        try {

            setLoading(true);

            showMessage(
                "Creating your CampusCare account...",
                "loading"
            );


            /* ---------------------------------
               FIREBASE AUTHENTICATION
            --------------------------------- */

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    passwordValue
                );


            const user =
                userCredential.user;


            /* ---------------------------------
               FIRESTORE PROFILE
            --------------------------------- */

            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {

                    name: name,

                    studentId: studentId,

                    email: email,

                    role: "student",

                    createdAt:
                        serverTimestamp()

                }
            );


            /* ---------------------------------
               SUCCESS
            --------------------------------- */

            showMessage(
                "Account created successfully! Redirecting to login...",
                "success"
            );


            registerForm.reset();


            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1200
            );


        }

        catch (error) {

            console.error(
                "Registration error:",
                error
            );


            setLoading(false);


            switch (error.code) {

                case "auth/email-already-in-use":

                    showMessage(
                        "This email is already registered."
                    );

                    break;


                case "auth/invalid-email":

                    showMessage(
                        "Please enter a valid email address."
                    );

                    break;


                case "auth/weak-password":

                    showMessage(
                        "Password is too weak."
                    );

                    break;


                case "auth/network-request-failed":

                    showMessage(
                        "Network error. Please check your internet connection."
                    );

                    break;


                case "permission-denied":

                    showMessage(
                        "Registration was blocked by the security rules."
                    );

                    break;


                default:

                    showMessage(
                        "Registration failed. Please try again."
                    );

            }

        }

    }
);
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";

const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");


loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        message.textContent = "Logging in...";

        // Step 1: Authenticate user
        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        // Step 2: Get user's Firestore profile
        const userDoc = await getDoc(
            doc(db, "users", user.uid)
        );

        if (!userDoc.exists()) {

            message.textContent =
                "User profile not found.";

            return;
        }

        // Step 3: Get role
        const userData = userDoc.data();

        const role = userData.role;


        // Step 4: Redirect according to role

        if (role === "student") {

            window.location.href =
                "student-dashboard.html";

        }

        else if (role === "coordinator") {

            window.location.href =
                "coordinator-dashboard.html";

        }

        else if (role === "principal") {

            window.location.href =
                "principal-dashboard.html";

        }

        else if (userData.role === "admin") {

    window.location.href =
        "admin-dashboard.html";

}

        else {

            message.textContent =
                "Invalid user role.";

        }

    }

    catch (error) {

        console.error("Login error:", error);

        if (error.code === "auth/invalid-credential") {

            message.textContent =
                "Incorrect email or password.";

        }

        else if (error.code === "auth/user-not-found") {

            message.textContent =
                "Account not found.";

        }

        else if (error.code === "auth/wrong-password") {

            message.textContent =
                "Incorrect password.";

        }

        else {

            message.textContent =
                "Login failed. Please try again.";

        }

    }

});
forgotPasswordBtn.addEventListener("click", async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    if (!email) {

        message.textContent =
            "Enter your email first to reset your password.";

        return;
    }

    try {

        await sendPasswordResetEmail(
            auth,
            email
        );

        message.textContent =
            "Password reset link sent. Please check your email.";

    }

    catch (error) {

        console.error(
            "Password reset error:",
            error
        );

        if (error.code === "auth/invalid-email") {

            message.textContent =
                "Please enter a valid email address.";

        }

        else if (error.code === "auth/user-not-found") {

            message.textContent =
                "No account found with this email.";

        }

        else {

            message.textContent =
                "Unable to send reset link. Please try again.";

        }

    }

});
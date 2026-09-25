import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


// =====================================================
// ELEMENTS
// =====================================================

const complaintForm =
    document.getElementById("complaintForm");

const category =
    document.getElementById("category");

const subject =
    document.getElementById("subject");

const description =
    document.getElementById("description");

const submitBtn =
    document.getElementById("submitBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const dashboardBtn =
    document.getElementById("dashboardBtn");

const complaintsBtn =
    document.getElementById("complaintsBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

const message =
    document.getElementById("message");

const subjectCounter =
    document.getElementById("subjectCounter");

const descriptionCounter =
    document.getElementById("descriptionCounter");

const successModal =
    document.getElementById("successModal");

const successDashboardBtn =
    document.getElementById(
        "successDashboardBtn"
    );

const successComplaintsBtn =
    document.getElementById(
        "successComplaintsBtn"
    );

const sidebarName =
    document.getElementById("sidebarName");

const topProfileName =
    document.getElementById("topProfileName");

const sidebarAvatar =
    document.getElementById("sidebarAvatar");

const topAvatar =
    document.getElementById("topAvatar");


// =====================================================
// CURRENT USER
// =====================================================

let currentUser = null;


// =====================================================
// AUTH CHECK
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        currentUser = user;


        try {

            const {
                doc,
                getDoc
            } = await import(
                "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"
            );


            const userSnapshot =
                await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );


            if (!userSnapshot.exists()) {

                message.textContent =
                    "User profile not found.";

                return;

            }


            const userData =
                userSnapshot.data();


            if (
                userData.role !==
                "student"
            ) {

                window.location.href =
                    "login.html";

                return;

            }


            const name =
                userData.name ||
                "Student";


            sidebarName.textContent =
                name;

            topProfileName.textContent =
                name;


            const initial =
                name
                    .charAt(0)
                    .toUpperCase();


            sidebarAvatar.textContent =
                initial;

            topAvatar.textContent =
                initial;

        }

        catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

            message.textContent =
                "Unable to load your profile.";

        }

    }
);


// =====================================================
// CHARACTER COUNTERS
// =====================================================

subject.addEventListener(
    "input",
    () => {

        subjectCounter.textContent =
            `${subject.value.length} / 100`;

    }
);


description.addEventListener(
    "input",
    () => {

        descriptionCounter.textContent =
            `${description.value.length} / 1000`;

    }
);


// =====================================================
// SUBMIT COMPLAINT
// =====================================================

complaintForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentUser) {

            message.textContent =
                "Please login again.";

            return;

        }


        const selectedCategory =
            category.value.trim();

        const complaintSubject =
            subject.value.trim();

        const complaintDescription =
            description.value.trim();


        if (!selectedCategory) {

            message.textContent =
                "Please select a complaint category.";

            category.focus();

            return;

        }


        if (!complaintSubject) {

            message.textContent =
                "Please enter a complaint subject.";

            subject.focus();

            return;

        }


        if (!complaintDescription) {

            message.textContent =
                "Please describe your complaint.";

            description.focus();

            return;

        }


        try {

            submitBtn.disabled = true;

            submitBtn.innerHTML =
                `
                <span>Submitting...</span>
                <span>⏳</span>
                `;


            message.textContent = "";


            await addDoc(
                collection(
                    db,
                    "complaints"
                ),
                {

                    studentId:
                        currentUser.uid,

                    category:
                        selectedCategory,

                    subject:
                        complaintSubject,

                    description:
                        complaintDescription,

                    status:
                        "pending",

                    createdAt:
                        serverTimestamp()

                }
            );


            complaintForm.reset();


            subjectCounter.textContent =
                "0 / 100";

            descriptionCounter.textContent =
                "0 / 1000";


            successModal.classList.remove(
                "hidden"
            );


            console.log(
                "Complaint submitted successfully."
            );

        }

        catch (error) {

            console.error(
                "Complaint submission error:",
                error
            );


            message.textContent =
                error.message ||
                "Unable to submit complaint. Please try again.";

        }

        finally {

            submitBtn.disabled = false;

            submitBtn.innerHTML =
                `
                <span>
                    Submit Complaint
                </span>

                <span>
                    →
                </span>
                `;

        }

    }
);


// =====================================================
// CANCEL
// =====================================================

cancelBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "student-dashboard.html";

    }
);


// =====================================================
// DASHBOARD
// =====================================================

dashboardBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "student-dashboard.html";

    }
);


// =====================================================
// MY COMPLAINTS
// =====================================================

complaintsBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "my-complaints.html";

    }
);


// =====================================================
// LOGOUT
// =====================================================

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


// =====================================================
// MOBILE MENU
// =====================================================

menuBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);


// =====================================================
// SUCCESS → DASHBOARD
// =====================================================

successDashboardBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "student-dashboard.html";

    }
);


// =====================================================
// SUCCESS → MY COMPLAINTS
// =====================================================

successComplaintsBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "my-complaints.html";

    }
);
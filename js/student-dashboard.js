// ============================================
// CAMPUSCARE - STUDENT DASHBOARD
// ============================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


// ============================================
// DOM ELEMENTS
// ============================================

const welcomeMessage =
    document.getElementById("welcomeMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const newComplaintBtn =
    document.getElementById("newComplaintBtn");

const viewComplaintsBtn =
    document.getElementById("viewComplaintsBtn");

const viewAllBtn =
    document.getElementById("viewAllBtn");

const totalComplaints =
    document.getElementById("totalComplaints");

const pendingComplaints =
    document.getElementById("pendingComplaints");

const resolvedComplaints =
    document.getElementById("resolvedComplaints");


// IMPORTANT:
// Your HTML uses "recentComplaints"
const recentComplaints =
    document.getElementById("recentComplaints");


// Navigation
const dashboardNavBtn =
    document.getElementById("dashboardNavBtn");

const submitNavBtn =
    document.getElementById("submitNavBtn");

const complaintsNavBtn =
    document.getElementById("complaintsNavBtn");

const profileNavBtn =
    document.getElementById("profileNavBtn");


// Profile
const profileBtn =
    document.getElementById("profileBtn");

const profileModal =
    document.getElementById("profileModal");

const closeProfileBtn =
    document.getElementById("closeProfileBtn");

const profileCloseBtn =
    document.getElementById("profileCloseBtn");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileStudentId =
    document.getElementById("profileStudentId");

const profileAvatar =
    document.getElementById("profileAvatar");

const topAvatar =
    document.getElementById("topAvatar");

const sidebarAvatar =
    document.getElementById("sidebarAvatar");

const topProfileName =
    document.getElementById("topProfileName");

const sidebarUserName =
    document.getElementById("sidebarUserName");


// ============================================
// CURRENT STUDENT
// ============================================

let currentStudent = null;


// ============================================
// AUTH CHECK
// ============================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            console.error(
                "Student profile not found."
            );

            alert(
                "Student profile not found."
            );

            await signOut(auth);

            window.location.href =
                "login.html";

            return;
        }


        const userData =
            userSnapshot.data();


        // ====================================
        // ROLE CHECK
        // ====================================

        if (
            userData.role !==
            "student"
        ) {

            console.error(
                "Wrong role:",
                userData.role
            );

            alert(
                "Access denied. Student account required."
            );

            window.location.href =
                "login.html";

            return;
        }


        // ====================================
        // SAVE STUDENT DATA
        // ====================================

        currentStudent = {

            uid:
                user.uid,

            name:
                userData.name ||
                "Student",

            studentId:
                userData.studentId ||
                "Not available",

            email:
                userData.email ||
                user.email ||
                "Not available"

        };


        // ====================================
        // UPDATE PROFILE UI
        // ====================================

        updateProfileUI();


        // ====================================
        // LOAD COMPLAINTS
        // ====================================

        await loadComplaints();

    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        if (welcomeMessage) {

            welcomeMessage.textContent =
                "Unable to load dashboard.";

        }

    }

});


// ============================================
// UPDATE PROFILE UI
// ============================================

function updateProfileUI() {

    if (!currentStudent) {
        return;
    }


    const firstLetter =
        currentStudent.name
            .charAt(0)
            .toUpperCase();


    if (welcomeMessage) {

        welcomeMessage.textContent =
            `Welcome, ${currentStudent.name}!`;

    }


    if (topProfileName) {

        topProfileName.textContent =
            currentStudent.name;

    }


    if (sidebarUserName) {

        sidebarUserName.textContent =
            currentStudent.name;

    }


    if (profileName) {

        profileName.textContent =
            currentStudent.name;

    }


    if (profileEmail) {

        profileEmail.textContent =
            currentStudent.email;

    }


    if (profileStudentId) {

        profileStudentId.textContent =
            currentStudent.studentId;

    }


    if (profileAvatar) {

        profileAvatar.textContent =
            firstLetter;

    }


    if (topAvatar) {

        topAvatar.textContent =
            firstLetter;

    }


    if (sidebarAvatar) {

        sidebarAvatar.textContent =
            firstLetter;

    }

}


// ============================================
// LOAD COMPLAINTS
// ============================================

async function loadComplaints() {

    if (!currentStudent) {
        return;
    }


    if (recentComplaints) {

        recentComplaints.innerHTML = `

            <div class="loading-state">

                <div class="loader"></div>

                <span>
                    Loading your complaints...
                </span>

            </div>

        `;

    }


    try {

        const complaintsRef =
            collection(
                db,
                "complaints"
            );


        const complaintsQuery =
            query(
                complaintsRef,
                where(
                    "studentId",
                    "==",
                    currentStudent.uid
                )
            );


        const snapshot =
            await getDocs(
                complaintsQuery
            );


        const complaints = [];


        snapshot.forEach(
            (complaintDoc) => {

                complaints.push({

                    id:
                        complaintDoc.id,

                    ...complaintDoc.data()

                });

            }
        );


        // ====================================
        // SORT
        // ====================================

        complaints.sort(
            (a, b) => {

                return (
                    getDateValue(b.createdAt) -
                    getDateValue(a.createdAt)
                );

            }
        );


        // ====================================
        // STATISTICS
        // ====================================

        const total =
            complaints.length;


        const pending =
            complaints.filter(
                complaint => {

                    const status =
                        normalizeStatus(
                            complaint.status
                        );

                    return (
                        status === "pending" ||
                        status === "in-progress"
                    );

                }
            ).length;


        const resolved =
            complaints.filter(
                complaint =>
                    normalizeStatus(
                        complaint.status
                    ) === "resolved"
            ).length;


        updateStatistics(
            total,
            pending,
            resolved
        );


        // ====================================
        // RECENT COMPLAINTS
        // ====================================

        renderRecentComplaints(
            complaints.slice(0, 3)
        );

    }

    catch (error) {

        console.error(
            "Complaint loading error:",
            error
        );


        if (recentComplaints) {

            recentComplaints.innerHTML = `

                <div class="dashboard-error">

                    <h3>
                        Unable to load complaints
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>

            `;

        }

    }

}


// ============================================
// STATISTICS
// ============================================

function updateStatistics(
    total,
    pending,
    resolved
) {

    if (totalComplaints) {

        totalComplaints.textContent =
            total;

    }


    if (pendingComplaints) {

        pendingComplaints.textContent =
            pending;

    }


    if (resolvedComplaints) {

        resolvedComplaints.textContent =
            resolved;

    }

}


// ============================================
// RECENT COMPLAINTS
// ============================================

function renderRecentComplaints(
    complaints
) {

    if (!recentComplaints) {
        return;
    }


    if (complaints.length === 0) {

        recentComplaints.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>
                    No Complaints Yet
                </h3>

                <p>
                    You haven't submitted any complaints yet.
                </p>

                <button
                    type="button"
                    class="empty-action-btn"
                    id="emptyComplaintBtn"
                >
                    Submit Your First Complaint
                </button>

            </div>

        `;


        const emptyButton =
            document.getElementById(
                "emptyComplaintBtn"
            );


        if (emptyButton) {

            emptyButton.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "submit-complaint.html";

                }
            );

        }


        return;
    }


    let html = "";


    complaints.forEach(
        complaint => {

            const status =
                normalizeStatus(
                    complaint.status
                );


            const subject =
                escapeHTML(
                    complaint.subject ||
                    "Untitled Complaint"
                );


            const category =
                escapeHTML(
                    complaint.category ||
                    "General"
                );


            const date =
                formatDate(
                    complaint.createdAt
                );


            html += `

                <div class="complaint-item">

                    <div class="complaint-item-left">

                        <div class="complaint-item-icon">

                            ${getStatusIcon(status)}

                        </div>


                        <div class="complaint-item-info">

                            <h3>
                                ${subject}
                            </h3>

                            <p>
                                ${category}
                                <span>
                                    •
                                </span>
                                ${date}
                            </p>

                        </div>

                    </div>


                    <span
                        class="complaint-status ${getStatusClass(status)}"
                    >
                        ${formatStatus(status)}
                    </span>

                </div>

            `;

        }
    );


    recentComplaints.innerHTML =
        html;

}


// ============================================
// STATUS
// ============================================

function normalizeStatus(status) {

    if (!status) {
        return "pending";
    }


    return String(status)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

}


function formatStatus(status) {

    if (status === "pending") {
        return "Pending";
    }


    if (status === "in-progress") {
        return "In Progress";
    }


    if (status === "resolved") {
        return "Resolved";
    }


    if (status === "rejected") {
        return "Rejected";
    }


    return capitalize(status);

}


function getStatusClass(status) {

    return `status-${status}`;

}


function getStatusIcon(status) {

    if (status === "resolved") {
        return "✓";
    }


    if (status === "in-progress") {
        return "↻";
    }


    if (status === "rejected") {
        return "×";
    }


    return "◷";

}


function capitalize(text) {

    return String(text)
        .replace(/-/g, " ")
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );

}


// ============================================
// DATE
// ============================================

function getDateValue(timestamp) {

    if (
        timestamp &&
        typeof timestamp.toDate ===
        "function"
    ) {

        return timestamp
            .toDate()
            .getTime();

    }


    if (
        timestamp instanceof Date
    ) {

        return timestamp.getTime();

    }


    if (
        typeof timestamp ===
        "string"
    ) {

        const date =
            new Date(timestamp);

        if (!isNaN(date)) {

            return date.getTime();

        }

    }


    return 0;

}


function formatDate(timestamp) {

    const value =
        getDateValue(timestamp);


    if (!value) {

        return "Date unavailable";

    }


    return new Date(value)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


// ============================================
// NAVIGATION
// ============================================

if (newComplaintBtn) {

    newComplaintBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "submit-complaint.html";

        }
    );

}


if (submitNavBtn) {

    submitNavBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "submit-complaint.html";

        }
    );

}


if (viewComplaintsBtn) {

    viewComplaintsBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "my-complaints.html";

        }
    );

}


if (complaintsNavBtn) {

    complaintsNavBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "my-complaints.html";

        }
    );

}


if (viewAllBtn) {

    viewAllBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "my-complaints.html";

        }
    );

}


// ============================================
// DASHBOARD NAV
// ============================================

if (dashboardNavBtn) {

    dashboardNavBtn.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


// ============================================
// PROFILE MODAL
// ============================================

function openProfile() {

    if (!profileModal) {
        return;
    }


    profileModal.classList.remove(
        "hidden"
    );

}


function closeProfile() {

    if (!profileModal) {
        return;
    }


    profileModal.classList.add(
        "hidden"
    );

}


if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        openProfile
    );

}


if (profileNavBtn) {

    profileNavBtn.addEventListener(
        "click",
        openProfile
    );

}


if (closeProfileBtn) {

    closeProfileBtn.addEventListener(
        "click",
        closeProfile
    );

}


if (profileCloseBtn) {

    profileCloseBtn.addEventListener(
        "click",
        closeProfile
    );

}


if (profileModal) {

    profileModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                profileModal
            ) {

                closeProfile();

            }

        }
    );

}


// ============================================
// LOGOUT
// ============================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                logoutBtn.disabled =
                    true;

                logoutBtn.textContent =
                    "Logging out...";


                await signOut(auth);


                window.location.href =
                    "login.html";

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                logoutBtn.disabled =
                    false;

                logoutBtn.textContent =
                    "Logout";

            }

        }
    );

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
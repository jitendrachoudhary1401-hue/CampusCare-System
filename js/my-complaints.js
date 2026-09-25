// ============================================
// CAMPUSCARE - MY COMPLAINTS
// ============================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
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
// DOM
// ============================================

const complaintsContainer =
    document.getElementById(
        "complaintsContainer"
    );

const loadingMessage =
    document.getElementById(
        "loadingMessage"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const dashboardBtn =
    document.getElementById(
        "dashboardBtn"
    );

const submitBtn =
    document.getElementById(
        "submitBtn"
    );

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );

const newComplaintBtn =
    document.getElementById(
        "newComplaintBtn"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );


// Statistics

const totalComplaints =
    document.getElementById(
        "totalComplaints"
    );

const pendingComplaints =
    document.getElementById(
        "pendingComplaints"
    );

const resolvedComplaints =
    document.getElementById(
        "resolvedComplaints"
    );


// Profile

const profileBtn =
    document.getElementById(
        "profileBtn"
    );

const topProfileBtn =
    document.getElementById(
        "topProfileBtn"
    );

const profileModal =
    document.getElementById(
        "profileModal"
    );

const closeProfileBtn =
    document.getElementById(
        "closeProfileBtn"
    );

const profileCloseBtn =
    document.getElementById(
        "profileCloseBtn"
    );

const profileName =
    document.getElementById(
        "profileName"
    );

const profileEmail =
    document.getElementById(
        "profileEmail"
    );

const profileStudentId =
    document.getElementById(
        "profileStudentId"
    );

const profileAvatar =
    document.getElementById(
        "profileAvatar"
    );

const topAvatar =
    document.getElementById(
        "topAvatar"
    );

const sidebarAvatar =
    document.getElementById(
        "sidebarAvatar"
    );

const topProfileName =
    document.getElementById(
        "topProfileName"
    );

const sidebarUserName =
    document.getElementById(
        "sidebarUserName"
    );


// ============================================
// STATE
// ============================================

let currentUser = null;

let currentUserData = null;

let allComplaints = [];


// ============================================
// AUTH
// ============================================

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

            await loadUserProfile();

            await loadComplaints();

        }

        catch (error) {

            console.error(
                "Initialization error:",
                error
            );

            showError(
                "Unable to load your complaints."
            );

        }

    }
);


// ============================================
// LOAD USER PROFILE
// ============================================

async function loadUserProfile() {

    const userSnapshot =
        await getDocs(
            query(
                collection(
                    db,
                    "users"
                ),
                where(
                    "__name__",
                    "==",
                    currentUser.uid
                )
            )
        );


    if (
        userSnapshot.empty
    ) {

        console.error(
            "User profile not found."
        );

        return;

    }


    const userData =
        userSnapshot
            .docs[0]
            .data();


    if (
        userData.role !==
        "student"
    ) {

        alert(
            "Access denied. Student account required."
        );

        await signOut(auth);

        window.location.href =
            "login.html";

        return;

    }


    currentUserData =
        userData;


    updateProfileUI();

}


// ============================================
// UPDATE PROFILE
// ============================================

function updateProfileUI() {

    const name =
        currentUserData.name ||
        "Student";

    const email =
        currentUserData.email ||
        currentUser.email ||
        "Not available";

    const studentId =
        currentUserData.studentId ||
        "Not available";

    const letter =
        name
            .charAt(0)
            .toUpperCase();


    if (profileName) {

        profileName.textContent =
            name;

    }


    if (profileEmail) {

        profileEmail.textContent =
            email;

    }


    if (profileStudentId) {

        profileStudentId.textContent =
            studentId;

    }


    if (topProfileName) {

        topProfileName.textContent =
            name;

    }


    if (sidebarUserName) {

        sidebarUserName.textContent =
            name;

    }


    if (profileAvatar) {

        profileAvatar.textContent =
            letter;

    }


    if (topAvatar) {

        topAvatar.textContent =
            letter;

    }


    if (sidebarAvatar) {

        sidebarAvatar.textContent =
            letter;

    }

}


// ============================================
// LOAD COMPLAINTS
// ============================================

async function loadComplaints() {

    if (!currentUser) {
        return;
    }


    if (loadingMessage) {

        loadingMessage.style.display =
            "flex";

    }


    if (complaintsContainer) {

        complaintsContainer.innerHTML =
            "";

    }


    try {

        const complaintsQuery =
            query(
                collection(
                    db,
                    "complaints"
                ),
                where(
                    "studentId",
                    "==",
                    currentUser.uid
                )
            );


        const snapshot =
            await getDocs(
                complaintsQuery
            );


        allComplaints = [];


        snapshot.forEach(
            complaintDoc => {

                allComplaints.push({

                    id:
                        complaintDoc.id,

                    ...complaintDoc.data()

                });

            }
        );


        // Newest first

        allComplaints.sort(
            (a, b) => {

                return (
                    getTimestamp(
                        b.createdAt
                    ) -
                    getTimestamp(
                        a.createdAt
                    )
                );

            }
        );


        updateStatistics();


        if (loadingMessage) {

            loadingMessage.style.display =
                "none";

        }


        renderComplaints(
            allComplaints
        );

    }

    catch (error) {

        console.error(
            "Error loading complaints:",
            error
        );


        if (loadingMessage) {

            loadingMessage.style.display =
                "none";

        }


        showError(
            error.message
        );

    }

}


// ============================================
// STATISTICS
// ============================================

function updateStatistics() {

    const total =
        allComplaints.length;


    const pending =
        allComplaints.filter(
            complaint => {

                const status =
                    normalizeStatus(
                        complaint.status
                    );

                return (
                    status === "pending" ||
                    status === "under-review" ||
                    status === "in-progress"
                );

            }
        ).length;


    const resolved =
        allComplaints.filter(
            complaint =>
                normalizeStatus(
                    complaint.status
                ) === "resolved"
        ).length;


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
// RENDER
// ============================================

function renderComplaints(
    complaints
) {

    if (!complaintsContainer) {
        return;
    }


    if (
        complaints.length === 0
    ) {

        complaintsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>
                    No Complaints Found
                </h3>

                <p>
                    You haven't submitted any complaints yet.
                </p>

            </div>

        `;

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


            const description =
                escapeHTML(
                    complaint.description ||
                    "No description provided."
                );


            const response =
                complaint.response;


            const date =
                formatDate(
                    complaint.createdAt
                );


            const responseHTML =
                response
                    ? `

                        <div class="principal-response">

                            <strong>
                                Principal Response
                            </strong>

                            <p>
                                ${escapeHTML(
                                    response
                                )}
                            </p>

                        </div>

                    `
                    : "";


            html += `

                <article
                    class="complaint-card"
                    data-status="${status}"
                >

                    <div class="complaint-top">


                        <div class="complaint-title">


                            <div class="complaint-icon">

                                ${getStatusIcon(
                                    status
                                )}

                            </div>


                            <div>

                                <h3>
                                    ${subject}
                                </h3>


                                <div class="complaint-meta">

                                    ${category}

                                    <span>
                                        •
                                    </span>

                                    Submitted
                                    ${date}

                                </div>

                            </div>


                        </div>


                        <span
                            class="status-badge ${status}"
                        >

                            ${getStatusLabel(
                                status
                            )}

                        </span>


                    </div>


                    <div class="complaint-description">

                        ${description}

                    </div>


                    ${responseHTML}


                    <div class="complaint-bottom">

                        <small>
                            Complaint ID:
                            <strong>
                                ${escapeHTML(
                                    complaint.id
                                )}
                            </strong>
                        </small>


                    </div>

                </article>

            `;

        }
    );


    complaintsContainer.innerHTML =
        html;

}


// ============================================
// SEARCH + FILTER
// ============================================

function applyFilters() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filter =
        statusFilter
            ? statusFilter.value
            : "all";


    const filtered =
        allComplaints.filter(
            complaint => {

                const status =
                    normalizeStatus(
                        complaint.status
                    );


                const subject =
                    String(
                        complaint.subject ||
                        ""
                    ).toLowerCase();


                const category =
                    String(
                        complaint.category ||
                        ""
                    ).toLowerCase();


                const description =
                    String(
                        complaint.description ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    subject.includes(search) ||
                    category.includes(search) ||
                    description.includes(search);


                const matchesStatus =
                    filter === "all" ||
                    status === filter;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderComplaints(
        filtered
    );

}


// ============================================
// STATUS HELPERS
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


function getStatusLabel(status) {

    const labels = {

        pending:
            "Pending",

        "under-review":
            "Under Review",

        "in-progress":
            "In Progress",

        resolved:
            "Resolved",

        rejected:
            "Rejected"

    };


    return (
        labels[status] ||
        "Pending"
    );

}


function getStatusIcon(status) {

    if (
        status ===
        "resolved"
    ) {

        return "✓";

    }


    if (
        status ===
        "rejected"
    ) {

        return "×";

    }


    if (
        status ===
        "in-progress"
    ) {

        return "↻";

    }


    return "◷";

}


// ============================================
// DATE
// ============================================

function getTimestamp(timestamp) {

    if (
        timestamp &&
        typeof timestamp.toDate ===
        "function"
    ) {

        return timestamp
            .toDate()
            .getTime();

    }


    return 0;

}


function formatDate(timestamp) {

    const value =
        getTimestamp(
            timestamp
        );


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
// ERROR
// ============================================

function showError(message) {

    if (!complaintsContainer) {
        return;
    }


    complaintsContainer.innerHTML = `

        <div class="error-state">

            <h3>
                Unable to Load Complaints
            </h3>

            <p>
                ${escapeHTML(
                    message ||
                    "Please try again."
                )}
            </p>

        </div>

    `;

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


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


// ============================================
// NAVIGATION
// ============================================

if (dashboardBtn) {

    dashboardBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "student-dashboard.html";

        }
    );

}


if (submitBtn) {

    submitBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "submit-complaint.html";

        }
    );

}


if (newComplaintBtn) {

    newComplaintBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "submit-complaint.html";

        }
    );

}


if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async () => {

            refreshBtn.disabled =
                true;

            refreshBtn.textContent =
                "↻ Loading...";


            await loadComplaints();


            refreshBtn.disabled =
                false;

            refreshBtn.textContent =
                "↻ Refresh";

        }
    );

}


// ============================================
// SEARCH
// ============================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );

}


// ============================================
// PROFILE
// ============================================

function openProfile() {

    if (profileModal) {

        profileModal.classList.remove(
            "hidden"
        );

    }

}


function closeProfile() {

    if (profileModal) {

        profileModal.classList.add(
            "hidden"
        );

    }

}


if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        openProfile
    );

}


if (topProfileBtn) {

    topProfileBtn.addEventListener(
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
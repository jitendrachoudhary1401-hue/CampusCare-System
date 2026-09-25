// =====================================
// CAMPUSCARE ADMIN DASHBOARD
// =====================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    orderBy,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


// =====================================
// DOM ELEMENTS
// =====================================

const sidebar =
    document.getElementById("sidebar");

const menuBtn =
    document.getElementById("menuBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const welcomeMessage =
    document.getElementById("welcomeMessage");

const sidebarAdminName =
    document.getElementById("sidebarAdminName");

const topProfileName =
    document.getElementById("topProfileName");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileRole =
    document.getElementById("profileRole");


const totalStudents =
    document.getElementById("totalStudents");

const totalPrincipals =
    document.getElementById("totalPrincipals");

const totalCoordinators =
    document.getElementById("totalCoordinators");

const totalComplaints =
    document.getElementById("totalComplaints");

const pendingComplaints =
    document.getElementById("pendingComplaints");

const reviewComplaints =
    document.getElementById("reviewComplaints");

const resolvedComplaints =
    document.getElementById("resolvedComplaints");


const dashboardSection =
    document.getElementById("dashboardSection");

const usersSection =
    document.getElementById("usersSection");

const complaintsSection =
    document.getElementById("complaintsSection");


const dashboardNavBtn =
    document.getElementById("dashboardNavBtn");

const usersNavBtn =
    document.getElementById("usersNavBtn");

const complaintsNavBtn =
    document.getElementById("complaintsNavBtn");


const viewUsersBtn =
    document.getElementById("viewUsersBtn");

const viewComplaintsBtn =
    document.getElementById("viewComplaintsBtn");


const usersContainer =
    document.getElementById("usersContainer");

const complaintsContainer =
    document.getElementById("complaintsContainer");

const activityContainer =
    document.getElementById("activityContainer");


const userSearch =
    document.getElementById("userSearch");

const userRoleFilter =
    document.getElementById("userRoleFilter");


const complaintSearch =
    document.getElementById("complaintSearch");

const complaintStatusFilter =
    document.getElementById(
        "complaintStatusFilter"
    );


const refreshActivityBtn =
    document.getElementById(
        "refreshActivityBtn"
    );


const profileBtn =
    document.getElementById(
        "profileBtn"
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


const complaintModal =
    document.getElementById(
        "complaintModal"
    );

const closeComplaintModal =
    document.getElementById(
        "closeComplaintModal"
    );

const complaintDetails =
    document.getElementById(
        "complaintDetails"
    );


// =====================================
// GLOBAL DATA
// =====================================

let currentUser = null;

let allUsers = [];

let allComplaints = [];


// =====================================
// AUTH CHECK
// =====================================

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

            await verifyAdmin();

            await loadDashboard();

            await loadRecentActivity();

        }

        catch (error) {

            console.error(
                "Admin initialization error:",
                error
            );

        }

    }
);


// =====================================
// VERIFY ADMIN
// =====================================

async function verifyAdmin() {

    const userRef =
        doc(
            db,
            "users",
            currentUser.uid
        );


    const userSnapshot =
        await getDoc(userRef);


    if (!userSnapshot.exists()) {

        alert(
            "Admin profile not found."
        );

        await signOut(auth);

        window.location.href =
            "login.html";

        return;

    }


    const userData =
        userSnapshot.data();


    if (
        userData.role !==
        "admin"
    ) {

        alert(
            "You do not have administrator access."
        );

        await signOut(auth);

        window.location.href =
            "login.html";

        return;

    }


    const name =
        userData.name ||
        "Admin";


    if (welcomeMessage) {

        welcomeMessage.textContent =
            `Welcome, ${name}!`;

    }


    if (sidebarAdminName) {

        sidebarAdminName.textContent =
            name;

    }


    if (topProfileName) {

        topProfileName.textContent =
            name;

    }


    if (profileName) {

        profileName.textContent =
            name;

    }


    if (profileEmail) {

        profileEmail.textContent =
            userData.email ||
            currentUser.email ||
            "No email available";

    }


    if (profileRole) {

        profileRole.textContent =
            "Administrator";

    }

}


// =====================================
// LOAD DASHBOARD
// =====================================

async function loadDashboard() {

    await loadUsers();

    await loadComplaints();

    updateStatistics();

}


// =====================================
// LOAD USERS
// =====================================

async function loadUsers() {

    try {

        const usersSnapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        allUsers = [];


        usersSnapshot.forEach(
            (userSnapshot) => {

                allUsers.push({

                    id:
                        userSnapshot.id,

                    ...userSnapshot.data()

                });

            }
        );


        renderUsers();

        updateStatistics();

        console.log(
            "Users loaded:",
            allUsers.length
        );

    }

    catch (error) {

        console.error(
            "Error loading users:",
            error
        );


        if (usersContainer) {

            usersContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        !
                    </div>

                    <h3>
                        Unable to Load Users
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


// =====================================
// RENDER USERS
// =====================================

function renderUsers() {

    if (!usersContainer) {
        return;
    }


    const search =
        userSearch
            ? userSearch.value
                .trim()
                .toLowerCase()
            : "";


    const role =
        userRoleFilter
            ? userRoleFilter.value
            : "all";


    const filteredUsers =
        allUsers.filter(
            (user) => {

                const name =
                    String(
                        user.name || ""
                    ).toLowerCase();


                const email =
                    String(
                        user.email || ""
                    ).toLowerCase();


                const studentId =
                    String(
                        user.studentId || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    email.includes(search) ||
                    studentId.includes(search);


                const matchesRole =
                    role === "all" ||
                    user.role === role;


                return (
                    matchesSearch &&
                    matchesRole
                );

            }
        );


    if (
        filteredUsers.length ===
        0
    ) {

        usersContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ◉
                </div>

                <h3>
                    No Users Found
                </h3>

                <p>
                    Try changing your search
                    or role filter.
                </p>

            </div>

        `;

        return;

    }


    usersContainer.innerHTML =
        filteredUsers
            .map(
                createUserCard
            )
            .join("");

}


// =====================================
// USER CARD
// =====================================

function createUserCard(user) {

    const name =
        user.name ||
        "Unnamed User";


    const email =
        user.email ||
        "No email";


    const role =
        user.role ||
        "unknown";


    const initial =
        name
            .charAt(0)
            .toUpperCase();


    const studentId =
        user.studentId
            ? `Student ID: ${escapeHTML(
                user.studentId
            )}`
            : "";


    return `

        <div class="user-card">

            <div class="user-avatar">
                ${escapeHTML(initial)}
            </div>


            <div class="user-info">

                <strong>
                    ${escapeHTML(name)}
                </strong>

                <span>
                    ${escapeHTML(email)}
                </span>

                ${
                    studentId
                        ? `<span>
                            ${studentId}
                           </span>`
                        : ""
                }

            </div>


            <span class="role-badge">
                ${escapeHTML(role)}
            </span>

        </div>

    `;

}


// =====================================
// LOAD COMPLAINTS
// =====================================

async function loadComplaints() {

    try {

        const complaintsQuery =
            query(
                collection(
                    db,
                    "complaints"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                complaintsQuery
            );


        allComplaints = [];


        snapshot.forEach(
            (complaintSnapshot) => {

                allComplaints.push({

                    id:
                        complaintSnapshot.id,

                    ...complaintSnapshot.data()

                });

            }
        );


        renderComplaints();

        updateStatistics();


        console.log(
            "Complaints loaded:",
            allComplaints.length
        );

    }

    catch (error) {

        console.error(
            "Error loading complaints:",
            error
        );


        if (complaintsContainer) {

            complaintsContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        !
                    </div>

                    <h3>
                        Unable to Load Complaints
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


// =====================================
// RENDER COMPLAINTS
// =====================================

function renderComplaints() {

    if (!complaintsContainer) {
        return;
    }


    const search =
        complaintSearch
            ? complaintSearch.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        complaintStatusFilter
            ? complaintStatusFilter.value
            : "all";


    const filteredComplaints =
        allComplaints.filter(
            (complaint) => {

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


                const studentId =
                    String(
                        complaint.studentId ||
                        ""
                    ).toLowerCase();


                const complaintId =
                    String(
                        complaint.id ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    subject.includes(search) ||
                    category.includes(search) ||
                    studentId.includes(search) ||
                    complaintId.includes(search);


                const matchesStatus =
                    status === "all" ||
                    complaint.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    if (
        filteredComplaints.length ===
        0
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
                    Try changing your search
                    or status filter.
                </p>

            </div>

        `;

        return;

    }


    complaintsContainer.innerHTML =
        filteredComplaints
            .map(
                createComplaintCard
            )
            .join("");


    document
        .querySelectorAll(
            ".view-complaint-btn"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .complaintId;

                        openComplaintModal(
                            id
                        );

                    }
                );

            }
        );

}


// =====================================
// COMPLAINT CARD
// =====================================

function createComplaintCard(
    complaint
) {

    const status =
        complaint.status ||
        "pending";


    const statusText =
        formatStatus(status);


    return `

        <article class="admin-complaint-card">

            <div class="complaint-top">

                <div>

                    <span class="section-label">
                        COMPLAINT
                    </span>

                    <h3>
                        ${escapeHTML(
                            complaint.subject ||
                            "Untitled Complaint"
                        )}
                    </h3>

                    <div class="complaint-meta">

                        ${escapeHTML(
                            complaint.category ||
                            "General"
                        )}

                        •

                        Student ID:
                        ${escapeHTML(
                            complaint.studentId ||
                            "N/A"
                        )}

                    </div>

                </div>


                <span
                    class="status-badge
                    ${getStatusClass(
                        status
                    )}"
                >
                    ${escapeHTML(
                        statusText
                    )}
                </span>

            </div>


            <p class="complaint-description">

                ${escapeHTML(
                    complaint.description ||
                    "No description provided."
                )}

            </p>


            <button
                type="button"
                class="view-complaint-btn"
                data-complaint-id="${escapeHTML(
                    complaint.id
                )}"
            >
                View Details →
            </button>

        </article>

    `;

}


// =====================================
// UPDATE STATISTICS
// =====================================

function updateStatistics() {

    let students = 0;

    let principals = 0;

    let coordinators = 0;


    allUsers.forEach(
        (user) => {

            if (
                user.role ===
                "student"
            ) {

                students++;

            }

            else if (
                user.role ===
                "principal"
            ) {

                principals++;

            }

            else if (
                user.role ===
                "coordinator"
            ) {

                coordinators++;

            }

        }
    );


    let pending = 0;

    let review = 0;

    let resolved = 0;


    allComplaints.forEach(
        (complaint) => {

            if (
                complaint.status ===
                "pending"
            ) {

                pending++;

            }

            else if (
                complaint.status ===
                "under-review"
            ) {

                review++;

            }

            else if (
                complaint.status ===
                "resolved"
            ) {

                resolved++;

            }

        }
    );


    if (totalStudents) {

        totalStudents.textContent =
            students;

    }


    if (totalPrincipals) {

        totalPrincipals.textContent =
            principals;

    }


    if (totalCoordinators) {

        totalCoordinators.textContent =
            coordinators;

    }


    if (totalComplaints) {

        totalComplaints.textContent =
            allComplaints.length;

    }


    if (pendingComplaints) {

        pendingComplaints.textContent =
            pending;

    }


    if (reviewComplaints) {

        reviewComplaints.textContent =
            review;

    }


    if (resolvedComplaints) {

        resolvedComplaints.textContent =
            resolved;

    }

}


// =====================================
// RECENT ACTIVITY
// =====================================

async function loadRecentActivity() {

    if (!activityContainer) {
        return;
    }


    activityContainer.innerHTML = `

        <div class="loading-state">

            <div class="loader"></div>

            <p>
                Loading recent activity...
            </p>

        </div>

    `;


    try {

        const activityQuery =
            query(
                collection(
                    db,
                    "auditLogs"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                activityQuery
            );


        if (snapshot.empty) {

            activityContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ✓
                    </div>

                    <h3>
                        No Recent Activity
                    </h3>

                    <p>
                        System activity will appear here.
                    </p>

                </div>

            `;

            return;

        }


        const logs = [];


        snapshot.forEach(
            (logSnapshot) => {

                logs.push({
                    id:
                        logSnapshot.id,

                    ...logSnapshot.data()
                });

            }
        );


        const recentLogs =
            logs.slice(0, 8);


        activityContainer.innerHTML =
            recentLogs
                .map(
                    createActivityItem
                )
                .join("");

    }

    catch (error) {

        console.error(
            "Activity loading error:",
            error
        );


        activityContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <h3>
                    Activity Unavailable
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


// =====================================
// ACTIVITY ITEM
// =====================================

function createActivityItem(
    log
) {

    const title =
        formatActivityTitle(
            log.action
        );


    const description =
        log.description ||
        "System activity recorded.";


    const time =
        formatTimestamp(
            log.createdAt
        );


    return `

        <div class="activity-item">

            <div class="activity-icon">
                ✓
            </div>


            <div class="activity-content">

                <strong>
                    ${escapeHTML(title)}
                </strong>

                <p>
                    ${escapeHTML(
                        description
                    )}
                </p>

            </div>


            <span class="activity-time">
                ${escapeHTML(time)}
            </span>

        </div>

    `;

}


// =====================================
// ACTIVITY TITLE
// =====================================

function formatActivityTitle(
    action
) {

    const titles = {

        complaint_submitted:
            "Complaint Submitted",

        principal_response_added:
            "Principal Response Added",

        complaint_status_changed:
            "Complaint Status Changed"

    };


    return titles[action] ||
        String(
            action ||
            "System Activity"
        )
            .replace(
                /_/g,
                " "
            )
            .replace(
                /\b\w/g,
                letter =>
                    letter.toUpperCase()
            );

}


// =====================================
// TIMESTAMP
// =====================================

function formatTimestamp(
    timestamp
) {

    if (
        !timestamp ||
        !timestamp.toDate
    ) {

        return "Recently";

    }


    const date =
        timestamp.toDate();


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =====================================
// COMPLAINT MODAL
// =====================================

function openComplaintModal(
    complaintId
) {

    const complaint =
        allComplaints.find(
            item =>
                item.id ===
                complaintId
        );


    if (
        !complaint ||
        !complaintDetails ||
        !complaintModal
    ) {

        return;

    }


    complaintDetails.innerHTML = `

        <div class="detail-row">

            <span>
                Subject
            </span>

            <strong>
                ${escapeHTML(
                    complaint.subject ||
                    "N/A"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Category
            </span>

            <strong>
                ${escapeHTML(
                    complaint.category ||
                    "N/A"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Student ID
            </span>

            <strong>
                ${escapeHTML(
                    complaint.studentId ||
                    "N/A"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Status
            </span>

            <strong>
                ${escapeHTML(
                    formatStatus(
                        complaint.status ||
                        "pending"
                    )
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Description
            </span>

            <p>
                ${escapeHTML(
                    complaint.description ||
                    "No description provided."
                )}
            </p>

        </div>


        <div class="detail-row">

            <span>
                Principal Response
            </span>

            <p>
                ${escapeHTML(
                    complaint.response ||
                    "No response recorded."
                )}
            </p>

        </div>


        <div class="detail-row">

            <span>
                Complaint ID
            </span>

            <strong>
                ${escapeHTML(
                    complaint.id
                )}
            </strong>

        </div>

    `;


    complaintModal.classList.remove(
        "hidden"
    );

}


// =====================================
// NAVIGATION
// =====================================

function showSection(
    section
) {

    dashboardSection
        ?.classList.remove(
            "active-section"
        );

    usersSection
        ?.classList.remove(
            "active-section"
        );

    complaintsSection
        ?.classList.remove(
            "active-section"
        );


    dashboardNavBtn
        ?.classList.remove(
            "active"
        );

    usersNavBtn
        ?.classList.remove(
            "active"
        );

    complaintsNavBtn
        ?.classList.remove(
            "active"
        );


    if (
        section ===
        "dashboard"
    ) {

        dashboardSection
            ?.classList.add(
                "active-section"
            );

        dashboardNavBtn
            ?.classList.add(
                "active"
            );

    }


    else if (
        section ===
        "users"
    ) {

        usersSection
            ?.classList.add(
                "active-section"
            );

        usersNavBtn
            ?.classList.add(
                "active"
            );

        renderUsers();

    }


    else if (
        section ===
        "complaints"
    ) {

        complaintsSection
            ?.classList.add(
                "active-section"
            );

        complaintsNavBtn
            ?.classList.add(
                "active"
            );

        renderComplaints();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    sidebar
        ?.classList.remove(
            "sidebar-open"
        );

}


// =====================================
// NAV EVENTS
// =====================================

dashboardNavBtn?.addEventListener(
    "click",
    () => {

        showSection(
            "dashboard"
        );

    }
);


usersNavBtn?.addEventListener(
    "click",
    () => {

        showSection(
            "users"
        );

    }
);


complaintsNavBtn?.addEventListener(
    "click",
    () => {

        showSection(
            "complaints"
        );

    }
);


viewUsersBtn?.addEventListener(
    "click",
    () => {

        showSection(
            "users"
        );

    }
);


viewComplaintsBtn?.addEventListener(
    "click",
    () => {

        showSection(
            "complaints"
        );

    }
);


// =====================================
// SEARCH
// =====================================

userSearch?.addEventListener(
    "input",
    renderUsers
);


userRoleFilter?.addEventListener(
    "change",
    renderUsers
);


complaintSearch?.addEventListener(
    "input",
    renderComplaints
);


complaintStatusFilter?.addEventListener(
    "change",
    renderComplaints
);


// =====================================
// REFRESH ACTIVITY
// =====================================

refreshActivityBtn?.addEventListener(
    "click",
    async () => {

        refreshActivityBtn.disabled =
            true;

        refreshActivityBtn.textContent =
            "Refreshing...";


        await loadRecentActivity();


        refreshActivityBtn.disabled =
            false;

        refreshActivityBtn.textContent =
            "↻ Refresh";

    }
);


// =====================================
// PROFILE MODAL
// =====================================

profileBtn?.addEventListener(
    "click",
    () => {

        profileModal
            ?.classList.remove(
                "hidden"
            );

    }
);


closeProfileBtn?.addEventListener(
    "click",
    () => {

        profileModal
            ?.classList.add(
                "hidden"
            );

    }
);


profileCloseBtn?.addEventListener(
    "click",
    () => {

        profileModal
            ?.classList.add(
                "hidden"
            );

    }
);


profileModal?.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            profileModal
        ) {

            profileModal
                .classList.add(
                    "hidden"
                );

        }

    }
);


// =====================================
// COMPLAINT MODAL CLOSE
// =====================================

closeComplaintModal?.addEventListener(
    "click",
    () => {

        complaintModal
            ?.classList.add(
                "hidden"
            );

    }
);


complaintModal?.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            complaintModal
        ) {

            complaintModal
                .classList.add(
                    "hidden"
                );

        }

    }
);


// =====================================
// MOBILE MENU
// =====================================

menuBtn?.addEventListener(
    "click",
    () => {

        sidebar
            ?.classList.toggle(
                "sidebar-open"
            );

    }
);


// =====================================
// LOGOUT
// =====================================

logoutBtn?.addEventListener(
    "click",
    async () => {

        try {

            logoutBtn.disabled =
                true;

            logoutBtn.textContent =
                "Logging out...";


            await signOut(
                auth
            );


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
                "↪ Logout";

        }

    }
);


// =====================================
// STATUS HELPERS
// =====================================

function formatStatus(
    status
) {

    if (
        status ===
        "under-review"
    ) {

        return "Under Review";

    }


    if (
        status ===
        "pending"
    ) {

        return "Pending";

    }


    if (
        status ===
        "resolved"
    ) {

        return "Resolved";

    }


    if (
        status ===
        "rejected"
    ) {

        return "Rejected";

    }


    return String(status)
        .replace(
            /-/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


function getStatusClass(
    status
) {

    if (
        status ===
        "under-review"
    ) {

        return "status-review";

    }


    if (
        status ===
        "resolved"
    ) {

        return "status-resolved";

    }


    if (
        status ===
        "rejected"
    ) {

        return "status-rejected";

    }


    return "status-pending";

}


// =====================================
// HTML ESCAPE
// =====================================

function escapeHTML(
    value
) {

    if (
        value ===
        undefined ||
        value ===
        null
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
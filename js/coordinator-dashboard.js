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
    where,
    orderBy,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase-config.js";


// =====================================
// AUDIT LOG HELPER
// =====================================

// CHANGE THIS PATH ONLY if your audit
// helper has a different filename.

import {
    createAuditLog
} from "./audit-log.js";


// =====================================
// ELEMENTS
// =====================================

const welcomeMessage =
    document.getElementById(
        "welcomeMessage"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const profileBtn =
    document.getElementById(
        "profileBtn"
    );

const profileNavBtn =
    document.getElementById(
        "profileNavBtn"
    );

const dashboardNavBtn =
    document.getElementById(
        "dashboardNavBtn"
    );

const resolvedNavBtn =
    document.getElementById(
        "resolvedNavBtn"
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

const profileRole =
    document.getElementById(
        "profileRole"
    );

const sidebarUserName =
    document.getElementById(
        "sidebarUserName"
    );

const topProfileName =
    document.getElementById(
        "topProfileName"
    );

const totalComplaints =
    document.getElementById(
        "totalComplaints"
    );

const resolvedComplaints =
    document.getElementById(
        "resolvedComplaints"
    );

const notificationsSent =
    document.getElementById(
        "notificationsSent"
    );

const complaintsContainer =
    document.getElementById(
        "complaintsContainer"
    );

const complaintsSection =
    document.getElementById(
        "complaintsSection"
    );

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );

const menuBtn =
    document.getElementById(
        "menuBtn"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );


// =====================================
// UTILITY
// =====================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================
// PROFILE MODAL
// =====================================

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
        (event) => {

            if (
                event.target ===
                profileModal
            ) {

                closeProfile();

            }

        }
    );

}


// =====================================
// SIDEBAR NAVIGATION
// =====================================

function activateNav(button) {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            (item) => {

                item.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


if (dashboardNavBtn) {

    dashboardNavBtn.addEventListener(
        "click",
        () => {

            activateNav(
                dashboardNavBtn
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


if (resolvedNavBtn) {

    resolvedNavBtn.addEventListener(
        "click",
        () => {

            activateNav(
                resolvedNavBtn
            );


            if (complaintsSection) {

                complaintsSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


// =====================================
// MOBILE MENU
// =====================================

if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        () => {

            if (sidebar) {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );

}


// =====================================
// CREATE COMPLAINT CARD
// =====================================

function createComplaintCard(
    complaint,
    complaintId
) {

    const subject =
        complaint.subject ||
        "Untitled Complaint";


    const category =
        complaint.category ||
        "General";


    const description =
        complaint.description ||
        "No description provided.";


    const response =
        complaint.response ||
        "No response provided.";


    const studentId =
        complaint.studentId ||
        "Unknown";


    const alreadyNotified =
        complaint
            .resolutionNotificationSent ===
        true;


    let resolvedDate =
        "Not available";


    if (
        complaint.updatedAt &&
        typeof complaint.updatedAt.toDate ===
        "function"
    ) {

        resolvedDate =
            complaint.updatedAt
                .toDate()
                .toLocaleString(
                    "en-IN",
                    {
                        dateStyle:
                            "medium",
                        timeStyle:
                            "short"
                    }
                );

    }


    return `

        <article
            class="complaint-card"
            data-complaint-id="${escapeHTML(
                complaintId
            )}"
        >

            <div class="complaint-top">

                <div class="complaint-title-area">

                    <div class="complaint-symbol">
                        ✓
                    </div>

                    <div>

                        <span class="complaint-id">
                            #${escapeHTML(
                                complaintId
                                    .slice(0, 8)
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(subject)}
                        </h3>

                    </div>

                </div>


                <span class="resolved-badge">
                    RESOLVED
                </span>

            </div>


            <div class="complaint-meta">

                <div class="meta-item">

                    <span class="meta-label">
                        CATEGORY
                    </span>

                    <strong>
                        ${escapeHTML(category)}
                    </strong>

                </div>


                <div class="meta-item">

                    <span class="meta-label">
                        STUDENT ID
                    </span>

                    <strong>
                        ${escapeHTML(studentId)}
                    </strong>

                </div>


                <div class="meta-item">

                    <span class="meta-label">
                        RESOLVED ON
                    </span>

                    <strong>
                        ${escapeHTML(resolvedDate)}
                    </strong>

                </div>

            </div>


            <div class="complaint-content">

                <div class="content-column">

                    <span class="content-label">
                        COMPLAINT
                    </span>

                    <p>
                        ${escapeHTML(description)}
                    </p>

                </div>


                <div class="content-column response-column">

                    <span class="content-label">
                        ADMINISTRATIVE RESPONSE
                    </span>

                    <p>
                        ${escapeHTML(response)}
                    </p>

                </div>

            </div>

            <div class="complaint-footer">

                <div class="notification-status">

                    ${
                        alreadyNotified
                            ? `
                                <span class="status-dot sent"></span>
                                <span>
                                    Student notification recorded
                                </span>
                            `
                            : `
                                <span class="status-dot pending"></span>
                                <span>
                                    Notification pending
                                </span>
                            `
                    }

                </div>


                <button
                    type="button"
                    class="send-notification-btn ${
                        alreadyNotified
                            ? "notification-sent"
                            : ""
                    }"
                    data-complaint-id="${escapeHTML(
                        complaintId
                    )}"
                    ${
                        alreadyNotified
                            ? "disabled"
                            : ""
                    }
                >

                    ${
                        alreadyNotified
                            ? "✓ Notification Sent"
                            : "Mark Notification Sent"
                    }

                </button>

            </div>

        </article>

    `;

}


// =====================================
// LOAD COMPLAINTS
// =====================================

async function loadComplaints() {

    if (!complaintsContainer) {
        return;
    }


    complaintsContainer.innerHTML = `

        <div class="loading-state">

            <div class="loader"></div>

            <p>
                Loading resolved complaints...
            </p>

        </div>

    `;


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
            "status",
            "==",
            "resolved"
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


        let total = 0;

        let resolved = 0;

        let notificationCount = 0;

        let resolvedHTML = "";


        snapshot.forEach(
            (complaintSnapshot) => {

                total++;


                const complaint =
                    complaintSnapshot.data();


                const complaintId =
                    complaintSnapshot.id;


                if (
                    complaint.status ===
                    "resolved"
                ) {

                    resolved++;


                    if (
                        complaint
                            .resolutionNotificationSent ===
                        true
                    ) {

                        notificationCount++;

                    }


                    resolvedHTML +=
                        createComplaintCard(
                            complaint,
                            complaintId
                        );

                }

            }
        );


        if (totalComplaints) {

            totalComplaints.textContent =
                total;

        }


        if (resolvedComplaints) {

            resolvedComplaints.textContent =
                resolved;

        }


        if (notificationsSent) {

            notificationsSent.textContent =
                notificationCount;

        }


        if (resolved === 0) {

            complaintsContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ✓
                    </div>

                    <h3>
                        No Resolved Complaints
                    </h3>

                    <p>
                        There are currently no resolved
                        complaints waiting for notification.
                    </p>

                </div>

            `;

        }

        else {

            complaintsContainer.innerHTML =
                resolvedHTML;

        }


        console.log(
            "Coordinator complaints loaded:",
            {
                total,
                resolved,
                notificationCount
            }
        );

    }

    catch (error) {

        console.error(
            "Error loading complaints:",
            error
        );


        complaintsContainer.innerHTML = `

            <div class="empty-state error-state">

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

                <button
                    type="button"
                    class="retry-btn"
                    id="retryBtn"
                >
                    Try Again
                </button>

            </div>

        `;


        const retryBtn =
            document.getElementById(
                "retryBtn"
            );


        if (retryBtn) {

            retryBtn.addEventListener(
                "click",
                loadComplaints
            );

        }

    }

}


// =====================================
// MARK NOTIFICATION SENT
// =====================================

async function markNotificationSent(
    complaintId,
    button
) {

    if (!complaintId) {

        alert(
            "Invalid complaint."
        );

        return;

    }


    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Your session has expired."
        );

        return;

    }


    try {

        button.disabled = true;

        button.textContent =
            "Updating...";


        const complaintRef =
            doc(
                db,
                "complaints",
                complaintId
            );


        const complaintSnapshot =
            await getDoc(
                complaintRef
            );


        if (
            !complaintSnapshot.exists()
        ) {

            throw new Error(
                "Complaint not found."
            );

        }


        const complaint =
            complaintSnapshot.data();


        if (
            complaint.status !==
            "resolved"
        ) {

            throw new Error(
                "Only resolved complaints can be notified."
            );

        }


        if (
            complaint
                .resolutionNotificationSent ===
            true
        ) {

            button.textContent =
                "✓ Notification Sent";

            return;

        }


        await updateDoc(
            complaintRef,
            {

                resolutionNotificationSent:
                    true,

                resolutionNotificationSentAt:
                    serverTimestamp(),

                resolutionNotificationSentBy:
                    user.uid

            }
        );


        // =================================
        // AUDIT LOG
        // =================================

        try {

            await createAuditLog({

                action:
                    "resolution_notification_recorded",

                description:
                    `Coordinator recorded student notification for complaint ${complaintId}`,

                complaintId:
                    complaintId

            });

        }

        catch (auditError) {

            console.error(
                "Audit log error:",
                auditError
            );

        }


        button.textContent =
            "✓ Notification Sent";


        button.classList.add(
            "notification-sent"
        );


        button.disabled = true;


        if (notificationsSent) {

            const current =
                Number(
                    notificationsSent.textContent
                ) || 0;


            notificationsSent.textContent =
                current + 1;

        }


        const card =
            button.closest(
                ".complaint-card"
            );


        if (card) {

            const status =
                card.querySelector(
                    ".notification-status"
                );


            if (status) {

                status.innerHTML = `

                    <span class="status-dot sent"></span>

                    <span>
                        Student notification recorded
                    </span>

                `;

            }

        }


        console.log(
            "Notification recorded:",
            complaintId
        );

    }

    catch (error) {

        console.error(
            "Notification update error:",
            error
        );


        button.disabled = false;


        button.textContent =
            "Mark Notification Sent";


        alert(
            error.message ||
            "Unable to record notification."
        );

    }

}


// =====================================
// NOTIFICATION BUTTON EVENT
// =====================================

if (complaintsContainer) {

    complaintsContainer.addEventListener(
        "click",
        async (event) => {

            const button =
                event.target.closest(
                    ".send-notification-btn"
                );


            if (!button) {
                return;
            }


            const complaintId =
                button.dataset.complaintId;


            const confirmed =
                confirm(
                    "Confirm that the student has been notified about this complaint resolution?"
                );


            if (!confirmed) {

                return;

            }


            await markNotificationSent(
                complaintId,
                button
            );

        }
    );

}


// =====================================
// REFRESH
// =====================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async () => {

            refreshBtn.disabled =
                true;


            refreshBtn.classList.add(
                "refreshing"
            );


            try {

                await loadComplaints();

            }

            finally {

                refreshBtn.disabled =
                    false;


                refreshBtn.classList.remove(
                    "refreshing"
                );

            }

        }
    );

}


// =====================================
// LOGOUT
// =====================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {

                return;

            }


            try {

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

                alert(
                    "Unable to logout."
                );

            }

        }
    );

}


// =====================================
// AUTHENTICATION
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        try {

            console.log(
                "Coordinator UID:",
                user.uid
            );


            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(
                    userRef
                );


            if (
                !userSnapshot.exists()
            ) {

                alert(
                    "Coordinator profile not found."
                );


                await signOut(
                    auth
                );


                window.location.href =
                    "login.html";


                return;

            }


            const userData =
                userSnapshot.data();


            // =================================
            // ROLE CHECK
            // =================================

            if (
                userData.role !==
                "coordinator"
            ) {

                console.error(
                    "Wrong role:",
                    userData.role
                );


                alert(
                    "Access denied. Coordinator account required."
                );


                window.location.href =
                    "login.html";


                return;

            }


            // =================================
            // PROFILE DATA
            // =================================

            const coordinatorName =
                userData.name ||
                "Coordinator";


            const coordinatorEmail =
                userData.email ||
                user.email ||
                "Email not available";


            // =================================
            // HEADER
            // =================================

            if (welcomeMessage) {

                welcomeMessage.textContent =
                    `Welcome, ${coordinatorName}`;

            }


            if (sidebarUserName) {

                sidebarUserName.textContent =
                    coordinatorName;

            }


            if (topProfileName) {

                topProfileName.textContent =
                    coordinatorName;

            }


            // =================================
            // PROFILE
            // =================================

            if (profileName) {

                profileName.textContent =
                    coordinatorName;

            }


            if (profileEmail) {

                profileEmail.textContent =
                    coordinatorEmail;

            }


            if (profileRole) {

                profileRole.textContent =
                    "Coordinator";

            }


            // =================================
            // LOAD DATA
            // =================================

            await loadComplaints();


            console.log(
                "Coordinator dashboard loaded successfully."
            );

        }

        catch (error) {

            console.error(
                "Coordinator authentication error:",
                error
            );


            if (complaintsContainer) {

                complaintsContainer.innerHTML = `

                    <div class="empty-state error-state">

                        <div class="empty-icon">
                            !
                        </div>

                        <h3>
                            Dashboard Error
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
);
// =====================================
// PRINCIPAL DASHBOARD
// CampusCare System
// =====================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    orderBy,
    getDocs,
    doc,
    getDoc,
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

const welcomeMessage =
    document.getElementById("welcomeMessage");

const principalName =
    document.getElementById("principalName");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileRole =
    document.getElementById("profileRole");

const totalComplaints =
    document.getElementById("totalComplaints");

const pendingComplaints =
    document.getElementById("pendingComplaints");

const reviewComplaints =
    document.getElementById("reviewComplaints");

const resolvedComplaints =
    document.getElementById("resolvedComplaints");

const complaintsContainer =
    document.getElementById("complaintsContainer");

const loadingMessage =
    document.getElementById("loadingMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const dashboardNavBtn =
    document.getElementById("dashboardNavBtn");

const complaintsNavBtn =
    document.getElementById("complaintsNavBtn");

const profileNavBtn =
    document.getElementById("profileNavBtn");

const profileBtn =
    document.getElementById("profileBtn");

const profileModal =
    document.getElementById("profileModal");

const closeProfileBtn =
    document.getElementById("closeProfileBtn");

const profileCloseBtn =
    document.getElementById("profileCloseBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");


// =====================================
// GLOBAL USER
// =====================================

let currentUser = null;


// =====================================
// AUTHENTICATION
// =====================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }

    currentUser = user;

    await loadPrincipalProfile();

    await loadComplaints();

});


// =====================================
// LOAD PRINCIPAL PROFILE
// =====================================

async function loadPrincipalProfile() {

    try {

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
                "Principal profile not found."
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
            "principal"
        ) {

            alert(
                "You do not have Principal access."
            );

            await signOut(auth);

            window.location.href =
                "login.html";

            return;
        }


        const name =
            userData.name ||
            "Principal";


        if (welcomeMessage) {

            welcomeMessage.textContent =
                `Welcome, ${name}!`;

        }


        if (principalName) {

            principalName.textContent =
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
                "Principal";

        }

    }

    catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        if (welcomeMessage) {

            welcomeMessage.textContent =
                "Unable to load profile.";

        }

    }

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
            <p>Loading complaints...</p>
        </div>
    `;


    if (loadingMessage) {
        loadingMessage.textContent = "";
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
        let pending = 0;
        let review = 0;
        let resolved = 0;


        if (snapshot.empty) {

            complaintsContainer.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ✓
                    </div>

                    <h3>No Complaints Found</h3>

                    <p>
                        There are currently no complaints
                        submitted by students.
                    </p>

                </div>
            `;


            updateStatistics(
                0,
                0,
                0,
                0
            );

            return;
        }


        let complaintsHTML = "";


        snapshot.forEach(
            (complaintSnapshot) => {

                const complaint =
                    complaintSnapshot.data();

                const complaintId =
                    complaintSnapshot.id;


                total++;


                const status =
                    complaint.status ||
                    "pending";


                if (status === "pending") {

                    pending++;

                }

                else if (
                    status ===
                    "under-review"
                ) {

                    review++;

                }

                else if (
                    status ===
                    "resolved"
                ) {

                    resolved++;

                }


                complaintsHTML +=
                    createComplaintCard(
                        complaint,
                        complaintId
                    );

            }
        );


        updateStatistics(
            total,
            pending,
            review,
            resolved
        );


        complaintsContainer.innerHTML =
            complaintsHTML;


        attachComplaintEvents();


        console.log(
            "Principal complaints loaded:",
            total
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
                    id="retryComplaintsBtn"
                >
                    Try Again
                </button>

            </div>
        `;


        const retryBtn =
            document.getElementById(
                "retryComplaintsBtn"
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
// UPDATE STATISTICS
// =====================================

function updateStatistics(
    total,
    pending,
    review,
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
// CREATE COMPLAINT CARD
// =====================================

function createComplaintCard(
    complaint,
    complaintId
) {

    const status =
        complaint.status ||
        "pending";


    const statusText =
        formatStatus(status);


    const studentId =
        complaint.studentId ||
        "Not available";


    const category =
        complaint.category ||
        "General";


    const subject =
        complaint.subject ||
        "Untitled Complaint";


    const description =
        complaint.description ||
        "No description provided.";


    const response =
        complaint.response ||
        "";


    return `

        <article
            class="complaint-card"
            data-complaint-id="${escapeHTML(
                complaintId
            )}"
        >

            <div class="complaint-card-header">

                <div>

                    <span class="complaint-label">
                        COMPLAINT
                    </span>

                    <h3>
                        ${escapeHTML(subject)}
                    </h3>

                    <div class="complaint-meta">

                        <span>
                            ${escapeHTML(category)}
                        </span>

                        <span>•</span>

                        <span>
                            Student ID:
                            ${escapeHTML(studentId)}
                        </span>

                    </div>

                </div>


                <span
                    class="status-badge ${getStatusClass(
                        status
                    )}"
                >
                    ${escapeHTML(statusText)}
                </span>

            </div>


            <div class="complaint-description">

                <span class="field-label">
                    DESCRIPTION
                </span>

                <p>
                    ${escapeHTML(description)}
                </p>

            </div>


            <div class="complaint-management">

                <div class="status-management">

                    <label
                        for="status-${escapeHTML(
                            complaintId
                        )}"
                    >
                        Status
                    </label>


                    <select
                        id="status-${escapeHTML(
                            complaintId
                        )}"
                        class="status-select"
                        data-status-select="${escapeHTML(
                            complaintId
                        )}"
                    >

                        <option
                            value="pending"
                            ${status === "pending"
                                ? "selected"
                                : ""}
                        >
                            Pending
                        </option>

                        <option
                            value="under-review"
                            ${status === "under-review"
                                ? "selected"
                                : ""}
                        >
                            Under Review
                        </option>

                        <option
                            value="resolved"
                            ${status === "resolved"
                                ? "selected"
                                : ""}
                        >
                            Resolved
                        </option>

                        <option
                            value="rejected"
                            ${status === "rejected"
                                ? "selected"
                                : ""}
                        >
                            Rejected
                        </option>

                    </select>


                    <button
                        type="button"
                        class="update-status-btn"
                        data-update-status="${escapeHTML(
                            complaintId
                        )}"
                    >
                        Update Status
                    </button>

                </div>

            </div>


            <div class="response-section">

                <span class="field-label">
                    PRINCIPAL RESPONSE
                </span>


                <textarea
                    class="response-input"
                    data-response-input="${escapeHTML(
                        complaintId
                    )}"
                    placeholder="Enter response for the student..."
                >${escapeHTML(response)}</textarea>


                <button
                    type="button"
                    class="save-response-btn"
                    data-save-response="${escapeHTML(
                        complaintId
                    )}"
                >
                    Save Response
                </button>

            </div>


            <div class="complaint-footer">

                <span>
                    Complaint ID:
                    ${escapeHTML(complaintId)}
                </span>

            </div>

        </article>

    `;

}


// =====================================
// ATTACH CARD EVENTS
// =====================================

function attachComplaintEvents() {

    const statusButtons =
        document.querySelectorAll(
            "[data-update-status]"
        );


    statusButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                async () => {

                    const complaintId =
                        button.dataset
                            .updateStatus;

                    await updateComplaintStatus(
                        complaintId,
                        button
                    );

                }
            );

        }
    );


    const responseButtons =
        document.querySelectorAll(
            "[data-save-response]"
        );


    responseButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                async () => {

                    const complaintId =
                        button.dataset
                            .saveResponse;

                    await savePrincipalResponse(
                        complaintId,
                        button
                    );

                }
            );

        }
    );

}


// =====================================
// UPDATE STATUS
// =====================================

async function updateComplaintStatus(
    complaintId,
    button
) {

    const select =
        document.querySelector(
            `[data-status-select="${CSS.escape(
                complaintId
            )}"]`
        );


    if (!select) {

        alert(
            "Status selector not found."
        );

        return;

    }


    const newStatus =
        select.value;


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


        await updateDoc(
            complaintRef,
            {

                status:
                    newStatus,

                updatedAt:
                    serverTimestamp(),

                respondedBy:
                    currentUser.uid

            }
        );


        button.textContent =
            "✓ Updated";


        setTimeout(
            () => {

                button.textContent =
                    "Update Status";

                button.disabled =
                    false;

            },
            1500
        );


        await loadComplaints();

    }

    catch (error) {

        console.error(
            "Status update error:",
            error
        );


        button.disabled =
            false;

        button.textContent =
            "Update Status";


        alert(
            error.message ||
            "Unable to update complaint status."
        );

    }

}


// =====================================
// SAVE PRINCIPAL RESPONSE
// =====================================

async function savePrincipalResponse(
    complaintId,
    button
) {

    const textarea =
        document.querySelector(
            `[data-response-input="${CSS.escape(
                complaintId
            )}"]`
        );


    if (!textarea) {

        alert(
            "Response field not found."
        );

        return;

    }


    const response =
        textarea.value.trim();


    if (!response) {

        alert(
            "Please enter a response before saving."
        );

        textarea.focus();

        return;

    }


    try {

        button.disabled = true;

        button.textContent =
            "Saving...";


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


        await updateDoc(
            complaintRef,
            {

                response:
                    response,

                respondedAt:
                    serverTimestamp(),

                respondedBy:
                    currentUser.uid,

                updatedAt:
                    serverTimestamp()

            }
        );


        button.textContent =
            "✓ Response Saved";


        setTimeout(
            () => {

                button.textContent =
                    "Save Response";

                button.disabled =
                    false;

            },
            1500
        );


        console.log(
            "Principal response saved:",
            complaintId
        );

    }

    catch (error) {

        console.error(
            "Response save error:",
            error
        );


        button.disabled =
            false;

        button.textContent =
            "Save Response";


        alert(
            error.message ||
            "Unable to save response."
        );

    }

}


// =====================================
// STATUS FORMATTER
// =====================================

function formatStatus(status) {

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


    return status
        .replace(/-/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}


// =====================================
// STATUS CSS CLASS
// =====================================

function getStatusClass(status) {

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
// PROFILE MODAL
// =====================================

function openProfileModal() {

    if (!profileModal) {
        return;
    }

    profileModal.classList.remove(
        "hidden"
    );

}


function closeProfileModal() {

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
        openProfileModal
    );

}


if (profileNavBtn) {

    profileNavBtn.addEventListener(
        "click",
        openProfileModal
    );

}


if (closeProfileBtn) {

    closeProfileBtn.addEventListener(
        "click",
        closeProfileModal
    );

}


if (profileCloseBtn) {

    profileCloseBtn.addEventListener(
        "click",
        closeProfileModal
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

                closeProfileModal();

            }

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

            refreshBtn.textContent =
                "Refreshing...";


            await loadComplaints();


            refreshBtn.textContent =
                "↻ Refresh";

            refreshBtn.disabled =
                false;

        }
    );

}


// =====================================
// NAVIGATION
// =====================================

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


if (complaintsNavBtn) {

    complaintsNavBtn.addEventListener(
        "click",
        () => {

            const section =
                document.getElementById(
                    "complaintsSection"
                );


            if (section) {

                section.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


// =====================================
// MOBILE SIDEBAR
// =====================================

if (menuBtn && sidebar) {

    menuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "sidebar-open"
            );

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


// =====================================
// HTML ESCAPE
// =====================================

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
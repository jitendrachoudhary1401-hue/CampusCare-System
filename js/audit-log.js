import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


export async function createAuditLog({
    action,
    description,
    complaintId = null
}) {

    const user = auth.currentUser;


    if (!user) {

        console.error(
            "Cannot create audit log: user is not logged in."
        );

        return;
    }


    try {

        await addDoc(
            collection(db, "auditLogs"),
            {

                action: action,

                description: description,

                actorUid: user.uid,

                complaintId: complaintId,

                createdAt: serverTimestamp()

            }
        );


        console.log(
            "Audit log created:",
            action
        );

    }

    catch (error) {

        console.error(
            "Error creating audit log:",
            error
        );

    }

}
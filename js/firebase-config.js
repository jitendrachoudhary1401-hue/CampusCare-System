
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";
const firebaseConfig = {
    apiKey: "AIzaSyDvrZyLTp6dyvK1nT6oaO88Zp4jpG5dUoU",
    authDomain: "college-complaint-portal-e0a49.firebaseapp.com",
    projectId: "college-complaint-portal-e0a49",
    storageBucket: "college-complaint-portal-e0a49.firebasestorage.app",
    messagingSenderId: "663789284022",
    appId: "1:663789284022:web:96142b9dc7899637de1417"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app, "default");
const storage = getStorage(app);

export { app, auth, db, storage };
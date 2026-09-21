// ============================================================
// HASNAIN VEHICLE EXPORTER
// Firebase Configuration
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ============================================================
// FIREBASE PROJECT CONFIGURATION
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyC_O0pbiwX4T4JqEyn-9iHacP2xNLqUvGY",
    authDomain: "hasnainvehicleexporter9048.firebaseapp.com",
    projectId: "hasnainvehicleexporter9048",
    storageBucket: "hasnainvehicleexporter9048.firebasestorage.app",
    messagingSenderId: "809667256400",
    appId: "1:809667256400:web:63f3f825ffa805024e3155",
    measurementId: "G-78SPE8THNW"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);


// ============================================================
// FIREBASE SERVICES
// ============================================================

export const auth = getAuth(app);

export const db = getFirestore(app);


// ============================================================
// KEEP ADMIN LOGGED IN
// ============================================================

setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.error(
            "Firebase authentication persistence error:",
            error
        );
    });


// ============================================================
// ONLY AUTHORIZED ADMIN
// ============================================================

export const ADMIN_EMAIL =
    "hasnainvehicleexporter@gmail.com";


// ============================================================
// CLOUDINARY
// ============================================================

export const CLOUDINARY_CLOUD_NAME =
    "xa9mgdhb";

export const CLOUDINARY_UPLOAD_PRESET =
    "hve_vehicle_images";

export const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

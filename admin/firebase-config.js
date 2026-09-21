// ============================================================
// HASNAIN VEHICLE EXPORTER
// Firebase + Cloudinary Configuration
// ============================================================

export const firebaseConfig = {
  apiKey: "AIzaSyC_O0pbiX4T4JqEyn-9iHacP2xNLqUvGY",
  authDomain: "hasnainvehicleexporter9048.firebaseapp.com",
  projectId: "hasnainvehicleexporter9048",
  storageBucket: "hasnainvehicleexporter9048.firebasestorage.app",
  messagingSenderId: "809667256400",
  appId: "1:809667256400:web:63f3f825ffa805024e3155",
  measurementId: "G-78SPE8THNW"
};

// ============================================================
// AUTHORIZED HVE DASHBOARD ADMINS
// ============================================================

export const ADMIN_EMAILS = [
  "hasnainvehicleexporter@gmail.com",
  "rh531790@gmail.com"
];

// ============================================================
// CLOUDINARY
// ============================================================

export const CLOUDINARY_CLOUD_NAME = "xa9mgdhb";

export const CLOUDINARY_UPLOAD_PRESET = "hve_vehicle_images";

export const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

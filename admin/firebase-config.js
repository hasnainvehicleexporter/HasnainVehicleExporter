// Firebase web configuration for Hasnain Vehicle Exporter.
// This client-side config is safe to include in the website.
// Security is enforced by Firebase Authentication + Firestore Rules.

export const firebaseConfig = {
  apiKey: "AIzaSyC_O0pbiwX4T4JqEyn-9iHacP2xNLqUvGY",
  authDomain: "hasnainvehicleexporter9048.firebaseapp.com",
  projectId: "hasnainvehicleexporter9048",
  storageBucket: "hasnainvehicleexporter9048.firebasestorage.app",
  messagingSenderId: "809667256400",
  appId: "1:809667256400:web:63f3f825ffa805024e3155",
  measurementId: "G-78SPE8THNW"
};

export const ADMIN_EMAILS = [
  "hasnainvehicleexporter@gmail.com",
  "rh531790@gmail.com"
];

// Cloudinary unsigned browser upload settings.
export const CLOUDINARY_CLOUD_NAME = "xa9mgdhb";
export const CLOUDINARY_UPLOAD_PRESET = "hve_vehicle_images";
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

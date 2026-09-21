import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    limit
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* =====================================================
   FIREBASE CONFIG
   ===================================================== */

const firebaseConfig = {
    apiKey: "AIzaSyC_O0pbiX4T4JqEyn-9iHacP2xNLqUvGY",
    authDomain: "hasnainvehicleexporter9048.firebaseapp.com",
    projectId: "hasnainvehicleexporter9048",
    storageBucket: "hasnainvehicleexporter9048.firebasestorage.app",
    messagingSenderId: "809667256400",
    appId: "1:809667256400:web:63f3f825ffa805024e3155",
    measurementId: "G-78SPE8THNW"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =====================================================
   ELEMENT
   ===================================================== */

const grid = document.getElementById("homeVehicleGrid");

if (!grid) {
    console.warn("homeVehicleGrid not found.");
}


/* =====================================================
   HELPERS
   ===================================================== */

function getValue(data, ...keys) {

    for (const key of keys) {

        if (
            data[key] !== undefined &&
            data[key] !== null &&
            data[key] !== ""
        ) {
            return data[key];
        }

    }

    return "";
}


function getFirstImage(data) {

    const images = getValue(
        data,
        "images",
        "imageUrls",
        "photos"
    );

    if (Array.isArray(images) && images.length > 0) {
        return images[0];
    }

    if (typeof images === "string" && images.trim()) {
        return images;
    }

    if (data.image) {
        return data.image;
    }

    return "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1000&q=85";
}


/* =====================================================
   CREATE CARD
   ===================================================== */

function createVehicleCard(id, data) {

    const make = getValue(data, "make", "brand");
    const model = getValue(data, "model");
    const year = getValue(data, "year");
    const mileage = getValue(data, "mileage");
    const engine = getValue(data, "engine");
    const fuel = getValue(data, "fuel", "fuelType");
    const transmission = getValue(
        data,
        "transmission",
        "gearbox"
    );

    const title = `${make} ${model}`.trim();

    const image = getFirstImage(data);

    const ref = getValue(
        data,
        "ref",
        "referenceNumber",
        "reference"
    );

    const status = String(
        getValue(data, "status") || "Available"
    ).toLowerCase();


    const card = document.createElement("article");

    card.className = "home-vehicle-card";


    card.innerHTML = `

        <div class="home-vehicle-image">

            <img
                src="${image}"
                alt="${title}"
                loading="lazy"
                onerror="this.src='https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1000&q=85'"
            >

            <div class="home-japan-badge">
                <span>🇯🇵</span>
                JAPAN
            </div>

        </div>


        <div class="home-vehicle-body">

            <h3>
                ${title || "Japanese Vehicle"}
            </h3>


            <div class="home-vehicle-specs">

                <div class="home-vehicle-spec">
                    📅
                    <strong>${year || "—"}</strong>
                </div>

                <div class="home-vehicle-spec">
                    ⏱
                    <strong>${mileage || "—"}</strong>
                </div>

                <div class="home-vehicle-spec">
                    ⚙
                    ${engine || fuel || "—"}
                </div>

                <div class="home-vehicle-spec">
                    ⇄
                    ${transmission || "—"}
                </div>

            </div>


            <div class="home-vehicle-price">

                Request Country-Specific Quote

                <span>
                    ${ref ? ` • ${ref}` : ""}
                </span>

            </div>


            <a
                class="home-vehicle-button"
                href="vehicle-details.html?id=${encodeURIComponent(id)}"
            >
                View Vehicle
            </a>

        </div>

    `;


    return card;
}


/* =====================================================
   LOAD VEHICLES
   ===================================================== */

async function loadHomeVehicles() {

    if (!grid) return;

    try {

        const vehiclesRef = collection(db, "vehicles");


        /*
         * Only show Available vehicles.
         * Maximum 8 vehicles on homepage.
         */

        const vehiclesQuery = query(
            vehiclesRef,
            where("status", "==", "Available"),
            limit(8)
        );


        const snapshot = await getDocs(vehiclesQuery);


        grid.innerHTML = "";


        if (snapshot.empty) {

            grid.innerHTML = `
                <div class="home-vehicle-empty">
                    No vehicles are currently available.
                </div>
            `;

            return;
        }


        snapshot.forEach((doc) => {

            const card = createVehicleCard(
                doc.id,
                doc.data()
            );

            grid.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Error loading homepage vehicles:",
            error
        );

        grid.innerHTML = `
            <div class="home-vehicle-empty">
                Vehicles are temporarily unavailable.
                Please contact us on WhatsApp.
            </div>
        `;

    }

}


/* =====================================================
   START
   ===================================================== */

loadHomeVehicles();

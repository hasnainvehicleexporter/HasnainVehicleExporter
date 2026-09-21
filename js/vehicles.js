/* =====================================================
   HASNAIN VEHICLE EXPORTER
   BROWSE VEHICLES JAVASCRIPT
   ===================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



/* =====================================================
   FIREBASE CONFIG
   ===================================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyC_O0pbiX4T4JqEyn-9iHacP2xNLqUvGY",

    authDomain:
        "hasnainvehicleexporter9048.firebaseapp.com",

    projectId:
        "hasnainvehicleexporter9048",

    storageBucket:
        "hasnainvehicleexporter9048.firebasestorage.app",

    messagingSenderId:
        "809667256400",

    appId:
        "1:809667256400:web:63f3f825ffa805024e3155",

    measurementId:
        "G-78SPE8THNW"

};



/* =====================================================
   INITIALIZE FIREBASE
   ===================================================== */

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);



/* =====================================================
   ELEMENTS
   ===================================================== */

const vehicleGrid =
    document.getElementById("vehicleGrid");

const loadingMessage =
    document.getElementById("loadingMessage");

const noVehicles =
    document.getElementById("noVehicles");

const searchInput =
    document.getElementById("vehicleSearch");

const regionFilter =
    document.getElementById("regionFilter");

const statusFilter =
    document.getElementById("statusFilter");



/* =====================================================
   VARIABLES
   ===================================================== */

let vehicles = [];



/* =====================================================
   FALLBACK VEHICLE IMAGE
   ===================================================== */

const fallbackImage =
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85";



/* =====================================================
   SAFE VALUE
   ===================================================== */

function valueOf(vehicle, ...keys) {

    for (const key of keys) {

        if (
            vehicle[key] !== undefined &&
            vehicle[key] !== null &&
            vehicle[key] !== ""
        ) {

            return vehicle[key];

        }

    }

    return "";

}



/* =====================================================
   GET VEHICLE IMAGE
   ===================================================== */

function getVehicleImage(vehicle) {

    const images =
        valueOf(
            vehicle,
            "images",
            "imageUrls",
            "photos"
        );


    if (Array.isArray(images) && images.length > 0) {

        return images[0];

    }


    if (
        typeof images === "string" &&
        images.trim() !== ""
    ) {

        return images;

    }


    if (
        vehicle.image &&
        typeof vehicle.image === "string"
    ) {

        return vehicle.image;

    }


    return fallbackImage;

}



/* =====================================================
   NORMALIZE VEHICLE
   ===================================================== */

function normalizeVehicle(doc) {

    const data =
        doc.data();


    const make =
        valueOf(
            data,
            "make",
            "brand"
        );


    const model =
        valueOf(
            data,
            "model"
        );


    const year =
        valueOf(
            data,
            "year"
        );


    const title =
        [make, model]
            .filter(Boolean)
            .join(" ");


    return {

        id: doc.id,

        ref:
            valueOf(
                data,
                "ref",
                "referenceNumber",
                "reference"
            ) || "HVE",

        title:
            title ||
            "Japanese Vehicle",

        year:
            year ||
            "",

        mileage:
            valueOf(
                data,
                "mileage"
            ) || "—",

        engine:
            valueOf(
                data,
                "engine"
            ) || "—",

        fuel:
            valueOf(
                data,
                "fuel"
            ) || "—",

        transmission:
            valueOf(
                data,
                "transmission"
            ) || "—",

        region:
            valueOf(
                data,
                "region",
                "market"
            ) || "",

        status:
            valueOf(
                data,
                "status"
            ) || "Available",

        image:
            getVehicleImage(data)

    };

}



/* =====================================================
   LOAD VEHICLES
   ===================================================== */

async function loadVehicles() {

    try {

        loadingMessage.classList.remove("hidden");

        noVehicles.classList.add("hidden");

        vehicleGrid.innerHTML = "";


        const snapshot =
            await getDocs(
                collection(db, "vehicles")
            );


        vehicles =
            snapshot.docs.map(
                normalizeVehicle
            );


        loadingMessage.classList.add("hidden");


        renderVehicles();


    } catch (error) {

        console.error(
            "Firebase vehicle loading error:",
            error
        );


        loadingMessage.textContent =
            "Unable to load vehicles. Please refresh the page.";


    }

}



/* =====================================================
   RENDER VEHICLES
   ===================================================== */

function renderVehicles() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const region =
        regionFilter.value;


    const status =
        statusFilter.value;


    const filtered =
        vehicles.filter(vehicle => {


            const searchableText =
                `
                ${vehicle.title}
                ${vehicle.year}
                ${vehicle.ref}
                ${vehicle.engine}
                ${vehicle.fuel}
                ${vehicle.transmission}
                `
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchableText.includes(search);


            const matchesRegion =
                region === "all" ||
                vehicle.region === region;


            const matchesStatus =
                status === "all" ||
                vehicle.status === status;


            return (
                matchesSearch &&
                matchesRegion &&
                matchesStatus
            );

        });


    vehicleGrid.innerHTML = "";


    if (filtered.length === 0) {

        noVehicles.classList.remove("hidden");

        return;

    }


    noVehicles.classList.add("hidden");


    filtered.forEach(vehicle => {

        vehicleGrid.appendChild(
            createVehicleCard(vehicle)
        );

    });

}



/* =====================================================
   CREATE VEHICLE CARD
   ===================================================== */

function createVehicleCard(vehicle) {

    const card =
        document.createElement("article");


    card.className =
        "vehicle-card";


    const isSold =
        vehicle.status.toLowerCase() === "sold";


    const statusClass =
        isSold ? "sold" : "";


    const yearText =
        vehicle.year
            ? vehicle.year
            : "";


    card.innerHTML = `

        <div class="vehicle-image">

            <img
                src="${escapeHtml(vehicle.image)}"
                alt="${escapeHtml(vehicle.title)}"
                loading="lazy"
                onerror="this.src='${fallbackImage}'"
            >

            <div class="vehicle-status ${statusClass}">
                ${escapeHtml(vehicle.status)}
            </div>

            ${
                isSold
                ?
                `
                <div class="sold-watermark">
                    SOLD
                </div>
                `
                :
                ""
            }

        </div>


        <div class="vehicle-content">

            <div class="vehicle-ref">
                ${escapeHtml(vehicle.ref)}
            </div>


            <h3 class="vehicle-name">
                ${escapeHtml(vehicle.title)}
                ${yearText ? ` ${escapeHtml(yearText)}` : ""}
            </h3>


            <div class="vehicle-specs">

                <div class="vehicle-spec">
                    ${escapeHtml(vehicle.mileage)} km
                </div>

                <div class="vehicle-spec">
                    ${escapeHtml(vehicle.engine)}
                </div>

                <div class="vehicle-spec">
                    ${escapeHtml(vehicle.fuel)}
                </div>

                <div class="vehicle-spec">
                    ${escapeHtml(vehicle.transmission)}
                </div>

            </div>


            <div class="vehicle-price">

                Price

                <strong>
                    Request Country-Specific Quote
                </strong>

            </div>


            <a
                class="vehicle-details-button"
                href="vehicle-details.html?id=${encodeURIComponent(vehicle.id)}"
            >

                View Details

            </a>

        </div>

    `;


    return card;

}



/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}



/* =====================================================
   FILTER EVENTS
   ===================================================== */

searchInput.addEventListener(
    "input",
    renderVehicles
);


regionFilter.addEventListener(
    "change",
    renderVehicles
);


statusFilter.addEventListener(
    "change",
    renderVehicles
);



/* =====================================================
   MOBILE MENU
   ===================================================== */

const menuToggle =
    document.getElementById("menuToggle");

const mainNav =
    document.getElementById("mainNav");


menuToggle.addEventListener(
    "click",
    () => {

        const opened =
            mainNav.classList.toggle("open");


        menuToggle.setAttribute(
            "aria-expanded",
            opened
        );

    }
);



/* CLOSE MOBILE MENU */

mainNav
    .querySelectorAll("a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                mainNav.classList.remove("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }
        );

    });



/* =====================================================
   YEAR
   ===================================================== */

const currentYear =
    document.getElementById("currentYear");


currentYear.textContent =
    new Date().getFullYear();



/* =====================================================
   START
   ===================================================== */

loadVehicles();

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyC_O0pbiwX4T4JqEyn-9iHacP2xNLqUvGY",

    authDomain:
        "hasnainvehicleexporter9048.firebaseapp.com",

    projectId:
        "hasnainvehicleexporter9048",

    storageBucket:
        "hasnainvehicleexporter9048.firebasestorage.app",

    messagingSenderId:
        "809667256400",

    appId:
        "1:809667256400:web:63f3f825ffa805024e3155"

};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


const vehicleGrid =
    document.getElementById("vehicleGrid");

const catalogStatus =
    document.getElementById("catalogStatus");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("vehicleSearch");

const statusFilter =
    document.getElementById("statusFilter");

const regionFilter =
    document.getElementById("regionFilter");


let vehicles = [];


/* LOAD VEHICLES */

async function loadVehicles() {

    try {

        catalogStatus.textContent =
            "Loading vehicles...";

        const snapshot =
            await getDocs(
                collection(db, "vehicles")
            );

        vehicles = snapshot.docs.map(doc => ({

            id: doc.id,

            ...doc.data()

        }));

        renderVehicles();

    } catch (error) {

        console.error(error);

        catalogStatus.textContent =
            "Unable to load vehicles.";

    }

}


/* FILTER */

function getFilteredVehicles() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const status =
        statusFilter.value;

    const region =
        regionFilter.value;


    return vehicles.filter(vehicle => {

        const searchable = [

            vehicle.ref,

            vehicle.referenceNumber,

            vehicle.make,

            vehicle.model,

            vehicle.year,

            vehicle.description

        ]

        .filter(Boolean)
        .join(" ")
        .toLowerCase();


        const matchesSearch =
            !search ||
            searchable.includes(search);


        const vehicleStatus =
            vehicle.status || "Available";


        const matchesStatus =
            status === "all" ||
            vehicleStatus.toLowerCase() ===
            status.toLowerCase();


        const matchesRegion =
            region === "all" ||
            vehicle.region === region;


        return (
            matchesSearch &&
            matchesStatus &&
            matchesRegion
        );

    });

}


/* RENDER */

function renderVehicles() {

    const filtered =
        getFilteredVehicles();


    vehicleGrid.innerHTML = "";

    catalogStatus.textContent =
        `${filtered.length} vehicle${filtered.length === 1 ? "" : "s"} available`;


    if (!filtered.length) {

        emptyState.hidden = false;

        return;

    }


    emptyState.hidden = true;


    filtered.forEach(vehicle => {

        vehicleGrid.appendChild(
            createVehicleCard(vehicle)
        );

    });

}


/* CARD */

function createVehicleCard(vehicle) {

    const card =
        document.createElement("article");

    card.className =
        "vehicle-card";


    const images =
        Array.isArray(vehicle.images)
            ? vehicle.images
            : [];


    const image =
        images[0] ||
        "images/vehicle-placeholder.jpg";


    const reference =
        vehicle.ref ||
        vehicle.referenceNumber ||
        vehicle.id;


    const status =
        vehicle.status ||
        "Available";


    const isSold =
        status.toLowerCase() === "sold";


    card.innerHTML = `

        <div class="vehicle-card-image">

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(vehicle.make || "")} ${escapeHTML(vehicle.model || "")}"
                loading="lazy">

            <div class="vehicle-ref">
                ${escapeHTML(reference)}
            </div>

            <div class="vehicle-status ${isSold ? "sold" : ""}">
                ${escapeHTML(status)}
            </div>

            ${isSold ? `
                <div class="sold-watermark">
                    SOLD
                </div>
            ` : ""}

        </div>


        <div class="vehicle-card-content">

            <h2>
                ${escapeHTML(vehicle.make || "")}
                ${escapeHTML(vehicle.model || "")}
            </h2>

            <div class="vehicle-meta">

                ${escapeHTML(vehicle.year || "")}

                ${vehicle.mileage
                    ? ` • ${escapeHTML(vehicle.mileage)}`
                    : ""}

            </div>


            <div class="vehicle-specs">

                ${vehicle.engine
                    ? `<div class="vehicle-spec">
                        ${escapeHTML(vehicle.engine)}
                       </div>`
                    : ""}

                ${vehicle.fuel
                    ? `<div class="vehicle-spec">
                        ${escapeHTML(vehicle.fuel)}
                       </div>`
                    : ""}

                ${vehicle.transmission
                    ? `<div class="vehicle-spec">
                        ${escapeHTML(vehicle.transmission)}
                       </div>`
                    : ""}

                ${vehicle.drive
                    ? `<div class="vehicle-spec">
                        ${escapeHTML(vehicle.drive)}
                       </div>`
                    : ""}

            </div>


            <div class="vehicle-price">

                Country-specific quotation

            </div>


            <a
                class="vehicle-button"
                href="vehicle-details.html?id=${encodeURIComponent(vehicle.id)}">

                ${isSold ? "View Details" : "View Vehicle"}

            </a>

        </div>

    `;


    return card;

}


/* BASIC HTML ESCAPE */

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* EVENTS */

searchInput.addEventListener(
    "input",
    renderVehicles
);

statusFilter.addEventListener(
    "change",
    renderVehicles
);

regionFilter.addEventListener(
    "change",
    renderVehicles
);


/* YEAR */

const yearElement =
    document.getElementById("currentYear");

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


/* START */

loadVehicles();

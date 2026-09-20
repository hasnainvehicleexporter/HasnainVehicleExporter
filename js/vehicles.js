import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
   ========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyC_O0pbiXw4T4JqEyn-9iHacP2xNLqUvGY",

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


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =========================================================
   AFRICA — 54 COUNTRIES
   ========================================================= */

const AFRICA = [

    "Algeria",
    "Angola",
    "Benin",
    "Botswana",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cameroon",
    "Central African Republic",
    "Chad",
    "Comoros",
    "Democratic Republic of the Congo",
    "Djibouti",
    "Egypt",
    "Equatorial Guinea",
    "Eritrea",
    "Eswatini",
    "Ethiopia",
    "Gabon",
    "Gambia",
    "Ghana",
    "Guinea",
    "Guinea-Bissau",
    "Ivory Coast",
    "Kenya",
    "Lesotho",
    "Liberia",
    "Libya",
    "Madagascar",
    "Malawi",
    "Mali",
    "Mauritania",
    "Mauritius",
    "Morocco",
    "Mozambique",
    "Namibia",
    "Niger",
    "Nigeria",
    "Republic of the Congo",
    "Rwanda",
    "Sao Tome and Principe",
    "Senegal",
    "Seychelles",
    "Sierra Leone",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Sudan",
    "Tanzania",
    "Togo",
    "Tunisia",
    "Uganda",
    "Zambia",
    "Zimbabwe"

];


/* =========================================================
   CARIBBEAN — 16 INDEPENDENT COUNTRIES
   ========================================================= */

const CARIBBEAN = [

    "Antigua and Barbuda",
    "Bahamas",
    "Barbados",
    "Belize",
    "Cuba",
    "Dominica",
    "Dominican Republic",
    "Grenada",
    "Guyana",
    "Haiti",
    "Jamaica",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Suriname",
    "Trinidad and Tobago"

];


const ALL_COUNTRIES = [
    ...AFRICA,
    ...CARIBBEAN
].sort();


/* =========================================================
   ELEMENTS
   ========================================================= */

const grid =
    document.getElementById("vehicleGrid");

const count =
    document.getElementById("vehicleCount");

const emptyState =
    document.getElementById("emptyState");

const search =
    document.getElementById("vehicleSearch");

const statusFilter =
    document.getElementById("statusFilter");

const regionFilter =
    document.getElementById("regionFilter");

const countryFilter =
    document.getElementById("countryFilter");

const clearFilters =
    document.getElementById("clearFilters");

const emptyClear =
    document.getElementById("emptyClear");


let vehicles = [];


/* =========================================================
   COUNTRY FILTER
   ========================================================= */

function populateCountries() {

    countryFilter.innerHTML = `
        <option value="all">
            All Countries
        </option>
    `;

    ALL_COUNTRIES.forEach(country => {

        const option =
            document.createElement("option");

        option.value = country;

        option.textContent = country;

        countryFilter.appendChild(option);

    });

}


/* =========================================================
   HELPERS
   ========================================================= */

function firstValue(obj, keys, fallback = "") {

    for (const key of keys) {

        if (
            obj[key] !== undefined &&
            obj[key] !== null &&
            obj[key] !== ""
        ) {

            return obj[key];

        }

    }

    return fallback;

}


function getImages(vehicle) {

    let images =
        firstValue(
            vehicle,
            [
                "images",
                "imageUrls",
                "photos",
                "gallery"
            ],
            []
        );


    if (!Array.isArray(images)) {

        images = images
            ? [images]
            : [];

    }


    return images.filter(Boolean);

}


function getReference(vehicle) {

    return firstValue(
        vehicle,
        [
            "referenceNumber",
            "ref",
            "reference",
            "hveRef"
        ],
        "HVE-0000"
    );

}


function getName(vehicle) {

    const make =
        firstValue(
            vehicle,
            ["make", "brand"],
            ""
        );

    const model =
        firstValue(
            vehicle,
            ["model", "vehicleModel"],
            ""
        );


    return `${make} ${model}`.trim()
        || "Japanese Vehicle";

}


function normalizeStatus(status) {

    return String(status || "Available")
        .trim()
        .toLowerCase();

}


function getImage(vehicle) {

    const images =
        getImages(vehicle);

    return images[0]
        || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=85";

}


/* =========================================================
   LOAD FIRESTORE
   ========================================================= */

async function loadVehicles() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "vehicles")
            );


        vehicles =
            snapshot.docs.map(doc => ({

                id: doc.id,

                ...doc.data()

            }));


        renderVehicles();

    }

    catch (error) {

        console.error(error);

        grid.innerHTML = `

            <div class="loading-box">

                <h2>
                    Unable to Load Vehicles
                </h2>

                <p>
                    Please refresh the page.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   FILTER
   ========================================================= */

function filterVehicles() {

    const term =
        search.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value.toLowerCase();


    const selectedRegion =
        regionFilter.value;


    const selectedCountry =
        countryFilter.value;


    return vehicles.filter(vehicle => {

        const name =
            getName(vehicle)
                .toLowerCase();


        const reference =
            getReference(vehicle)
                .toLowerCase();


        const year =
            String(
                firstValue(
                    vehicle,
                    ["year"],
                    ""
                )
            ).toLowerCase();


        const country =
            String(
                firstValue(
                    vehicle,
                    ["country", "destinationCountry"],
                    ""
                )
            );


        const region =
            String(
                firstValue(
                    vehicle,
                    ["region", "market"],
                    ""
                )
            );


        const status =
            normalizeStatus(
                firstValue(
                    vehicle,
                    ["status"],
                    "Available"
                )
            );


        const searchMatch =
            !term
            ||
            name.includes(term)
            ||
            reference.includes(term)
            ||
            year.includes(term)
            ||
            country.toLowerCase()
                .includes(term)
            ||
            region.toLowerCase()
                .includes(term);


        const statusMatch =
            selectedStatus === "all"
            ||
            status === selectedStatus;


        const regionMatch =
            selectedRegion === "all"
            ||
            region.toLowerCase()
                === selectedRegion.toLowerCase();


        const countryMatch =
            selectedCountry === "all"
            ||
            country === selectedCountry;


        return (
            searchMatch &&
            statusMatch &&
            regionMatch &&
            countryMatch
        );

    });

}


/* =========================================================
   RENDER
   ========================================================= */

function renderVehicles() {

    const filtered =
        filterVehicles();


    count.textContent =
        filtered.length;


    if (!filtered.length) {

        grid.innerHTML = "";

        emptyState.hidden = false;

        return;

    }


    emptyState.hidden = true;


    grid.innerHTML =
        filtered
            .map(createCard)
            .join("");

}


/* =========================================================
   CARD
   ========================================================= */

function createCard(vehicle) {

    const name =
        getName(vehicle);


    const reference =
        getReference(vehicle);


    const image =
        getImage(vehicle);


    const year =
        firstValue(
            vehicle,
            ["year"],
            "—"
        );


    const mileage =
        firstValue(
            vehicle,
            ["mileage"],
            "—"
        );


    const engine =
        firstValue(
            vehicle,
            ["engine"],
            "—"
        );


    const fuel =
        firstValue(
            vehicle,
            ["fuel"],
            "—"
        );


    const transmission =
        firstValue(
            vehicle,
            ["transmission"],
            "—"
        );


    const status =
        normalizeStatus(
            firstValue(
                vehicle,
                ["status"],
                "Available"
            )
        );


    const statusClass =
        status === "sold"
            ? "status-sold"
            : status.includes("transit")
                ? "status-transit"
                : "status-available";


    const statusText =
        status
            .replace(/\b\w/g, l => l.toUpperCase());


    const sold =
        status === "sold";


    return `

        <article class="vehicle-card">

            <div class="vehicle-image">

                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(name)}"
                    loading="lazy"
                    onerror="
                        this.src='https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=85';
                    ">

                <span class="vehicle-ref">
                    ${escapeHtml(reference)}
                </span>

                <span class="vehicle-status ${statusClass}">
                    ${escapeHtml(statusText)}
                </span>

                ${
                    sold
                    ? `<span class="sold-watermark">
                        SOLD
                       </span>`
                    : ""
                }

            </div>


            <div class="vehicle-content">

                <h2>
                    ${escapeHtml(name)}
                </h2>

                <p class="vehicle-subtitle">
                    Japanese Vehicle
                </p>


                <div class="vehicle-specs">

                    <div class="vehicle-spec">
                        <label>Year</label>
                        <span>${escapeHtml(year)}</span>
                    </div>

                    <div class="vehicle-spec">
                        <label>Mileage</label>
                        <span>${escapeHtml(mileage)}</span>
                    </div>

                    <div class="vehicle-spec">
                        <label>Engine</label>
                        <span>${escapeHtml(engine)}</span>
                    </div>

                    <div class="vehicle-spec">
                        <label>Fuel</label>
                        <span>${escapeHtml(fuel)}</span>
                    </div>

                    <div class="vehicle-spec">
                        <label>Transmission</label>
                        <span>${escapeHtml(transmission)}</span>
                    </div>

                </div>


                <div class="vehicle-price">

                    <strong>
                        Price: Request Country-Specific Quote
                    </strong>

                    Destination country affects
                    shipping and final quotation.

                </div>


                <a
                    class="view-vehicle-btn"
                    href="vehicle-details.html?id=${encodeURIComponent(vehicle.id)}">

                    View Vehicle Details

                </a>

            </div>

        </article>

    `;

}


/* =========================================================
   ESCAPE
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   EVENTS
   ========================================================= */

[
    search,
    statusFilter,
    regionFilter,
    countryFilter
].forEach(element => {

    element.addEventListener(
        "input",
        renderVehicles
    );

    element.addEventListener(
        "change",
        renderVehicles
    );

});


function resetFilters() {

    search.value = "";

    statusFilter.value = "all";

    regionFilter.value = "all";

    countryFilter.value = "all";

    renderVehicles();

}


clearFilters.addEventListener(
    "click",
    resetFilters
);


emptyClear.addEventListener(
    "click",
    resetFilters
);


/* =========================================================
   MOBILE NAV
   ========================================================= */

const menuBtn =
    document.getElementById(
        "mobileMenuBtn"
    );

const mainNav =
    document.getElementById(
        "mainNav"
    );


menuBtn.addEventListener(
    "click",
    () => {

        mainNav.classList.toggle(
            "open"
        );

    }
);


mainNav
    .querySelectorAll("a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                mainNav.classList.remove(
                    "open"
                );

            }
        );

    });


/* YEAR */

document.getElementById(
    "currentYear"
).textContent =
    new Date().getFullYear();


/* START */

populateCountries();

loadVehicles();

/* =========================================================
   HASNAIN VEHICLE EXPORTER
   BROWSE VEHICLES JAVASCRIPT
   Firebase + Firestore
   ========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyC_O0pbiX4T4JqEyn-9iHacP2xNLqUvGY",

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


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =========================================================
   ELEMENTS
   ========================================================= */

const vehicleGrid =
    document.getElementById("vehicleGrid");

const resultsCount =
    document.getElementById("resultsCount");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const regionFilter =
    document.getElementById("regionFilter");

const countryFilter =
    document.getElementById("countryFilter");

const sortSelect =
    document.getElementById("sortSelect");

const clearFilters =
    document.getElementById("clearFilters");


/* =========================================================
   AFRICA — 54 COUNTRIES
   ========================================================= */

const AFRICA_COUNTRIES = [

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
    "Republic of the Congo",
    "Cote d'Ivoire",
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
   CARIBBEAN — INDEPENDENT COUNTRIES
   ========================================================= */

const CARIBBEAN_COUNTRIES = [

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


/* =========================================================
   ALL COUNTRIES
   ========================================================= */

const ALL_COUNTRIES = [
    ...AFRICA_COUNTRIES,
    ...CARIBBEAN_COUNTRIES
].sort();


/* =========================================================
   FALLBACK VEHICLE IMAGE
   ========================================================= */

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=85";


/* =========================================================
   VEHICLE DATA
   ========================================================= */

let allVehicles = [];


/* =========================================================
   COUNTRY FILTER
   ========================================================= */

function populateCountryFilter() {

    if (!countryFilter) {
        return;
    }

    countryFilter.innerHTML = "";

    const allOption =
        document.createElement("option");

    allOption.value = "";

    allOption.textContent =
        "All Countries";

    countryFilter.appendChild(allOption);


    const africaGroup =
        document.createElement("optgroup");

    africaGroup.label =
        "Africa";


    AFRICA_COUNTRIES
        .slice()
        .sort()
        .forEach(country => {

            const option =
                document.createElement("option");

            option.value = country;

            option.textContent = country;

            africaGroup.appendChild(option);

        });


    countryFilter.appendChild(africaGroup);


    const caribbeanGroup =
        document.createElement("optgroup");

    caribbeanGroup.label =
        "Caribbean";


    CARIBBEAN_COUNTRIES
        .slice()
        .sort()
        .forEach(country => {

            const option =
                document.createElement("option");

            option.value = country;

            option.textContent = country;

            caribbeanGroup.appendChild(option);

        });


    countryFilter.appendChild(caribbeanGroup);
}


/* =========================================================
   HELPERS
   ========================================================= */

function getValue(vehicle, fields) {

    for (const field of fields) {

        if (
            vehicle[field] !== undefined &&
            vehicle[field] !== null &&
            vehicle[field] !== ""
        ) {
            return vehicle[field];
        }

    }

    return "";
}


/* =========================================================
   IMAGE EXTRACTION
   ========================================================= */

function getVehicleImages(vehicle) {

    let images =
        getValue(vehicle, [
            "images",
            "imageUrls",
            "photos"
        ]);


    /* Single image field */

    if (!images) {

        const singleImage =
            getValue(vehicle, [
                "image",
                "photo",
                "imageUrl",
                "photoUrl"
            ]);

        if (singleImage) {
            images = [singleImage];
        }

    }


    /* Convert to array */

    if (!Array.isArray(images)) {

        if (typeof images === "string") {

            images = images
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);

        } else {

            images = [];

        }

    }


    /* Handle objects such as:
       {url: "..."}
       {secure_url: "..."}
    */

    images = images
        .map(image => {

            if (typeof image === "string") {
                return image;
            }

            if (image && typeof image === "object") {

                return (
                    image.url ||
                    image.secure_url ||
                    image.src ||
                    ""
                );

            }

            return "";

        })
        .filter(Boolean);


    if (images.length === 0) {
        images.push(FALLBACK_IMAGE);
    }


    return images;
}


/* =========================================================
   IMAGE ERROR FALLBACK
   ========================================================= */

function imageError(img) {

    if (
        img.dataset.fallbackUsed === "true"
    ) {
        return;
    }

    img.dataset.fallbackUsed = "true";

    img.src = FALLBACK_IMAGE;
}


/* =========================================================
   STATUS
   ========================================================= */

function normalizeStatus(status) {

    if (!status) {
        return "Available";
    }

    const value =
        String(status)
            .trim()
            .toLowerCase();


    if (
        value === "sold"
    ) {
        return "Sold";
    }


    if (
        value === "available"
    ) {
        return "Available";
    }


    if (
        value.includes("transit")
    ) {
        return "In Transit";
    }


    if (
        value.includes("arrival")
    ) {
        return "Port Arrival";
    }


    if (
        value.includes("departure")
    ) {
        return "Port Departure";
    }


    if (
        value.includes("purchased")
    ) {
        return "Purchased";
    }


    if (
        value.includes("delivered")
    ) {
        return "Delivered";
    }


    return String(status);
}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function getStatusClass(status) {

    const value =
        status.toLowerCase();


    if (value === "sold") {
        return "sold";
    }


    if (value === "available") {
        return "available";
    }


    if (
        value.includes("transit") ||
        value.includes("arrival") ||
        value.includes("departure")
    ) {
        return "transit";
    }


    return "";
}


/* =========================================================
   REGION
   ========================================================= */

function getRegion(vehicle) {

    const region =
        getValue(vehicle, [
            "region",
            "market"
        ]);


    if (region) {
        return String(region);
    }


    const country =
        getValue(vehicle, [
            "country",
            "destination"
        ]);


    if (
        AFRICA_COUNTRIES.includes(country)
    ) {
        return "Africa";
    }


    if (
        CARIBBEAN_COUNTRIES.includes(country)
    ) {
        return "Caribbean";
    }


    return "";
}


/* =========================================================
   VEHICLE REFERENCE
   ========================================================= */

function getReference(vehicle) {

    return getValue(vehicle, [
        "ref",
        "referenceNumber",
        "reference",
        "hveRef"
    ]) || "HVE-0000";
}


/* =========================================================
   VEHICLE NAME
   ========================================================= */

function getVehicleName(vehicle) {

    const make =
        getValue(vehicle, [
            "make",
            "brand"
        ]);


    const model =
        getValue(vehicle, [
            "model"
        ]);


    return (
        `${make} ${model}`
            .trim()
            || "Japanese Vehicle"
    );
}


/* =========================================================
   VEHICLE CARD
   ========================================================= */

function createVehicleCard(vehicle) {

    const ref =
        getReference(vehicle);


    const make =
        getValue(vehicle, [
            "make",
            "brand"
        ]) || "Vehicle";


    const model =
        getValue(vehicle, [
            "model"
        ]) || "";


    const year =
        getValue(vehicle, [
            "year"
        ]) || "—";


    const mileage =
        getValue(vehicle, [
            "mileage"
        ]) || "—";


    const engine =
        getValue(vehicle, [
            "engine"
        ]) || "—";


    const fuel =
        getValue(vehicle, [
            "fuel"
        ]) || "—";


    const transmission =
        getValue(vehicle, [
            "transmission"
        ]) || "—";


    const drive =
        getValue(vehicle, [
            "drive"
        ]) || "—";


    const status =
        normalizeStatus(
            getValue(vehicle, [
                "status"
            ])
        );


    const statusClass =
        getStatusClass(status);


    const region =
        getRegion(vehicle);


    const images =
        getVehicleImages(vehicle);


    const image =
        images[0];


    const documentId =
        vehicle.id;


    const card =
        document.createElement("article");


    card.className =
        "vehicle-card";


    const soldWatermark =
        status === "Sold"
            ? `
                <div class="sold-watermark">
                    SOLD
                </div>
              `
            : "";


    card.innerHTML = `

        <div class="vehicle-card-image">

            <img
                src="${escapeAttribute(image)}"
                alt="${escapeAttribute(make + " " + model)}"
                loading="lazy"
                onerror="imageError(this)"
            >

            <span
                class="vehicle-status ${statusClass}"
            >
                ${escapeHTML(status)}
            </span>


            ${
                region
                    ? `
                        <span class="vehicle-market">
                            ${escapeHTML(region)}
                        </span>
                      `
                    : ""
            }


            ${soldWatermark}

        </div>


        <div class="vehicle-card-content">


            <div class="vehicle-reference">

                ${escapeHTML(ref)}

            </div>


            <h3>
                ${escapeHTML(make)}
                ${escapeHTML(model)}
            </h3>


            <div class="vehicle-card-year">

                ${escapeHTML(String(year))}

            </div>


            <div class="vehicle-specs">


                <div class="vehicle-spec">

                    <strong>
                        KM:
                    </strong>

                    ${escapeHTML(String(mileage))}

                </div>


                <div class="vehicle-spec">

                    <strong>
                        Engine:
                    </strong>

                    ${escapeHTML(String(engine))}

                </div>


                <div class="vehicle-spec">

                    <strong>
                        Fuel:
                    </strong>

                    ${escapeHTML(String(fuel))}

                </div>


                <div class="vehicle-spec">

                    <strong>
                        Gear:
                    </strong>

                    ${escapeHTML(String(transmission))}

                </div>


            </div>


            <div class="vehicle-price">

                <span class="vehicle-price-label">
                    Price
                </span>

                <span class="vehicle-price-value">
                    Request Country-Specific Quote
                </span>

            </div>


            <div class="vehicle-card-actions">

                <a
                    href="vehicle-details.html?id=${encodeURIComponent(documentId)}"
                    class="btn"
                >
                    View Details
                </a>

            </div>

        </div>

    `;


    return card;
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHTML(value);
}


/* =========================================================
   FILTER VEHICLES
   ========================================================= */

function filterVehicles() {

    const search =
        (
            searchInput?.value || ""
        )
            .trim()
            .toLowerCase();


    const status =
        statusFilter?.value || "";


    const region =
        regionFilter?.value || "";


    const country =
        countryFilter?.value || "";


    let filtered =
        allVehicles.filter(vehicle => {


            const make =
                getValue(vehicle, [
                    "make",
                    "brand"
                ]);


            const model =
                getValue(vehicle, [
                    "model"
                ]);


            const year =
                getValue(vehicle, [
                    "year"
                ]);


            const ref =
                getReference(vehicle);


            const vehicleStatus =
                normalizeStatus(
                    getValue(vehicle, [
                        "status"
                    ])
                );


            const vehicleRegion =
                getRegion(vehicle);


            const vehicleCountry =
                getValue(vehicle, [
                    "country",
                    "destination"
                ]);


            const searchable =
                [
                    make,
                    model,
                    year,
                    ref,
                    vehicleStatus,
                    vehicleRegion,
                    vehicleCountry
                ]
                    .join(" ")
                    .toLowerCase();


            const matchesSearch =
                !search ||
                searchable.includes(search);


            const matchesStatus =
                !status ||
                vehicleStatus === status;


            const matchesRegion =
                !region ||
                vehicleRegion === region;


            const matchesCountry =
                !country ||
                vehicleCountry === country;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesRegion &&
                matchesCountry
            );

        });


    sortVehicles(filtered);


    renderVehicles(filtered);
}


/* =========================================================
   SORT
   ========================================================= */

function sortVehicles(vehicles) {

    const sort =
        sortSelect?.value || "newest";


    if (sort === "year-desc") {

        vehicles.sort((a, b) => {

            return Number(
                getValue(b, ["year"]) || 0
            ) -
            Number(
                getValue(a, ["year"]) || 0
            );

        });

        return;
    }


    if (sort === "year-asc") {

        vehicles.sort((a, b) => {

            return Number(
                getValue(a, ["year"]) || 0
            ) -
            Number(
                getValue(b, ["year"]) || 0
            );

        });

        return;
    }


    if (sort === "name-asc") {

        vehicles.sort((a, b) => {

            return getVehicleName(a)
                .localeCompare(
                    getVehicleName(b)
                );

        });

        return;
    }


    if (sort === "name-desc") {

        vehicles.sort((a, b) => {

            return getVehicleName(b)
                .localeCompare(
                    getVehicleName(a)
                );

        });

        return;
    }


    /* Newest / default */

    vehicles.sort((a, b) => {

        const aTime =
            a.createdAt?.seconds ||
            a.createdAt ||
            0;


        const bTime =
            b.createdAt?.seconds ||
            b.createdAt ||
            0;


        return Number(bTime) -
            Number(aTime);

    });
}


/* =========================================================
   RENDER VEHICLES
   ========================================================= */

function renderVehicles(vehicles) {

    if (!vehicleGrid) {
        return;
    }


    vehicleGrid.innerHTML = "";


    if (resultsCount) {

        resultsCount.innerHTML = `

            <strong>
                ${vehicles.length}
            </strong>

            ${
                vehicles.length === 1
                    ? " vehicle available"
                    : " vehicles available"
            }

        `;

    }


    if (vehicles.length === 0) {

        vehicleGrid.innerHTML = `

            <div class="no-results">

                <h3>
                    No Vehicles Found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

        return;
    }


    const fragment =
        document.createDocumentFragment();


    vehicles.forEach(vehicle => {

        fragment.appendChild(
            createVehicleCard(vehicle)
        );

    });


    vehicleGrid.appendChild(fragment);
}


/* =========================================================
   LOAD VEHICLES FROM FIRESTORE
   ========================================================= */

async function loadVehicles() {

    try {

        if (vehicleGrid) {

            vehicleGrid.innerHTML = `

                <div class="loading">

                    Loading vehicles...

                </div>

            `;

        }


        const snapshot =
            await getDocs(
                collection(db, "vehicles")
            );


        allVehicles = [];


        snapshot.forEach(docSnapshot => {

            allVehicles.push({

                id: docSnapshot.id,

                ...docSnapshot.data()

            });

        });


        console.log(
            "Hasnain Vehicle Exporter:",
            allVehicles.length,
            "vehicle(s) loaded."
        );


        filterVehicles();


    } catch (error) {

        console.error(
            "Vehicle loading error:",
            error
        );


        if (resultsCount) {

            resultsCount.innerHTML =
                "Unable to load vehicles";

        }


        if (vehicleGrid) {

            vehicleGrid.innerHTML = `

                <div class="no-results">

                    <h3>
                        Unable to Load Vehicles
                    </h3>

                    <p>
                        Please refresh the page and try again.
                    </p>

                    <p
                        style="
                            margin-top:12px;
                            color:#666;
                            font-size:11px;
                        "
                    >
                        ${escapeHTML(error.message || "Unknown error")}
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterVehicles
    );

}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterVehicles
    );

}


if (regionFilter) {

    regionFilter.addEventListener(
        "change",
        filterVehicles
    );

}


if (countryFilter) {

    countryFilter.addEventListener(
        "change",
        filterVehicles
    );

}


if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        filterVehicles
    );

}


if (clearFilters) {

    clearFilters.addEventListener(
        "click",
        function () {

            if (searchInput) {
                searchInput.value = "";
            }

            if (statusFilter) {
                statusFilter.value = "";
            }

            if (regionFilter) {
                regionFilter.value = "";
            }

            if (countryFilter) {
                countryFilter.value = "";
            }

            if (sortSelect) {
                sortSelect.value = "newest";
            }

            filterVehicles();

        }
    );

}


/* =========================================================
   START
   ========================================================= */

populateCountryFilter();

loadVehicles();

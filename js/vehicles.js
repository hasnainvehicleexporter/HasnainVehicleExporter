import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    ALL_COUNTRIES,
    AFRICA_COUNTRIES,
    CARIBBEAN_COUNTRIES,
    COUNTRY_REGION
} from "./countries.js";


/* =========================
   FIREBASE
========================= */

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


/* =========================
   DOM
========================= */

const grid =
    document.getElementById("vehicleGrid");

const count =
    document.getElementById("vehicleCount");

const empty =
    document.getElementById("vehicleEmpty");

const pagination =
    document.getElementById("vehiclePagination");

const searchInput =
    document.getElementById("vehicleSearch");

const statusFilter =
    document.getElementById("statusFilter");

const regionFilter =
    document.getElementById("regionFilter");

const countryFilter =
    document.getElementById("countryFilter");

const resetButton =
    document.getElementById("resetFilters");

const emptyReset =
    document.getElementById("emptyReset");


/* =========================
   STATE
========================= */

let allVehicles = [];

let filteredVehicles = [];

let currentPage = 1;

const ITEMS_PER_PAGE = 8;


/* =========================
   COUNTRY FILTER
========================= */

function populateCountries() {

    countryFilter.innerHTML = `
        <option value="all">
            All Countries
        </option>
    `;


    const africaGroup =
        document.createElement("optgroup");

    africaGroup.label = "Africa";


    AFRICA_COUNTRIES.forEach(country => {

        const option =
            document.createElement("option");

        option.value = country;

        option.textContent = country;

        africaGroup.appendChild(option);

    });


    countryFilter.appendChild(
        africaGroup
    );


    const caribbeanGroup =
        document.createElement("optgroup");

    caribbeanGroup.label = "Caribbean";


    CARIBBEAN_COUNTRIES.forEach(country => {

        const option =
            document.createElement("option");

        option.value = country;

        option.textContent = country;

        caribbeanGroup.appendChild(option);

    });


    countryFilter.appendChild(
        caribbeanGroup
    );

}


populateCountries();


/* =========================
   HELPERS
========================= */

function valueOf(vehicle, ...fields) {

    for (const field of fields) {

        const value = vehicle[field];

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            return value;

        }

    }

    return "";

}


function clean(value) {

    return String(value || "")
        .trim();

}


function lower(value) {

    return clean(value)
        .toLowerCase();

}


function escapeHTML(value) {

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function formatMileage(value) {

    if (!value) return "-";

    const number =
        Number(
            String(value)
                .replaceAll(",", "")
                .replace(/[^\d.]/g, "")
        );

    if (!Number.isNaN(number)) {

        return number.toLocaleString();

    }

    return value;

}


function getVehicleName(vehicle) {

    const make =
        valueOf(
            vehicle,
            "make",
            "brand",
            "manufacturer"
        );

    const model =
        valueOf(
            vehicle,
            "model",
            "name",
            "title"
        );

    if (make && model) {

        return `${make} ${model}`;

    }

    return model || make || "Japanese Vehicle";

}


function getStatus(vehicle) {

    return clean(
        valueOf(
            vehicle,
            "status",
            "availability"
        ) || "Available"
    );

}


function getRegion(vehicle) {

    const region =
        clean(
            valueOf(
                vehicle,
                "region",
                "market"
            )
        );

    return region || "Africa";

}


function getImages(vehicle) {

    const images =
        valueOf(
            vehicle,
            "images",
            "imageUrls",
            "photos",
            "photoUrls"
        );


    if (Array.isArray(images)) {

        return images.filter(Boolean);

    }


    if (typeof images === "string") {

        return images
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

    }


    return [];

}


function getFirstImage(vehicle) {

    const images =
        getImages(vehicle);

    if (images.length) {

        return images[0];

    }


    /*
     * Online fallback image.
     * This is only used if the vehicle has
     * no uploaded Cloudinary photo.
     */

    return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=85";

}


/* =========================
   LOAD VEHICLES
========================= */

async function loadVehicles() {

    try {

        count.textContent =
            "Loading vehicles...";


        const snapshot =
            await getDocs(
                collection(db, "vehicles")
            );


        allVehicles =
            snapshot.docs.map(doc => ({

                id: doc.id,

                ...doc.data()

            }));


        /*
         * Newest entries first.
         */

        allVehicles.sort((a, b) => {

            const aTime =
                a.createdAt?.seconds ||
                0;

            const bTime =
                b.createdAt?.seconds ||
                0;

            return bTime - aTime;

        });


        applyFilters();

    }

    catch (error) {

        console.error(
            "Vehicle loading error:",
            error
        );


        count.textContent =
            "Unable to load vehicles.";

        grid.innerHTML = `

            <div class="vehicle-load-error">

                <h3>
                    Vehicles could not be loaded
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}


/* =========================
   FILTER
========================= */

function applyFilters() {

    const search =
        lower(searchInput.value);

    const selectedStatus =
        lower(statusFilter.value);

    const selectedRegion =
        lower(regionFilter.value);

    const selectedCountry =
        countryFilter.value;


    filteredVehicles =
        allVehicles.filter(vehicle => {


            const name =
                getVehicleName(vehicle);


            const reference =
                valueOf(
                    vehicle,
                    "ref",
                    "referenceNumber",
                    "reference",
                    "stockNumber"
                );


            const description =
                valueOf(
                    vehicle,
                    "description"
                );


            const status =
                lower(getStatus(vehicle));


            const region =
                lower(getRegion(vehicle));


            const country =
                clean(
                    valueOf(
                        vehicle,
                        "country",
                        "destinationCountry",
                        "destination"
                    )
                );


            /*
             * SEARCH
             */

            const matchesSearch =
                !search ||

                lower(name)
                    .includes(search) ||

                lower(reference)
                    .includes(search) ||

                lower(description)
                    .includes(search);


            /*
             * STATUS
             */

            const matchesStatus =
                selectedStatus === "all" ||

                status === selectedStatus;


            /*
             * REGION
             */

            const matchesRegion =
                selectedRegion === "all" ||

                region === selectedRegion;


            /*
             * COUNTRY
             *
             * Important:
             * A vehicle published without a
             * destination remains visible under
             * All Countries.
             */

            let matchesCountry = true;


            if (
                selectedCountry !== "all"
            ) {

                matchesCountry =
                    country === selectedCountry ||

                    region ===
                    lower(
                        COUNTRY_REGION[
                            selectedCountry
                        ]
                    );

            }


            return (
                matchesSearch &&
                matchesStatus &&
                matchesRegion &&
                matchesCountry
            );

        });


    currentPage = 1;

    renderVehicles();

}


/* =========================
   CARD
========================= */

function createVehicleCard(vehicle) {

    const name =
        getVehicleName(vehicle);


    const reference =
        valueOf(
            vehicle,
            "ref",
            "referenceNumber",
            "reference",
            "stockNumber"
        ) || "HVE-0000";


    const year =
        valueOf(
            vehicle,
            "year",
            "modelYear"
        ) || "-";


    const mileage =
        formatMileage(
            valueOf(
                vehicle,
                "mileage",
                "km",
                "kilometers"
            )
        );


    const engine =
        valueOf(
            vehicle,
            "engine",
            "engineSize",
            "displacement"
        ) || "-";


    const fuel =
        valueOf(
            vehicle,
            "fuel",
            "fuelType"
        ) || "-";


    const status =
        getStatus(vehicle);


    const image =
        getFirstImage(vehicle);


    const sold =
        lower(status) === "sold";


    const safeImage =
        escapeHTML(image);


    const card =
        document.createElement("article");

    card.className =
        "vehicle-card";


    card.innerHTML = `

        <div class="vehicle-card-image">

            <img
                src="${safeImage}"
                alt="${escapeHTML(name)}"
                loading="lazy"
                onerror="
                    this.src='https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=85'
                "
            >


            <span class="vehicle-ref">
                REF: ${escapeHTML(reference)}
            </span>


            <span
                class="vehicle-status ${
                    sold ? "sold" : "available"
                }"
            >
                ${escapeHTML(status).toUpperCase()}
            </span>

        </div>


        <div class="vehicle-card-body">

            <h3>
                ${escapeHTML(name)}
            </h3>


            <div class="vehicle-mini-specs">

                <span>
                    ◫ ${escapeHTML(year)}
                </span>

                <span>
                    ◇ ${escapeHTML(mileage)} km
                </span>

                <span>
                    ⚙ ${escapeHTML(engine)}
                </span>

                <span>
                    ⛽ ${escapeHTML(fuel)}
                </span>

            </div>


            <div class="vehicle-card-quote">
                Country-specific quotation
            </div>


            <a
                class="vehicle-details-button"
                href="vehicle-details.html?id=${encodeURIComponent(vehicle.id)}"
            >

                View Details
                <span>→</span>

            </a>

        </div>

    `;


    return card;

}


/* =========================
   RENDER
========================= */

function renderVehicles() {

    grid.innerHTML = "";

    pagination.innerHTML = "";


    const total =
        filteredVehicles.length;


    count.textContent =
        `Showing ${total} vehicle${total === 1 ? "" : "s"}`;


    if (!total) {

        empty.hidden = false;

        return;

    }


    empty.hidden = true;


    const totalPages =
        Math.ceil(
            total / ITEMS_PER_PAGE
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage = totalPages;

    }


    const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;


    const end =
        start + ITEMS_PER_PAGE;


    const pageVehicles =
        filteredVehicles.slice(
            start,
            end
        );


    pageVehicles.forEach(vehicle => {

        grid.appendChild(
            createVehicleCard(vehicle)
        );

    });


    renderPagination(
        totalPages
    );

}


/* =========================
   PAGINATION
========================= */

function renderPagination(totalPages) {

    if (totalPages <= 1) {

        return;

    }


    const previous =
        document.createElement("button");

    previous.innerHTML =
        "‹";

    previous.disabled =
        currentPage === 1;

    previous.addEventListener(
        "click",
        () => {

            currentPage--;

            renderVehicles();

            window.scrollTo({
                top: 400,
                behavior: "smooth"
            });

        }
    );


    pagination.appendChild(previous);


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");

        button.textContent =
            page;


        if (
            page === currentPage
        ) {

            button.classList.add("active");

        }


        button.addEventListener(
            "click",
            () => {

                currentPage = page;

                renderVehicles();

                window.scrollTo({
                    top: 400,
                    behavior: "smooth"
                });

            }
        );


        pagination.appendChild(button);

    }


    const next =
        document.createElement("button");

    next.innerHTML =
        "›";

    next.disabled =
        currentPage === totalPages;

    next.addEventListener(
        "click",
        () => {

            currentPage++;

            renderVehicles();

            window.scrollTo({
                top: 400,
                behavior: "smooth"
            });

        }
    );


    pagination.appendChild(next);

}


/* =========================
   RESET
========================= */

function resetFilters() {

    searchInput.value = "";

    statusFilter.value = "all";

    regionFilter.value = "all";

    countryFilter.value = "all";

    currentPage = 1;

    applyFilters();

}


resetButton.addEventListener(
    "click",
    resetFilters
);


emptyReset.addEventListener(
    "click",
    resetFilters
);


/* =========================
   EVENTS
========================= */

searchInput.addEventListener(
    "input",
    applyFilters
);

statusFilter.addEventListener(
    "change",
    applyFilters
);

regionFilter.addEventListener(
    "change",
    () => {

        /*
         * When selecting a region,
         * reset country so the user can
         * select from the full country list.
         */

        countryFilter.value = "all";

        applyFilters();

    }
);


countryFilter.addEventListener(
    "change",
    applyFilters
);


/* =========================
   START
========================= */

loadVehicles();

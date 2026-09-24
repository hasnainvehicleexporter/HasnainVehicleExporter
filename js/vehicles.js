/* =====================================================
   HASNAIN VEHICLE EXPORTER
   BROWSE VEHICLES
   FIREBASE + FILTERS + SORTING
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
   FIREBASE
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

const vehicleCount =
    document.getElementById("vehicleCount");

const makeFilter =
    document.getElementById("makeFilter");

const modelFilter =
    document.getElementById("modelFilter");

const yearFilter =
    document.getElementById("yearFilter");

const priceFilter =
    document.getElementById("priceFilter");

const sortFilter =
    document.getElementById("sortFilter");

const resetFilters =
    document.getElementById("resetFilters");

const menuToggle =
    document.getElementById("menuToggle");

const mainNav =
    document.getElementById("mainNav");



/* =====================================================
   VARIABLES
   ===================================================== */

let vehicles = [];



/* =====================================================
   FALLBACK IMAGE
   ===================================================== */

const fallbackImage =
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85";



/* =====================================================
   HELPER
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



/* =====================================================
   NUMBER
   ===================================================== */

function numberValue(value) {

    if (
        typeof value === "number"
    ) {

        return value;

    }


    if (
        typeof value === "string"
    ) {

        const clean =
            value
                .replace(/,/g, "")
                .replace(/[^\d.]/g, "");

        return Number(clean) || 0;

    }


    return 0;

}



/* =====================================================
   IMAGE
   ===================================================== */

function getImage(data) {

    const images =
        getValue(
            data,
            "images",
            "imageUrls",
            "photos"
        );


    if (
        Array.isArray(images) &&
        images.length
    ) {

        return images[0];

    }


    if (
        typeof images === "string" &&
        images.trim()
    ) {

        return images;

    }


    const image =
        getValue(
            data,
            "image",
            "imageUrl"
        );


    if (image) {

        return image;

    }


    return fallbackImage;

}



/* =====================================================
   NORMALIZE
   ===================================================== */

function normalizeVehicle(doc) {

    const data =
        doc.data();


    const make =
        getValue(
            data,
            "make",
            "brand"
        );


    const model =
        getValue(
            data,
            "model"
        );


    const year =
        numberValue(
            getValue(
                data,
                "year"
            )
        );


    const price =
        numberValue(
            getValue(
                data,
                "price",
                "sellingPrice",
                "amount"
            )
        );


    return {

        id: doc.id,

        ref:
            getValue(
                data,
                "ref",
                "referenceNumber",
                "reference"
            ) || "HVE",

        make:
            make || "Japanese",

        model:
            model || "Vehicle",

        title:
            `${make || "Japanese"} ${model || "Vehicle"}`,

        year,

        mileage:
            getValue(
                data,
                "mileage"
            ) || "—",

        engine:
            getValue(
                data,
                "engine"
            ) || "—",

        fuel:
            getValue(
                data,
                "fuel",
                "fuelType"
            ) || "—",

        transmission:
            getValue(
                data,
                "transmission"
            ) || "—",

        region:
            getValue(
                data,
                "region",
                "market"
            ) || "",

        status:
            getValue(
                data,
                "status"
            ) || "Available",

        price,

        image:
            getImage(data),

        createdAt:
            data.createdAt || null

    };

}



/* =====================================================
   LOAD FIREBASE VEHICLES
   ===================================================== */

async function loadVehicles() {

    try {

        loadingMessage.classList.remove(
            "hidden"
        );


        noVehicles.classList.add(
            "hidden"
        );


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "vehicles"
                )
            );


        vehicles =
            snapshot.docs.map(
                normalizeVehicle
            );


        populateFilters();


        loadingMessage.classList.add(
            "hidden"
        );


        renderVehicles();


    } catch (error) {

        console.error(
            "Vehicle loading error:",
            error
        );


        loadingMessage.innerHTML = `

            <strong>
                Unable to load vehicles
            </strong>

            <span>
                Please refresh the page and try again.
            </span>

        `;

    }

}



/* =====================================================
   POPULATE MAKE / MODEL / YEAR
   ===================================================== */

function populateFilters() {


    const makes =
        [...new Set(
            vehicles
                .map(v => v.make)
                .filter(Boolean)
        )]
        .sort();


    const years =
        [...new Set(
            vehicles
                .map(v => v.year)
                .filter(Boolean)
        )]
        .sort(
            (a, b) => b - a
        );


    makeFilter.innerHTML = `

        <option value="all">
            All Makes
        </option>

        ${
            makes.map(
                make =>
                    `
                    <option value="${escapeAttr(make)}">
                        ${escapeHtml(make)}
                    </option>
                    `
            ).join("")
        }

    `;


    yearFilter.innerHTML = `

        <option value="all">
            All Years
        </option>

        ${
            years.map(
                year =>
                    `
                    <option value="${year}">
                        ${year}
                    </option>
                    `
            ).join("")
        }

    `;


    updateModelFilter();

}



/* =====================================================
   MODEL FILTER
   ===================================================== */

function updateModelFilter() {

    const selectedMake =
        makeFilter.value;


    let filtered =
        vehicles;


    if (
        selectedMake !== "all"
    ) {

        filtered =
            vehicles.filter(
                vehicle =>
                    vehicle.make ===
                    selectedMake
            );

    }


    const models =
        [...new Set(
            filtered
                .map(v => v.model)
                .filter(Boolean)
        )]
        .sort();


    modelFilter.innerHTML = `

        <option value="all">
            All Models
        </option>

        ${
            models.map(
                model =>
                    `
                    <option value="${escapeAttr(model)}">
                        ${escapeHtml(model)}
                    </option>
                    `
            ).join("")
        }

    `;

}



/* =====================================================
   GET CHECKED FILTERS
   ===================================================== */

function getCheckedValues(className) {

    return [
        ...document.querySelectorAll(
            `.${className}:checked`
        )
    ].map(
        input => input.value
    );

}



/* =====================================================
   PRICE MATCH
   ===================================================== */

function priceMatches(vehicle) {

    const filter =
        priceFilter.value;


    if (
        filter === "all"
    ) {

        return true;

    }


    /*
       Your public website uses
       country-specific quotations.

       If a vehicle does not have a
       numeric price in Firestore,
       it remains visible.
    */

    if (
        !vehicle.price
    ) {

        return true;

    }


    const price =
        vehicle.price;


    if (
        filter === "under10000"
    ) {

        return price < 10000;

    }


    if (
        filter === "10000-15000"
    ) {

        return (
            price >= 10000 &&
            price <= 15000
        );

    }


    if (
        filter === "15000-20000"
    ) {

        return (
            price >= 15000 &&
            price <= 20000
        );

    }


    if (
        filter === "20000-30000"
    ) {

        return (
            price >= 20000 &&
            price <= 30000
        );

    }


    if (
        filter === "30000plus"
    ) {

        return price >= 30000;

    }


    return true;

}



/* =====================================================
   FILTER VEHICLES
   ===================================================== */

function getFilteredVehicles() {

    const selectedMake =
        makeFilter.value;


    const selectedModel =
        modelFilter.value;


    const selectedYear =
        yearFilter.value;


    const transmissions =
        getCheckedValues(
            "transmission-filter"
        );


    const fuels =
        getCheckedValues(
            "fuel-filter"
        );


    return vehicles.filter(
        vehicle => {


            if (
                selectedMake !== "all" &&
                vehicle.make !== selectedMake
            ) {

                return false;

            }


            if (
                selectedModel !== "all" &&
                vehicle.model !== selectedModel
            ) {

                return false;

            }


            if (
                selectedYear !== "all" &&
                String(vehicle.year) !==
                String(selectedYear)
            ) {

                return false;

            }


            if (
                transmissions.length &&
                !transmissions.includes(
                    vehicle.transmission
                )
            ) {

                return false;

            }


            if (
                fuels.length &&
                !fuels.includes(
                    vehicle.fuel
                )
            ) {

                return false;

            }


            if (
                !priceMatches(vehicle)
            ) {

                return false;

            }


            return true;

        }
    );

}



/* =====================================================
   SORT
   ===================================================== */

function sortVehicles(list) {

    const sorted =
        [...list];


    if (
        sortFilter.value === "newest"
    ) {

        sorted.sort(
            (a, b) =>
                b.year - a.year
        );

    }


    if (
        sortFilter.value === "oldest"
    ) {

        sorted.sort(
            (a, b) =>
                a.year - b.year
        );

    }


    if (
        sortFilter.value === "name"
    ) {

        sorted.sort(
            (a, b) =>
                a.title.localeCompare(
                    b.title
                )
        );

    }


    return sorted;

}



/* =====================================================
   RENDER
   ===================================================== */

function renderVehicles() {

    const filtered =
        getFilteredVehicles();


    const sorted =
        sortVehicles(filtered);


    vehicleGrid.innerHTML =
        "";


    vehicleCount.textContent =
        `Showing ${sorted.length} of ${vehicles.length} vehicles`;


    if (
        sorted.length === 0
    ) {

        noVehicles.classList.remove(
            "hidden"
        );

        return;

    }


    noVehicles.classList.add(
        "hidden"
    );


    sorted.forEach(
        vehicle => {

            vehicleGrid.appendChild(
                createCard(vehicle)
            );

        }
    );

}



/* =====================================================
   CARD
   ===================================================== */

function createCard(vehicle) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "vehicle-card";


    const isSold =
        vehicle.status
            .toLowerCase()
            .includes("sold");


    const statusClass =
        isSold
            ? "sold"
            : "";


    const whatsappMessage =
        `Hello Hasnain Vehicle Exporter, I am interested in the ${vehicle.title} ${vehicle.year ? vehicle.year : ""} (Ref: ${vehicle.ref}). Please provide the country-specific price and shipping details.`;


    const whatsappURL =
        `https://wa.me/923198148346?text=${encodeURIComponent(whatsappMessage)}`;


    card.innerHTML = `

        <div class="vehicle-image">


            <img
                src="${escapeAttr(vehicle.image)}"
                alt="${escapeAttr(vehicle.title)}"
                loading="lazy"
            >


            <div class="japan-badge">

                <span>
                    🇯🇵
                </span>

                JAPAN

            </div>


            <div
                class="card-status ${statusClass}"
            >

                ${escapeHtml(vehicle.status)}

            </div>


            ${
                isSold
                    ?
                    `
                    <div class="sold-overlay">
                        SOLD
                    </div>
                    `
                    :
                    ""
            }


        </div>



        <div class="vehicle-card-body">


            <h3>
                ${escapeHtml(vehicle.title)}
                ${vehicle.year ? ` ${vehicle.year}` : ""}
            </h3>


            <div class="vehicle-reference">

                REF:
                ${escapeHtml(vehicle.ref)}

            </div>



            <div class="vehicle-spec-grid">


                <div class="vehicle-spec">

                    <span class="spec-icon">
                        ◫
                    </span>

                    ${escapeHtml(
                        String(vehicle.year || "—")
                    )}

                </div>


                <div class="vehicle-spec">

                    <span class="spec-icon">
                        ◉
                    </span>

                    ${escapeHtml(
                        String(vehicle.mileage)
                    )}
                    km

                </div>


                <div class="vehicle-spec">

                    <span class="spec-icon">
                        ⚙
                    </span>

                    ${escapeHtml(
                        String(vehicle.engine)
                    )}

                </div>


                <div class="vehicle-spec">

                    <span class="spec-icon">
                        ⇄
                    </span>

                    ${escapeHtml(
                        String(vehicle.transmission)
                    )}

                </div>


                <div class="vehicle-spec">

                    <span class="spec-icon">
                        ◌
                    </span>

                    ${escapeHtml(
                        String(vehicle.fuel)
                    )}

                </div>


                <div class="vehicle-spec">

                    <span class="spec-icon">
                        ●
                    </span>

                    ${escapeHtml(
                        String(vehicle.region || "Japan")
                    )}

                </div>


            </div>



            <div class="vehicle-quote">

                Price

                <span>
                    Request Country-Specific Quote
                </span>

            </div>



            <a
                class="vehicle-whatsapp"
                href="${whatsappURL}"
                target="_blank"
                rel="noopener"
            >

                <span class="vehicle-whatsapp-icon">
                    ☎
                </span>

                Contact for This Vehicle

            </a>



            <a
                class="vehicle-details-link"
                href="vehicle-details.html?id=${encodeURIComponent(vehicle.id)}"
            >

                View Full Vehicle Details →

            </a>


        </div>

    `;


    const image =
        card.querySelector(
            ".vehicle-image img"
        );


    image.addEventListener(
        "error",
        () => {

            image.src =
                fallbackImage;

        }
    );


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


function escapeAttr(value) {

    return escapeHtml(value);

}



/* =====================================================
   EVENTS
   ===================================================== */

makeFilter.addEventListener(
    "change",
    () => {

        updateModelFilter();

        renderVehicles();

    }
);


modelFilter.addEventListener(
    "change",
    renderVehicles
);


yearFilter.addEventListener(
    "change",
    renderVehicles
);


priceFilter.addEventListener(
    "change",
    renderVehicles
);


sortFilter.addEventListener(
    "change",
    renderVehicles
);


document
    .querySelectorAll(
        ".transmission-filter, .fuel-filter"
    )
    .forEach(
        checkbox => {

            checkbox.addEventListener(
                "change",
                renderVehicles
            );

        }
    );



/* =====================================================
   RESET
   ===================================================== */

resetFilters.addEventListener(
    "click",
    () => {

        makeFilter.value =
            "all";

        updateModelFilter();

        modelFilter.value =
            "all";

        yearFilter.value =
            "all";

        priceFilter.value =
            "all";

        sortFilter.value =
            "newest";


        document
            .querySelectorAll(
                ".transmission-filter, .fuel-filter"
            )
            .forEach(
                checkbox => {

                    checkbox.checked =
                        false;

                }
            );


        renderVehicles();

    }
);



/* =====================================================
   MOBILE NAV
   ===================================================== */

menuToggle.addEventListener(
    "click",
    () => {

        const open =
            mainNav.classList.toggle(
                "open"
            );


        menuToggle.setAttribute(
            "aria-expanded",
            open
        );

    }
);


mainNav
    .querySelectorAll("a")
    .forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    mainNav.classList.remove(
                        "open"
                    );

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        }
    );



/* =====================================================
   YEAR
   ===================================================== */

document
    .getElementById("currentYear")
    .textContent =
        new Date().getFullYear();



/* =====================================================
   START
   ===================================================== */

loadVehicles();

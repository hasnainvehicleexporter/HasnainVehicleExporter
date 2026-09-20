import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    AFRICA_COUNTRIES,
    CARIBBEAN_COUNTRIES,
    ALL_COUNTRIES
} from "./countries.js";


/* =========================
   FIREBASE
========================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyC_C0pbiXw4T4JqEyn-9iHacP2xNLqUvGY",

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


const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


/* =========================
   DOM
========================= */

const loading =
    document.getElementById(
        "vehicleLoading"
    );

const details =
    document.getElementById(
        "vehicleDetails"
    );

const errorBox =
    document.getElementById(
        "vehicleError"
    );


const reference =
    document.getElementById(
        "vehicleReference"
    );

const title =
    document.getElementById(
        "vehicleTitle"
    );

const status =
    document.getElementById(
        "vehicleStatus"
    );

const year =
    document.getElementById(
        "vehicleYear"
    );

const mileage =
    document.getElementById(
        "vehicleMileage"
    );

const engine =
    document.getElementById(
        "vehicleEngine"
    );

const fuel =
    document.getElementById(
        "vehicleFuel"
    );

const transmission =
    document.getElementById(
        "vehicleTransmission"
    );

const drive =
    document.getElementById(
        "vehicleDrive"
    );

const description =
    document.getElementById(
        "vehicleDescription"
    );

const features =
    document.getElementById(
        "vehicleFeatures"
    );

const mainImage =
    document.getElementById(
        "vehicleMainImage"
    );

const gallery =
    document.getElementById(
        "vehicleGallery"
    );

const countrySelect =
    document.getElementById(
        "destinationCountry"
    );

const quoteButton =
    document.getElementById(
        "whatsappQuote"
    );

const similarGrid =
    document.getElementById(
        "similarVehicles"
    );


/* =========================
   HELPERS
========================= */

function valueOf(vehicle, ...fields) {

    for (const field of fields) {

        const value =
            vehicle[field];

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


function escapeHTML(value) {

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function vehicleName(vehicle) {

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


    return model ||
        make ||
        "Japanese Vehicle";

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


function formatMileage(value) {

    if (!value) {

        return "-";

    }


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


/* =========================
   COUNTRIES
========================= */

function populateCountries() {

    countrySelect.innerHTML = `

        <option value="">
            Select your country
        </option>

    `;


    const africa =
        document.createElement(
            "optgroup"
        );

    africa.label =
        "Africa";


    AFRICA_COUNTRIES.forEach(
        country => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                country;

            option.textContent =
                country;

            africa.appendChild(
                option
            );

        }
    );


    countrySelect.appendChild(
        africa
    );


    const caribbean =
        document.createElement(
            "optgroup"
        );

    caribbean.label =
        "Caribbean";


    CARIBBEAN_COUNTRIES.forEach(
        country => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                country;

            option.textContent =
                country;

            caribbean.appendChild(
                option
            );

        }
    );


    countrySelect.appendChild(
        caribbean
    );

}


populateCountries();


/* =========================
   URL
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const vehicleId =
    params.get("id");


/* =========================
   LOAD
========================= */

async function loadVehicle() {

    if (!vehicleId) {

        showError();

        return;

    }


    try {

        const vehicleRef =
            doc(
                db,
                "vehicles",
                vehicleId
            );


        const snapshot =
            await getDoc(
                vehicleRef
            );


        if (!snapshot.exists()) {

            showError();

            return;

        }


        const vehicle = {

            id:
                snapshot.id,

            ...snapshot.data()

        };


        renderVehicle(
            vehicle
        );


        loadSimilarVehicles(
            vehicle
        );


    }

    catch (error) {

        console.error(
            error
        );

        showError();

    }

}


/* =========================
   RENDER VEHICLE
========================= */

function renderVehicle(vehicle) {

    const name =
        vehicleName(vehicle);


    const ref =
        valueOf(
            vehicle,
            "ref",
            "referenceNumber",
            "reference",
            "stockNumber"
        ) ||
        "HVE-0000";


    const vehicleStatus =
        valueOf(
            vehicle,
            "status",
            "availability"
        ) ||
        "Available";


    title.textContent =
        name;


    reference.textContent =
        ref;


    status.textContent =
        vehicleStatus
            .toUpperCase();


    status.className =
        "detail-status " +
        (
            vehicleStatus
                .toLowerCase() === "sold"
                ? "sold"
                : "available"
        );


    year.textContent =
        valueOf(
            vehicle,
            "year",
            "modelYear"
        ) || "-";


    mileage.textContent =
        formatMileage(
            valueOf(
                vehicle,
                "mileage",
                "km",
                "kilometers"
            )
        );


    engine.textContent =
        valueOf(
            vehicle,
            "engine",
            "engineSize",
            "displacement"
        ) || "-";


    fuel.textContent =
        valueOf(
            vehicle,
            "fuel",
            "fuelType"
        ) || "-";


    transmission.textContent =
        valueOf(
            vehicle,
            "transmission",
            "gearbox"
        ) || "-";


    drive.textContent =
        valueOf(
            vehicle,
            "drive",
            "drivetrain"
        ) || "-";


    description.textContent =
        valueOf(
            vehicle,
            "description",
            "details"
        ) ||
        `The ${name} is available for export from Japan. Contact Hasnain Vehicle Exporter for current vehicle availability, country-specific pricing and shipping information.`;


    renderFeatures(
        vehicle
    );


    renderGallery(
        vehicle
    );


    loading.hidden =
        true;

    details.hidden =
        false;

}


/* =========================
   FEATURES
========================= */

function renderFeatures(vehicle) {

    let list =
        valueOf(
            vehicle,
            "features",
            "keyFeatures"
        );


    if (typeof list === "string") {

        list =
            list
                .split(",")
                .map(item =>
                    item.trim()
                )
                .filter(Boolean);

    }


    if (!Array.isArray(list) ||
        !list.length) {

        list = [

            "Cruise Control",
            "Reverse Camera",
            "Bluetooth",
            "Power Seats",
            "Climate Control",
            "Alloy Wheels",
            "Multi-Function Steering",
            "Keyless Entry",
            "ABS & Airbags",
            "Leather Interior"

        ];

    }


    features.innerHTML =
        list.map(item => `

            <div class="feature-item">

                <span>✓</span>

                ${escapeHTML(item)}

            </div>

        `).join("");

}


/* =========================
   GALLERY
========================= */

function renderGallery(vehicle) {

    let images =
        getImages(vehicle);


    /*
     * Fallback online images if
     * no Cloudinary images exist.
     */

    if (!images.length) {

        images = [

            "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=85",

            "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1000&q=85",

            "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1000&q=85",

            "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1000&q=85"

        ];

    }


    setMainImage(
        images[0]
    );


    gallery.innerHTML =
        images.map(
            (image, index) => `

                <button
                    type="button"
                    class="gallery-thumb ${
                        index === 0
                            ? "active"
                            : ""
                    }"
                    data-image="${escapeHTML(image)}"
                >

                    <img
                        src="${escapeHTML(image)}"
                        alt="Vehicle image ${index + 1}"
                        loading="lazy"
                    >

                </button>

            `
        ).join("");


    gallery
        .querySelectorAll(
            ".gallery-thumb"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    gallery
                        .querySelectorAll(
                            ".gallery-thumb"
                        )
                        .forEach(
                            item =>
                                item.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList.add(
                        "active"
                    );


                    setMainImage(
                        button.dataset.image
                    );

                }
            );

        });

}


function setMainImage(image) {

    mainImage.innerHTML = `

        <img
            src="${escapeHTML(image)}"
            alt="Vehicle"
            onerror="
                this.src='https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=85'
            "
        >

    `;

}


/* =========================
   WHATSAPP
========================= */

quoteButton.addEventListener(
    "click",
    () => {

        const country =
            countrySelect.value;


        if (!country) {

            countrySelect.focus();

            countrySelect.classList.add(
                "input-error"
            );

            setTimeout(() => {

                countrySelect.classList.remove(
                    "input-error"
                );

            }, 1500);

            return;

        }


        const name =
            title.textContent;


        const ref =
            reference.textContent;


        const message =

`Hello Hasnain Vehicle Exporter,

I am interested in the ${name}.

Reference: ${ref}

Destination: ${country}

Please provide the country-specific price and shipping details.`;


        const url =
            "https://wa.me/923392207418?text=" +
            encodeURIComponent(message);


        window.open(
            url,
            "_blank",
            "noopener"
        );

    }
);


/* =========================
   SIMILAR VEHICLES
========================= */

async function loadSimilarVehicles(
    currentVehicle
) {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "vehicles"
                )
            );


        const vehicles =
            snapshot.docs
                .map(doc => ({

                    id: doc.id,

                    ...doc.data()

                }))
                .filter(vehicle =>
                    vehicle.id !==
                    currentVehicle.id
                )
                .slice(0, 4);


        renderSimilar(
            vehicles
        );

    }

    catch (error) {

        console.error(
            "Similar vehicle error:",
            error
        );

    }

}


/* =========================
   SIMILAR CARD
========================= */

function renderSimilar(
    vehicles
) {

    if (!vehicles.length) {

        similarGrid.innerHTML =
            `<p class="no-similar">
                More vehicles will appear here
                as inventory is added.
            </p>`;

        return;

    }


    similarGrid.innerHTML =
        vehicles.map(
            vehicle => {

                const name =
                    vehicleName(
                        vehicle
                    );


                const ref =
                    valueOf(
                        vehicle,
                        "ref",
                        "referenceNumber",
                        "reference"
                    ) ||
                    "HVE-0000";


                const status =
                    valueOf(
                        vehicle,
                        "status"
                    ) ||
                    "Available";


                const images =
                    getImages(
                        vehicle
                    );


                const image =
                    images[0] ||

                    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=85";


                return `

                    <article class="similar-card">

                        <div class="similar-image">

                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(name)}"
                                loading="lazy"
                            >

                            <span>
                                REF:
                                ${escapeHTML(ref)}
                            </span>

                        </div>


                        <div class="similar-body">

                            <h3>
                                ${escapeHTML(name)}
                            </h3>


                            <p>

                                ${escapeHTML(
                                    valueOf(
                                        vehicle,
                                        "year"
                                    ) || "-"
                                )}

                                •


                                ${escapeHTML(
                                    valueOf(
                                        vehicle,
                                        "engine"
                                    ) || "-"
                                )}

                                •


                                ${escapeHTML(
                                    valueOf(
                                        vehicle,
                                        "fuel"
                                    ) || "-"
                                )}

                            </p>


                            <a
                                href="vehicle-details.html?id=${encodeURIComponent(vehicle.id)}"
                            >
                                View Details →
                            </a>

                        </div>

                    </article>

                `;

            }
        ).join("");

}


/* =========================
   ERROR
========================= */

function showError() {

    loading.hidden =
        true;

    details.hidden =
        true;

    errorBox.hidden =
        false;

}


/* =========================
   START
========================= */

loadVehicle();

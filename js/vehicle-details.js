import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc
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


const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


/* =========================================================
   COUNTRIES
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


const COUNTRIES = [
    ...AFRICA,
    ...CARIBBEAN
].sort();


/* =========================================================
   ELEMENTS
   ========================================================= */

const loading =
    document.getElementById(
        "detailsLoading"
    );

const details =
    document.getElementById(
        "vehicleDetails"
    );

const errorBox =
    document.getElementById(
        "detailsError"
    );

const mainImage =
    document.getElementById(
        "mainVehicleImage"
    );

const thumbnails =
    document.getElementById(
        "thumbnailRow"
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

const specs =
    document.getElementById(
        "specGrid"
    );

const description =
    document.getElementById(
        "vehicleDescription"
    );

const features =
    document.getElementById(
        "vehicleFeatures"
    );

const countrySelect =
    document.getElementById(
        "quoteCountry"
    );

const whatsapp =
    document.getElementById(
        "whatsappQuote"
    );


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

        images =
            images
                ? [images]
                : [];

    }


    return images.filter(Boolean);

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


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   COUNTRIES
   ========================================================= */

function populateCountries() {

    COUNTRIES.forEach(country => {

        const option =
            document.createElement("option");

        option.value = country;

        option.textContent = country;

        countrySelect.appendChild(option);

    });

}


/* =========================================================
   GET VEHICLE ID
   ========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const vehicleId =
    params.get("id");


/* =========================================================
   LOAD VEHICLE
   ========================================================= */

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
            await getDoc(vehicleRef);


        if (!snapshot.exists()) {

            showError();

            return;

        }


        const vehicle =
            snapshot.data();


        renderVehicle(vehicle);

    }

    catch (error) {

        console.error(error);

        showError();

    }

}


/* =========================================================
   RENDER
   ========================================================= */

function renderVehicle(vehicle) {

    const name =
        getName(vehicle);


    const ref =
        firstValue(
            vehicle,
            [
                "referenceNumber",
                "ref",
                "reference",
                "hveRef"
            ],
            "HVE-0000"
        );


    const images =
        getImages(vehicle);


    const imageList =
        images.length
            ? images
            : [
                "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=85"
            ];


    reference.textContent =
        `REF: ${ref}`;


    title.textContent =
        name;


    const currentStatus =
        firstValue(
            vehicle,
            ["status"],
            "Available"
        );


    status.textContent =
        currentStatus;


    /* SPECS */

    const specData = [

        [
            "Year",
            firstValue(vehicle, ["year"], "—")
        ],

        [
            "Mileage",
            firstValue(vehicle, ["mileage"], "—")
        ],

        [
            "Engine",
            firstValue(vehicle, ["engine"], "—")
        ],

        [
            "Fuel",
            firstValue(vehicle, ["fuel"], "—")
        ],

        [
            "Transmission",
            firstValue(vehicle, ["transmission"], "—")
        ],

        [
            "Drive",
            firstValue(vehicle, ["drive"], "—")
        ]

    ];


    specs.innerHTML =
        specData.map(item => `

            <div class="detail-spec">

                <label>
                    ${escapeHtml(item[0])}
                </label>

                <span>
                    ${escapeHtml(item[1])}
                </span>

            </div>

        `).join("");


    /* DESCRIPTION */

    description.textContent =
        firstValue(
            vehicle,
            ["description"],
            `Quality ${name} sourced from Japan.
             Contact us for current availability,
             country-specific pricing and shipping details.`
        );


    /* FEATURES */

    let featureValue =
        firstValue(
            vehicle,
            ["features", "keyFeatures"],
            ""
        );


    if (Array.isArray(featureValue)) {

        featureValue =
            featureValue.join(" • ");

    }


    features.textContent =
        featureValue
        ||
        "Japanese specification • Export ready • Country-specific shipping support";


    /* GALLERY */

    mainImage.src =
        imageList[0];

    mainImage.alt =
        name;


    thumbnails.innerHTML =
        imageList.map(
            (image, index) => `

                <button
                    class="thumbnail ${index === 0 ? "active" : ""}"
                    data-image="${escapeHtml(image)}">

                    <img
                        src="${escapeHtml(image)}"
                        alt="${escapeHtml(name)}"
                        onerror="
                            this.style.display='none';
                        ">

                </button>

            `
        ).join("");


    document
        .querySelectorAll(".thumbnail")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(".thumbnail")
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );


                    button.classList.add(
                        "active"
                    );


                    mainImage.src =
                        button.dataset.image;

                }
            );

        });


    /* WHATSAPP */

    function updateWhatsApp() {

        const country =
            countrySelect.value;


        if (!country) {

            whatsapp.href =
                "https://wa.me/923392207418";

            return;

        }


        const message =
            `Hello Hasnain Vehicle Exporter,

I am interested in the ${name}.

Ref: ${ref}

Destination: ${country}

Please provide the country-specific price and shipping details.`;


        whatsapp.href =
            `https://wa.me/923392207418?text=${
                encodeURIComponent(message)
            }`;

    }


    countrySelect.addEventListener(
        "change",
        updateWhatsApp
    );


    loading.style.display =
        "none";

    details.hidden =
        false;

}


/* =========================================================
   ERROR
   ========================================================= */

function showError() {

    loading.style.display =
        "none";

    details.hidden =
        true;

    errorBox.hidden =
        false;

}


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

loadVehicle();

/* =========================================================
   HASNAIN VEHICLE EXPORTER
   VEHICLE DETAILS JAVASCRIPT
   ========================================================= */

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


/* =========================================================
   FIREBASE
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


const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);


/* =========================================================
   COUNTRIES
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


const ALL_COUNTRIES = [

    ...AFRICA_COUNTRIES,
    ...CARIBBEAN_COUNTRIES

].sort();


/* =========================================================
   ELEMENTS
   ========================================================= */

const loading =
    document.getElementById(
        "detailsLoading"
    );


const errorBox =
    document.getElementById(
        "detailsError"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


const details =
    document.getElementById(
        "vehicleDetails"
    );


const mainImage =
    document.getElementById(
        "mainVehicleImage"
    );


const thumbnails =
    document.getElementById(
        "thumbnailGallery"
    );


const vehicleReference =
    document.getElementById(
        "vehicleReference"
    );


const vehicleTitle =
    document.getElementById(
        "vehicleTitle"
    );


const vehicleSubtitle =
    document.getElementById(
        "vehicleSubtitle"
    );


const detailStatus =
    document.getElementById(
        "detailStatus"
    );


const quoteCountry =
    document.getElementById(
        "quoteCountry"
    );


const whatsappQuote =
    document.getElementById(
        "whatsappQuote"
    );


const quoteMessage =
    document.getElementById(
        "quoteMessage"
    );


/* =========================================================
   FALLBACK IMAGE
   ========================================================= */

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1600&q=85";


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
   IMAGES
   ========================================================= */

function getImages(vehicle) {

    let images =
        getValue(
            vehicle,
            [
                "images",
                "imageUrls",
                "photos"
            ]
        );


    if (!images) {

        const single =
            getValue(
                vehicle,
                [
                    "image",
                    "imageUrl",
                    "photo",
                    "photoUrl"
                ]
            );


        if (single) {

            images = [single];

        }

    }


    if (!Array.isArray(images)) {

        if (
            typeof images === "string"
        ) {

            images =
                images
                    .split(",")
                    .map(x => x.trim())
                    .filter(Boolean);

        } else {

            images = [];

        }

    }


    images =
        images
            .map(image => {

                if (
                    typeof image === "string"
                ) {

                    return image;

                }


                if (
                    image &&
                    typeof image === "object"
                ) {

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


    if (
        images.length === 0
    ) {

        images.push(
            FALLBACK_IMAGE
        );

    }


    return images;

}


/* =========================================================
   COUNTRY SELECT
   ========================================================= */

function populateCountries() {

    if (!quoteCountry) {
        return;
    }


    quoteCountry.innerHTML = `

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


    AFRICA_COUNTRIES
        .forEach(country => {

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

        });


    quoteCountry.appendChild(
        africa
    );


    const caribbean =
        document.createElement(
            "optgroup"
        );

    caribbean.label =
        "Caribbean";


    CARIBBEAN_COUNTRIES
        .forEach(country => {

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

        });


    quoteCountry.appendChild(
        caribbean
    );

}


/* =========================================================
   REFERENCE
   ========================================================= */

function getReference(vehicle) {

    return (
        getValue(
            vehicle,
            [
                "ref",
                "referenceNumber",
                "reference",
                "hveRef"
            ]
        )
        ||
        "HVE-0000"
    );

}


/* =========================================================
   NAME
   ========================================================= */

function getName(vehicle) {

    const make =
        getValue(
            vehicle,
            [
                "make",
                "brand"
            ]
        );


    const model =
        getValue(
            vehicle,
            [
                "model"
            ]
        );


    return (
        `${make} ${model}`
            .trim()
            ||
            "Japanese Vehicle"
    );

}


/* =========================================================
   STATUS
   ========================================================= */

function getStatus(vehicle) {

    return (
        getValue(
            vehicle,
            [
                "status"
            ]
        )
        ||
        "Available"
    );

}


/* =========================================================
   DISPLAY VEHICLE
   ========================================================= */

function displayVehicle(vehicle) {

    const images =
        getImages(vehicle);


    const reference =
        getReference(vehicle);


    const make =
        getValue(
            vehicle,
            [
                "make",
                "brand"
            ]
        );


    const model =
        getValue(
            vehicle,
            [
                "model"
            ]
        );


    const year =
        getValue(
            vehicle,
            [
                "year"
            ]
        ) || "—";


    const mileage =
        getValue(
            vehicle,
            [
                "mileage"
            ]
        ) || "—";


    const engine =
        getValue(
            vehicle,
            [
                "engine"
            ]
        ) || "—";


    const fuel =
        getValue(
            vehicle,
            [
                "fuel"
            ]
        ) || "—";


    const transmission =
        getValue(
            vehicle,
            [
                "transmission"
            ]
        ) || "—";


    const drive =
        getValue(
            vehicle,
            [
                "drive"
            ]
        ) || "—";


    const description =
        getValue(
            vehicle,
            [
                "description"
            ]
        )
        ||
        "Contact us for complete vehicle information, current availability and a country-specific quotation.";


    const features =
        getValue(
            vehicle,
            [
                "features",
                "keyFeatures"
            ]
        );


    /* REFERENCE */

    vehicleReference.textContent =
        reference;


    /* TITLE */

    vehicleTitle.textContent =
        `${make} ${model}`.trim();


    /* SUBTITLE */

    vehicleSubtitle.textContent =
        `${year} • Japanese Vehicle`;


    /* STATUS */

    const status =
        getStatus(vehicle);


    detailStatus.textContent =
        status.toUpperCase();


    detailStatus.classList.toggle(
        "sold",
        status.toLowerCase() === "sold"
    );


    /* SPECS */

    document.getElementById(
        "specYear"
    ).textContent =
        year;


    document.getElementById(
        "specMileage"
    ).textContent =
        mileage;


    document.getElementById(
        "specEngine"
    ).textContent =
        engine;


    document.getElementById(
        "specFuel"
    ).textContent =
        fuel;


    document.getElementById(
        "specTransmission"
    ).textContent =
        transmission;


    document.getElementById(
        "specDrive"
    ).textContent =
        drive;


    /* DESCRIPTION */

    document.getElementById(
        "vehicleDescription"
    ).textContent =
        description;


    /* FEATURES */

    renderFeatures(
        features,
        vehicle
    );


    /* GALLERY */

    renderGallery(
        images,
        `${make} ${model}`
    );

}


/* =========================================================
   GALLERY
   ========================================================= */

function renderGallery(images, title) {

    if (!mainImage) {
        return;
    }


    mainImage.src =
        images[0];


    mainImage.alt =
        title;


    mainImage.onerror =
        function () {

            this.onerror = null;

            this.src =
                FALLBACK_IMAGE;

        };


    thumbnails.innerHTML =
        "";


    images.forEach(
        (image, index) => {

            const thumbnail =
                document.createElement(
                    "img"
                );


            thumbnail.className =
                "vehicle-thumbnail";


            if (index === 0) {

                thumbnail.classList.add(
                    "active"
                );

            }


            thumbnail.src =
                image;


            thumbnail.alt =
                `${title} photo ${index + 1}`;


            thumbnail.onerror =
                function () {

                    this.onerror = null;

                    this.src =
                        FALLBACK_IMAGE;

                };


            thumbnail.addEventListener(
                "click",
                function () {

                    mainImage.src =
                        image;

                    thumbnails
                        .querySelectorAll(
                            ".vehicle-thumbnail"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );

                    thumbnail.classList.add(
                        "active"
                    );

                }
            );


            thumbnails.appendChild(
                thumbnail
            );

        }
    );

}


/* =========================================================
   FEATURES
   ========================================================= */

function renderFeatures(
    features,
    vehicle
) {

    const list =
        document.getElementById(
            "vehicleFeatures"
        );


    list.innerHTML =
        "";


    let featureArray =
        [];


    if (
        Array.isArray(features)
    ) {

        featureArray =
            features;

    }
    else if (
        typeof features === "string"
    ) {

        featureArray =
            features
                .split(/[,|\n]/)
                .map(
                    x => x.trim()
                )
                .filter(Boolean);

    }


    /* Add useful automatic specs */

    if (
        vehicle.year
    ) {

        featureArray.push(
            `${vehicle.year} Model`
        );

    }


    if (
        vehicle.fuel
    ) {

        featureArray.push(
            `${vehicle.fuel} Fuel`
        );

    }


    if (
        vehicle.transmission
    ) {

        featureArray.push(
            `${vehicle.transmission} Transmission`
        );

    }


    if (
        vehicle.drive
    ) {

        featureArray.push(
            `${vehicle.drive} Drive`
        );

    }


    featureArray =
        [
            ...new Set(
                featureArray
            )
        ];


    if (
        featureArray.length === 0
    ) {

        featureArray = [
            "Japanese vehicle",
            "Vehicle sourcing available",
            "Country-specific quotation",
            "Export support"
        ];

    }


    featureArray
        .slice(0, 10)
        .forEach(feature => {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                feature;

            list.appendChild(
                li
            );

        });

}


/* =========================================================
   WHATSAPP QUOTE
   ========================================================= */

function setupWhatsApp(vehicle) {

    whatsappQuote.addEventListener(
        "click",
        function () {

            const country =
                quoteCountry.value;


            if (!country) {

                quoteMessage.textContent =
                    "Please select your destination country first.";

                quoteMessage.style.color =
                    "#d4af37";

                quoteCountry.focus();

                return;

            }


            const reference =
                getReference(vehicle);


            const name =
                getName(vehicle);


            const message =
                `Hello Hasnain Vehicle Exporter,

I am interested in the ${name} (${vehicle.year || ""}).

Reference: ${reference}

Destination: ${country}

Please provide the country-specific price and shipping details.`;


            const url =
                "https://wa.me/923392207418?text=" +
                encodeURIComponent(
                    message
                );


            window.open(
                url,
                "_blank"
            );

        }
    );

}


/* =========================================================
   SIMILAR VEHICLES
   ========================================================= */

async function loadSimilarVehicles(
    currentVehicle
) {

    const container =
        document.getElementById(
            "similarVehicles"
        );


    if (!container) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "vehicles"
                )
            );


        const vehicles = [];


        snapshot.forEach(
            documentSnapshot => {

                if (
                    documentSnapshot.id ===
                    currentVehicle.id
                ) {
                    return;
                }


                vehicles.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        const currentMake =
            String(
                getValue(
                    currentVehicle,
                    [
                        "make",
                        "brand"
                    ]
                )
            ).toLowerCase();


        const similar =
            vehicles
                .filter(
                    vehicle => {

                        const make =
                            String(
                                getValue(
                                    vehicle,
                                    [
                                        "make",
                                        "brand"
                                    ]
                                )
                            ).toLowerCase();


                        return (
                            make &&
                            make === currentMake
                        );

                    }
                )
                .slice(0, 3);


        const finalVehicles =
            similar.length
                ? similar
                : vehicles.slice(0, 3);


        container.innerHTML =
            "";


        finalVehicles.forEach(
            vehicle => {

                container.appendChild(
                    createSimilarCard(
                        vehicle
                    )
                );

            }
        );


        if (
            finalVehicles.length === 0
        ) {

            container.innerHTML = `

                <p style="
                    color:#777;
                    font-size:13px;
                ">
                    More vehicles will be added soon.
                </p>

            `;

        }


    }
    catch (error) {

        console.error(
            "Similar vehicles error:",
            error
        );

    }

}


/* =========================================================
   SIMILAR CARD
   ========================================================= */

function createSimilarCard(
    vehicle
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "similar-card";


    const images =
        getImages(vehicle);


    const image =
        images[0];


    const name =
        getName(vehicle);


    const reference =
        getReference(vehicle);


    const year =
        getValue(
            vehicle,
            [
                "year"
            ]
        ) || "";


    card.innerHTML = `

        <div class="similar-card-image">

            <img
                src="${image}"
                alt="${name}"
                loading="lazy"
            >

        </div>

        <div class="similar-card-content">

            <div class="similar-ref">
                ${reference}
            </div>

            <h3>
                ${name}
            </h3>

            <p>
                ${year}
                • Request Country-Specific Quote
            </p>

            <a
                href="vehicle-details.html?id=${encodeURIComponent(vehicle.id)}"
            >
                View Details →
            </a>

        </div>

    `;


    return card;

}


/* =========================================================
   SHOW ERROR
   ========================================================= */

function showError(message) {

    if (loading) {

        loading.style.display =
            "none";

    }


    if (details) {

        details.style.display =
            "none";

    }


    if (errorBox) {

        errorBox.style.display =
            "flex";

    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

    }

}


/* =========================================================
   LOAD VEHICLE
   ========================================================= */

async function loadVehicle() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const vehicleId =
        params.get("id");


    if (!vehicleId) {

        showError(
            "No vehicle ID was provided."
        );

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

            showError(
                "This vehicle no longer exists or could not be found."
            );

            return;

        }


        const vehicle = {

            id:
                snapshot.id,

            ...snapshot.data()

        };


        displayVehicle(
            vehicle
        );


        setupWhatsApp(
            vehicle
        );


        loadSimilarVehicles(
            vehicle
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        if (details) {

            details.style.display =
                "block";

        }


        document.title =
            `${getName(vehicle)} | Hasnain Vehicle Exporter`;


    }
    catch (error) {

        console.error(
            "Vehicle details error:",
            error
        );


        showError(
            "Unable to load this vehicle. Please refresh the page and try again."
        );

    }

}


/* =========================================================
   START
   ========================================================= */

populateCountries();

loadVehicle();

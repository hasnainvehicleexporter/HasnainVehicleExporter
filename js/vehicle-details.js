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


const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


const container =
    document.getElementById("vehicleDetails");


/* GET VEHICLE ID */

const params =
    new URLSearchParams(
        window.location.search
    );

const vehicleId =
    params.get("id");


/* COUNTRY LIST */

const countries = [

    "Kenya",
    "Tanzania",
    "Uganda",
    "Ghana",
    "Nigeria",
    "South Africa",
    "Zambia",
    "Zimbabwe",
    "Malawi",
    "Mozambique",
    "Rwanda",
    "Burundi",
    "Ethiopia",
    "Somalia",
    "Botswana",
    "Namibia",
    "Sierra Leone",
    "Liberia",
    "Cameroon",
    "Ivory Coast",
    "Senegal",
    "Gambia",
    "Guinea",
    "Mauritius",
    "Seychelles",

    "Barbados",
    "Jamaica",
    "Bahamas",
    "Trinidad and Tobago",
    "Dominican Republic",
    "Saint Lucia",
    "Grenada",
    "Guyana",
    "Suriname",
    "Belize",
    "Haiti",
    "Antigua and Barbuda",
    "Dominica",
    "Saint Kitts and Nevis",
    "Saint Vincent and the Grenadines"

];


/* LOAD */

async function loadVehicle() {

    if (!vehicleId) {

        showError(
            "Vehicle reference was not provided."
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
            await getDoc(vehicleRef);


        if (!snapshot.exists()) {

            showError(
                "Vehicle not found."
            );

            return;

        }


        const vehicle = {

            id: snapshot.id,

            ...snapshot.data()

        };


        renderVehicle(vehicle);

    } catch (error) {

        console.error(error);

        showError(
            "Unable to load vehicle."
        );

    }

}


/* RENDER */

function renderVehicle(vehicle) {

    const images =
        Array.isArray(vehicle.images)
            ? vehicle.images
            : [];


    const mainImage =
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


    document.title =
        `${vehicle.make || ""} ${vehicle.model || ""} | Hasnain Vehicle Exporter`;


    container.innerHTML = `

        <div class="vehicle-gallery">

            <div class="vehicle-main-image">

                <img
                    id="mainVehicleImage"
                    src="${escapeHTML(mainImage)}"
                    alt="${escapeHTML(vehicle.make || "")} ${escapeHTML(vehicle.model || "")}">

            </div>


            <div class="vehicle-thumbnails">

                ${images.map((image, index) => `

                    <div
                        class="vehicle-thumbnail"
                        data-image="${escapeHTML(image)}">

                        <img
                            src="${escapeHTML(image)}"
                            alt="Vehicle photo ${index + 1}"
                            loading="lazy">

                    </div>

                `).join("")}

            </div>

        </div>


        <div class="vehicle-info">

            <div class="detail-ref">

                REF: ${escapeHTML(reference)}

            </div>


            <h1>

                ${escapeHTML(vehicle.make || "")}
                ${escapeHTML(vehicle.model || "")}

            </h1>


            <div class="vehicle-status ${isSold ? "sold" : ""}">

                ${escapeHTML(status)}

            </div>


            <div class="detail-spec-grid">

                ${detailSpec(
                    "Year",
                    vehicle.year
                )}

                ${detailSpec(
                    "Mileage",
                    vehicle.mileage
                )}

                ${detailSpec(
                    "Engine",
                    vehicle.engine
                )}

                ${detailSpec(
                    "Fuel",
                    vehicle.fuel
                )}

                ${detailSpec(
                    "Transmission",
                    vehicle.transmission
                )}

                ${detailSpec(
                    "Drive",
                    vehicle.drive
                )}

            </div>


            <div class="detail-description">

                ${escapeHTML(
                    vehicle.description ||
                    "Contact Hasnain Vehicle Exporter for more information about this vehicle."
                )}

            </div>


            ${vehicle.features ? `

                <h3>
                    Key Features
                </h3>

                <div class="detail-description">

                    ${escapeHTML(vehicle.features)}

                </div>

            ` : ""}


            ${!isSold ? `

                <div class="quote-box">

                    <h3>
                        Get Country-Specific Quote
                    </h3>

                    <p>
                        Vehicle and shipping costs vary
                        by destination country.
                    </p>


                    <label
                        for="destinationCountry">

                        Destination Country

                    </label>


                    <select
                        id="destinationCountry">

                        <option value="">
                            Select your country
                        </option>

                        ${countries.map(country => `

                            <option value="${escapeHTML(country)}">

                                ${escapeHTML(country)}

                            </option>

                        `).join("")}

                    </select>


                    <a
                        id="whatsappQuote"
                        class="whatsapp-button"
                        href="#">

                        Get Quote on WhatsApp

                    </a>

                </div>

            ` : `

                <div class="quote-box">

                    <h3>
                        Vehicle Sold
                    </h3>

                    <p>
                        This vehicle is no longer available.
                        Please contact us for similar vehicles.
                    </p>

                    <a
                        class="vehicle-button"
                        href="vehicles.html">

                        Browse Available Vehicles

                    </a>

                </div>

            `}

        </div>

    `;


    /* GALLERY */

    document
        .querySelectorAll(".vehicle-thumbnail")
        .forEach(thumbnail => {

            thumbnail.addEventListener(
                "click",
                () => {

                    document
                        .getElementById(
                            "mainVehicleImage"
                        )
                        .src =
                        thumbnail.dataset.image;

                }
            );

        });


    /* WHATSAPP */

    if (!isSold) {

        const countrySelect =
            document.getElementById(
                "destinationCountry"
            );

        const whatsapp =
            document.getElementById(
                "whatsappQuote"
            );


        countrySelect.addEventListener(
            "change",
            () => {

                const country =
                    countrySelect.value;


                if (!country) {

                    whatsapp.href = "#";

                    return;

                }


                const message =
                    `Hello Hasnain Vehicle Exporter, I am interested in ${vehicle.make || ""} ${vehicle.model || ""} (Ref: ${reference}). Destination: ${country}. Please provide the country-specific price and shipping details.`;


                whatsapp.href =
                    `https://wa.me/923392207418?text=${encodeURIComponent(message)}`;

            }
        );

    }

}


/* SPEC */

function detailSpec(
    label,
    value
) {

    if (!value) return "";

    return `

        <div class="detail-spec">

            <strong>
                ${escapeHTML(label)}
            </strong>

            <span>
                ${escapeHTML(value)}
            </span>

        </div>

    `;

}


/* ERROR */

function showError(message) {

    container.innerHTML = `

        <div class="empty-state">

            <h2>
                ${escapeHTML(message)}
            </h2>

            <p>
                <a href="vehicles.html">
                    Return to Browse Vehicles
                </a>
            </p>

        </div>

    `;

}


/* ESCAPE */

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* YEAR */

const yearElement =
    document.getElementById(
        "currentYear"
    );

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


/* START */

loadVehicle();

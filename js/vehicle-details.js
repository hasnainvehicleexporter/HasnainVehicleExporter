/* =====================================================
   HASNAIN VEHICLE EXPORTER
   VEHICLE DETAILS
   FIREBASE + GALLERY + COUNTRY QUOTE
   ===================================================== */


import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";


import {
    getFirestore,
    collection,
    getDoc,
    getDocs,
    doc
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
   URL
   ===================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );


const vehicleId =
    params.get("id");



/* =====================================================
   ELEMENTS
   ===================================================== */

const mainImage =
    document.getElementById(
        "mainVehicleImage"
    );

const thumbnailRow =
    document.getElementById(
        "thumbnailRow"
    );

const imageCounter =
    document.getElementById(
        "imageCounter"
    );

const vehicleTitle =
    document.getElementById(
        "vehicleTitle"
    );

const vehicleReference =
    document.getElementById(
        "vehicleReference"
    );

const breadcrumbVehicle =
    document.getElementById(
        "breadcrumbVehicle"
    );

const vehicleYear =
    document.getElementById(
        "vehicleYear"
    );

const vehicleMileage =
    document.getElementById(
        "vehicleMileage"
    );

const vehicleEngine =
    document.getElementById(
        "vehicleEngine"
    );

const vehicleTransmission =
    document.getElementById(
        "vehicleTransmission"
    );

const vehicleFuel =
    document.getElementById(
        "vehicleFuel"
    );

const vehicleDrive =
    document.getElementById(
        "vehicleDrive"
    );

const vehicleDescription =
    document.getElementById(
        "vehicleDescription"
    );

const keyFeaturesList =
    document.getElementById(
        "keyFeaturesList"
    );

const fullSpecifications =
    document.getElementById(
        "fullSpecifications"
    );

const featuresGrid =
    document.getElementById(
        "featuresGrid"
    );

const largeGallery =
    document.getElementById(
        "largeGallery"
    );

const morePhotos =
    document.getElementById(
        "morePhotos"
    );

const similarVehicles =
    document.getElementById(
        "similarVehicles"
    );

const destinationCountry =
    document.getElementById(
        "destinationCountry"
    );

const customerName =
    document.getElementById(
        "customerName"
    );

const customerEmail =
    document.getElementById(
        "customerEmail"
    );

const customerMessage =
    document.getElementById(
        "customerMessage"
    );



/* =====================================================
   VARIABLES
   ===================================================== */

let vehicle = null;

let galleryImages = [];

let currentImageIndex = 0;



/* =====================================================
   FALLBACK
   ===================================================== */

const fallbackImage =
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85";



/* =====================================================
   GET VALUE
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
   IMAGES
   ===================================================== */

function getImages(data) {

    let images =
        getValue(
            data,
            "images",
            "imageUrls",
            "photos"
        );


    if (
        Array.isArray(images)
    ) {

        return images.filter(Boolean);

    }


    if (
        typeof images === "string" &&
        images.trim()
    ) {

        return [
            images
        ];

    }


    const image =
        getValue(
            data,
            "image",
            "imageUrl"
        );


    if (image) {

        return [
            image
        ];

    }


    return [
        fallbackImage
    ];

}



/* =====================================================
   NORMALIZE FEATURES
   ===================================================== */

function getFeatures(data) {

    const features =
        getValue(
            data,
            "features",
            "keyFeatures"
        );


    if (
        Array.isArray(features)
    ) {

        return features.filter(Boolean);

    }


    if (
        typeof features === "string"
    ) {

        return features
            .split(/\n|,/)
            .map(
                item =>
                    item.trim()
            )
            .filter(Boolean);

    }


    return [

        "Quality Japanese vehicle",

        "Reliable performance",

        "Personal support",

        "Export assistance"

    ];

}



/* =====================================================
   LOAD VEHICLE
   ===================================================== */

async function loadVehicle() {

    if (!vehicleId) {

        showError(
            "No vehicle was selected."
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
                "Vehicle not found."
            );

            return;

        }


        const data =
            snapshot.data();


        vehicle = {

            id:
                snapshot.id,

            ref:
                getValue(
                    data,
                    "ref",
                    "referenceNumber",
                    "reference"
                ) || "HVE",

            make:
                getValue(
                    data,
                    "make",
                    "brand"
                ) || "Japanese",

            model:
                getValue(
                    data,
                    "model"
                ) || "Vehicle",

            year:
                getValue(
                    data,
                    "year"
                ) || "—",

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

            drive:
                getValue(
                    data,
                    "drive",
                    "drivetrain"
                ) || "—",

            status:
                getValue(
                    data,
                    "status"
                ) || "Available",

            description:
                getValue(
                    data,
                    "description"
                ) ||
                "This quality Japanese vehicle is available through Hasnain Vehicle Exporter. Contact us for current availability, country-specific pricing and shipping information.",

            features:
                getFeatures(data),

            images:
                getImages(data)

        };


        galleryImages =
            vehicle.images;


        renderVehicle();


        loadSimilarVehicles();


    } catch (error) {

        console.error(
            error
        );


        showError(
            "Unable to load this vehicle."
        );

    }

}



/* =====================================================
   RENDER VEHICLE
   ===================================================== */

function renderVehicle() {

    const title =
        `${vehicle.make} ${vehicle.model}`;


    vehicleTitle.textContent =
        title;


    breadcrumbVehicle.textContent =
        title;


    vehicleReference.textContent =
        vehicle.ref;


    vehicleYear.textContent =
        vehicle.year;


    vehicleMileage.textContent =
        formatMileage(
            vehicle.mileage
        );


    vehicleEngine.textContent =
        vehicle.engine;


    vehicleTransmission.textContent =
        vehicle.transmission;


    vehicleFuel.textContent =
        vehicle.fuel;


    vehicleDrive.textContent =
        vehicle.drive;


    vehicleDescription.textContent =
        vehicle.description;


    document.title =
        `${title} | Hasnain Vehicle Exporter`;


    renderGallery();


    renderFeatures();


    renderSpecifications();


    renderWhatsApp();


}



/* =====================================================
   MILEAGE
   ===================================================== */

function formatMileage(value) {

    if (
        value === "—"
    ) {

        return value;

    }


    const number =
        String(value)
            .replace(/,/g, "")
            .replace(/[^\d.]/g, "");


    if (
        number
    ) {

        return (
            Number(number)
                .toLocaleString()
            + " km"
        );

    }


    return String(value);

}



/* =====================================================
   GALLERY
   ===================================================== */

function renderGallery() {

    if (
        !galleryImages.length
    ) {

        galleryImages =
            [fallbackImage];

    }


    currentImageIndex =
        0;


    showGalleryImage(
        0
    );


    thumbnailRow.innerHTML =
        "";


    galleryImages.forEach(
        (image, index) => {

            const thumbnail =
                document.createElement(
                    "div"
                );


            thumbnail.className =
                "thumbnail";


            if (
                index === 0
            ) {

                thumbnail.classList.add(
                    "active"
                );

            }


            thumbnail.innerHTML = `

                <img
                    src="${escapeAttr(image)}"
                    alt="${escapeAttr(vehicle.make + " " + vehicle.model)}"
                >

            `;


            thumbnail.addEventListener(
                "click",
                () => {

                    showGalleryImage(
                        index
                    );

                }
            );


            thumbnailRow.appendChild(
                thumbnail
            );

        }
    );


    renderLargeGallery();

}



/* =====================================================
   SHOW IMAGE
   ===================================================== */

function showGalleryImage(index) {

    if (
        !galleryImages.length
    ) {

        return;

    }


    currentImageIndex =
        index;


    mainImage.src =
        galleryImages[index];


    mainImage.alt =
        `${vehicle.make} ${vehicle.model}`;


    imageCounter.textContent =
        `${index + 1} / ${galleryImages.length}`;


    document
        .querySelectorAll(
            ".thumbnail"
        )
        .forEach(
            (thumbnail, i) => {

                thumbnail.classList.toggle(
                    "active",
                    i === index
                );

            }
        );

}



/* =====================================================
   GALLERY BUTTONS
   ===================================================== */

document
    .getElementById(
        "galleryPrev"
    )
    .addEventListener(
        "click",
        () => {

            let next =
                currentImageIndex - 1;


            if (
                next < 0
            ) {

                next =
                    galleryImages.length - 1;

            }


            showGalleryImage(
                next
            );

        }
    );


document
    .getElementById(
        "galleryNext"
    )
    .addEventListener(
        "click",
        () => {

            let next =
                currentImageIndex + 1;


            if (
                next >= galleryImages.length
            ) {

                next = 0;

            }


            showGalleryImage(
                next
            );

        }
    );



/* =====================================================
   MAIN IMAGE FALLBACK
   ===================================================== */

mainImage.addEventListener(
    "error",
    () => {

        if (
            mainImage.src !==
            fallbackImage
        ) {

            mainImage.src =
                fallbackImage;

        }

    }
);



/* =====================================================
   FEATURES
   ===================================================== */

function renderFeatures() {

    keyFeaturesList.innerHTML =
        "";


    featuresGrid.innerHTML =
        "";


    vehicle.features.forEach(
        feature => {


            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                feature;


            keyFeaturesList.appendChild(
                li
            );



            const featureBox =
                document.createElement(
                    "div"
                );


            featureBox.className =
                "feature-item";


            featureBox.textContent =
                feature;


            featuresGrid.appendChild(
                featureBox
            );

        }
    );

}



/* =====================================================
   SPECIFICATIONS
   ===================================================== */

function renderSpecifications() {

    const specifications = [

        [
            "Reference",
            vehicle.ref
        ],

        [
            "Make",
            vehicle.make
        ],

        [
            "Model",
            vehicle.model
        ],

        [
            "Year",
            vehicle.year
        ],

        [
            "Mileage",
            formatMileage(
                vehicle.mileage
            )
        ],

        [
            "Engine",
            vehicle.engine
        ],

        [
            "Fuel Type",
            vehicle.fuel
        ],

        [
            "Transmission",
            vehicle.transmission
        ],

        [
            "Drive",
            vehicle.drive
        ],

        [
            "Status",
            vehicle.status
        ]

    ];


    fullSpecifications.innerHTML =
        "";


    specifications.forEach(
        item => {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "full-spec";


            box.innerHTML = `

                <span>
                    ${escapeHtml(item[0])}
                </span>

                <strong>
                    ${escapeHtml(item[1])}
                </strong>

            `;


            fullSpecifications.appendChild(
                box
            );

        }
    );

}



/* =====================================================
   LARGE GALLERY
   ===================================================== */

function renderLargeGallery() {

    largeGallery.innerHTML =
        "";


    morePhotos.innerHTML =
        "";


    galleryImages.forEach(
        image => {

            const large =
                document.createElement(
                    "img"
                );


            large.src =
                image;


            large.alt =
                vehicle.make +
                " " +
                vehicle.model;


            largeGallery.appendChild(
                large
            );


            const photo =
                document.createElement(
                    "div"
                );


            photo.className =
                "more-photo";


            photo.innerHTML = `

                <img
                    src="${escapeAttr(image)}"
                    alt="${escapeAttr(vehicle.make + " " + vehicle.model)}"
                    loading="lazy"
                >

            `;


            photo.addEventListener(
                "click",
                () => {

                    const index =
                        galleryImages.indexOf(
                            image
                        );


                    if (
                        index >= 0
                    ) {

                        showGalleryImage(
                            index
                        );


                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }

                }
            );


            morePhotos.appendChild(
                photo
            );

        }
    );

}



/* =====================================================
   WHATSAPP
   ===================================================== */

function createWhatsAppURL(
    country = ""
) {

    const title =
        `${vehicle.make} ${vehicle.model}`;


    let message =
        `Hello Hasnain Vehicle Exporter, I am interested in the ${title} ${vehicle.year} (Ref: ${vehicle.ref}).`;


    if (
        country
    ) {

        message +=
            ` Destination: ${country}.`;

    }


    message +=
        ` Please provide the country-specific price and shipping details.`;


    return (
        "https://wa.me/923198148346?text=" +
        encodeURIComponent(
            message
        )
    );

}



/* =====================================================
   MAIN WHATSAPP
   ===================================================== */

function renderWhatsApp() {

    const button =
        document.getElementById(
            "mainWhatsAppButton"
        );


    button.addEventListener(
        "click",
        () => {

            const country =
                destinationCountry.value;


            window.open(
                createWhatsAppURL(
                    country
                ),
                "_blank"
            );

        }
    );

}



/* =====================================================
   CONTACT FORM
   ===================================================== */

document
    .getElementById(
        "vehicleContactForm"
    )
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                customerName.value.trim();


            const email =
                customerEmail.value.trim();


            const country =
                destinationCountry.value;


            const message =
                customerMessage.value.trim();


            const title =
                `${vehicle.make} ${vehicle.model}`;


            let whatsappMessage =
                `Hello Hasnain Vehicle Exporter,%0A%0A`;


            whatsappMessage +=
                `I am interested in:%20${encodeURIComponent(title)}%0A`;


            whatsappMessage +=
                `Year:%20${encodeURIComponent(vehicle.year)}%0A`;


            whatsappMessage +=
                `Reference:%20${encodeURIComponent(vehicle.ref)}%0A`;


            whatsappMessage +=
                `Destination:%20${encodeURIComponent(country)}%0A`;


            whatsappMessage +=
                `Name:%20${encodeURIComponent(name)}%0A`;


            if (email) {

                whatsappMessage +=
                    `Email:%20${encodeURIComponent(email)}%0A`;

            }


            if (message) {

                whatsappMessage +=
                    `Message:%20${encodeURIComponent(message)}%0A`;

            }


            whatsappMessage +=
                `%0APlease provide the country-specific price and shipping details.`;


            window.open(
                "https://wa.me/923198148346?text=" +
                whatsappMessage,
                "_blank"
            );

        }
    );



/* =====================================================
   TABS
   ===================================================== */

document
    .querySelectorAll(
        ".information-tab"
    )
    .forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    const target =
                        tab.dataset.tab;


                    document
                        .querySelectorAll(
                            ".information-tab"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    document
                        .querySelectorAll(
                            ".tab-panel"
                        )
                        .forEach(
                            panel => {

                                panel.classList.remove(
                                    "active"
                                );

                            }
                        );


                    tab.classList.add(
                        "active"
                    );


                    document
                        .getElementById(
                            `tab-${target}`
                        )
                        .classList.add(
                            "active"
                        );

                }
            );

        }
    );



/* =====================================================
   FAVORITE
   ===================================================== */

document
    .getElementById(
        "favoriteButton"
    )
    .addEventListener(
        "click",
        event => {

            event.currentTarget.classList.toggle(
                "saved"
            );


            event.currentTarget.textContent =
                event.currentTarget.classList.contains(
                    "saved"
                )
                    ? "♥"
                    : "♡";

        }
    );



/* =====================================================
   SIMILAR VEHICLES
   ===================================================== */

async function loadSimilarVehicles() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "vehicles"
                )
            );


        const allVehicles =
            snapshot.docs
                .map(
                    item => {

                        const data =
                            item.data();


                        return {

                            id:
                                item.id,

                            make:
                                getValue(
                                    data,
                                    "make",
                                    "brand"
                                ) || "",

                            model:
                                getValue(
                                    data,
                                    "model"
                                ) || "",

                            year:
                                getValue(
                                    data,
                                    "year"
                                ) || "—",

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

                            ref:
                                getValue(
                                    data,
                                    "ref",
                                    "referenceNumber",
                                    "reference"
                                ) || "HVE",

                            image:
                                getImages(data)[0]

                        };

                    }
                )
                .filter(
                    item =>
                        item.id !== vehicleId
                );


        const sameMake =
            allVehicles.filter(
                item =>
                    item.make === vehicle.make
            );


        const finalList =
            [
                ...sameMake,
                ...allVehicles
            ]
            .filter(
                (item, index, arr) =>
                    arr.findIndex(
                        x =>
                            x.id === item.id
                    ) === index
            )
            .slice(0, 3);


        renderSimilar(
            finalList
        );


    } catch (error) {

        console.error(
            "Similar vehicles error:",
            error
        );


        similarVehicles.innerHTML = `
            <div class="similar-loading">
                View more vehicles in our catalog.
            </div>
        `;

    }

}



/* =====================================================
   RENDER SIMILAR
   ===================================================== */

function renderSimilar(list) {

    similarVehicles.innerHTML =
        "";


    if (
        !list.length
    ) {

        similarVehicles.innerHTML = `

            <div class="similar-loading">
                More vehicles coming soon.
            </div>

        `;

        return;

    }


    list.forEach(
        item => {

            const element =
                document.createElement(
                    "a"
                );


            element.href =
                `vehicle-details.html?id=${encodeURIComponent(item.id)}`;


            element.className =
                "similar-item";


            element.innerHTML = `

                <div class="similar-image">

                    <img
                        src="${escapeAttr(item.image || fallbackImage)}"
                        alt="${escapeAttr(item.make + " " + item.model)}"
                    >

                </div>


                <div class="similar-info">

                    <strong>
                        🇯🇵
                        ${escapeHtml(item.make)}
                        ${escapeHtml(item.model)}
                    </strong>

                    <small>
                        ${escapeHtml(String(item.year))}
                        &nbsp;•&nbsp;
                        ${escapeHtml(String(item.mileage))}
                        &nbsp;•&nbsp;
                        ${escapeHtml(String(item.engine))}
                    </small>

                    <div class="similar-price">
                        Request Quote
                    </div>

                </div>

            `;


            similarVehicles.appendChild(
                element
            );

        }
    );

}



/* =====================================================
   ERROR
   ===================================================== */

function showError(message) {

    document.querySelector(
        "main"
    ).innerHTML = `

        <div
            style="
                min-height:70vh;
                display:flex;
                align-items:center;
                justify-content:center;
                text-align:center;
                padding:40px;
            "
        >

            <div>

                <h1
                    style="
                        color:#d4af37;
                        margin-bottom:12px;
                    "
                >
                    ${escapeHtml(message)}
                </h1>

                <p
                    style="
                        color:#b8c0c4;
                        margin-bottom:20px;
                    "
                >
                    The vehicle may have been removed
                    or the link may be incorrect.
                </p>

                <a
                    href="vehicles.html"
                    style="
                        display:inline-block;
                        padding:11px 20px;
                        background:#d4af37;
                        color:#111;
                        border-radius:5px;
                        font-weight:800;
                    "
                >
                    Browse Vehicles
                </a>

            </div>

        </div>

    `;

}



/* =====================================================
   ESCAPE
   ===================================================== */

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttr(value) {

    return escapeHtml(value);

}



/* =====================================================
   MOBILE NAV
   ===================================================== */

const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const mainNav =
    document.getElementById(
        "mainNav"
    );


menuToggle.addEventListener(
    "click",
    () => {

        const open =
            mainNav.classList.toggle(
                "open"
            );


        menuToggle.setAttribute(
            "aria-expanded",
            String(open)
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

                }
            );

        }
    );



/* =====================================================
   START
   ===================================================== */

loadVehicle();

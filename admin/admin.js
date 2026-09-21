/* ============================================================
   HASNAIN VEHICLE EXPORTER
   ADMIN DASHBOARD JAVASCRIPT

   Firebase Authentication
   Firestore
   Cloudinary
   Vehicle CRUD
   HVE References
   Search / Filters
   Tracking
============================================================ */

import {
    auth,
    db,
    ADMIN_EMAILS,
    CLOUDINARY_UPLOAD_URL,
    CLOUDINARY_UPLOAD_PRESET
} from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ============================================================
   CONFIGURATION
============================================================ */

const VEHICLES_COLLECTION = "vehicles";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80";


/* ============================================================
   COUNTRY DATA
============================================================ */

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
    "Côte d'Ivoire",
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
    "São Tomé and Príncipe",
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


/* ============================================================
   STATE
============================================================ */

let allVehicles = [];

let selectedImages = [];

let existingImages = [];

let editingVehicleId = null;


/* ============================================================
   DOM HELPERS
============================================================ */

const $ = (id) => document.getElementById(id);

function show(element) {
    if (element) {
        element.classList.remove("hidden");
    }
}

function hide(element) {
    if (element) {
        element.classList.add("hidden");
    }
}

function value(id) {
    const element = $(id);
    return element ? element.value.trim() : "";
}

function setValue(id, val) {
    const element = $(id);

    if (element) {
        element.value = val ?? "";
    }
}


/* ============================================================
   AUTHORIZATION
============================================================ */

function isAuthorizedAdmin(user) {

    if (!user || !user.email) {
        return false;
    }

    const email = user.email.trim().toLowerCase();

    return ADMIN_EMAILS
        .map(item => item.toLowerCase())
        .includes(email);
}


/* ============================================================
   LOGIN
============================================================ */

const loginForm = $("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = value("email").toLowerCase();

        const password = $("password")?.value || "";

        const loginButton = $("loginButton");

        const loginButtonText = $("loginButtonText");

        const loginSpinner = $("loginSpinner");

        const loginError = $("loginError");

        hide(loginError);

        if (!email || !password) {

            showLoginError(
                "Please enter your email address and password."
            );

            return;
        }

        loginButton.disabled = true;

        if (loginButtonText) {
            loginButtonText.textContent = "Signing In...";
        }

        show(loginSpinner);

        try {

            const credentials =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = credentials.user;

            if (!isAuthorizedAdmin(user)) {

                await signOut(auth);

                throw new Error(
                    "This account is not authorized for the HVE dashboard."
                );
            }

        } catch (error) {

            console.error("Login error:", error);

            showLoginError(
                getFirebaseErrorMessage(error)
            );

        } finally {

            loginButton.disabled = false;

            if (loginButtonText) {
                loginButtonText.textContent = "Sign In";
            }

            hide(loginSpinner);
        }

    });

}


/* ============================================================
   PASSWORD VISIBILITY
============================================================ */

const togglePassword = $("togglePassword");

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        const password = $("password");

        if (!password) return;

        if (password.type === "password") {

            password.type = "text";

            togglePassword.textContent = "Hide";

        } else {

            password.type = "password";

            togglePassword.textContent = "Show";
        }

    });

}


/* ============================================================
   FIREBASE AUTH STATE
============================================================ */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        show($("loginScreen"));
        hide($("dashboard"));

        return;
    }

    if (!isAuthorizedAdmin(user)) {

        await signOut(auth);

        showLoginError(
            "This account is not authorized for the HVE dashboard."
        );

        return;
    }

    hide($("loginScreen"));
    show($("dashboard"));

    const adminEmail = $("adminEmail");

    if (adminEmail) {
        adminEmail.textContent = user.email;
    }

    await initializeDashboard();

});


/* ============================================================
   FIREBASE ERROR MESSAGES
============================================================ */

function getFirebaseErrorMessage(error) {

    const code = error?.code || "";

    switch (code) {

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/invalid-login-credentials":
            return "Invalid email or password.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/user-not-found":
            return "No Firebase account exists with this email.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-disabled":
            return "This Firebase account has been disabled.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please wait and try again.";

        case "auth/unauthorized-domain":
            return "This website domain is not authorized in Firebase Authentication.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        case "auth/configuration-not-found":
            return "Firebase Authentication is not configured correctly.";

        default:
            return error?.message ||
                "Login failed. Please check Firebase settings.";
    }
}


function showLoginError(message) {

    const loginError = $("loginError");

    if (!loginError) return;

    loginError.textContent = message;

    show(loginError);
}


/* ============================================================
   LOGOUT
============================================================ */

const logoutButton = $("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error("Logout error:", error);

            showToast(
                "Could not sign out.",
                "error"
            );
        }

    });

}


/* ============================================================
   DASHBOARD INITIALIZATION
============================================================ */

async function initializeDashboard() {

    populateCountrySelector();

    setupNavigation();

    setupVehicleForm();

    setupVehicleFilters();

    setupMobileMenu();

    await loadVehicles();

}


/* ============================================================
   NAVIGATION
============================================================ */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach((button) => {

        button.addEventListener("click", () => {

            const section =
                button.dataset.section;

            openSection(section);

        });

    });


    document
        .querySelectorAll("[data-open-section]")
        .forEach((button) => {

            button.addEventListener("click", () => {

                openSection(
                    button.dataset.openSection
                );

            });

        });

}


function openSection(sectionName) {

    document
        .querySelectorAll(".dashboard-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    const target =
        $(`section-${sectionName}`);

    if (target) {

        target.classList.add(
            "active-section"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );

        });


    const pageTitle = $("pageTitle");

    if (pageTitle) {

        const titles = {

            overview: "Dashboard",

            vehicles: "All Vehicles",

            addVehicle: editingVehicleId
                ? "Edit Vehicle"
                : "Add Vehicle",

            tracking: "Vehicle Tracking"

        };

        pageTitle.textContent =
            titles[sectionName] || "Dashboard";
    }


    if (sectionName === "tracking") {

        renderTracking();

    }

    closeMobileMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ============================================================
   MOBILE MENU
============================================================ */

function setupMobileMenu() {

    const button =
        $("mobileMenuButton");

    const sidebar =
        $("sidebar");

    if (!button || !sidebar) return;

    button.addEventListener("click", () => {

        sidebar.classList.toggle(
            "mobile-open"
        );

    });

}


function closeMobileMenu() {

    const sidebar =
        $("sidebar");

    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );

    }

}


/* ============================================================
   COUNTRY SELECTOR
============================================================ */

function populateCountrySelector(
    selectedCountry = ""
) {

    const countrySelect =
        $("country");

    if (!countrySelect) return;

    countrySelect.innerHTML = "";

    const emptyOption =
        document.createElement("option");

    emptyOption.value = "";

    emptyOption.textContent =
        "No Destination Yet";

    countrySelect.appendChild(
        emptyOption
    );


    const africaGroup =
        document.createElement("optgroup");

    africaGroup.label =
        "Africa";

    AFRICA_COUNTRIES.forEach(country => {

        const option =
            document.createElement("option");

        option.value = country;

        option.textContent = country;

        africaGroup.appendChild(option);

    });

    countrySelect.appendChild(
        africaGroup
    );


    const caribbeanGroup =
        document.createElement("optgroup");

    caribbeanGroup.label =
        "Caribbean";

    CARIBBEAN_COUNTRIES.forEach(country => {

        const option =
            document.createElement("option");

        option.value = country;

        option.textContent = country;

        caribbeanGroup.appendChild(option);

    });

    countrySelect.appendChild(
        caribbeanGroup
    );


    if (selectedCountry) {

        countrySelect.value =
            selectedCountry;

    }

}


/* ============================================================
   LOAD VEHICLES
============================================================ */

async function loadVehicles() {

    const vehicleList =
        $("vehicleList");

    if (vehicleList) {

        vehicleList.innerHTML = `
            <div class="loading-state">
                Loading vehicles...
            </div>
        `;

    }

    try {

        const vehiclesRef =
            collection(
                db,
                VEHICLES_COLLECTION
            );

        const snapshot =
            await getDocs(vehiclesRef);

        allVehicles = [];

        snapshot.forEach(item => {

            allVehicles.push({
                id: item.id,
                ...item.data()
            });

        });


        sortVehicles();

        renderStatistics();

        renderVehicleList();

        renderRecentVehicles();

        renderTracking();

    } catch (error) {

        console.error(
            "Firestore load error:",
            error
        );

        if (vehicleList) {

            vehicleList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">!</div>
                    <h3>Could not load vehicles</h3>
                    <p>${escapeHtml(error.message)}</p>
                </div>
            `;

        }

        showToast(
            "Could not load vehicles from Firebase.",
            "error"
        );
    }

}


function sortVehicles() {

    allVehicles.sort((a, b) => {

        const aTime =
            getTimestampMillis(
                a.updatedAt ||
                a.createdAt
            );

        const bTime =
            getTimestampMillis(
                b.updatedAt ||
                b.createdAt
            );

        return bTime - aTime;

    });

}


/* ============================================================
   STATISTICS
============================================================ */

function renderStatistics() {

    const total =
        allVehicles.length;

    const available =
        allVehicles.filter(
            item => item.status === "Available"
        ).length;

    const transit =
        allVehicles.filter(
            item =>
                item.status === "In Transit"
        ).length;

    const delivered =
        allVehicles.filter(
            item =>
                item.status === "Delivered"
        ).length;


    setText(
        "statTotal",
        total
    );

    setText(
        "statAvailable",
        available
    );

    setText(
        "statTransit",
        transit
    );

    setText(
        "statDelivered",
        delivered
    );

}


function setText(id, text) {

    const element = $(id);

    if (element) {
        element.textContent = text;
    }

}


/* ============================================================
   RECENT VEHICLES
============================================================ */

function renderRecentVehicles() {

    const container =
        $("recentVehicles");

    if (!container) return;

    const vehicles =
        allVehicles.slice(0, 6);

    if (!vehicles.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🚘</div>
                <h3>No vehicles yet</h3>
                <p>
                    Add your first vehicle to your inventory.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        vehicles.map(vehicle => {

            const title =
                getVehicleTitle(vehicle);

            const image =
                getFirstImage(vehicle);

            return `
                <div class="recent-row">

                    <img
                        class="recent-image"
                        src="${escapeAttribute(image)}"
                        alt="${escapeAttribute(title)}"
                        onerror="this.src='${FALLBACK_IMAGE}'"
                    >

                    <div class="recent-info">

                        <strong>
                            ${escapeHtml(title)}
                        </strong>

                        <span>
                            ${escapeHtml(
                                vehicle.ref ||
                                vehicle.referenceNumber ||
                                "No reference"
                            )}
                        </span>

                    </div>

                    ${statusBadge(vehicle.status)}

                </div>
            `;

        }).join("");

}


/* ============================================================
   VEHICLE LIST
============================================================ */

function renderVehicleList() {

    const container =
        $("vehicleList");

    if (!container) return;

    const search =
        value("vehicleSearch")
            .toLowerCase();

    const status =
        value("statusFilter");

    const region =
        value("regionFilter");


    let vehicles =
        allVehicles.filter(vehicle => {

            const title =
                getVehicleTitle(vehicle)
                    .toLowerCase();

            const ref =
                String(
                    vehicle.ref ||
                    vehicle.referenceNumber ||
                    ""
                ).toLowerCase();

            const country =
                String(
                    vehicle.country ||
                    vehicle.destinationCountry ||
                    ""
                ).toLowerCase();


            const matchesSearch =
                !search ||
                title.includes(search) ||
                ref.includes(search) ||
                country.includes(search);


            const matchesStatus =
                status === "all" ||
                vehicle.status === status;


            const matchesRegion =
                region === "all" ||
                vehicle.region === region;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesRegion
            );

        });


    if (!vehicles.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🚘
                </div>

                <h3>
                    No vehicles found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        vehicles.map(vehicle =>
            vehicleAdminRow(vehicle)
        ).join("");


    attachVehicleActions();

}


function vehicleAdminRow(vehicle) {

    const title =
        getVehicleTitle(vehicle);

    const image =
        getFirstImage(vehicle);

    const ref =
        vehicle.ref ||
        vehicle.referenceNumber ||
        "No Reference";

    const country =
        vehicle.country ||
        vehicle.destinationCountry ||
        "No destination";


    return `
        <div
            class="vehicle-admin-row"
            data-id="${escapeAttribute(vehicle.id)}"
        >

            <img
                class="admin-vehicle-image"
                src="${escapeAttribute(image)}"
                alt="${escapeAttribute(title)}"
                onerror="this.src='${FALLBACK_IMAGE}'"
            >


            <div class="admin-vehicle-name">

                <strong>
                    ${escapeHtml(title)}
                </strong>

                <span>
                    ${escapeHtml(country)}
                </span>

            </div>


            <div class="vehicle-ref">
                ${escapeHtml(ref)}
            </div>


            <div>
                ${statusBadge(vehicle.status)}
            </div>


            <div class="vehicle-location">
                ${escapeHtml(
                    vehicle.region || "—"
                )}
            </div>


            <div class="vehicle-actions">

                <button
                    type="button"
                    class="icon-button edit-vehicle"
                    data-id="${escapeAttribute(vehicle.id)}"
                    title="Edit"
                >
                    ✎
                </button>

                <button
                    type="button"
                    class="icon-button delete delete-vehicle"
                    data-id="${escapeAttribute(vehicle.id)}"
                    title="Delete"
                >
                    ×
                </button>

            </div>

        </div>
    `;
}


function attachVehicleActions() {

    document
        .querySelectorAll(".edit-vehicle")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => editVehicle(button.dataset.id)
            );

        });


    document
        .querySelectorAll(".delete-vehicle")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteVehicle(button.dataset.id)
            );

        });

}


/* ============================================================
   SEARCH / FILTERS
============================================================ */

function setupVehicleFilters() {

    const search =
        $("vehicleSearch");

    const status =
        $("statusFilter");

    const region =
        $("regionFilter");


    if (search) {

        search.addEventListener(
            "input",
            renderVehicleList
        );

    }

    if (status) {

        status.addEventListener(
            "change",
            renderVehicleList
        );

    }

    if (region) {

        region.addEventListener(
            "change",
            renderVehicleList
        );

    }

}


/* ============================================================
   VEHICLE FORM
============================================================ */

function setupVehicleForm() {

    const form =
        $("vehicleForm");

    if (!form) return;


    form.addEventListener(
        "submit",
        saveVehicle
    );


    const imageInput =
        $("vehicleImages");

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            handleImageSelection
        );

    }


    const cancel =
        $("cancelVehicleButton");

    if (cancel) {

        cancel.addEventListener(
            "click",
            () => {

                resetVehicleForm();

                openSection("vehicles");

            }
        );

    }


    const region =
        $("region");

    if (region) {

        region.addEventListener(
            "change",
            () => {

                const currentCountry =
                    value("country");

                populateCountrySelector(
                    currentCountry
                );

            }
        );

    }

}


/* ============================================================
   IMAGE SELECTION
============================================================ */

function handleImageSelection(event) {

    const files =
        Array.from(
            event.target.files || []
        );

    selectedImages = files;

    renderImagePreview();

}


function renderImagePreview() {

    const container =
        $("imagePreview");

    if (!container) return;

    container.innerHTML = "";


    existingImages.forEach(
        (image, index) => {

            container.insertAdjacentHTML(
                "beforeend",
                `
                <div class="preview-image">

                    <img
                        src="${escapeAttribute(image)}"
                        alt="Vehicle photo"
                    >

                    <button
                        type="button"
                        class="preview-remove"
                        data-existing-index="${index}"
                        title="Remove photo"
                    >
                        ×
                    </button>

                </div>
                `
            );

        }
    );


    selectedImages.forEach(
        (file, index) => {

            const url =
                URL.createObjectURL(file);

            container.insertAdjacentHTML(
                "beforeend",
                `
                <div class="preview-image">

                    <img
                        src="${url}"
                        alt="${escapeAttribute(file.name)}"
                    >

                    <button
                        type="button"
                        class="preview-remove"
                        data-selected-index="${index}"
                        title="Remove photo"
                    >
                        ×
                    </button>

                </div>
                `
            );

        }
    );


    container
        .querySelectorAll(
            "[data-existing-index]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.existingIndex
                        );

                    existingImages.splice(
                        index,
                        1
                    );

                    renderImagePreview();

                }
            );

        });


    container
        .querySelectorAll(
            "[data-selected-index]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.selectedIndex
                        );

                    selectedImages.splice(
                        index,
                        1
                    );

                    renderImagePreview();

                }
            );

        });

}


/* ============================================================
   SAVE VEHICLE
============================================================ */

async function saveVehicle(event) {

    event.preventDefault();


    const saveButton =
        $("saveVehicleButton");

    const message =
        $("vehicleFormMessage");


    hide(message);


    const make =
        value("make");

    const model =
        value("model");

    const year =
        value("year");


    if (!make || !model || !year) {

        showFormMessage(
            "Please complete Make, Model and Year.",
            "error"
        );

        return;
    }


    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";


    try {

        const user =
            auth.currentUser;


        if (!isAuthorizedAdmin(user)) {

            throw new Error(
                "You are not authorized to modify vehicles."
            );

        }


        const vehicleData = {

            make,

            model,

            year: Number(year),

            mileage:
                value("mileage"),

            engine:
                value("engine"),

            fuel:
                value("fuel"),

            transmission:
                value("transmission"),

            drive:
                value("drive"),

            status:
                value("status") ||
                "Available",

            region:
                value("region"),

            country:
                value("country"),

            destinationCountry:
                value("country"),

            description:
                value("description"),

            features:
                parseFeatures(
                    value("features")
                ),

            images:
                [...existingImages],

            updatedAt:
                serverTimestamp()

        };


        if (!editingVehicleId) {

            vehicleData.ref =
                await generateNextReference();

            vehicleData.createdAt =
                serverTimestamp();

            vehicleData.createdBy =
                user.email;

            vehicleData.priceText =
                "Request Country-Specific Quote";

            vehicleData.trackingStatus =
                vehicleData.status;


            if (selectedImages.length) {

                const uploaded =
                    await uploadImages(
                        selectedImages
                    );

                vehicleData.images =
                    uploaded;

            }


            await addDoc(
                collection(
                    db,
                    VEHICLES_COLLECTION
                ),
                vehicleData
            );


            showFormMessage(
                `Vehicle ${vehicleData.ref} added successfully.`,
                "success"
            );


        } else {

            if (selectedImages.length) {

                const uploaded =
                    await uploadImages(
                        selectedImages
                    );

                vehicleData.images =
                    [
                        ...existingImages,
                        ...uploaded
                    ];

            }


            await updateDoc(
                doc(
                    db,
                    VEHICLES_COLLECTION,
                    editingVehicleId
                ),
                vehicleData
            );


            showFormMessage(
                "Vehicle updated successfully.",
                "success"
            );

        }


        await loadVehicles();


        setTimeout(() => {

            resetVehicleForm();

            openSection("vehicles");

        }, 900);


    } catch (error) {

        console.error(
            "Save vehicle error:",
            error
        );

        showFormMessage(
            error.message ||
            "Could not save vehicle.",
            "error"
        );

    } finally {

        saveButton.disabled = false;

        saveButton.textContent =
            editingVehicleId
                ? "Update Vehicle"
                : "Save Vehicle";

    }

}


/* ============================================================
   GENERATE HVE REFERENCE
============================================================ */

async function generateNextReference() {

    const numbers =
        allVehicles
            .map(vehicle => {

                const ref =
                    String(
                        vehicle.ref ||
                        vehicle.referenceNumber ||
                        ""
                    );

                const match =
                    ref.match(
                        /HVE-(\d+)/i
                    );

                return match
                    ? Number(match[1])
                    : 0;

            })
            .filter(number =>
                Number.isFinite(number)
            );


    const next =
        numbers.length
            ? Math.max(...numbers) + 1
            : 1;


    return `HVE-${String(next).padStart(4, "0")}`;

}


/* ============================================================
   CLOUDINARY UPLOAD
============================================================ */

async function uploadImages(files) {

    const uploadedUrls = [];


    for (const file of files) {

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );

        formData.append(
            "upload_preset",
            CLOUDINARY_UPLOAD_PRESET
        );


        const response =
            await fetch(
                CLOUDINARY_UPLOAD_URL,
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {

            throw new Error(
                "Cloudinary image upload failed."
            );

        }


        const result =
            await response.json();


        if (!result.secure_url) {

            throw new Error(
                "Cloudinary did not return an image URL."
            );

        }


        uploadedUrls.push(
            result.secure_url
        );

    }


    return uploadedUrls;

}


/* ============================================================
   EDIT VEHICLE
============================================================ */

async function editVehicle(vehicleId) {

    const vehicle =
        allVehicles.find(
            item => item.id === vehicleId
        );


    if (!vehicle) {

        showToast(
            "Vehicle not found.",
            "error"
        );

        return;
    }


    editingVehicleId =
        vehicleId;


    setValue(
        "editingVehicleId",
        vehicleId
    );


    setValue(
        "make",
        vehicle.make ||
        vehicle.brand ||
        ""
    );


    setValue(
        "model",
        vehicle.model ||
        ""
    );


    setValue(
        "year",
        vehicle.year ||
        ""
    );


    setValue(
        "mileage",
        vehicle.mileage ||
        ""
    );


    setValue(
        "engine",
        vehicle.engine ||
        ""
    );


    setValue(
        "fuel",
        vehicle.fuel ||
        ""
    );


    setValue(
        "transmission",
        vehicle.transmission ||
        ""
    );


    setValue(
        "drive",
        vehicle.drive ||
        ""
    );


    setValue(
        "reference",
        vehicle.ref ||
        vehicle.referenceNumber ||
        ""
    );


    setValue(
        "status",
        vehicle.status ||
        "Available"
    );


    setValue(
        "region",
        vehicle.region ||
        ""
    );


    populateCountrySelector(
        vehicle.country ||
        vehicle.destinationCountry ||
        ""
    );


    setValue(
        "description",
        vehicle.description ||
        ""
    );


    setValue(
        "features",
        Array.isArray(vehicle.features)
            ? vehicle.features.join(", ")
            : vehicle.features || ""
    );


    existingImages =
        getImages(vehicle);

    selectedImages = [];


    renderImagePreview();


    const title =
        $("vehicleFormTitle");

    if (title) {

        title.innerHTML =
            "Edit <span>Vehicle</span>";

    }


    const subtitle =
        $("vehicleFormSubtitle");

    if (subtitle) {

        subtitle.textContent =
            `Editing ${vehicle.ref || "vehicle listing"}.`;

    }


    const saveButton =
        $("saveVehicleButton");

    if (saveButton) {

        saveButton.textContent =
            "Update Vehicle";

    }


    openSection("addVehicle");

}


/* ============================================================
   DELETE VEHICLE
============================================================ */

async function deleteVehicle(vehicleId) {

    const vehicle =
        allVehicles.find(
            item => item.id === vehicleId
        );


    if (!vehicle) return;


    const title =
        getVehicleTitle(vehicle);


    const confirmed =
        window.confirm(
            `Delete ${title} (${vehicle.ref || "No Reference"})?\n\nThis will permanently remove the vehicle listing from Firestore.`
        );


    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(
                db,
                VEHICLES_COLLECTION,
                vehicleId
            )
        );


        showToast(
            "Vehicle deleted successfully.",
            "success"
        );


        await loadVehicles();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        showToast(
            error.message ||
            "Could not delete vehicle.",
            "error"
        );

    }

}


/* ============================================================
   RESET FORM
============================================================ */

function resetVehicleForm() {

    editingVehicleId = null;

    selectedImages = [];

    existingImages = [];


    const form =
        $("vehicleForm");

    if (form) {
        form.reset();
    }


    setValue(
        "status",
        "Available"
    );


    setValue(
        "reference",
        ""
    );


    setValue(
        "editingVehicleId",
        ""
    );


    populateCountrySelector();


    const title =
        $("vehicleFormTitle");

    if (title) {

        title.innerHTML =
            "Add <span>Vehicle</span>";

    }


    const subtitle =
        $("vehicleFormSubtitle");

    if (subtitle) {

        subtitle.textContent =
            "Publish a vehicle to your public catalog.";

    }


    const saveButton =
        $("saveVehicleButton");

    if (saveButton) {

        saveButton.textContent =
            "Save Vehicle";

    }


    const message =
        $("vehicleFormMessage");

    hide(message);


    const preview =
        $("imagePreview");

    if (preview) {

        preview.innerHTML = "";

    }

}


/* ============================================================
   TRACKING
============================================================ */

function renderTracking() {

    const container =
        $("trackingList");

    if (!container) return;


    const activeVehicles =
        allVehicles.filter(vehicle => {

            return [
                "Purchased",
                "In Transit",
                "Port Arrival"
            ].includes(
                vehicle.status
            );

        });


    if (!activeVehicles.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ◈
                </div>

                <h3>
                    No active shipments
                </h3>

                <p>
                    Purchased and in-transit vehicles will appear here.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        activeVehicles
            .map(vehicle => {

                const title =
                    getVehicleTitle(vehicle);

                const ref =
                    vehicle.ref ||
                    vehicle.referenceNumber ||
                    "No Reference";

                const country =
                    vehicle.country ||
                    vehicle.destinationCountry ||
                    "Destination not assigned";


                return `
                    <div class="vehicle-admin-row">

                        <img
                            class="admin-vehicle-image"
                            src="${escapeAttribute(
                                getFirstImage(vehicle)
                            )}"
                            alt="${escapeAttribute(title)}"
                            onerror="this.src='${FALLBACK_IMAGE}'"
                        >

                        <div class="admin-vehicle-name">

                            <strong>
                                ${escapeHtml(title)}
                            </strong>

                            <span>
                                ${escapeHtml(country)}
                            </span>

                        </div>

                        <div class="vehicle-ref">
                            ${escapeHtml(ref)}
                        </div>

                        <div>
                            ${statusBadge(vehicle.status)}
                        </div>

                        <div class="vehicle-actions">

                            <button
                                type="button"
                                class="icon-button edit-vehicle"
                                data-id="${escapeAttribute(vehicle.id)}"
                                title="Update tracking"
                            >
                                ✎
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");


    container
        .querySelectorAll(".edit-vehicle")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => editVehicle(
                    button.dataset.id
                )
            );

        });

}


/* ============================================================
   HELPERS
============================================================ */

function getVehicleTitle(vehicle) {

    const make =
        vehicle.make ||
        vehicle.brand ||
        "";

    const model =
        vehicle.model ||
        "";

    const title =
        `${make} ${model}`.trim();

    return title ||
        "Japanese Vehicle";

}


function getImages(vehicle) {

    const images =
        vehicle.images ||
        vehicle.imageUrls ||
        vehicle.photos ||
        vehicle.image ||
        [];


    if (Array.isArray(images)) {

        return images.filter(Boolean);

    }


    if (typeof images === "string" && images) {

        return [images];

    }


    return [];

}


function getFirstImage(vehicle) {

    const images =
        getImages(vehicle);

    return images[0] ||
        FALLBACK_IMAGE;

}


function parseFeatures(text) {

    if (!text) return [];

    return text
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

}


function statusBadge(status) {

    const current =
        status ||
        "Available";


    const classes = {

        "Available":
            "status-available",

        "Purchased":
            "status-purchased",

        "In Transit":
            "status-transit",

        "Port Arrival":
            "status-arrival",

        "Delivered":
            "status-delivered",

        "Sold":
            "status-sold"

    };


    const className =
        classes[current] ||
        "status-available";


    return `
        <span
            class="status-badge ${className}"
        >
            ${escapeHtml(current)}
        </span>
    `;

}


/* ============================================================
   FORM MESSAGE
============================================================ */

function showFormMessage(
    message,
    type
) {

    const element =
        $("vehicleFormMessage");

    if (!element) return;

    element.textContent =
        message;

    element.className =
        `form-message ${type}`;

}


/* ============================================================
   TOAST
============================================================ */

let toastTimer = null;

function showToast(
    message,
    type = "success"
) {

    const toast =
        $("toast");

    const toastMessage =
        $("toastMessage");


    if (!toast || !toastMessage) return;


    toastMessage.textContent =
        message;


    toast.style.borderColor =
        type === "error"
            ? "rgba(224,82,82,0.35)"
            : "rgba(201,162,39,0.3)";


    show(toast);


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            hide(toast);

        }, 3500);

}


/* ============================================================
   TIMESTAMP
============================================================ */

function getTimestampMillis(timestamp) {

    if (!timestamp) return 0;

    if (
        typeof timestamp.toMillis ===
        "function"
    ) {

        return timestamp.toMillis();

    }

    if (
        timestamp.seconds !== undefined
    ) {

        return timestamp.seconds * 1000;

    }

    if (
        timestamp instanceof Date
    ) {

        return timestamp.getTime();

    }

    return 0;

}


/* ============================================================
   SECURITY / HTML ESCAPING
============================================================ */

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHtml(value);

}


/* ============================================================
   INITIAL COUNTRY LIST
============================================================ */

populateCountrySelector();

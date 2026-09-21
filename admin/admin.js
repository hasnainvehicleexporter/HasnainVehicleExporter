// ============================================================
// HASNAIN VEHICLE EXPORTER
// ADMIN DASHBOARD
// Firebase + Firestore + Cloudinary
// Authorized admin:
// hasnaindvehicleexporter@gmail.com
// ============================================================

import {
    auth,
    db,
    ADMIN_EMAIL,
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
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ============================================================
// CONSTANTS
// ============================================================

const VEHICLES_COLLECTION = "vehicles";

const ALLOWED_ADMIN_EMAIL =
    "hasnainvehicleexporter@gmail.com";

const WHATSAPP_NUMBER =
    "923392207418";


// ============================================================
// COUNTRY DATA
// ============================================================

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
    "The Gambia",
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

const CARIBBEAN_TERRITORIES = [
    "Aruba",
    "Bermuda",
    "British Virgin Islands",
    "Cayman Islands",
    "Curaçao",
    "Guadeloupe",
    "Martinique",
    "Puerto Rico",
    "Sint Maarten",
    "Turks and Caicos Islands",
    "U.S. Virgin Islands"
];


// ============================================================
// STATUS LIST
// ============================================================

const VEHICLE_STATUSES = [
    "Available",
    "Purchased",
    "Port Departure",
    "In Transit",
    "Port Arrival",
    "Delivered",
    "Sold"
];


// ============================================================
// APPLICATION STATE
// ============================================================

let allVehicles = [];

let filteredVehicles = [];

let editingVehicleId = null;

let pendingDeleteVehicleId = null;

let uploadedImages = [];

let isSaving = false;

let toastTimer = null;


// ============================================================
// DOM HELPERS
// ============================================================

const $ = (id) => document.getElementById(id);

const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));


// ============================================================
// INITIAL DOM REFERENCES
// ============================================================

const loginScreen = $("loginScreen");

const adminApp = $("adminApp");

const loginForm = $("loginForm");

const loginEmail = $("loginEmail");

const loginPassword = $("loginPassword");

const loginButton = $("loginButton");

const loginButtonText = $("loginButtonText");

const loginSpinner = $("loginSpinner");

const loginError = $("loginError");

const togglePassword = $("togglePassword");

const logoutButton = $("logoutButton");

const sidebar = $("sidebar");

const sidebarOverlay = $("sidebarOverlay");

const openSidebar = $("openSidebar");

const closeSidebar = $("closeSidebar");

const pageTitle = $("pageTitle");

const pageEyebrow = $("pageEyebrow");

const globalMessage = $("globalMessage");


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();

    setupLogin();

    setupPasswordToggle();

    setupLogout();

    setupMobileSidebar();

    setupVehicleFilters();

    setupVehicleForm();

    setupImageUpload();

    setupImportExport();

    setupModals();

    setupQuickActions();

});


// ============================================================
// FIREBASE AUTH STATE
// ============================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        showLoginScreen();

        return;
    }


    const email =
        String(user.email || "")
            .trim()
            .toLowerCase();


    if (email !== ALLOWED_ADMIN_EMAIL) {

        await signOut(auth);

        showLoginError(
            "This account is not authorized to access the admin dashboard."
        );

        showLoginScreen();

        return;
    }


    showAdminApp();

    await loadVehicles();

});


// ============================================================
// LOGIN
// ============================================================

function setupLogin() {

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            String(loginEmail.value || "")
                .trim()
                .toLowerCase();

        const password =
            loginPassword.value;


        if (!email || !password) {

            showLoginError(
                "Please enter your email address and password."
            );

            return;
        }


        if (email !== ALLOWED_ADMIN_EMAIL) {

            showLoginError(
                "Only the authorized administrator account can log in."
            );

            return;
        }


        setLoginLoading(true);

        hideLoginError();


        try {

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const loggedInEmail =
                String(credential.user.email || "")
                    .trim()
                    .toLowerCase();


            if (loggedInEmail !== ALLOWED_ADMIN_EMAIL) {

                await signOut(auth);

                throw new Error(
                    "This account is not authorized."
                );
            }


            loginPassword.value = "";

        } catch (error) {

            console.error(
                "Firebase login error:",
                error
            );

            showLoginError(
                getFirebaseErrorMessage(error)
            );

        } finally {

            setLoginLoading(false);

        }

    });

}


// ============================================================
// PASSWORD TOGGLE
// ============================================================

function setupPasswordToggle() {

    if (!togglePassword || !loginPassword) {
        return;
    }


    togglePassword.addEventListener("click", () => {

        const showing =
            loginPassword.type === "text";


        loginPassword.type =
            showing ? "password" : "text";


        togglePassword.textContent =
            showing ? "Show" : "Hide";

    });

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener("click", async () => {

        try {

            await signOut(auth);

            showLoginScreen();

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            showToast(
                "Unable to log out.",
                "error"
            );

        }

    });

}


// ============================================================
// LOGIN UI
// ============================================================

function showLoginScreen() {

    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (adminApp) {
        adminApp.classList.add("hidden");
    }

}


function showAdminApp() {

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (adminApp) {
        adminApp.classList.remove("hidden");
    }

}


function setLoginLoading(loading) {

    if (!loginButton) {
        return;
    }


    loginButton.disabled = loading;


    if (loginButtonText) {

        loginButtonText.textContent =
            loading ? "Signing in..." : "Login";

    }


    if (loginSpinner) {

        loginSpinner.classList.toggle(
            "hidden",
            !loading
        );

    }

}


function showLoginError(message) {

    if (!loginError) {
        return;
    }

    loginError.textContent = message;

    loginError.classList.remove("hidden");

}


function hideLoginError() {

    if (!loginError) {
        return;
    }

    loginError.textContent = "";

    loginError.classList.add("hidden");

}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    $$("[data-section]").forEach((button) => {

        button.addEventListener("click", () => {

            const section =
                button.dataset.section;


            if (!section) {
                return;
            }


            openSection(section);

        });

    });

}


function openSection(sectionName) {

    const sections = {
        dashboard: "dashboardSection",
        vehicles: "vehiclesSection",
        addVehicle: "addVehicleSection",
        importExport: "importExportSection"
    };


    Object.values(sections).forEach((id) => {

        const section = $(id);

        if (section) {

            section.classList.remove(
                "active-section"
            );

        }

    });


    const target =
        $(sections[sectionName]);


    if (!target) {
        return;
    }


    target.classList.add(
        "active-section"
    );


    $$(".sidebar-nav-item").forEach((item) => {

        item.classList.remove("active");


        if (
            item.dataset.section === sectionName
        ) {

            item.classList.add("active");

        }

    });


    updatePageHeading(sectionName);

    closeMobileSidebar();


    if (sectionName === "dashboard") {

        renderDashboard();

    }


    if (sectionName === "vehicles") {

        renderVehicles();

    }


    if (sectionName === "addVehicle") {

        if (!editingVehicleId) {

            prepareNewVehicleForm();

        }

    }

}


function updatePageHeading(sectionName) {

    const headings = {

        dashboard: {
            eyebrow: "ADMINISTRATION",
            title: "Dashboard"
        },

        vehicles: {
            eyebrow: "INVENTORY",
            title: "Manage Vehicles"
        },

        addVehicle: {
            eyebrow: editingVehicleId
                ? "EDIT LISTING"
                : "NEW LISTING",
            title: editingVehicleId
                ? "Edit Vehicle"
                : "Add Vehicle"
        },

        importExport: {
            eyebrow: "DATA TOOLS",
            title: "Import / Export"
        }

    };


    const data =
        headings[sectionName] ||
        headings.dashboard;


    if (pageEyebrow) {
        pageEyebrow.textContent =
            data.eyebrow;
    }


    if (pageTitle) {
        pageTitle.textContent =
            data.title;
    }

}


// ============================================================
// MOBILE SIDEBAR
// ============================================================

function setupMobileSidebar() {

    if (openSidebar) {

        openSidebar.addEventListener(
            "click",
            () => {

                sidebar?.classList.add("open");

            }
        );

    }


    if (closeSidebar) {

        closeSidebar.addEventListener(
            "click",
            closeMobileSidebar
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeMobileSidebar
        );

    }

}


function closeMobileSidebar() {

    sidebar?.classList.remove("open");

}


// ============================================================
// LOAD VEHICLES
// ============================================================

async function loadVehicles() {

    showGlobalMessage(
        "Loading vehicle inventory..."
    );


    try {

        const vehiclesRef =
            collection(
                db,
                VEHICLES_COLLECTION
            );


        const snapshot =
            await getDocs(vehiclesRef);


        allVehicles =
            snapshot.docs.map((vehicleDoc) => ({

                id: vehicleDoc.id,

                ...vehicleDoc.data()

            }));


        sortVehicles();


        filteredVehicles =
            [...allVehicles];


        renderDashboard();

        renderVehicles();


        hideGlobalMessage();

    } catch (error) {

        console.error(
            "Firestore vehicle loading error:",
            error
        );


        showGlobalMessage(
            "Unable to load vehicles: " +
            getFirestoreErrorMessage(error)
        );

    }

}


// ============================================================
// SORT VEHICLES
// ============================================================

function sortVehicles() {

    allVehicles.sort((a, b) => {

        const aTime =
            getVehicleTime(a);

        const bTime =
            getVehicleTime(b);


        return bTime - aTime;

    });

}


function getVehicleTime(vehicle) {

    if (
        vehicle.updatedAt &&
        typeof vehicle.updatedAt.toMillis === "function"
    ) {

        return vehicle.updatedAt.toMillis();

    }


    if (
        vehicle.createdAt &&
        typeof vehicle.createdAt.toMillis === "function"
    ) {

        return vehicle.createdAt.toMillis();

    }


    return 0;

}


// ============================================================
// DASHBOARD
// ============================================================

function renderDashboard() {

    updateStatistics();

    renderRecentVehicles();

}


function updateStatistics() {

    const total =
        allVehicles.length;


    const available =
        allVehicles.filter(
            (vehicle) =>
                normalizeStatus(vehicle.status) ===
                "available"
        ).length;


    const inTransit =
        allVehicles.filter(
            (vehicle) =>
                normalizeStatus(vehicle.status) ===
                "in transit"
        ).length;


    const sold =
        allVehicles.filter(
            (vehicle) =>
                normalizeStatus(vehicle.status) ===
                    "sold" ||
                normalizeStatus(vehicle.status) ===
                    "delivered"
        ).length;


    setText(
        "totalVehicles",
        total
    );

    setText(
        "availableVehicles",
        available
    );

    setText(
        "inTransitVehicles",
        inTransit
    );

    setText(
        "soldVehicles",
        sold
    );

}


function renderRecentVehicles() {

    const container =
        $("recentVehicles");


    if (!container) {
        return;
    }


    const vehicles =
        allVehicles.slice(0, 6);


    if (!vehicles.length) {

        container.innerHTML =
            createEmptyState(
                "No Vehicles Yet",
                "Add your first vehicle to begin building the inventory."
            );

        return;
    }


    container.innerHTML =
        vehicles.map(
            createRecentVehicleHTML
        ).join("");

}


// ============================================================
// VEHICLE FILTERS
// ============================================================

function setupVehicleFilters() {

    const search =
        $("vehicleSearch");

    const status =
        $("statusFilter");

    const region =
        $("regionFilter");

    const clear =
        $("clearFilters");


    search?.addEventListener(
        "input",
        applyVehicleFilters
    );


    status?.addEventListener(
        "change",
        applyVehicleFilters
    );


    region?.addEventListener(
        "change",
        applyVehicleFilters
    );


    clear?.addEventListener(
        "click",
        () => {

            if (search) {
                search.value = "";
            }

            if (status) {
                status.value = "all";
            }

            if (region) {
                region.value = "all";
            }

            applyVehicleFilters();

        }
    );

}


function applyVehicleFilters() {

    const search =
        String(
            $("vehicleSearch")?.value || ""
        )
            .trim()
            .toLowerCase();


    const status =
        $("statusFilter")?.value || "all";


    const region =
        $("regionFilter")?.value || "all";


    filteredVehicles =
        allVehicles.filter((vehicle) => {

            const searchable = [

                vehicle.ref,

                vehicle.referenceNumber,

                vehicle.reference,

                vehicle.make,

                vehicle.brand,

                vehicle.model,

                vehicle.chassis,

                vehicle.chassisNo,

                vehicle.customerName,

                vehicle.country

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchable.includes(search);


            const matchesStatus =
                status === "all" ||
                String(vehicle.status || "") ===
                    status;


            const matchesRegion =
                region === "all" ||
                String(
                    vehicle.region ||
                    vehicle.market ||
                    ""
                ) === region;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesRegion
            );

        });


    renderVehicles();

}


// ============================================================
// VEHICLES TABLE
// ============================================================

function renderVehicles() {

    const wrapper =
        $("vehiclesTableWrapper");


    if (!wrapper) {
        return;
    }


    if (!filteredVehicles.length) {

        wrapper.innerHTML =
            createEmptyState(
                "No Vehicles Found",
                "No inventory records match your current filters."
            );

        return;
    }


    wrapper.innerHTML = `

        <table class="vehicles-table">

            <thead>

                <tr>

                    <th>VEHICLE</th>

                    <th>REFERENCE</th>

                    <th>REGION</th>

                    <th>DESTINATION</th>

                    <th>STATUS</th>

                    <th>ACTIONS</th>

                </tr>

            </thead>

            <tbody>

                ${filteredVehicles
                    .map(createVehicleTableRow)
                    .join("")}

            </tbody>

        </table>

    `;


    wrapper
        .querySelectorAll(
            "[data-action='view']"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openVehicleModal(
                        button.dataset.id
                    );

                }
            );

        });


    wrapper
        .querySelectorAll(
            "[data-action='edit']"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    editVehicle(
                        button.dataset.id
                    );

                }
            );

        });


    wrapper
        .querySelectorAll(
            "[data-action='delete']"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    requestDeleteVehicle(
                        button.dataset.id
                    );

                }
            );

        });

}


// ============================================================
// TABLE ROW
// ============================================================

function createVehicleTableRow(vehicle) {

    const title =
        vehicleTitle(vehicle);


    const image =
        getFirstImage(vehicle);


    const ref =
        getVehicleReference(vehicle);


    const region =
        vehicle.region ||
        vehicle.market ||
        "—";


    const destination =
        vehicle.country ||
        vehicle.destinationCountry ||
        "Not assigned";


    return `

        <tr>

            <td>

                <div class="table-vehicle">

                    <div class="table-vehicle-image">

                        ${
                            image
                                ? `
                                    <img
                                        src="${escapeAttribute(image)}"
                                        alt="${escapeAttribute(title)}"
                                    >
                                  `
                                : ""
                        }

                    </div>

                    <div class="table-vehicle-info">

                        <strong>
                            ${escapeHTML(title)}
                        </strong>

                        <span>
                            ${escapeHTML(
                                String(
                                    vehicle.year ||
                                    ""
                                )
                            )}
                            ${
                                vehicle.mileage
                                    ? " • " +
                                      escapeHTML(
                                          String(
                                              vehicle.mileage
                                          )
                                      )
                                    : ""
                            }
                        </span>

                    </div>

                </div>

            </td>


            <td>

                <span class="vehicle-ref">
                    ${escapeHTML(ref)}
                </span>

            </td>


            <td>
                ${escapeHTML(String(region))}
            </td>


            <td>
                ${escapeHTML(String(destination))}
            </td>


            <td>
                ${createStatusBadge(
                    vehicle.status
                )}
            </td>


            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="table-action"
                        data-action="view"
                        data-id="${escapeAttribute(vehicle.id)}"
                        title="View"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="table-action"
                        data-action="edit"
                        data-id="${escapeAttribute(vehicle.id)}"
                        title="Edit"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="table-action delete"
                        data-action="delete"
                        data-id="${escapeAttribute(vehicle.id)}"
                        title="Delete"
                    >
                        Delete
                    </button>

                </div>

            </td>

        </tr>

    `;

}


// ============================================================
// RECENT VEHICLE HTML
// ============================================================

function createRecentVehicleHTML(vehicle) {

    const title =
        vehicleTitle(vehicle);


    const image =
        getFirstImage(vehicle);


    return `

        <div class="recent-vehicle">

            <div class="recent-vehicle-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(title)}"
                            >
                          `
                        : ""
                }

            </div>


            <div class="recent-vehicle-name">

                <strong>
                    ${escapeHTML(title)}
                </strong>

                <span>
                    ${escapeHTML(
                        String(
                            vehicle.year ||
                            ""
                        )
                    )}
                    ${
                        vehicle.mileage
                            ? " • " +
                              escapeHTML(
                                  String(
                                      vehicle.mileage
                                  )
                              )
                            : ""
                    }
                </span>

            </div>


            <div class="vehicle-ref">

                ${escapeHTML(
                    getVehicleReference(vehicle)
                )}

            </div>


            <div>

                ${createStatusBadge(
                    vehicle.status
                )}

            </div>


            <div>

                <button
                    type="button"
                    class="table-action"
                    data-recent-view="${escapeAttribute(vehicle.id)}"
                >
                    View
                </button>

            </div>

        </div>

    `;

}


// ============================================================
// RECENT VIEW EVENT DELEGATION
// ============================================================

document.addEventListener("click", (event) => {

    const button =
        event.target.closest(
            "[data-recent-view]"
        );


    if (!button) {
        return;
    }


    openVehicleModal(
        button.dataset.recentView
    );

});


// ============================================================
// STATUS BADGE
// ============================================================

function createStatusBadge(status) {

    const value =
        String(
            status ||
            "Available"
        );


    let className =
        "status-available";


    const normalized =
        normalizeStatus(value);


    if (normalized === "purchased") {

        className =
            "status-purchased";

    } else if (
        normalized === "in transit"
    ) {

        className =
            "status-transit";

    } else if (
        normalized === "port departure"
    ) {

        className =
            "status-port-departure";

    } else if (
        normalized === "port arrival"
    ) {

        className =
            "status-arrival";

    } else if (
        normalized === "delivered"
    ) {

        className =
            "status-delivered";

    } else if (
        normalized === "sold"
    ) {

        className =
            "status-sold";

    }


    return `

        <span
            class="status-badge ${className}"
        >
            ${escapeHTML(value)}
        </span>

    `;

}


// ============================================================
// VEHICLE FORM
// ============================================================

function setupVehicleForm() {

    const form =
        $("vehicleForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        saveVehicle
    );


    $("cancelVehicleButton")
        ?.addEventListener(
            "click",
            () => {

                editingVehicleId = null;

                prepareNewVehicleForm();

                openSection("vehicles");

            }
        );


    $("cancelVehicleButtonBottom")
        ?.addEventListener(
            "click",
            () => {

                editingVehicleId = null;

                prepareNewVehicleForm();

                openSection("vehicles");

            }
        );


    populateCountrySelect();

}


// ============================================================
// PREPARE NEW VEHICLE
// ============================================================

function prepareNewVehicleForm() {

    const form =
        $("vehicleForm");


    if (!form) {
        return;
    }


    form.reset();


    editingVehicleId = null;

    uploadedImages = [];


    const editId =
        $("editVehicleId");


    if (editId) {
        editId.value = "";
    }


    const reference =
        $("vehicleReference");


    if (reference) {

        reference.value =
            "Automatic after publishing";

    }


    const destination =
        $("vehicleCountry");


    if (destination) {

        destination.value = "";

    }


    const status =
        $("vehicleStatus");


    if (status) {

        status.value =
            "Available";

    }


    const imageGrid =
        $("imagePreviewGrid");


    if (imageGrid) {

        imageGrid.innerHTML = "";

    }


    const label =
        $("vehicleFormLabel");


    const title =
        $("vehicleFormTitle");


    const subtitle =
        $("vehicleFormSubtitle");


    const saveText =
        $("saveVehicleButtonText");


    if (label) {
        label.textContent =
            "NEW LISTING";
    }


    if (title) {
        title.textContent =
            "Add Vehicle";
    }


    if (subtitle) {

        subtitle.textContent =
            "Publish a Japanese vehicle to your public catalog.";

    }


    if (saveText) {

        saveText.textContent =
            "Publish Vehicle";

    }


    updatePageHeading(
        "addVehicle"
    );

}


// ============================================================
// EDIT VEHICLE
// ============================================================

async function editVehicle(vehicleId) {

    const vehicle =
        allVehicles.find(
            (item) =>
                item.id === vehicleId
        );


    if (!vehicle) {

        showToast(
            "Vehicle could not be found.",
            "error"
        );

        return;
    }


    editingVehicleId =
        vehicleId;


    populateVehicleForm(
        vehicle
    );


    openSection(
        "addVehicle"
    );

}


// ============================================================
// POPULATE VEHICLE FORM
// ============================================================

function populateVehicleForm(vehicle) {

    setInput(
        "editVehicleId",
        vehicle.id
    );


    setInput(
        "vehicleMake",
        vehicle.make ||
        vehicle.brand ||
        ""
    );


    setInput(
        "vehicleModel",
        vehicle.model ||
        ""
    );


    setInput(
        "vehicleYear",
        vehicle.year ||
        ""
    );


    setInput(
        "vehicleMileage",
        vehicle.mileage ||
        ""
    );


    setInput(
        "vehicleEngine",
        vehicle.engine ||
        ""
    );


    setInput(
        "vehicleFuel",
        vehicle.fuel ||
        ""
    );


    setInput(
        "vehicleTransmission",
        vehicle.transmission ||
        ""
    );


    setInput(
        "vehicleDrive",
        vehicle.drive ||
        ""
    );


    setInput(
        "vehicleSeats",
        vehicle.seats ||
        ""
    );


    setInput(
        "vehicleColor",
        vehicle.color ||
        vehicle.extColor ||
        ""
    );


    setInput(
        "vehicleLocation",
        vehicle.location ||
        ""
    );


    setInput(
        "vehicleChassis",
        vehicle.chassis ||
        vehicle.chassisNo ||
        vehicle.chassisNumber ||
        ""
    );


    setInput(
        "vehicleModelCode",
        vehicle.modelCode ||
        ""
    );


    setInput(
        "vehicleVersion",
        vehicle.version ||
        vehicle.class ||
        vehicle.versionClass ||
        ""
    );


    setInput(
        "vehicleRegistration",
        vehicle.registration ||
        vehicle.registrationYearMonth ||
        ""
    );


    setInput(
        "vehicleManufacture",
        vehicle.manufacture ||
        vehicle.manufactureYearMonth ||
        ""
    );


    setInput(
        "vehicleDoors",
        vehicle.doors ||
        ""
    );


    setInput(
        "vehicleDimension",
        vehicle.dimension ||
        ""
    );


    setInput(
        "vehicleWeight",
        vehicle.weight ||
        ""
    );


    setInput(
        "vehicleM3",
        vehicle.m3 ||
        ""
    );


    setInput(
        "vehicleSteering",
        vehicle.steering ||
        ""
    );


    setInput(
        "vehicleMaxCapacity",
        vehicle.maxCapacity ||
        vehicle.maxCap ||
        ""
    );


    setInput(
        "vehicleReference",
        getVehicleReference(vehicle)
    );


    setInput(
        "vehicleSubReference",
        vehicle.subReference ||
        vehicle.subRefNo ||
        ""
    );


    setInput(
        "vehicleRegion",
        vehicle.region ||
        vehicle.market ||
        ""
    );


    setInput(
        "vehicleCountry",
        vehicle.country ||
        vehicle.destinationCountry ||
        ""
    );


    setInput(
        "vehicleStatus",
        vehicle.status ||
        "Available"
    );


    setInput(
        "vehicleCustomerName",
        vehicle.customerName ||
        ""
    );


    setInput(
        "vehicleCustomerWhatsApp",
        vehicle.customerWhatsApp ||
        ""
    );


    setInput(
        "vehicleTracking",
        vehicle.trackingNumber ||
        vehicle.tracking ||
        vehicle.shipmentReference ||
        ""
    );


    setInput(
        "vehicleDescription",
        vehicle.description ||
        ""
    );


    setInput(
        "vehicleFeatures",
        formatFeaturesForTextarea(
            vehicle.features ||
            vehicle.keyFeatures ||
            []
        )
    );


    uploadedImages =
        normalizeImages(
            vehicle.images ||
            vehicle.imageUrls ||
            vehicle.photos ||
            vehicle.image ||
            []
        );


    renderImagePreviews();


    const label =
        $("vehicleFormLabel");

    const title =
        $("vehicleFormTitle");

    const subtitle =
        $("vehicleFormSubtitle");

    const saveText =
        $("saveVehicleButtonText");


    if (label) {
        label.textContent =
            "EDIT LISTING";
    }


    if (title) {
        title.textContent =
            "Edit Vehicle";
    }


    if (subtitle) {

        subtitle.textContent =
            "Update vehicle details, customer information, photos, or tracking.";

    }


    if (saveText) {

        saveText.textContent =
            "Save Changes";

    }

}


// ============================================================
// SAVE VEHICLE
// ============================================================

async function saveVehicle(event) {

    event.preventDefault();


    if (isSaving) {
        return;
    }


    const make =
        getInputValue("vehicleMake");

    const model =
        getInputValue("vehicleModel");

    const year =
        getInputValue("vehicleYear");

    const region =
        getInputValue("vehicleRegion");

    const status =
        getInputValue("vehicleStatus") ||
        "Available";


    if (!make || !model || !year || !region) {

        showToast(
            "Please complete all required vehicle fields.",
            "error"
        );

        return;
    }


    if (!VEHICLE_STATUSES.includes(status)) {

        showToast(
            "Invalid vehicle status.",
            "error"
        );

        return;
    }


    isSaving = true;

    setSaveLoading(true);


    try {

        const reference =
            editingVehicleId
                ? getInputValue(
                      "vehicleReference"
                  )
                : await generateNextHVEReference();


        const vehicleData = {

            ref:
                reference,

            referenceNumber:
                reference,

            make:
                make,

            model:
                model,

            year:
                Number(year),

            mileage:
                getInputValue(
                    "vehicleMileage"
                ),

            engine:
                getInputValue(
                    "vehicleEngine"
                ),

            fuel:
                getInputValue(
                    "vehicleFuel"
                ),

            transmission:
                getInputValue(
                    "vehicleTransmission"
                ),

            drive:
                getInputValue(
                    "vehicleDrive"
                ),

            seats:
                getInputValue(
                    "vehicleSeats"
                ),

            color:
                getInputValue(
                    "vehicleColor"
                ),

            location:
                getInputValue(
                    "vehicleLocation"
                ),

            chassis:
                getInputValue(
                    "vehicleChassis"
                ),

            modelCode:
                getInputValue(
                    "vehicleModelCode"
                ),

            version:
                getInputValue(
                    "vehicleVersion"
                ),

            registration:
                getInputValue(
                    "vehicleRegistration"
                ),

            manufacture:
                getInputValue(
                    "vehicleManufacture"
                ),

            doors:
                getInputValue(
                    "vehicleDoors"
                ),

            dimension:
                getInputValue(
                    "vehicleDimension"
                ),

            weight:
                getInputValue(
                    "vehicleWeight"
                ),

            m3:
                getInputValue(
                    "vehicleM3"
                ),

            steering:
                getInputValue(
                    "vehicleSteering"
                ),

            maxCapacity:
                getInputValue(
                    "vehicleMaxCapacity"
                ),

            subReference:
                getInputValue(
                    "vehicleSubReference"
                ),

            region:
                region,

            country:
                getInputValue(
                    "vehicleCountry"
                ),

            destinationCountry:
                getInputValue(
                    "vehicleCountry"
                ),

            status:
                status,

            customerName:
                getInputValue(
                    "vehicleCustomerName"
                ),

            customerWhatsApp:
                getInputValue(
                    "vehicleCustomerWhatsApp"
                ),

            trackingNumber:
                getInputValue(
                    "vehicleTracking"
                ),

            description:
                getInputValue(
                    "vehicleDescription"
                ),

            features:
                parseFeatures(
                    getInputValue(
                        "vehicleFeatures"
                    )
                ),

            images:
                [...uploadedImages],

            imageUrls:
                [...uploadedImages],

            updatedAt:
                serverTimestamp()

        };


        if (editingVehicleId) {

            const vehicleRef =
                doc(
                    db,
                    VEHICLES_COLLECTION,
                    editingVehicleId
                );


            await updateDoc(
                vehicleRef,
                vehicleData
            );


            showToast(
                "Vehicle updated successfully.",
                "success"
            );

        } else {

            vehicleData.createdAt =
                serverTimestamp();


            await addDoc(
                collection(
                    db,
                    VEHICLES_COLLECTION
                ),
                vehicleData
            );


            showToast(
                `${reference} published successfully.`,
                "success"
            );

        }


        await loadVehicles();


        editingVehicleId = null;


        prepareNewVehicleForm();


        openSection(
            "vehicles"
        );


    } catch (error) {

        console.error(
            "Vehicle save error:",
            error
        );


        showToast(
            getFirestoreErrorMessage(error),
            "error"
        );

    } finally {

        isSaving = false;

        setSaveLoading(false);

    }

}


// ============================================================
// SAVE BUTTON LOADING
// ============================================================

function setSaveLoading(loading) {

    const button =
        $("saveVehicleButton");

    const text =
        $("saveVehicleButtonText");

    const spinner =
        $("saveVehicleSpinner");


    if (button) {

        button.disabled =
            loading;

    }


    if (text) {

        text.textContent =
            loading
                ? "Saving..."
                : editingVehicleId
                    ? "Save Changes"
                    : "Publish Vehicle";

    }


    if (spinner) {

        spinner.classList.toggle(
            "hidden",
            !loading
        );

    }

}


// ============================================================
// HVE REFERENCE GENERATOR
// ============================================================

async function generateNextHVEReference() {

    const snapshot =
        await getDocs(
            collection(
                db,
                VEHICLES_COLLECTION
            )
        );


    let highest =
        0;


    snapshot.forEach((vehicleDoc) => {

        const data =
            vehicleDoc.data();


        const reference =
            String(
                data.ref ||
                data.referenceNumber ||
                data.reference ||
                ""
            );


        const match =
            reference.match(
                /^HVE-(\d+)$/i
            );


        if (match) {

            const number =
                parseInt(
                    match[1],
                    10
                );


            if (
                Number.isFinite(number) &&
                number > highest
            ) {

                highest =
                    number;

            }

        }

    });


    const next =
        highest + 1;


    return (
        "HVE-" +
        String(next).padStart(4, "0")
    );

}


// ============================================================
// IMAGE UPLOAD
// ============================================================

function setupImageUpload() {

    const input =
        $("vehicleImages");

    const dropZone =
        $("imageDropZone");


    if (!input || !dropZone) {
        return;
    }


    input.addEventListener(
        "change",
        async () => {

            const files =
                Array.from(
                    input.files || []
                );


            if (!files.length) {
                return;
            }


            await uploadVehicleImages(
                files
            );


            input.value = "";

        }
    );


    dropZone.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            dropZone.classList.add(
                "dragover"
            );

        }
    );


    dropZone.addEventListener(
        "dragleave",
        () => {

            dropZone.classList.remove(
                "dragover"
            );

        }
    );


    dropZone.addEventListener(
        "drop",
        async (event) => {

            event.preventDefault();

            dropZone.classList.remove(
                "dragover"
            );


            const files =
                Array.from(
                    event.dataTransfer.files || []
                ).filter(
                    (file) =>
                        file.type.startsWith(
                            "image/"
                        )
                );


            if (!files.length) {

                showToast(
                    "Please drop image files only.",
                    "error"
                );

                return;
            }


            await uploadVehicleImages(
                files
            );

        }
    );

}


async function uploadVehicleImages(files) {

    if (!files.length) {
        return;
    }


    const progress =
        $("uploadProgress");

    const progressBar =
        $("uploadProgressBar");

    const progressText =
        $("uploadProgressText");


    progress?.classList.remove(
        "hidden"
    );


    let completed =
        0;


    try {

        for (
            const file of files
        ) {

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                continue;

            }


            const url =
                await uploadImageToCloudinary(
                    file,
                    (percent) => {

                        const totalPercent =
                            (
                                (
                                    completed +
                                    percent / 100
                                ) /
                                files.length
                            ) * 100;


                        updateUploadProgress(
                            totalPercent,
                            progressBar,
                            progressText
                        );

                    }
                );


            if (url) {

                uploadedImages.push(
                    url
                );

            }


            completed++;


            updateUploadProgress(
                (
                    completed /
                    files.length
                ) * 100,
                progressBar,
                progressText
            );

        }


        renderImagePreviews();


        showToast(
            "Vehicle photos uploaded successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Cloudinary upload error:",
            error
        );


        showToast(
            "One or more images could not be uploaded.",
            "error"
        );

    } finally {

        setTimeout(
            () => {

                progress?.classList.add(
                    "hidden"
                );

                updateUploadProgress(
                    0,
                    progressBar,
                    progressText
                );

            },
            700
        );

    }

}


// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

function uploadImageToCloudinary(
    file,
    onProgress
) {

    return new Promise(
        (resolve, reject) => {

            const xhr =
                new XMLHttpRequest();


            xhr.open(
                "POST",
                CLOUDINARY_UPLOAD_URL
            );


            xhr.upload.addEventListener(
                "progress",
                (event) => {

                    if (!event.lengthComputable) {
                        return;
                    }


                    const percent =
                        (
                            event.loaded /
                            event.total
                        ) * 100;


                    onProgress?.(
                        percent
                    );

                }
            );


            xhr.addEventListener(
                "load",
                () => {

                    if (
                        xhr.status < 200 ||
                        xhr.status >= 300
                    ) {

                        reject(
                            new Error(
                                "Cloudinary upload failed."
                            )
                        );

                        return;
                    }


                    try {

                        const result =
                            JSON.parse(
                                xhr.responseText
                            );


                        if (
                            !result.secure_url
                        ) {

                            reject(
                                new Error(
                                    "Cloudinary did not return an image URL."
                                )
                            );

                            return;
                        }


                        resolve(
                            result.secure_url
                        );

                    } catch (error) {

                        reject(error);

                    }

                }
            );


            xhr.addEventListener(
                "error",
                () => {

                    reject(
                        new Error(
                            "Network error during image upload."
                        )
                    );

                }
            );


            xhr.addEventListener(
                "abort",
                () => {

                    reject(
                        new Error(
                            "Image upload was cancelled."
                        )
                    );

                }
            );


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


            xhr.send(
                formData
            );

        }
    );

}


// ============================================================
// UPLOAD PROGRESS
// ============================================================

function updateUploadProgress(
    percent,
    bar,
    text
) {

    const safe =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    if (bar) {

        bar.style.width =
            `${safe}%`;

    }


    if (text) {

        text.textContent =
            `${Math.round(safe)}%`;

    }

}


// ============================================================
// IMAGE PREVIEWS
// ============================================================

function renderImagePreviews() {

    const grid =
        $("imagePreviewGrid");


    if (!grid) {
        return;
    }


    if (!uploadedImages.length) {

        grid.innerHTML = "";

        return;
    }


    grid.innerHTML =
        uploadedImages
            .map(
                (url, index) => `

                    <div
                        class="image-preview"
                    >

                        <img
                            src="${escapeAttribute(url)}"
                            alt="Vehicle image ${index + 1}"
                        >

                        <button
                            type="button"
                            class="image-preview-remove"
                            data-image-index="${index}"
                            aria-label="Remove image"
                        >
                            ×
                        </button>

                    </div>

                `
            )
            .join("");


    grid
        .querySelectorAll(
            "[data-image-index]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.imageIndex
                        );


                    if (
                        Number.isInteger(index)
                    ) {

                        uploadedImages.splice(
                            index,
                            1
                        );


                        renderImagePreviews();

                    }

                }
            );

        });

}


// ============================================================
// IMPORT / EXPORT
// ============================================================

function setupImportExport() {

    $("exportVehiclesButton")
        ?.addEventListener(
            "click",
            exportVehicles
        );


    $("importVehiclesFile")
        ?.addEventListener(
            "change",
            async (event) => {

                const file =
                    event.target.files?.[0];


                if (!file) {
                    return;
                }


                await importVehicles(
                    file
                );


                event.target.value = "";

            }
        );

}


function exportVehicles() {

    if (!allVehicles.length) {

        showToast(
            "There are no vehicles to export.",
            "error"
        );

        return;
    }


    const exportData =
        allVehicles.map(
            sanitizeForExport
        );


    const blob =
        new Blob(
            [
                JSON.stringify(
                    exportData,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    const date =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    link.href =
        url;


    link.download =
        `hasnain-vehicle-exporter-${date}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Vehicle inventory exported successfully.",
        "success"
    );

}


async function importVehicles(file) {

    try {

        const text =
            await file.text();


        const data =
            JSON.parse(
                text
            );


        if (!Array.isArray(data)) {

            throw new Error(
                "JSON must contain an array of vehicle records."
            );

        }


        if (!data.length) {

            throw new Error(
                "The JSON file contains no vehicles."
            );

        }


        let imported =
            0;


        for (
            const originalVehicle of data
        ) {

            const vehicle =
                cleanImportedVehicle(
                    originalVehicle
                );


            if (
                !vehicle.make &&
                !vehicle.brand
            ) {

                continue;

            }


            if (
                !vehicle.model
            ) {

                continue;

            }


            if (
                !vehicle.ref &&
                !vehicle.referenceNumber
            ) {

                vehicle.ref =
                    await generateNextHVEReference();

                vehicle.referenceNumber =
                    vehicle.ref;

            }


            vehicle.updatedAt =
                serverTimestamp();


            vehicle.createdAt =
                serverTimestamp();


            await addDoc(
                collection(
                    db,
                    VEHICLES_COLLECTION
                ),
                vehicle
            );


            imported++;

        }


        await loadVehicles();


        showToast(
            `${imported} vehicle record(s) imported successfully.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Import error:",
            error
        );


        showToast(
            "Import failed: " +
            error.message,
            "error"
        );

    }

}


// ============================================================
// DELETE VEHICLE
// ============================================================

function requestDeleteVehicle(
    vehicleId
) {

    const vehicle =
        allVehicles.find(
            (item) =>
                item.id === vehicleId
        );


    if (!vehicle) {
        return;
    }


    pendingDeleteVehicleId =
        vehicleId;


    const message =
        $("deleteMessage");


    if (message) {

        message.textContent =
            `This will permanently delete ${
                vehicleTitle(vehicle)
            } (${getVehicleReference(vehicle)}).`;

    }


    openModal(
        "deleteModal"
    );

}


async function deleteVehicle() {

    if (!pendingDeleteVehicleId) {
        return;
    }


    const vehicleId =
        pendingDeleteVehicleId;


    try {

        await deleteDoc(
            doc(
                db,
                VEHICLES_COLLECTION,
                vehicleId
            )
        );


        closeModal(
            "deleteModal"
        );


        pendingDeleteVehicleId =
            null;


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
            getFirestoreErrorMessage(error),
            "error"
        );

    }

}


// ============================================================
// MODALS
// ============================================================

function setupModals() {

    $("closeVehicleModal")
        ?.addEventListener(
            "click",
            () => {

                closeModal(
                    "vehicleModal"
                );

            }
        );


    $("vehicleModal")
        ?.querySelector(
            ".modal-overlay"
        )
        ?.addEventListener(
            "click",
            () => {

                closeModal(
                    "vehicleModal"
                );

            }
        );


    $("cancelDeleteButton")
        ?.addEventListener(
            "click",
            () => {

                pendingDeleteVehicleId =
                    null;

                closeModal(
                    "deleteModal"
                );

            }
        );


    $("confirmDeleteButton")
        ?.addEventListener(
            "click",
            deleteVehicle
        );


    $("deleteModal")
        ?.querySelector(
            ".modal-overlay"
        )
        ?.addEventListener(
            "click",
            () => {

                pendingDeleteVehicleId =
                    null;

                closeModal(
                    "deleteModal"
                );

            }
        );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Escape"
            ) {

                return;

            }


            closeModal(
                "vehicleModal"
            );

            closeModal(
                "deleteModal"
            );

        }
    );

}


function openModal(id) {

    const modal =
        $(id);


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function closeModal(id) {

    const modal =
        $(id);


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        $("vehicleModal")?.classList.contains(
            "hidden"
        ) &&
        $("deleteModal")?.classList.contains(
            "hidden"
        )
    ) {

        document.body.style.overflow =
            "";

    }

}


// ============================================================
// VEHICLE DETAILS MODAL
// ============================================================

async function openVehicleModal(
    vehicleId
) {

    const vehicle =
        allVehicles.find(
            (item) =>
                item.id === vehicleId
        );


    if (!vehicle) {

        showToast(
            "Vehicle could not be found.",
            "error"
        );

        return;
    }


    setText(
        "modalVehicleTitle",
        vehicleTitle(vehicle)
    );


    setText(
        "modalVehicleReference",
        getVehicleReference(vehicle)
    );


    const content =
        $("modalVehicleContent");


    if (!content) {
        return;
    }


    const images =
        normalizeImages(
            vehicle.images ||
            vehicle.imageUrls ||
            vehicle.photos ||
            vehicle.image ||
            []
        );


    const features =
        normalizeFeatures(
            vehicle.features ||
            vehicle.keyFeatures ||
            []
        );


    content.innerHTML = `

        ${
            images.length
                ? `
                    <div class="modal-images">

                        ${images
                            .map(
                                (image) => `
                                    <img
                                        src="${escapeAttribute(image)}"
                                        alt="${escapeAttribute(
                                            vehicleTitle(vehicle)
                                        )}"
                                    >
                                `
                            )
                            .join("")}

                    </div>
                  `
                : ""
        }


        <div class="modal-detail-grid">

            ${modalDetail(
                "Reference",
                getVehicleReference(vehicle)
            )}

            ${modalDetail(
                "Status",
                vehicle.status ||
                    "Available"
            )}

            ${modalDetail(
                "Make",
                vehicle.make ||
                    vehicle.brand ||
                    "—"
            )}

            ${modalDetail(
                "Model",
                vehicle.model ||
                    "—"
            )}

            ${modalDetail(
                "Year",
                vehicle.year ||
                    "—"
            )}

            ${modalDetail(
                "Mileage",
                vehicle.mileage ||
                    "—"
            )}

            ${modalDetail(
                "Engine",
                vehicle.engine ||
                    "—"
            )}

            ${modalDetail(
                "Fuel",
                vehicle.fuel ||
                    "—"
            )}

            ${modalDetail(
                "Transmission",
                vehicle.transmission ||
                    "—"
            )}

            ${modalDetail(
                "Drive",
                vehicle.drive ||
                    "—"
            )}

            ${modalDetail(
                "Region",
                vehicle.region ||
                    vehicle.market ||
                    "—"
            )}

            ${modalDetail(
                "Destination",
                vehicle.country ||
                    vehicle.destinationCountry ||
                    "Not assigned"
            )}

            ${modalDetail(
                "Location",
                vehicle.location ||
                    "—"
            )}

            ${modalDetail(
                "Chassis",
                vehicle.chassis ||
                    vehicle.chassisNo ||
                    "—"
            )}

            ${modalDetail(
                "Customer",
                vehicle.customerName ||
                    "Not assigned"
            )}

            ${modalDetail(
                "Tracking",
                vehicle.trackingNumber ||
                    vehicle.tracking ||
                    "Not assigned"
            )}

        </div>


        ${
            vehicle.description
                ? `
                    <div
                        style="
                            margin-top:20px;
                            color:#bfc3c5;
                            font-size:12px;
                            line-height:1.8;
                        "
                    >

                        <strong
                            style="
                                display:block;
                                color:#ffffff;
                                margin-bottom:7px;
                                font-size:13px;
                            "
                        >
                            Description
                        </strong>

                        ${escapeHTML(
                            String(
                                vehicle.description
                            )
                        )}

                    </div>
                  `
                : ""
        }


        ${
            features.length
                ? `
                    <div
                        style="
                            margin-top:20px;
                        "
                    >

                        <strong
                            style="
                                display:block;
                                color:#ffffff;
                                margin-bottom:9px;
                                font-size:13px;
                            "
                        >
                            Key Features
                        </strong>

                        <div
                            style="
                                display:flex;
                                flex-wrap:wrap;
                                gap:7px;
                            "
                        >

                            ${features
                                .map(
                                    (feature) => `
                                        <span
                                            style="
                                                display:inline-flex;
                                                padding:6px 9px;
                                                color:#c9a24d;
                                                background:rgba(201,162,77,.07);
                                                border:1px solid rgba(201,162,77,.15);
                                                border-radius:20px;
                                                font-size:10px;
                                            "
                                        >
                                            ${escapeHTML(
                                                feature
                                            )}
                                        </span>
                                    `
                                )
                                .join("")}

                        </div>

                    </div>
                  `
                : ""
        }

    `;


    openModal(
        "vehicleModal"
    );

}


// ============================================================
// QUICK ACTIONS
// ============================================================

function setupQuickActions() {

    // Navigation is already handled
    // through the global data-section
    // listener.

}


// ============================================================
// COUNTRY SELECT
// ============================================================

function populateCountrySelect() {

    const select =
        $("vehicleCountry");


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            No destination yet
        </option>

        <optgroup label="Africa">

            ${AFRICA_COUNTRIES
                .map(
                    (country) =>
                        `<option value="${escapeAttribute(country)}">
                            ${escapeHTML(country)}
                         </option>`
                )
                .join("")}

        </optgroup>


        <optgroup label="Caribbean">

            ${CARIBBEAN_COUNTRIES
                .map(
                    (country) =>
                        `<option value="${escapeAttribute(country)}">
                            ${escapeHTML(country)}
                         </option>`
                )
                .join("")}

        </optgroup>


        <optgroup label="Caribbean Territories">

            ${CARIBBEAN_TERRITORIES
                .map(
                    (country) =>
                        `<option value="${escapeAttribute(country)}">
                            ${escapeHTML(country)}
                         </option>`
                )
                .join("")}

        </optgroup>

    `;

}


// ============================================================
// FEATURES
// ============================================================

function parseFeatures(value) {

    if (!value) {
        return [];
    }


    return String(value)
        .split(/\r?\n|,/)
        .map(
            (item) =>
                item.trim()
        )
        .filter(Boolean);

}


function normalizeFeatures(value) {

    if (!value) {
        return [];
    }


    if (Array.isArray(value)) {

        return value
            .map(
                (item) =>
                    String(item).trim()
            )
            .filter(Boolean);

    }


    return parseFeatures(
        value
    );

}


function formatFeaturesForTextarea(
    features
) {

    return normalizeFeatures(
        features
    ).join("\n");

}


// ============================================================
// IMAGES
// ============================================================

function normalizeImages(value) {

    if (!value) {
        return [];
    }


    if (Array.isArray(value)) {

        return value
            .map(
                (item) => {

                    if (
                        typeof item ===
                        "string"
                    ) {

                        return item;

                    }


                    if (
                        item &&
                        typeof item.url ===
                        "string"
                    ) {

                        return item.url;

                    }


                    return "";

                }
            )
            .filter(Boolean);

    }


    if (
        typeof value ===
        "string"
    ) {

        return value
            .split(",")
            .map(
                (item) =>
                    item.trim()
            )
            .filter(Boolean);

    }


    return [];

}


function getFirstImage(vehicle) {

    const images =
        normalizeImages(
            vehicle.images ||
            vehicle.imageUrls ||
            vehicle.photos ||
            vehicle.image ||
            []
        );


    return images[0] || "";

}


// ============================================================
// VEHICLE HELPERS
// ============================================================

function vehicleTitle(vehicle) {

    const make =
        vehicle.make ||
        vehicle.brand ||
        "";


    const model =
        vehicle.model ||
        "";


    const combined =
        `${make} ${model}`
            .trim();


    if (combined) {
        return combined;
    }


    return "Vehicle";

}


function getVehicleReference(
    vehicle
) {

    return (
        vehicle.ref ||
        vehicle.referenceNumber ||
        vehicle.reference ||
        "No Reference"
    );

}


function normalizeStatus(
    status
) {

    return String(
        status ||
        ""
    )
        .trim()
        .toLowerCase();

}


// ============================================================
// MODAL DETAIL
// ============================================================

function modalDetail(
    label,
    value
) {

    return `

        <div class="modal-detail">

            <span>
                ${escapeHTML(label)}
            </span>

            <strong>
                ${escapeHTML(
                    String(
                        value ??
                        "—"
                    )
                )}
            </strong>

        </div>

    `;

}


// ============================================================
// IMPORT CLEANUP
// ============================================================

function cleanImportedVehicle(
    original
) {

    const vehicle =
        {
            ...original
        };


    delete vehicle.id;


    if (!vehicle.ref) {

        if (
            vehicle.referenceNumber
        ) {

            vehicle.ref =
                vehicle.referenceNumber;

        } else if (
            vehicle.reference
        ) {

            vehicle.ref =
                vehicle.reference;

        }

    }


    if (!vehicle.referenceNumber) {

        vehicle.referenceNumber =
            vehicle.ref ||
            "";

    }


    if (
        vehicle.images ||
        vehicle.imageUrls ||
        vehicle.photos ||
        vehicle.image
    ) {

        const images =
            normalizeImages(
                vehicle.images ||
                vehicle.imageUrls ||
                vehicle.photos ||
                vehicle.image
            );


        vehicle.images =
            images;

        vehicle.imageUrls =
            images;

    }


    if (
        vehicle.features ||
        vehicle.keyFeatures
    ) {

        vehicle.features =
            normalizeFeatures(
                vehicle.features ||
                vehicle.keyFeatures
            );

    }


    return vehicle;

}


// ============================================================
// EXPORT CLEANUP
// ============================================================

function sanitizeForExport(
    vehicle
) {

    const result =
        {
            ...vehicle
        };


    delete result.id;


    if (
        result.createdAt &&
        typeof result.createdAt.toDate ===
            "function"
    ) {

        result.createdAt =
            result.createdAt
                .toDate()
                .toISOString();

    }


    if (
        result.updatedAt &&
        typeof result.updatedAt.toDate ===
            "function"
    ) {

        result.updatedAt =
            result.updatedAt
                .toDate()
                .toISOString();

    }


    return result;

}


// ============================================================
// INPUT HELPERS
// ============================================================

function getInputValue(
    id
) {

    const element =
        $(id);


    if (!element) {
        return "";
    }


    return String(
        element.value ||
        ""
    ).trim();

}


function setInput(
    id,
    value
) {

    const element =
        $(id);


    if (!element) {
        return;
    }


    element.value =
        value ??
        "";

}


function setText(
    id,
    value
) {

    const element =
        $(id);


    if (!element) {
        return;
    }


    element.textContent =
        value ??
        "";

}


// ============================================================
// EMPTY STATE
// ============================================================

function createEmptyState(
    title,
    description
) {

    return `

        <div class="empty-state">

            <div class="empty-state-icon">
                🚗
            </div>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(description)}
            </p>

        </div>

    `;

}


// ============================================================
// GLOBAL MESSAGE
// ============================================================

function showGlobalMessage(
    message
) {

    if (!globalMessage) {
        return;
    }


    globalMessage.textContent =
        message;


    globalMessage.classList.remove(
        "hidden"
    );

}


function hideGlobalMessage() {

    if (!globalMessage) {
        return;
    }


    globalMessage.classList.add(
        "hidden"
    );

}


// ============================================================
// TOAST
// ============================================================

function showToast(
    message,
    type = "success"
) {

    const toast =
        $("toast");

    const toastMessage =
        $("toastMessage");

    const toastIcon =
        $("toastIcon");


    if (!toast) {
        return;
    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    toast.classList.remove(
        "success",
        "error"
    );


    toast.classList.add(
        type
    );


    if (toastIcon) {

        toastIcon.textContent =
            type === "error"
                ? "!"
                : "✓";

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


// ============================================================
// FIREBASE ERROR MESSAGES
// ============================================================

function getFirebaseErrorMessage(
    error
) {

    const code =
        error?.code ||
        "";


    const messages = {

        "auth/invalid-credential":
            "The email or password is incorrect.",

        "auth/invalid-login-credentials":
            "The email or password is incorrect.",

        "auth/user-not-found":
            "No administrator account was found for this email.",

        "auth/wrong-password":
            "The password is incorrect.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/too-many-requests":
            "Too many login attempts. Please wait and try again.",

        "auth/network-request-failed":
            "Network error. Check your internet connection.",

        "auth/api-key-not-valid":
            "Firebase rejected the API key. Check the Firebase web configuration.",

        "auth/configuration-not-found":
            "Firebase Authentication configuration was not found.",

        "permission-denied":
            "Firebase denied this operation. Check Firestore rules.",

        "unauthenticated":
            "Your Firebase session has expired. Please log in again."

    };


    return (
        messages[code] ||
        error?.message ||
        "An unexpected Firebase error occurred."
    );

}


function getFirestoreErrorMessage(
    error
) {

    if (
        error?.code ===
        "permission-denied"
    ) {

        return (
            "Firestore permission denied. " +
            "Check the Firebase Firestore security rules."
        );

    }


    if (
        error?.code ===
        "unavailable"
    ) {

        return (
            "Firebase is temporarily unavailable. " +
            "Please check your internet connection."
        );

    }


    return (
        error?.message ||
        "Unable to complete the Firebase operation."
    );

}


// ============================================================
// HTML ESCAPING
// ============================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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


function escapeAttribute(value) {

    return escapeHTML(
        value
    );

}


// ============================================================
// ERROR HANDLING
// ============================================================

window.addEventListener(
    "unhandledrejection",
    (event) => {

        console.error(
            "Unhandled promise rejection:",
            event.reason
        );

    }
);

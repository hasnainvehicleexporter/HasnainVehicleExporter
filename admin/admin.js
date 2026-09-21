// ============================================================
// HASNAIN VEHICLE EXPORTER
// ADMIN DASHBOARD
// Supports multiple authorized admin accounts
// ============================================================

import {
  firebaseConfig,
  ADMIN_EMAILS,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL
} from "./firebase-config.js";

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
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
// FIREBASE INITIALIZATION
// ============================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const vehiclesCollection = collection(db, "vehicles");


// ============================================================
// GLOBAL STATE
// ============================================================

let currentUser = null;

let vehicles = [];

let editingVehicleId = null;

let currentImages = [];


// ============================================================
// ADMIN EMAIL CHECK
// ============================================================

function isAuthorizedAdmin(user) {
  if (!user || !user.email) {
    return false;
  }

  const email = user.email.trim().toLowerCase();

  return ADMIN_EMAILS
    .map(item => item.toLowerCase())
    .includes(email);
}


// ============================================================
// AUTHENTICATION
// ============================================================

onAuthStateChanged(auth, async (user) => {

  currentUser = user || null;

  if (!user) {
    showLoginScreen();
    return;
  }

  if (!isAuthorizedAdmin(user)) {

    alert(
      "This account is not authorized for the HVE dashboard."
    );

    await signOut(auth);

    showLoginScreen();

    return;
  }

  showDashboard();

  updateLoggedInEmail(user.email);

  await loadVehicles();

  updateDashboardCounts();

});


// ============================================================
// LOGIN
// ============================================================

async function loginUser(email, password) {

  try {

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {

      alert("Please enter your email and password.");

      return;

    }

    if (
      !ADMIN_EMAILS
        .map(item => item.toLowerCase())
        .includes(cleanEmail)
    ) {

      alert(
        "This email is not authorized for the HVE dashboard."
      );

      return;

    }

    await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

  } catch (error) {

    console.error(error);

    let message = "Login failed.";

    if (error.code === "auth/invalid-credential") {
      message = "Incorrect email or password.";
    }

    if (error.code === "auth/user-not-found") {
      message = "This Firebase account does not exist.";
    }

    if (error.code === "auth/wrong-password") {
      message = "Incorrect password.";
    }

    if (error.code === "auth/too-many-requests") {
      message = "Too many attempts. Please try again later.";
    }

    alert(message);

  }

}


// ============================================================
// LOGOUT
// ============================================================

async function logoutUser() {

  try {

    await signOut(auth);

  } catch (error) {

    console.error("Logout error:", error);

  }

}


// ============================================================
// LOGIN SCREEN
// ============================================================

function showLoginScreen() {

  const loginScreen =
    document.querySelector("#loginScreen") ||
    document.querySelector(".login-screen") ||
    document.querySelector("[data-login]");

  const dashboard =
    document.querySelector("#dashboard") ||
    document.querySelector(".dashboard") ||
    document.querySelector("[data-dashboard]");

  if (loginScreen) {
    loginScreen.style.display = "";
  }

  if (dashboard) {
    dashboard.style.display = "none";
  }

}


// ============================================================
// DASHBOARD SCREEN
// ============================================================

function showDashboard() {

  const loginScreen =
    document.querySelector("#loginScreen") ||
    document.querySelector(".login-screen") ||
    document.querySelector("[data-login]");

  const dashboard =
    document.querySelector("#dashboard") ||
    document.querySelector(".dashboard") ||
    document.querySelector("[data-dashboard]");

  if (loginScreen) {
    loginScreen.style.display = "none";
  }

  if (dashboard) {
    dashboard.style.display = "";
  }

}


// ============================================================
// LOGGED-IN EMAIL
// ============================================================

function updateLoggedInEmail(email) {

  const elements = [
    "#adminEmail",
    "#userEmail",
    "#loggedInEmail",
    ".admin-email"
  ];

  elements.forEach(selector => {

    const element = document.querySelector(selector);

    if (element) {
      element.textContent = email;
    }

  });

}


// ============================================================
// LOAD VEHICLES
// ============================================================

async function loadVehicles() {

  try {

    const q = query(
      vehiclesCollection,
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const snapshot = await getDocs(q);

    vehicles = [];

    snapshot.forEach(item => {

      vehicles.push({
        id: item.id,
        ...item.data()
      });

    });

    renderVehicles();

    updateDashboardCounts();

  } catch (error) {

    console.error("Could not load vehicles:", error);

    /*
      If some old vehicles don't contain createdAt,
      load them without orderBy.
    */

    try {

      const snapshot = await getDocs(
        vehiclesCollection
      );

      vehicles = [];

      snapshot.forEach(item => {

        vehicles.push({
          id: item.id,
          ...item.data()
        });

      });

      vehicles.sort((a, b) => {

        const aTime =
          a.createdAt?.seconds || 0;

        const bTime =
          b.createdAt?.seconds || 0;

        return bTime - aTime;

      });

      renderVehicles();

      updateDashboardCounts();

    } catch (secondError) {

      console.error(
        "Vehicle loading failed:",
        secondError
      );

      alert(
        "Could not load vehicles from Firebase."
      );

    }

  }

}


// ============================================================
// GET VEHICLE REFERENCE
// ============================================================

function getNextReference() {

  let highest = 0;

  vehicles.forEach(vehicle => {

    const ref =
      vehicle.ref ||
      vehicle.referenceNumber ||
      vehicle.reference ||
      "";

    const match =
      String(ref).match(/HVE-(\d+)/i);

    if (match) {

      const number =
        parseInt(match[1], 10);

      if (number > highest) {
        highest = number;
      }

    }

  });

  return `HVE-${String(highest + 1).padStart(4, "0")}`;

}


// ============================================================
// IMAGE HELPERS
// ============================================================

function getVehicleImages(vehicle) {

  if (Array.isArray(vehicle.images)) {
    return vehicle.images.filter(Boolean);
  }

  if (Array.isArray(vehicle.imageUrls)) {
    return vehicle.imageUrls.filter(Boolean);
  }

  if (Array.isArray(vehicle.photos)) {
    return vehicle.photos.filter(Boolean);
  }

  if (typeof vehicle.image === "string" && vehicle.image) {
    return [vehicle.image];
  }

  return [];

}


// ============================================================
// CLOUDINARY IMAGE UPLOAD
// ============================================================

async function uploadImage(file) {

  if (!file) {
    return null;
  }

  if (!file.type.startsWith("image/")) {

    alert(
      `${file.name} is not an image file.`
    );

    return null;

  }

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );

  try {

    const response = await fetch(
      CLOUDINARY_UPLOAD_URL,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(data);

      throw new Error(
        data.error?.message ||
        "Cloudinary upload failed."
      );

    }

    return data.secure_url;

  } catch (error) {

    console.error(
      "Cloudinary upload error:",
      error
    );

    alert(
      `Image upload failed: ${error.message}`
    );

    return null;

  }

}


// ============================================================
// UPLOAD MULTIPLE IMAGES
// ============================================================

async function uploadImages(files) {

  const uploaded = [];

  for (const file of files) {

    const url =
      await uploadImage(file);

    if (url) {
      uploaded.push(url);
    }

  }

  return uploaded;

}


// ============================================================
// REMOVE IMAGE FROM CURRENT VEHICLE
// ============================================================

function removeImage(index) {

  if (
    index < 0 ||
    index >= currentImages.length
  ) {
    return;
  }

  currentImages.splice(index, 1);

  renderCurrentImages();

}


// ============================================================
// IMAGE PREVIEW
// ============================================================

function renderCurrentImages() {

  const containers = [
    "#imagePreview",
    "#imagePreviews",
    "#vehicleImagePreview",
    ".image-preview"
  ];

  let container = null;

  for (const selector of containers) {

    const found =
      document.querySelector(selector);

    if (found) {
      container = found;
      break;
    }

  }

  if (!container) {
    return;
  }

  container.innerHTML = "";

  currentImages.forEach(
    (image, index) => {

      const wrapper =
        document.createElement("div");

      wrapper.className =
        "admin-image-preview-item";

      wrapper.innerHTML = `
        <img
          src="${escapeAttribute(image)}"
          alt="Vehicle image ${index + 1}"
        >

        <button
          type="button"
          class="remove-image-btn"
          data-remove-image="${index}"
          title="Remove image"
        >
          ×
        </button>
      `;

      container.appendChild(wrapper);

    }
  );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


// ============================================================
// GET FORM VALUE
// ============================================================

function getValue(selectors) {

  for (const selector of selectors) {

    const element =
      document.querySelector(selector);

    if (element) {
      return element.value.trim();
    }

  }

  return "";

}


// ============================================================
// SET FORM VALUE
// ============================================================

function setValue(selectors, value) {

  for (const selector of selectors) {

    const element =
      document.querySelector(selector);

    if (element) {

      element.value =
        value ?? "";

      return;

    }

  }

}


// ============================================================
// VEHICLE DATA FROM FORM
// ============================================================

function getVehicleFromForm() {

  const make =
    getValue([
      "#make",
      "#brand",
      "#vehicleMake",
      "[name='make']",
      "[name='brand']"
    ]);

  const model =
    getValue([
      "#model",
      "#vehicleModel",
      "[name='model']"
    ]);

  const year =
    getValue([
      "#year",
      "#vehicleYear",
      "[name='year']"
    ]);

  const mileage =
    getValue([
      "#mileage",
      "#vehicleMileage",
      "[name='mileage']"
    ]);

  const engine =
    getValue([
      "#engine",
      "#engineSize",
      "[name='engine']"
    ]);

  const fuel =
    getValue([
      "#fuel",
      "[name='fuel']"
    ]);

  const transmission =
    getValue([
      "#transmission",
      "[name='transmission']"
    ]);

  const drive =
    getValue([
      "#drive",
      "[name='drive']"
    ]);

  const region =
    getValue([
      "#region",
      "#market",
      "[name='region']",
      "[name='market']"
    ]);

  const country =
    getValue([
      "#country",
      "#destinationCountry",
      "[name='country']",
      "[name='destinationCountry']"
    ]);

  const status =
    getValue([
      "#status",
      "[name='status']"
    ]) || "Available";

  const description =
    getValue([
      "#description",
      "#vehicleDescription",
      "[name='description']"
    ]);

  const features =
    getValue([
      "#features",
      "#keyFeatures",
      "[name='features']",
      "[name='keyFeatures']"
    ]);

  const chassis =
    getValue([
      "#chassis",
      "#chassisNo",
      "[name='chassis']",
      "[name='chassisNo']"
    ]);

  const modelCode =
    getValue([
      "#modelCode",
      "[name='modelCode']"
    ]);

  const version =
    getValue([
      "#version",
      "#versionClass",
      "[name='version']",
      "[name='versionClass']"
    ]);

  const steering =
    getValue([
      "#steering",
      "[name='steering']"
    ]);

  const exteriorColor =
    getValue([
      "#exteriorColor",
      "#extColor",
      "[name='exteriorColor']",
      "[name='extColor']"
    ]);

  const seats =
    getValue([
      "#seats",
      "[name='seats']"
    ]);

  const doors =
    getValue([
      "#doors",
      "[name='doors']"
    ]);

  const location =
    getValue([
      "#location",
      "[name='location']"
    ]);

  const registration =
    getValue([
      "#registration",
      "#registrationYear",
      "[name='registration']"
    ]);

  const manufacture =
    getValue([
      "#manufacture",
      "#manufactureYear",
      "[name='manufacture']"
    ]);

  const dimension =
    getValue([
      "#dimension",
      "[name='dimension']"
    ]);

  const weight =
    getValue([
      "#weight",
      "[name='weight']"
    ]);

  const maxCapacity =
    getValue([
      "#maxCapacity",
      "#maxCap",
      "[name='maxCapacity']"
    ]);

  const m3 =
    getValue([
      "#m3",
      "[name='m3']"
    ]);

  const subRefNo =
    getValue([
      "#subRefNo",
      "#subReference",
      "[name='subRefNo']"
    ]);

  return {

    make,
    brand: make,

    model,

    year,

    mileage,

    engine,

    fuel,

    transmission,

    drive,

    region,

    market: region,

    country,

    destinationCountry: country,

    status,

    description,

    features,

    keyFeatures: features,

    chassis,

    chassisNo: chassis,

    modelCode,

    version,

    versionClass: version,

    steering,

    exteriorColor,

    extColor: exteriorColor,

    seats,

    doors,

    location,

    registration,

    manufacture,

    dimension,

    weight,

    maxCapacity,

    m3,

    subRefNo

  };

}


// ============================================================
// SAVE VEHICLE
// ============================================================

async function saveVehicle() {

  if (!currentUser) {

    alert("Please login first.");

    return;

  }

  if (!isAuthorizedAdmin(currentUser)) {

    alert(
      "Your account is not authorized."
    );

    return;

  }

  const vehicle =
    getVehicleFromForm();

  if (!vehicle.make) {

    alert("Please enter vehicle make.");

    return;

  }

  if (!vehicle.model) {

    alert("Please enter vehicle model.");

    return;

  }

  // ----------------------------------------------------------
  // OPTIONAL DESTINATION
  // ----------------------------------------------------------
  //
  // Destination country is NOT required when publishing.
  // It can be added later when a customer buys/inquires.
  //
  // ----------------------------------------------------------

  try {

    let reference;

    if (editingVehicleId) {

      const existing =
        vehicles.find(
          item =>
            item.id === editingVehicleId
        );

      reference =
        existing?.ref ||
        existing?.referenceNumber ||
        existing?.reference ||
        getNextReference();

    } else {

      reference =
        getNextReference();

    }

    vehicle.ref =
      reference;

    vehicle.referenceNumber =
      reference;

    vehicle.images =
      [...currentImages];

    vehicle.updatedAt =
      serverTimestamp();

    if (!editingVehicleId) {

      vehicle.createdAt =
        serverTimestamp();

      await addDoc(
        vehiclesCollection,
        vehicle
      );

      alert(
        `${reference} added successfully.`
      );

    } else {

      await updateDoc(
        doc(
          db,
          "vehicles",
          editingVehicleId
        ),
        vehicle
      );

      alert(
        `${reference} updated successfully.`
      );

    }

    resetVehicleForm();

    await loadVehicles();

    updateDashboardCounts();

  } catch (error) {

    console.error(
      "Save vehicle error:",
      error
    );

    alert(
      `Could not save vehicle: ${error.message}`
    );

  }

}


// ============================================================
// EDIT VEHICLE
// ============================================================

function editVehicle(id) {

  const vehicle =
    vehicles.find(
      item => item.id === id
    );

  if (!vehicle) {
    return;
  }

  editingVehicleId =
    vehicle.id;

  currentImages =
    getVehicleImages(vehicle);

  setValue(
    ["#make", "#brand", "#vehicleMake", "[name='make']", "[name='brand']"],
    vehicle.make || vehicle.brand || ""
  );

  setValue(
    ["#model", "#vehicleModel", "[name='model']"],
    vehicle.model || ""
  );

  setValue(
    ["#year", "#vehicleYear", "[name='year']"],
    vehicle.year || ""
  );

  setValue(
    ["#mileage", "#vehicleMileage", "[name='mileage']"],
    vehicle.mileage || ""
  );

  setValue(
    ["#engine", "#engineSize", "[name='engine']"],
    vehicle.engine || ""
  );

  setValue(
    ["#fuel", "[name='fuel']"],
    vehicle.fuel || ""
  );

  setValue(
    ["#transmission", "[name='transmission']"],
    vehicle.transmission || ""
  );

  setValue(
    ["#drive", "[name='drive']"],
    vehicle.drive || ""
  );

  setValue(
    ["#region", "#market", "[name='region']", "[name='market']"],
    vehicle.region || vehicle.market || ""
  );

  setValue(
    ["#country", "#destinationCountry", "[name='country']", "[name='destinationCountry']"],
    vehicle.country ||
    vehicle.destinationCountry ||
    ""
  );

  setValue(
    ["#status", "[name='status']"],
    vehicle.status || "Available"
  );

  setValue(
    ["#description", "#vehicleDescription", "[name='description']"],
    vehicle.description || ""
  );

  setValue(
    ["#features", "#keyFeatures", "[name='features']", "[name='keyFeatures']"],
    Array.isArray(vehicle.features)
      ? vehicle.features.join("\n")
      : vehicle.features ||
        vehicle.keyFeatures ||
        ""
  );

  setValue(
    ["#chassis", "#chassisNo", "[name='chassis']", "[name='chassisNo']"],
    vehicle.chassis ||
    vehicle.chassisNo ||
    ""
  );

  setValue(
    ["#modelCode", "[name='modelCode']"],
    vehicle.modelCode || ""
  );

  setValue(
    ["#version", "#versionClass", "[name='version']", "[name='versionClass']"],
    vehicle.version ||
    vehicle.versionClass ||
    ""
  );

  setValue(
    ["#steering", "[name='steering']"],
    vehicle.steering || ""
  );

  setValue(
    ["#exteriorColor", "#extColor", "[name='exteriorColor']", "[name='extColor']"],
    vehicle.exteriorColor ||
    vehicle.extColor ||
    ""
  );

  setValue(
    ["#seats", "[name='seats']"],
    vehicle.seats || ""
  );

  setValue(
    ["#doors", "[name='doors']"],
    vehicle.doors || ""
  );

  setValue(
    ["#location", "[name='location']"],
    vehicle.location || ""
  );

  setValue(
    ["#registration", "#registrationYear", "[name='registration']"],
    vehicle.registration || ""
  );

  setValue(
    ["#manufacture", "#manufactureYear", "[name='manufacture']"],
    vehicle.manufacture || ""
  );

  setValue(
    ["#dimension", "[name='dimension']"],
    vehicle.dimension || ""
  );

  setValue(
    ["#weight", "[name='weight']"],
    vehicle.weight || ""
  );

  setValue(
    ["#maxCapacity", "#maxCap", "[name='maxCapacity']"],
    vehicle.maxCapacity || ""
  );

  setValue(
    ["#m3", "[name='m3']"],
    vehicle.m3 || ""
  );

  setValue(
    ["#subRefNo", "#subReference", "[name='subRefNo']"],
    vehicle.subRefNo || ""
  );

  renderCurrentImages();

  updateFormTitle();

  scrollToVehicleForm();

}


// ============================================================
// DELETE VEHICLE
// ============================================================

async function deleteVehicle(id) {

  const vehicle =
    vehicles.find(
      item => item.id === id
    );

  if (!vehicle) {
    return;
  }

  const ref =
    vehicle.ref ||
    vehicle.referenceNumber ||
    vehicle.reference ||
    id;

  const confirmed =
    confirm(
      `Delete ${ref} permanently?\n\nThis removes the vehicle from Firestore.`
    );

  if (!confirmed) {
    return;
  }

  try {

    await deleteDoc(
      doc(
        db,
        "vehicles",
        id
      )
    );

    alert(
      `${ref} deleted successfully.`
    );

    if (
      editingVehicleId === id
    ) {
      resetVehicleForm();
    }

    await loadVehicles();

    updateDashboardCounts();

  } catch (error) {

    console.error(
      "Delete vehicle error:",
      error
    );

    alert(
      `Could not delete vehicle: ${error.message}`
    );

  }

}


// ============================================================
// RENDER VEHICLES
// ============================================================

function renderVehicles(list = vehicles) {

  const containers = [
    "#vehicleList",
    "#vehiclesList",
    "#inventoryList",
    "#recentVehicles",
    ".vehicle-list"
  ];

  let container = null;

  for (const selector of containers) {

    const element =
      document.querySelector(selector);

    if (element) {

      container = element;

      break;

    }

  }

  if (!container) {
    return;
  }

  if (!list.length) {

    container.innerHTML = `
      <div class="empty-state">
        No vehicles found.
      </div>
    `;

    return;

  }

  container.innerHTML =
    list.map(vehicle => {

      const ref =
        vehicle.ref ||
        vehicle.referenceNumber ||
        vehicle.reference ||
        "—";

      const make =
        vehicle.make ||
        vehicle.brand ||
        "";

      const model =
        vehicle.model ||
        "";

      const title =
        `${make} ${model}`.trim() ||
        "Vehicle";

      const year =
        vehicle.year ||
        "—";

      const country =
        vehicle.country ||
        vehicle.destinationCountry ||
        "Not assigned";

      const status =
        vehicle.status ||
        "Available";

      const images =
        getVehicleImages(vehicle);

      const image =
        images[0] ||
        "";

      return `

        <div
          class="admin-vehicle-row"
          data-vehicle-id="${escapeAttribute(vehicle.id)}"
        >

          <div class="admin-vehicle-image">

            ${
              image
              ?
              `<img
                src="${escapeAttribute(image)}"
                alt="${escapeAttribute(title)}"
              >`
              :
              `<div class="no-vehicle-image">
                HVE
              </div>`
            }

          </div>

          <div class="admin-vehicle-info">

            <strong>
              ${escapeHTML(title)}
            </strong>

            <span>
              ${escapeHTML(ref)}
            </span>

          </div>

          <div>
            ${escapeHTML(year)}
          </div>

          <div>
            ${escapeHTML(country)}
          </div>

          <div>

            <span class="status-badge">
              ${escapeHTML(status)}
            </span>

          </div>

          <div class="admin-vehicle-actions">

            <button
              type="button"
              data-edit-vehicle="${escapeAttribute(vehicle.id)}"
            >
              Edit
            </button>

            <button
              type="button"
              data-delete-vehicle="${escapeAttribute(vehicle.id)}"
            >
              Delete
            </button>

          </div>

        </div>

      `;

    }).join("");

}


// ============================================================
// SEARCH VEHICLES
// ============================================================

function searchVehicles(value) {

  const search =
    String(value || "")
      .trim()
      .toLowerCase();

  if (!search) {

    renderVehicles();

    return;

  }

  const filtered =
    vehicles.filter(vehicle => {

      const text = [

        vehicle.ref,

        vehicle.referenceNumber,

        vehicle.reference,

        vehicle.make,

        vehicle.brand,

        vehicle.model,

        vehicle.year,

        vehicle.country,

        vehicle.destinationCountry,

        vehicle.status,

        vehicle.region,

        vehicle.chassis,

        vehicle.chassisNo

      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(search);

    });

  renderVehicles(filtered);

}


// ============================================================
// FILTER VEHICLES
// ============================================================

function filterVehicles(status) {

  if (!status || status === "All") {

    renderVehicles();

    return;

  }

  const filtered =
    vehicles.filter(
      vehicle =>
        String(
          vehicle.status || ""
        ).toLowerCase() ===
        String(status).toLowerCase()
    );

  renderVehicles(filtered);

}


// ============================================================
// DASHBOARD COUNTS
// ============================================================

function updateDashboardCounts() {

  const total =
    vehicles.length;

  const available =
    vehicles.filter(
      v =>
        String(v.status || "")
          .toLowerCase() ===
        "available"
    ).length;

  const sold =
    vehicles.filter(
      v =>
        String(v.status || "")
          .toLowerCase() ===
        "sold"
    ).length;

  const inTransit =
    vehicles.filter(
      v =>
        String(v.status || "")
          .toLowerCase()
          .includes("transit")
    ).length;

  setCounter(
    ["#totalVehicles", "#totalCount", "[data-count='total']"],
    total
  );

  setCounter(
    ["#availableVehicles", "#availableCount", "[data-count='available']"],
    available
  );

  setCounter(
    ["#soldVehicles", "#soldCount", "[data-count='sold']"],
    sold
  );

  setCounter(
    ["#inTransitVehicles", "#transitCount", "[data-count='transit']"],
    inTransit
  );

}


function setCounter(selectors, value) {

  for (const selector of selectors) {

    const element =
      document.querySelector(selector);

    if (element) {

      element.textContent =
        value;

      return;

    }

  }

}


// ============================================================
// RESET FORM
// ============================================================

function resetVehicleForm() {

  editingVehicleId = null;

  currentImages = [];

  const form =
    document.querySelector("#vehicleForm") ||
    document.querySelector("#addVehicleForm") ||
    document.querySelector("form[data-vehicle-form]");

  if (form) {
    form.reset();
  }

  setValue(
    ["#status", "[name='status']"],
    "Available"
  );

  renderCurrentImages();

  updateFormTitle();

}


// ============================================================
// FORM TITLE
// ============================================================

function updateFormTitle() {

  const titleSelectors = [
    "#vehicleFormTitle",
    "#formTitle",
    ".vehicle-form-title"
  ];

  for (const selector of titleSelectors) {

    const element =
      document.querySelector(selector);

    if (element) {

      element.textContent =
        editingVehicleId
          ? "Edit Vehicle"
          : "Add Vehicle";

    }

  }

}


// ============================================================
// SCROLL TO FORM
// ============================================================

function scrollToVehicleForm() {

  const form =
    document.querySelector("#vehicleForm") ||
    document.querySelector("#addVehicleForm") ||
    document.querySelector("form[data-vehicle-form]");

  if (form) {

    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


// ============================================================
// IMPORT JSON
// ============================================================

async function importVehiclesFromJSON(file) {

  if (!file) {
    return;
  }

  try {

    const text =
      await file.text();

    const data =
      JSON.parse(text);

    const list =
      Array.isArray(data)
        ? data
        : Array.isArray(data.vehicles)
          ? data.vehicles
          : [];

    if (!list.length) {

      alert(
        "No vehicles were found in the JSON file."
      );

      return;

    }

    let imported = 0;

    for (const item of list) {

      const vehicle = {
        ...item
      };

      const reference =
        vehicle.ref ||
        vehicle.referenceNumber ||
        vehicle.reference ||
        getNextReference();

      vehicle.ref =
        reference;

      vehicle.referenceNumber =
        reference;

      if (!Array.isArray(vehicle.images)) {

        vehicle.images =
          getVehicleImages(vehicle);

      }

      vehicle.createdAt =
        serverTimestamp();

      vehicle.updatedAt =
        serverTimestamp();

      await addDoc(
        vehiclesCollection,
        vehicle
      );

      imported++;

    }

    alert(
      `${imported} vehicle(s) imported successfully.`
    );

    await loadVehicles();

    updateDashboardCounts();

  } catch (error) {

    console.error(
      "JSON import error:",
      error
    );

    alert(
      `JSON import failed: ${error.message}`
    );

  }

}


// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // --------------------------------------------------------
    // LOGIN FORM
    // --------------------------------------------------------

    const loginForm =
      document.querySelector("#loginForm") ||
      document.querySelector("form[data-login-form]");

    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        event => {

          event.preventDefault();

          const emailInput =
            loginForm.querySelector(
              "input[type='email']"
            ) ||
            document.querySelector("#email") ||
            document.querySelector("#loginEmail");

          const passwordInput =
            loginForm.querySelector(
              "input[type='password']"
            ) ||
            document.querySelector("#password") ||
            document.querySelector("#loginPassword");

          loginUser(
            emailInput?.value || "",
            passwordInput?.value || ""
          );

        }
      );

    }


    // --------------------------------------------------------
    // LOGOUT BUTTONS
    // --------------------------------------------------------

    document.addEventListener(
      "click",
      event => {

        const logoutButton =
          event.target.closest(
            "#logoutBtn, #signOutBtn, [data-logout]"
          );

        if (logoutButton) {

          event.preventDefault();

          logoutUser();

        }

      }
    );


    // --------------------------------------------------------
    // VEHICLE FORM
    // --------------------------------------------------------

    const vehicleForm =
      document.querySelector("#vehicleForm") ||
      document.querySelector("#addVehicleForm") ||
      document.querySelector("form[data-vehicle-form]");

    if (vehicleForm) {

      vehicleForm.addEventListener(
        "submit",
        async event => {

          event.preventDefault();

          const submitButton =
            vehicleForm.querySelector(
              "button[type='submit']"
            );

          if (submitButton) {
            submitButton.disabled = true;
          }

          await saveVehicle();

          if (submitButton) {
            submitButton.disabled = false;
          }

        }
      );

    }


    // --------------------------------------------------------
    // IMAGE FILE INPUT
    // --------------------------------------------------------

    const imageInput =
      document.querySelector("#images") ||
      document.querySelector("#vehicleImages") ||
      document.querySelector("#imageUpload") ||
      document.querySelector(
        "input[type='file'][multiple]"
      );

    if (imageInput) {

      imageInput.addEventListener(
        "change",
        async event => {

          const files =
            Array.from(
              event.target.files || []
            );

          if (!files.length) {
            return;
          }

          const uploadButton =
            document.querySelector(
              "#uploadImagesBtn"
            );

          if (uploadButton) {

            uploadButton.disabled =
              true;

            uploadButton.textContent =
              "Uploading...";

          }

          const uploaded =
            await uploadImages(files);

          currentImages.push(
            ...uploaded
          );

          renderCurrentImages();

          event.target.value = "";

          if (uploadButton) {

            uploadButton.disabled =
              false;

            uploadButton.textContent =
              "Upload Images";

          }

        }
      );

    }


    // --------------------------------------------------------
    // BUTTON EVENTS
    // --------------------------------------------------------

    document.addEventListener(
      "click",
      event => {

        // Edit vehicle
        const editButton =
          event.target.closest(
            "[data-edit-vehicle]"
          );

        if (editButton) {

          editVehicle(
            editButton.dataset.editVehicle
          );

          return;

        }


        // Delete vehicle
        const deleteButton =
          event.target.closest(
            "[data-delete-vehicle]"
          );

        if (deleteButton) {

          deleteVehicle(
            deleteButton.dataset.deleteVehicle
          );

          return;

        }


        // Remove image from listing
        const removeImageButton =
          event.target.closest(
            "[data-remove-image]"
          );

        if (removeImageButton) {

          const index =
            parseInt(
              removeImageButton.dataset.removeImage,
              10
            );

          removeImage(index);

          return;

        }


        // Reset form
        const resetButton =
          event.target.closest(
            "#resetVehicleBtn, #cancelEditBtn, [data-reset-form]"
          );

        if (resetButton) {

          resetVehicleForm();

          return;

        }


        // Add vehicle button
        const addButton =
          event.target.closest(
            "#addVehicleBtn, [data-add-vehicle]"
          );

        if (addButton) {

          resetVehicleForm();

          scrollToVehicleForm();

          return;

        }

      }
    );


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    const searchInput =
      document.querySelector("#vehicleSearch") ||
      document.querySelector("#searchVehicles") ||
      document.querySelector(
        "input[data-vehicle-search]"
      );

    if (searchInput) {

      searchInput.addEventListener(
        "input",
        event => {

          searchVehicles(
            event.target.value
          );

        }
      );

    }


    // --------------------------------------------------------
    // STATUS FILTER
    // --------------------------------------------------------

    const statusFilter =
      document.querySelector("#statusFilter") ||
      document.querySelector("#vehicleStatusFilter");

    if (statusFilter) {

      statusFilter.addEventListener(
        "change",
        event => {

          filterVehicles(
            event.target.value
          );

        }
      );

    }


    // --------------------------------------------------------
    // JSON IMPORT
    // --------------------------------------------------------

    const jsonInput =
      document.querySelector("#jsonFile") ||
      document.querySelector("#importJSON") ||
      document.querySelector(
        "input[type='file'][accept*='json']"
      );

    if (jsonInput) {

      jsonInput.addEventListener(
        "change",
        event => {

          const file =
            event.target.files?.[0];

          if (file) {

            importVehiclesFromJSON(
              file
            );

          }

          event.target.value = "";

        }
      );

    }

  }
);


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================
//
// Makes these available to existing HTML onclick handlers.
// ============================================================

window.loginUser =
  loginUser;

window.logoutUser =
  logoutUser;

window.loadVehicles =
  loadVehicles;

window.editVehicle =
  editVehicle;

window.deleteVehicle =
  deleteVehicle;

window.removeImage =
  removeImage;

window.saveVehicle =
  saveVehicle;

window.resetVehicleForm =
  resetVehicleForm;

window.searchVehicles =
  searchVehicles;

window.filterVehicles =
  filterVehicles;

window.importVehiclesFromJSON =
  importVehiclesFromJSON;

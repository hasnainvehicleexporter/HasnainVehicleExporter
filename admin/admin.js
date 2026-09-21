import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
  firebaseConfig,
  ADMIN_EMAIL,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL
} from "./firebase-config.js";


/* =========================================================
   FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* =========================================================
   HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];


/* =========================================================
   STATE
========================================================= */

let vehicles = [];

/*
  Files waiting to be uploaded to Cloudinary.
*/
let selectedFiles = [];

/*
  Existing images currently attached to the vehicle being edited.
*/
let currentImages = [];

/*
  Vehicle currently being edited.
*/
let editingVehicle = null;


/* =========================================================
   TOAST
========================================================= */

function toast(message, error = false) {
  const el = $("toast");

  if (!el) return;

  el.textContent = message;
  el.className = `toast show ${error ? "error" : ""}`;

  setTimeout(() => {
    el.className = "toast";
  }, 3000);
}


/* =========================================================
   SECURITY / HTML
========================================================= */

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c])
  );
}


/* =========================================================
   SLUG
========================================================= */

function slugify(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


/* =========================================================
   NORMALIZE VEHICLE
========================================================= */

function normalizeVehicle(v, id = "") {
  return {
    id: id || v.id || "",
    ref: v.ref || v.reference || "",
    status: v.status || "Available",
    make: v.make || "",
    model: v.model || "",
    year: Number(v.year) || "",
    mileage: v.mileage || "",
    engine: v.engine || "",
    fuel: v.fuel || "Petrol",
    transmission: v.transmission || "Automatic",
    drive: v.drive || "",
    region: v.region || "Africa",
    country: v.country || "",
    beforwardRef: v.beforwardRef || v.beforward_reference || "",
    description: v.description || "",

    features: Array.isArray(v.features)
      ? v.features
      : String(v.features || "")
          .split(",")
          .map(x => x.trim())
          .filter(Boolean),

    images: Array.isArray(v.images)
      ? v.images
      : [],

    tracking: {
      status: v.tracking?.status || "Available in Japan",
      location: v.tracking?.location || "Japan",
      updatedAt: v.tracking?.updatedAt || null
    }
  };
}


/* =========================================================
   STATUS
========================================================= */

function statusClass(status) {
  const s = String(status).toLowerCase();

  if (s === "sold") {
    return "pill sold";
  }

  if (s === "available") {
    return "pill available";
  }

  if (s.includes("transit")) {
    return "pill transit";
  }

  return "pill";
}


/* =========================================================
   LOAD VEHICLES
========================================================= */

async function loadVehicles() {
  try {
    const snap = await getDocs(
      query(
        collection(db, "vehicles"),
        orderBy("createdAt", "desc")
      )
    );

    vehicles = snap.docs.map(d =>
      normalizeVehicle(d.data(), d.id)
    );

    renderAll();

  } catch (err) {
    console.error(err);

    /*
      If createdAt ordering causes a problem for older records,
      fall back to loading the collection normally.
    */

    try {
      const snap = await getDocs(collection(db, "vehicles"));

      vehicles = snap.docs.map(d =>
        normalizeVehicle(d.data(), d.id)
      );

      vehicles.sort((a, b) =>
        String(b.ref).localeCompare(String(a.ref))
      );

      renderAll();

    } catch (fallbackError) {
      console.error(fallbackError);
      toast("Could not load vehicles.", true);
    }
  }
}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {
  const total = vehicles.length;

  $("statTotal").textContent = total;

  $("statAvailable").textContent =
    vehicles.filter(v => v.status === "Available").length;

  $("statSold").textContent =
    vehicles.filter(v => v.status === "Sold").length;

  $("statTransit").textContent =
    vehicles.filter(v => v.status === "In Transit").length;

  const recent = vehicles.slice(0, 8);

  $("recentTable").innerHTML =
    tableHtml(recent, true);

  renderVehicleTable();
  renderTracking();
}


/* =========================================================
   VEHICLE TABLE
========================================================= */

function tableHtml(list, compact = false) {

  if (!list.length) {
    return `<div class="empty">No vehicles found.</div>`;
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Reference</th>
          <th>Vehicle</th>
          <th>Year</th>
          <th>Country</th>
          <th>Status</th>
          ${compact ? "" : "<th>Actions</th>"}
        </tr>
      </thead>

      <tbody>

        ${list.map(v => `

          <tr>

            <td>
              <strong>${escapeHtml(v.ref)}</strong>
            </td>

            <td>
              ${escapeHtml(v.make)}
              ${escapeHtml(v.model)}
            </td>

            <td>
              ${escapeHtml(v.year)}
            </td>

            <td>
              ${escapeHtml(v.country || "—")}
            </td>

            <td>
              <span class="${statusClass(v.status)}">
                ${escapeHtml(v.status)}
              </span>
            </td>

            ${
              compact
                ? ""
                : `
                  <td class="actions">

                    <button
                      type="button"
                      class="mini-btn"
                      data-edit="${escapeHtml(v.id)}">
                      Edit
                    </button>

                    <button
                      type="button"
                      class="mini-btn danger"
                      data-delete="${escapeHtml(v.id)}">
                      Delete
                    </button>

                  </td>
                `
            }

          </tr>

        `).join("")}

      </tbody>
    </table>
  `;
}


/* =========================================================
   VEHICLE TABLE FILTER
========================================================= */

function renderVehicleTable() {

  const search =
    $("vehicleSearch").value.trim().toLowerCase();

  const status =
    $("statusFilter").value;

  const filtered = vehicles.filter(v => {

    const hay =
      `${v.ref} ${v.make} ${v.model} ${v.country} ${v.region}`
        .toLowerCase();

    return (
      (!search || hay.includes(search)) &&
      (!status || v.status === status)
    );
  });

  $("vehicleTable").innerHTML =
    tableHtml(filtered);

  qsa("[data-edit]").forEach(button => {
    button.onclick = () =>
      startEdit(button.dataset.edit);
  });

  qsa("[data-delete]").forEach(button => {
    button.onclick = () =>
      removeVehicle(button.dataset.delete);
  });
}


/* =========================================================
   TRACKING
========================================================= */

function renderTracking() {

  const tracked =
    vehicles.filter(v => v.status !== "Sold");

  $("trackingTable").innerHTML =
    tracked.length

      ? `
        <table>

          <thead>
            <tr>
              <th>Reference</th>
              <th>Vehicle</th>
              <th>Tracking Status</th>
              <th>Location</th>
              <th>Update</th>
            </tr>
          </thead>

          <tbody>

            ${tracked.map(v => `

              <tr>

                <td>
                  <strong>
                    ${escapeHtml(v.ref)}
                  </strong>
                </td>

                <td>
                  ${escapeHtml(v.make)}
                  ${escapeHtml(v.model)}
                </td>

                <td>

                  <select
                    class="tracking-select"
                    data-track="${escapeHtml(v.id)}">

                    ${
                      [
                        "Available in Japan",
                        "Vehicle Purchased",
                        "Port Departure",
                        "In Transit",
                        "Port Arrival",
                        "Delivered"
                      ]
                        .map(x => `
                          <option
                            ${x === v.tracking.status ? "selected" : ""}>
                            ${escapeHtml(x)}
                          </option>
                        `)
                        .join("")
                    }

                  </select>

                </td>

                <td>

                  <input
                    class="tracking-location"
                    data-location="${escapeHtml(v.id)}"
                    value="${escapeHtml(v.tracking.location || "")}">

                </td>

                <td>

                  <button
                    type="button"
                    class="mini-btn"
                    data-save-track="${escapeHtml(v.id)}">
                    Save
                  </button>

                </td>

              </tr>

            `).join("")}

          </tbody>

        </table>
      `

      : `
        <div class="empty">
          No active vehicles to track.
        </div>
      `;

  qsa("[data-save-track]").forEach(button => {

    button.onclick = () =>
      updateTracking(button.dataset.saveTrack);

  });
}


/* =========================================================
   UPDATE TRACKING
========================================================= */

async function updateTracking(id) {

  const status =
    qs(`[data-track="${id}"]`).value;

  const location =
    qs(`[data-location="${id}"]`).value.trim();

  try {

    await updateDoc(
      doc(db, "vehicles", id),
      {
        "tracking.status": status,
        "tracking.location": location,
        "tracking.updatedAt": serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );

    toast("Tracking updated.");

    await loadVehicles();

  } catch (err) {

    console.error(err);

    toast(
      "Could not update tracking.",
      true
    );
  }
}


/* =========================================================
   NEXT HVE REFERENCE
========================================================= */

async function nextReference() {

  const snap =
    await getDocs(collection(db, "vehicles"));

  let max = 0;

  snap.docs.forEach(d => {

    const ref =
      d.data().ref || "";

    const m =
      String(ref).match(/^HVE-(\d+)$/i);

    if (m) {
      max =
        Math.max(
          max,
          Number(m[1])
        );
    }
  });

  return `HVE-${String(max + 1).padStart(4, "0")}`;
}


/* =========================================================
   COUNTRIES
========================================================= */

async function loadCountries() {

  try {

    const response =
      await fetch("../data/countries.json");

    if (!response.ok) {
      throw new Error(
        "Could not load countries.json"
      );
    }

    const data =
      await response.json();

    window.__countries = data;

    fillCountryOptions([]);

    /*
      Prevent adding duplicate change listeners
      if countries are loaded again.
    */

    const region =
      $("region");

    region.onchange = () => {

      fillCountryOptions(
        data[region.value] || []
      );

    };

  } catch (err) {

    console.error(err);

    toast(
      "Could not load country list.",
      true
    );
  }
}


function fillCountryOptions(list) {

  $("country").innerHTML =
    `<option value="">Not selected</option>` +

    list
      .map(
        c =>
          `<option value="${escapeHtml(c)}">
            ${escapeHtml(c)}
          </option>`
      )
      .join("");
}


/* =========================================================
   CLEAN OBJECT URLS
========================================================= */

function revokePreviewUrls() {

  selectedFiles.forEach(file => {

    if (file.__previewUrl) {
      URL.revokeObjectURL(
        file.__previewUrl
      );
    }

  });
}


/* =========================================================
   RESET FORM
========================================================= */

function resetForm() {

  revokePreviewUrls();

  selectedFiles = [];
  currentImages = [];
  editingVehicle = null;

  $("vehicleForm").reset();

  $("editId").value = "";

  $("formTitle").textContent =
    "Add Vehicle";

  $("cancelEditBtn")
    .classList.add("hidden");

  $("formMessage").textContent = "";

  $("photoPreview").innerHTML = "";

  /*
    Reset country options.
  */

  fillCountryOptions([]);

  /*
    Generate the next HVE reference.
  */

  nextReference()
    .then(ref => {
      $("ref").value = ref;
    })
    .catch(err => {
      console.error(err);
    });
}


/* =========================================================
   START EDIT
========================================================= */

function startEdit(id) {

  const v =
    vehicles.find(x => x.id === id);

  if (!v) return;

  /*
    Clear any previous pending files.
  */

  revokePreviewUrls();

  selectedFiles = [];

  editingVehicle = v;

  currentImages =
    Array.isArray(v.images)
      ? [...v.images]
      : [];

  $("editId").value = v.id;

  $("ref").value = v.ref;

  $("status").value = v.status;

  $("make").value = v.make;

  $("model").value = v.model;

  $("year").value = v.year;

  $("mileage").value = v.mileage;

  $("engine").value = v.engine;

  $("fuel").value = v.fuel;

  $("transmission").value =
    v.transmission;

  $("drive").value = v.drive;

  $("beforwardRef").value =
    v.beforwardRef;

  $("region").value =
    v.region || "";

  fillCountryOptions(
    window.__countries?.[v.region] || []
  );

  $("country").value =
    v.country || "";

  $("description").value =
    v.description;

  $("features").value =
    v.features.join(", ");

  $("trackingStatus").value =
    v.tracking?.status ||
    "Available in Japan";

  $("trackingLocation").value =
    v.tracking?.location ||
    "Japan";

  $("formTitle").textContent =
    `Edit ${v.ref}`;

  $("cancelEditBtn")
    .classList.remove("hidden");

  renderPhotoPreview();

  showView("add");
}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

function renderPhotoPreview() {

  const container =
    $("photoPreview");

  if (!container) return;

  const existingHtml =
    currentImages.length

      ? currentImages
          .map((url, index) => {

            return `
              <div
                class="photo-item existing-photo"
                data-existing-photo="${index}">

                <div class="photo-image-wrap">

                  <img
                    src="${escapeHtml(url)}"
                    alt="Vehicle photo ${index + 1}"
                    loading="lazy"
                    onerror="this.style.display='none';">

                  <span class="photo-badge">
                    Saved
                  </span>

                  <button
                    type="button"
                    class="photo-remove-btn"
                    data-remove-existing="${index}"
                    title="Remove this image">

                    ×

                  </button>

                </div>

                <div class="photo-name">
                  Photo ${index + 1}
                </div>

              </div>
            `;

          })
          .join("")

      : "";


  const newHtml =
    selectedFiles.length

      ? selectedFiles
          .map((file, index) => {

            const previewUrl =
              file.__previewUrl ||
              URL.createObjectURL(file);

            file.__previewUrl =
              previewUrl;

            return `
              <div
                class="photo-item new-photo"
                data-new-photo="${index}">

                <div class="photo-image-wrap">

                  <img
                    src="${escapeHtml(previewUrl)}"
                    alt="${escapeHtml(file.name)}">

                  <span class="photo-badge new">
                    New
                  </span>

                  <button
                    type="button"
                    class="photo-remove-btn"
                    data-remove-new="${index}"
                    title="Remove this image">

                    ×

                  </button>

                </div>

                <div class="photo-name"
                     title="${escapeHtml(file.name)}">

                  ${escapeHtml(file.name)}

                </div>

              </div>
            `;

          })
          .join("")

      : "";


  if (!existingHtml && !newHtml) {

    container.innerHTML = `
      <div class="photo-empty">
        <span class="photo-empty-icon">▧</span>
        <strong>No vehicle photos</strong>
        <small>
          Add photos using the button above.
        </small>
      </div>
    `;

    return;
  }


  container.innerHTML =
    existingHtml +
    newHtml;


  /*
    Existing image removal
  */

  qsa("[data-remove-existing]")
    .forEach(button => {

      button.onclick = () => {

        const index =
          Number(
            button.dataset.removeExisting
          );

        removeExistingImage(index);

      };

    });


  /*
    New image removal
  */

  qsa("[data-remove-new]")
    .forEach(button => {

      button.onclick = () => {

        const index =
          Number(
            button.dataset.removeNew
          );

        removeNewImage(index);

      };

    });
}


/* =========================================================
   REMOVE EXISTING IMAGE
========================================================= */

function removeExistingImage(index) {

  if (
    index < 0 ||
    index >= currentImages.length
  ) {
    return;
  }

  const removed =
    currentImages[index];

  const confirmed =
    confirm(
      "Remove this vehicle image?\n\n" +
      "The image will be removed from this vehicle when you save the changes."
    );

  if (!confirmed) {
    return;
  }

  currentImages.splice(index, 1);

  renderPhotoPreview();

  toast("Image marked for removal.");
}


/* =========================================================
   REMOVE NEW IMAGE
========================================================= */

function removeNewImage(index) {

  if (
    index < 0 ||
    index >= selectedFiles.length
  ) {
    return;
  }

  const file =
    selectedFiles[index];

  if (file.__previewUrl) {
    URL.revokeObjectURL(
      file.__previewUrl
    );
  }

  selectedFiles.splice(index, 1);

  renderPhotoPreview();

  /*
    Reset the file input so the same file
    can be selected again if necessary.
  */

  const input =
    $("photos");

  if (input) {
    input.value = "";
  }

  toast("Selected image removed.");
}


/* =========================================================
   PHOTO FILE INPUT
========================================================= */

$("photos").addEventListener(
  "change",
  event => {

    const files =
      [...event.target.files];

    if (!files.length) {
      return;
    }

    /*
      Validate files before adding.
    */

    const validFiles = [];

    for (const file of files) {

      if (!file.type.startsWith("image/")) {

        toast(
          `${file.name} is not an image.`,
          true
        );

        continue;
      }

      if (file.size > 10 * 1024 * 1024) {

        toast(
          `${file.name} is larger than 10 MB.`,
          true
        );

        continue;
      }

      validFiles.push(file);
    }


    /*
      Add instead of replacing existing
      selected files.
    */

    selectedFiles.push(
      ...validFiles
    );

    renderPhotoPreview();

    /*
      Clear input so selecting the same
      file again works.
    */

    event.target.value = "";
  }
);


/* =========================================================
   CLOUDINARY UPLOAD
========================================================= */

async function uploadPhotos(
  ref,
  files
) {

  const urls = [];

  for (const file of files) {

    if (!file.type.startsWith("image/")) {

      throw new Error(
        `${file.name} is not an image file.`
      );
    }

    if (file.size > 10 * 1024 * 1024) {

      throw new Error(
        `${file.name} is larger than 10 MB.`
      );
    }


    const form =
      new FormData();

    form.append(
      "file",
      file
    );

    form.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET
    );

    form.append(
      "folder",
      `hve/vehicles/${ref}`
    );


    const response =
      await fetch(
        CLOUDINARY_UPLOAD_URL,
        {
          method: "POST",
          body: form
        }
      );


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.secure_url
    ) {

      throw new Error(
        result.error?.message ||
        `Cloudinary upload failed for ${file.name}.`
      );
    }


    urls.push(
      result.secure_url
    );
  }

  return urls;
}


/* =========================================================
   SAVE VEHICLE
========================================================= */

async function saveVehicle(event) {

  event.preventDefault();

  const btn =
    event.submitter ||
    $("vehicleForm").querySelector(
      'button[type="submit"]'
    );

  if (btn) {
    btn.disabled = true;
  }

  $("formMessage").textContent =
    "Saving...";


  try {

    const editId =
      $("editId").value;

    const ref =
      $("ref").value ||
      await nextReference();


    /*
      Upload only newly selected files.
    */

    let newImages = [];

    if (selectedFiles.length) {

      $("formMessage").textContent =
        "Uploading photos...";

      newImages =
        await uploadPhotos(
          ref,
          selectedFiles
        );
    }


    /*
      Existing images are represented
      by currentImages.

      Any image removed from the preview
      is therefore excluded here.
    */

    const finalImages = [
      ...currentImages,
      ...newImages
    ];


    const data = {

      ref,

      status:
        $("status").value,

      make:
        $("make").value.trim(),

      model:
        $("model").value.trim(),

      year:
        Number($("year").value),

      mileage:
        $("mileage").value.trim(),

      engine:
        $("engine").value.trim(),

      fuel:
        $("fuel").value,

      transmission:
        $("transmission").value,

      drive:
        $("drive").value.trim(),

      region:
        $("region").value || "",

      country:
        $("country").value || "",

      beforwardRef:
        $("beforwardRef").value.trim(),

      description:
        $("description").value.trim(),

      features:
        $("features")
          .value
          .split(",")
          .map(x => x.trim())
          .filter(Boolean),

      images:
        finalImages,

      tracking: {

        status:
          $("trackingStatus").value,

        location:
          $("trackingLocation")
            .value
            .trim(),

        updatedAt:
          serverTimestamp()
      },

      updatedAt:
        serverTimestamp()
    };


    if (editId) {

      /*
        UPDATE EXISTING VEHICLE
      */

      await updateDoc(
        doc(
          db,
          "vehicles",
          editId
        ),
        data
      );

      toast(
        `${ref} updated.`
      );

    } else {

      /*
        CREATE NEW VEHICLE
      */

      data.createdAt =
        serverTimestamp();

      await addDoc(
        collection(
          db,
          "vehicles"
        ),
        data
      );

      toast(
        `${ref} added.`
      );
    }


    /*
      Clear the form and reload data.
    */

    resetForm();

    await loadVehicles();

    showView("vehicles");


  } catch (err) {

    console.error(err);

    $("formMessage").textContent =
      err.message;

    toast(
      "Could not save vehicle.",
      true
    );

  } finally {

    if (btn) {
      btn.disabled = false;
    }
  }
}


/* =========================================================
   DELETE VEHICLE
========================================================= */

async function removeVehicle(id) {

  const v =
    vehicles.find(
      x => x.id === id
    );

  if (!v) return;


  const confirmed =
    confirm(
      `Delete ${v.ref} — ${v.make} ${v.model}?`
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

    toast(
      `${v.ref} deleted.`
    );

    await loadVehicles();

  } catch (err) {

    console.error(err);

    toast(
      "Could not delete vehicle.",
      true
    );
  }
}


/* =========================================================
   IMPORT JSON
========================================================= */

async function importJson() {

  const file =
    $("jsonFile").files[0];

  if (!file) {

    toast(
      "Choose a JSON file first.",
      true
    );

    return;
  }


  try {

    const data =
      JSON.parse(
        await file.text()
      );


    const list =
      Array.isArray(data)
        ? data
        : (
            Array.isArray(data.vehicles)
              ? data.vehicles
              : []
          );


    if (!list.length) {

      throw new Error(
        "No vehicle records found in the JSON file."
      );
    }


    const batch =
      writeBatch(db);

    let count = 0;


    for (const raw of list) {

      const v =
        normalizeVehicle(raw);

      const ref =
        v.ref ||
        await nextReference();

      const docId =
        v.id ||
        slugify(ref);


      batch.set(
        doc(
          db,
          "vehicles",
          docId
        ),
        {
          ...v,
          ref,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()
        },
        {
          merge: true
        }
      );

      count++;
    }


    await batch.commit();


    $("importResult").textContent =
      `Imported/updated ${count} vehicle(s).`;

    toast(
      `Imported ${count} vehicles.`
    );

    await loadVehicles();


  } catch (err) {

    console.error(err);

    $("importResult").textContent =
      err.message;

    toast(
      "Import failed.",
      true
    );
  }
}


/* =========================================================
   PAGE VIEWS
========================================================= */

function showView(name) {

  qsa(".page-view")
    .forEach(view =>
      view.classList.add("hidden")
    );


  const target =
    $(`view-${name}`);

  if (target) {
    target.classList.remove("hidden");
  }


  qsa(".nav-item")
    .forEach(button =>
      button.classList.toggle(
        "active",
        button.dataset.view === name
      )
    );


  const titles = {

    overview:
      "Dashboard",

    vehicles:
      "Vehicles",

    add:
      "Add Vehicle",

    tracking:
      "Tracking",

    import:
      "Import JSON"
  };


  $("pageTitle").textContent =
    titles[name] ||
    "Dashboard";
}


/* =========================================================
   LOGIN
========================================================= */

$("loginForm").addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    $("loginError").textContent = "";


    try {

      await signInWithEmailAndPassword(
        auth,
        $("loginEmail").value,
        $("loginPassword").value
      );

    } catch (err) {

      console.error(err);

      $("loginError").textContent =
        err.message
          .replace(
            "Firebase: Error (auth/",
            ""
          )
          .replace(
            ").",
            ""
          );
    }
  }
);


/* =========================================================
   BUTTON EVENTS
========================================================= */

$("logoutBtn").onclick =
  () =>
    signOut(auth);


$("refreshBtn").onclick =
  () =>
    loadVehicles()
      .then(() =>
        toast("Refreshed.")
      );


$("vehicleSearch")
  .addEventListener(
    "input",
    renderVehicleTable
  );


$("statusFilter")
  .addEventListener(
    "change",
    renderVehicleTable
  );


$("vehicleForm")
  .addEventListener(
    "submit",
    saveVehicle
  );


$("clearFormBtn").onclick =
  resetForm;


$("cancelEditBtn").onclick =
  resetForm;


$("importBtn").onclick =
  importJson;


/* =========================================================
   NAVIGATION
========================================================= */

qsa(".nav-item")
  .forEach(button => {

    button.onclick = () =>
      showView(
        button.dataset.view
      );

  });


qsa("[data-go]")
  .forEach(button => {

    button.onclick = () =>
      showView(
        button.dataset.go
      );

  });


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
  auth,
  async user => {

    if (user) {

      /*
        Only the configured admin email
        is allowed into the dashboard.
      */

      if (
        user.email?.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
      ) {

        await signOut(auth);

        $("loginError").textContent =
          "This account is not authorized for the HVE dashboard.";

        return;
      }


      $("loginView")
        .classList.add("hidden");

      $("appView")
        .classList.remove("hidden");

      $("signedInAs").textContent =
        user.email;


      await loadCountries();

      resetForm();

      await loadVehicles();


    } else {

      $("loginView")
        .classList.remove("hidden");

      $("appView")
        .classList.add("hidden");
    }

  }
);

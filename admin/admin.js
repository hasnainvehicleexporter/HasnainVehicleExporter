import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore, collection, getDocs, addDoc, doc, getDoc, setDoc,
  updateDoc, deleteDoc, query, orderBy, limit, serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAIL, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];

let vehicles = [];
let selectedFiles = [];
let editingVehicle = null;

function toast(message, error=false) {
  const el = $("toast");
  el.textContent = message;
  el.className = `toast show ${error ? "error" : ""}`;
  setTimeout(() => el.className = "toast", 3000);
}

function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function slugify(value="") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizeVehicle(v, id="") {
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
    features: Array.isArray(v.features) ? v.features : String(v.features || "").split(",").map(x => x.trim()).filter(Boolean),
    images: Array.isArray(v.images) ? v.images : [],
    tracking: {
      status: v.tracking?.status || "Available in Japan",
      location: v.tracking?.location || "Japan",
      updatedAt: v.tracking?.updatedAt || null
    }
  };
}

function statusClass(status) {
  const s = String(status).toLowerCase();
  if (s === "sold") return "pill sold";
  if (s === "available") return "pill available";
  if (s.includes("transit")) return "pill transit";
  return "pill";
}

async function loadVehicles() {
  const snap = await getDocs(query(collection(db, "vehicles"), orderBy("createdAt", "desc")));
  vehicles = snap.docs.map(d => normalizeVehicle(d.data(), d.id));
  renderAll();
}

function renderAll() {
  const total = vehicles.length;
  $("statTotal").textContent = total;
  $("statAvailable").textContent = vehicles.filter(v => v.status === "Available").length;
  $("statSold").textContent = vehicles.filter(v => v.status === "Sold").length;
  $("statTransit").textContent = vehicles.filter(v => v.status === "In Transit").length;

  const recent = vehicles.slice(0, 8);
  $("recentTable").innerHTML = tableHtml(recent, true);
  renderVehicleTable();
  renderTracking();
}

function tableHtml(list, compact=false) {
  if (!list.length) return `<div class="empty">No vehicles found.</div>`;
  return `<table><thead><tr>
    <th>Reference</th><th>Vehicle</th><th>Year</th><th>Country</th><th>Status</th>${compact ? "" : "<th>Actions</th>"}
  </tr></thead><tbody>${list.map(v => `<tr>
    <td><strong>${escapeHtml(v.ref)}</strong></td>
    <td>${escapeHtml(v.make)} ${escapeHtml(v.model)}</td>
    <td>${escapeHtml(v.year)}</td>
    <td>${escapeHtml(v.country || "—")}</td>
    <td><span class="${statusClass(v.status)}">${escapeHtml(v.status)}</span></td>
    ${compact ? "" : `<td class="actions">
      <button class="mini-btn" data-edit="${v.id}">Edit</button>
      <button class="mini-btn danger" data-delete="${v.id}">Delete</button>
    </td>`}
  </tr>`).join("")}</tbody></table>`;
}

function renderVehicleTable() {
  const search = $("vehicleSearch").value.trim().toLowerCase();
  const status = $("statusFilter").value;
  const filtered = vehicles.filter(v => {
    const hay = `${v.ref} ${v.make} ${v.model} ${v.country} ${v.region}`.toLowerCase();
    return (!search || hay.includes(search)) && (!status || v.status === status);
  });
  $("vehicleTable").innerHTML = tableHtml(filtered);
  qsa("[data-edit]").forEach(b => b.onclick = () => startEdit(b.dataset.edit));
  qsa("[data-delete]").forEach(b => b.onclick = () => removeVehicle(b.dataset.delete));
}

function renderTracking() {
  const tracked = vehicles.filter(v => v.status !== "Sold");
  $("trackingTable").innerHTML = tracked.length ? `<table><thead><tr>
    <th>Reference</th><th>Vehicle</th><th>Tracking Status</th><th>Location</th><th>Update</th>
  </tr></thead><tbody>${tracked.map(v => `<tr>
    <td><strong>${escapeHtml(v.ref)}</strong></td>
    <td>${escapeHtml(v.make)} ${escapeHtml(v.model)}</td>
    <td><select class="tracking-select" data-track="${v.id}">
      ${["Available in Japan","Vehicle Purchased","Port Departure","In Transit","Port Arrival","Delivered"].map(x => `<option ${x === v.tracking.status ? "selected" : ""}>${x}</option>`).join("")}
    </select></td>
    <td><input class="tracking-location" data-location="${v.id}" value="${escapeHtml(v.tracking.location || "")}"></td>
    <td><button class="mini-btn" data-save-track="${v.id}">Save</button></td>
  </tr>`).join("")}</tbody></table>` : `<div class="empty">No active vehicles to track.</div>`;

  qsa("[data-save-track]").forEach(b => b.onclick = () => updateTracking(b.dataset.saveTrack));
}

async function updateTracking(id) {
  const status = qs(`[data-track="${id}"]`).value;
  const location = qs(`[data-location="${id}"]`).value.trim();
  await updateDoc(doc(db, "vehicles", id), {
    "tracking.status": status,
    "tracking.location": location,
    "tracking.updatedAt": serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  toast("Tracking updated.");
  await loadVehicles();
}

async function nextReference() {
  const snap = await getDocs(collection(db, "vehicles"));
  let max = 0;
  snap.docs.forEach(d => {
    const ref = d.data().ref || "";
    const m = String(ref).match(/^HVE-(\d+)$/i);
    if (m) max = Math.max(max, Number(m[1]));
  });
  return `HVE-${String(max + 1).padStart(4, "0")}`;
}

async function loadCountries() {
  const response = await fetch("../data/countries.json");
  const data = await response.json();
  fillCountryOptions([]);
  $("region").addEventListener("change", async () => {
    fillCountryOptions(data[$("region").value] || []);
  });
  window.__countries = data;
}

function fillCountryOptions(list) {
  $("country").innerHTML = `<option value="">Not selected</option>` + list.map(c => `<option>${escapeHtml(c)}</option>`).join("");
}

function resetForm() {
  $("vehicleForm").reset();
  $("editId").value = "";
  $("formTitle").textContent = "Add Vehicle";
  $("cancelEditBtn").classList.add("hidden");
  $("formMessage").textContent = "";
  selectedFiles = [];
  $("photoPreview").innerHTML = "";
  editingVehicle = null;
  nextReference().then(ref => $("ref").value = ref);
}

function startEdit(id) {
  const v = vehicles.find(x => x.id === id);
  if (!v) return;
  editingVehicle = v;
  $("editId").value = v.id;
  $("ref").value = v.ref;
  $("status").value = v.status;
  $("make").value = v.make;
  $("model").value = v.model;
  $("year").value = v.year;
  $("mileage").value = v.mileage;
  $("engine").value = v.engine;
  $("fuel").value = v.fuel;
  $("transmission").value = v.transmission;
  $("drive").value = v.drive;
  $("beforwardRef").value = v.beforwardRef;
  $("region").value = v.region || "";
  fillCountryOptions(window.__countries?.[v.region] || []);
  $("country").value = v.country || "";
  $("description").value = v.description;
  $("features").value = v.features.join(", ");
  $("trackingStatus").value = v.tracking?.status || "Available in Japan";
  $("trackingLocation").value = v.tracking?.location || "Japan";
  $("formTitle").textContent = `Edit ${v.ref}`;
  $("cancelEditBtn").classList.remove("hidden");
  $("photoPreview").innerHTML = (v.images || []).map(url => `<img src="${escapeHtml(url)}" alt="">`).join("");
  showView("add");
}

async function uploadPhotos(ref, files) {
  const urls = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`${file.name} is not an image file.`);
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`${file.name} is larger than 10 MB.`);
    }

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    form.append("folder", `hve/vehicles/${ref}`);

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: form
    });

    const result = await response.json();
    if (!response.ok || !result.secure_url) {
      throw new Error(result.error?.message || `Cloudinary upload failed for ${file.name}.`);
    }
    urls.push(result.secure_url);
  }
  return urls;
}

async function saveVehicle(event) {
  event.preventDefault();
  const btn = event.submitter;
  btn.disabled = true;
  $("formMessage").textContent = "Saving...";
  try {
    const editId = $("editId").value;
    const ref = $("ref").value || await nextReference();
    const existingImages = editingVehicle?.images || [];
    const newImages = selectedFiles.length ? await uploadPhotos(ref, selectedFiles) : [];
    const data = {
      ref,
      status: $("status").value,
      make: $("make").value.trim(),
      model: $("model").value.trim(),
      year: Number($("year").value),
      mileage: $("mileage").value.trim(),
      engine: $("engine").value.trim(),
      fuel: $("fuel").value,
      transmission: $("transmission").value,
      drive: $("drive").value.trim(),
      region: $("region").value || "",
      country: $("country").value || "",
      beforwardRef: $("beforwardRef").value.trim(),
      description: $("description").value.trim(),
      features: $("features").value.split(",").map(x => x.trim()).filter(Boolean),
      images: [...existingImages, ...newImages],
      tracking: {
        status: $("trackingStatus").value,
        location: $("trackingLocation").value.trim(),
        updatedAt: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    };

    if (editId) {
      await updateDoc(doc(db, "vehicles", editId), data);
      toast(`${ref} updated.`);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, "vehicles"), data);
      toast(`${ref} added.`);
    }
    resetForm();
    await loadVehicles();
    showView("vehicles");
  } catch (err) {
    console.error(err);
    $("formMessage").textContent = err.message;
    toast("Could not save vehicle.", true);
  } finally {
    btn.disabled = false;
  }
}

async function removeVehicle(id) {
  const v = vehicles.find(x => x.id === id);
  if (!v || !confirm(`Delete ${v.ref} — ${v.make} ${v.model}?`)) return;
  try {
    await deleteDoc(doc(db, "vehicles", id));
    toast(`${v.ref} deleted.`);
    await loadVehicles();
  } catch (err) {
    console.error(err);
    toast("Could not delete vehicle.", true);
  }
}

async function importJson() {
  const file = $("jsonFile").files[0];
  if (!file) return toast("Choose a JSON file first.", true);
  try {
    const data = JSON.parse(await file.text());
    const list = Array.isArray(data) ? data : (Array.isArray(data.vehicles) ? data.vehicles : []);
    if (!list.length) throw new Error("No vehicle records found in the JSON file.");
    const batch = writeBatch(db);
    let count = 0;
    for (const raw of list) {
      const v = normalizeVehicle(raw);
      const ref = v.ref || await nextReference();
      const docId = v.id || ref.toLowerCase();
      batch.set(doc(db, "vehicles", docId), {
        ...v,
        ref,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      count++;
    }
    await batch.commit();
    $("importResult").textContent = `Imported/updated ${count} vehicle(s).`;
    toast(`Imported ${count} vehicles.`);
    await loadVehicles();
  } catch (err) {
    $("importResult").textContent = err.message;
    toast("Import failed.", true);
  }
}

function showView(name) {
  qsa(".page-view").forEach(v => v.classList.add("hidden"));
  $(`view-${name}`).classList.remove("hidden");
  qsa(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  const titles = {overview:"Dashboard",vehicles:"Vehicles",add:"Add Vehicle",tracking:"Tracking",import:"Import JSON"};
  $("pageTitle").textContent = titles[name] || "Dashboard";
}

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  $("loginError").textContent = "";
  try {
    await signInWithEmailAndPassword(auth, $("loginEmail").value, $("loginPassword").value);
  } catch (err) {
    $("loginError").textContent = err.message.replace("Firebase: Error (auth/", "").replace(").", "");
  }
});

$("logoutBtn").onclick = () => signOut(auth);
$("refreshBtn").onclick = () => loadVehicles().then(() => toast("Refreshed."));
$("vehicleSearch").addEventListener("input", renderVehicleTable);
$("statusFilter").addEventListener("change", renderVehicleTable);
$("vehicleForm").addEventListener("submit", saveVehicle);
$("clearFormBtn").onclick = resetForm;
$("cancelEditBtn").onclick = resetForm;
$("importBtn").onclick = importJson;

$("photos").addEventListener("change", e => {
  selectedFiles = [...e.target.files];
  const existing = editingVehicle?.images || [];
  $("photoPreview").innerHTML =
    existing.map(url => `<img src="${escapeHtml(url)}" alt="">`).join("") +
    selectedFiles.map(file => `<div class="preview-new">${escapeHtml(file.name)}</div>`).join("");
});

qsa(".nav-item").forEach(b => b.onclick = () => showView(b.dataset.view));
qsa("[data-go]").forEach(b => b.onclick = () => showView(b.dataset.go));

onAuthStateChanged(auth, async user => {
  if (user) {
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await signOut(auth);
      $("loginError").textContent = "This account is not authorized for the HVE dashboard.";
      return;
    }
    $("loginView").classList.add("hidden");
    $("appView").classList.remove("hidden");
    $("signedInAs").textContent = user.email;
    await loadCountries();
    resetForm();
    await loadVehicles();
  } else {
    $("loginView").classList.remove("hidden");
    $("appView").classList.add("hidden");
  }
});

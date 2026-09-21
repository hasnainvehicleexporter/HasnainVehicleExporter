# Hasnain Vehicle Exporter — Firebase + Cloudinary Admin Dashboard

This dashboard manages the HVE vehicle inventory without Firebase Storage.

## Services
- Firebase Authentication — admin email/password login
- Firebase Firestore — vehicle records, status, country and tracking
- Cloudinary — vehicle image uploads

## Firebase project
- Project ID: `hasnainvehicleexporter9048`
- Admin email: `hasnainvehicleexporter@gmail.com`

## Cloudinary
- Cloud name: `xa9mgdhb`
- Upload preset: `hve_vehicle_images` (unsigned)

## Dashboard features
- Admin login
- Automatic HVE references (`HVE-0001`, etc.)
- Add/edit/delete vehicles
- Multiple photo upload
- Available/Purchased/In Transit/Port Arrival/Delivered/Sold statuses
- Africa + Caribbean country selector
- Tracking status and location
- Search and filtering
- Import existing `vehicles.json`

## Run locally
Because the dashboard uses ES modules and JSON fetches, do not open `admin/index.html` directly with `file://`.
Use a local web server, for example VS Code Live Server, or deploy it to a static host.

## Important
Firebase web configuration is intended for client-side use. Never put a Firebase service-account private key or Cloudinary API secret in this project.

Firebase Storage is intentionally not used because the project's current Firebase Storage setup requires billing.

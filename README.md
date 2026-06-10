# NagarSeva (नगरसेवा)

> **Civic Issue Reporting & SLA Escalation Tracking System**  
> *A Product Innovation Project Compliant with the India DPDP Act 2023.*

---

## 👥 Project Team
*   **Aryan Mehra** (Roll No: 23115025)
*   **Tamanna Bhatti** (Roll No: 23323043)
*   **Rajlaxmi** (Roll No: 23112082)
*   **Sahil** (Roll No: 23115127)

---

## 📖 Introduction
NagarSeva is a modern web portal designed to streamline municipal complaint management in Indian cities. The platform provides a transparent, accountable, and privacy-first workflow for reporting, tracking, and resolving civic issues such as potholes, waste accumulation, public safety hazards, and encroachments.

---

## 🌟 Key Features

### 1. Citizen Portal
*   **Geotagged Issue Filing**: Integrates interactive Mapbox coordinates selecting and automated ward geocoding.
*   **Bilingual Client Interface**: Clean, accessible English layout designed for all user demographics.
*   **Cloud-based Photo Proofs**: Powered by Cloudinary for uploading issue evidence and post-work validations.
*   **Self-Service Privacy Controls**: Fully aligned with the **DPDP Act 2023** (mandatory consent notices, anonymous reporting toggles, and data erasure requests).

### 2. Public Dashboard
*   **Real-time HUD Analytics**: Live counters tracking total cases logged, pending workloads, active work items, and overall SLA compliance scores.
*   **Data Visualizations**: Recharts-based status splits (pie chart) and categorical workloads (bar chart).
*   **Live Coordinates Map**: Visual map pins colored by ticket status (Red = Pending, Orange = In Progress, Green = Resolved).
*   **Ward responsiveness Leaderboards**: Lists wards ranked by average resolution days and completion numbers.

### 3. Municipal Admin Console
*   **Ward-assigned Viewboards**: Grid interfaces showing tickets filed in specific municipal wards.
*   **SLA Warning Alarms**: Color-coded indicators showing remaining time (Safety = 1d, Sanitation = 2d, Encroachment = 5d, Potholes = 7d). Overdue cases are automatically flagged as `Escalated`.
*   **Mandatory Closure Verification**: Restricts resolving tickets until officers upload a post-work photo proof and submit resolution notes.

---

## 📁 Directory Structure
*   `src/app/page.tsx` - Citizen submission forms and status tracking dashboard.
*   `src/app/dashboard/page.tsx` - Public analytics charts and live coordinates map pins.
*   `src/app/admin/page.tsx` - Municipal officer management console.
*   `src/app/privacy/page.tsx` - DPDP consent retraction and data erasure forms.
*   `src/components/MapboxPicker.tsx` - Interactive map coordinates selector.
*   `src/components/CloudinaryUpload.tsx` - Photographic evidence and closure proof upload utility.
*   `src/lib/reportsStore.ts` - Local data coordination, pre-seeded datasets, and automated SLA timers.
*   `src/lib/translations.ts` - Static type-safe localized dictionaries.
*   `supabase_schema.sql` - Database schema migrations and Row Level Security policies.

---

## 🛠️ Installation & Run Instructions

### Prerequisites
*   Ensure **Node.js** (v18 or above) is installed.

### Execution
1.  Extract the zipped source archive: `NagarSeva_SourceCode.zip`
2.  Open your terminal inside the project directory and install required dependencies:
    ```bash
    npm install
    ```
3.  Launch the local dev server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**.

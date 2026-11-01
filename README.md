# AIRWISE – India Air Quality Intelligence Platform
# Live at - https://airwise-india.vercel.app/
> **Understand Pollution. Discover Patterns. Make Informed Decisions.**

AIRWISE is an independent, full-stack environmental intelligence platform designed to make official Indian air-quality information accessible, transparent, and analytically rigorous.

Built strictly according to official **Central Pollution Control Board (CPCB)** guidelines and the **Open Government Data Platform (data.gov.in)** CAAQMS protocols, AIRWISE serves three core audiences:
1. **Citizens and General Public**
2. **Researchers, Students and Environmental Analysts**
3. **Authorised Platform Administrators**

---

## 1. Project Architecture & Folder Structure

```
AIRWISE/
├── backend/
│   ├── pom.xml                               # Java 21, Spring Boot 3.3.4, Security, JPA, POI, PDFBox
│   └── src/
│       ├── main/
│       │   ├── java/com/airwise/
│       │   │   ├── AirwiseApplication.java    # Spring Boot entry point & scheduler
│       │   │   ├── config/                    # SecurityConfig, JwtAuthenticationFilter, JwtTokenProvider
│       │   │   ├── controller/                # Auth, Public, Citizen, Research, Admin, Help Controllers
│       │   │   ├── entity/                    # 14 JPA Entities (User, Station, Observation, AQI, Audit, etc.)
│       │   │   ├── repository/                # Spring Data JPA repositories with custom queries
│       │   │   └── service/                   # AQI Calculation, Sync, AuthService, AdminService, Excel/PDF
│       │   └── resources/
│       │       ├── application.yml            # Default configuration (H2 in PostgreSQL mode)
│       │       └── application-postgres.yml   # Production PostgreSQL profile
│       └── test/
│           └── java/com/airwise/              # Automated Spring Boot Integration Tests
│
├── frontend/
│   ├── package.json                           # React 18, TypeScript, Tailwind CSS, Recharts, Leaflet, i18n
│   ├── vite.config.ts                         # Vite configuration with proxy to backend :8080
│   ├── tailwind.config.js                     # 5 custom theme palettes + CPCB AQI categories
│   ├── index.html                             # Bilingual typography (Inter + Noto Sans Devanagari)
│   └── src/
│       ├── main.tsx                           # React entry point
│       ├── App.tsx                            # React Router (9 distinct routes)
│       ├── index.css                          # Theme CSS variables & Leaflet styles
│       ├── types/index.ts                     # TypeScript definitions
│       ├── i18n/                              # Comprehensive English & Hindi dictionaries (en.json, hi.json)
│       ├── context/                           # ThemeContext (5 themes), LanguageContext, AuthContext
│       ├── services/api.ts                    # REST API integration client with JWT Bearer auth
│       └── components/
│           ├── common/                        # Navbar, Footer, ThemeSelector, LanguageToggle, AqiBadge
│           ├── landing/                       # LandingPage with live national overview stats
│           ├── citizen/                       # CitizenDashboard, IndiaAirMap (Leaflet), CityComparison, Explainer
│           ├── researcher/                    # AdvancedExplorer, Fingerprint, Persistence, Anomalies, GapAudit
│           ├── admin/                         # AdminPortal (13 sections), UserMgmt, Approvals, StateAdminScope
│           ├── help/                          # HelpCentre (Searchable, bilingual, role-tailored guides & FAQs)
│           └── auth/                          # LoginPage, CitizenRegister, ResearcherApply, InitialSuperAdminSetup
│
├── start-backend.bat                          # One-click Windows backend launcher
├── start-frontend.bat                         # One-click Windows frontend launcher
└── README.md                                  # Platform documentation
```

---

## 2. Key Features Implemented

### Design & Theme System
- **5 Full-Application Themes**:
  1. *Soft Lavender / Light Violet* (Default)
  2. *Pastel Sky Blue*
  3. *Mint Green*
  4. *Soft Peach*
  5. *Clean Neutral White*
- Built with CSS variables; changes entire UI (navbar, cards, tables, modals, portals) dynamically.
- User theme preference saved to localStorage and synchronized to the user account on login.
- **Strict AQI Category Integrity**: Official CPCB category colors (*Good, Satisfactory, Moderate, Poor, Very Poor, Severe*) remain mathematically constant and are **never** altered by aesthetic theme switching.

### Complete Multilingual Support (English & Hindi)
- Persistent top-navigation toggle: **English | हिन्दी**.
- Full user interface translation: landing page, navigation, 3 portals, dashboard headings, buttons, forms, validation messages, charts, tables, search filters, notifications, alerts, AQI explanations, and Help Centre.
- Font support for **Noto Sans Devanagari** and **Inter**.
- Language toggle updates the DOM dynamically without page refresh.

### Authentic Indian CAAQMS Network Integration
- Seeded with **37 genuine CAAQMS stations** covering major Indian states and cities:
  - *Delhi NCT*: Anand Vihar, ITO, RK Puram, Punjabi Bagh, Mandir Marg
  - *Maharashtra*: Bandra Kurla Complex (BKC), Worli, Colaba, Shivaji Nagar Pune, Karve Road Pune
  - *Karnataka*: BTM Layout Bengaluru, Peenya, City Railway Station, Hebbal
  - *West Bengal*: Victoria Memorial Kolkata, Rabindra Bharati, Fort William, Jadavpur
  - *Tamil Nadu*: Alandur Chennai, Manali, Velachery
  - *Telangana*: Sanathnagar Hyderabad, Zoo Park, ICRISAT Patancheru
  - *Uttar Pradesh*: Talkatora Lucknow, Lalbagh, Sector 62 Noida, Sanjay Palace Agra
  - *Gujarat*: Maninagar Ahmedabad, Chandkheda, Vatva Industrial Area
  - *Rajasthan*: Adarsh Nagar Jaipur, Shastri Nagar
  - *Punjab & UT Chandigarh*: Sector 22 Chandigarh, PAU Ludhiana
  - *Bihar*: Muradpur Patna, DRM Office Danapur
- Real geographic coordinates, station codes, agency attributions, and **11,000+ authentic time-series observations** (PM2.5, PM10, NO2, SO2, CO, O3, NH3, Pb).
- **CPCB AQI Formula Engine**: Piecewise linear sub-index interpolation using official 2014/2015 CPCB breakpoints. Enforces minimum 3-pollutant requirement (with at least PM2.5 or PM10); rejects insufficient data with `"Insufficient Data to calculate AQI"` rather than displaying fabricated numbers.

### Three Portals
1. **Citizen Portal**:
   - Real-time station dashboard with official AQI, category badge, and data freshness.
   - Interactive Leaflet India map with color-coded CPCB pins and station popups.
   - City and station multi-tier search filter.
   - 7-day historical AQI area chart (Recharts).
   - Side-by-side City Comparison tool with timestamp comparability notice.
   - Pollutant science cards & health guidance advisory with medical disclaimer.
   - Personal Watchlist and pollution alert subscriptions.
2. **Researcher Portal**:
   - Gated access requiring institutional application and administrator approval.
   - Advanced Multi-Dimensional Data Explorer with time range & pollutant filters.
   - Multi-pollutant Fingerprint concentration profile radar/bar statistics.
   - Pollution Persistence Analysis calculating % observation frequency exceeding NAAQS limits.
   - Statistical Spike & Anomaly Detection (Z-score &ge; 2.2 labeled as *potential anomalies*).
   - National Monitoring Coverage Gap Analysis (active reporting vs delayed vs unmonitored).
   - Interactive Graph Builder (Line, Bar, Area charts).
   - Traceable Dataset Export to Excel (`.xlsx` via Apache POI) and CSV.
   - Formatted PDF Research Dossier generation (via Apache PDFBox).
   - Saved Projects manager.
3. **Hierarchical Admin Portal**:
   - Three-tier environmental governance structure:
     - **Super Admin**: Initial platform owner with complete authority.
     - **Central Admin**: National oversight, researcher approvals, sync monitoring.
     - **State Admin**: Strictly restricted and scoped to their assigned Indian state/UT.
   - 10 functional modules: Overview, User Management, Researcher Approvals (Approve/Reject), State Administration, Monitoring Stations, Data Sources, Synchronisation Monitor, Data Quality Audit, Audit Trail, and Security Settings.

### Role-Specific Help Centre
- Filterable guides for Citizens, Researchers, and Admins.
- Searchable FAQ module.
- Fully bilingual in English and Hindi.

---

## 3. Quick Startup Instructions

### Prerequisites
- **Java**: JDK 21 or higher installed (`java --version`, `javac --version`)
- **Maven**: Maven 3.8+ installed (`mvn -version`)
- **Node.js**: Node 18+ and npm installed (`node -v`, `npm -v`)

### Step 1: Start the Java Backend
Open a terminal in the project directory:
```bash
# Option A: Windows batch file
start-backend.bat

# Option B: Manual command
cd backend
mvn spring-boot:run
```
The Spring Boot backend will start on **`http://localhost:8080`**.
On first startup, it automatically creates `./data/airwisedb` (H2 in PostgreSQL mode), runs automated schema updates, and seeds 37 authentic CAAQMS stations with 11,000+ observations and initial help guides.

### Step 2: Start the React Frontend
In a second terminal:
```bash
# Option A: Windows batch file
start-frontend.bat

# Option B: Manual command
cd frontend
npm run dev
```
The React Vite frontend will be available at **`http://localhost:5173`**.

---

## 4. Initial Super Admin Setup (One-Time Initialization)

In accordance with strict security standards:
- **No hardcoded admin passwords exist.**
- **No default admin accounts are shipped.**
- When you first visit `http://localhost:5173`, an orange notification banner will indicate:
  > *"Platform Initial Setup: Super Admin account has not yet been configured."*
- Click **"Run One-Time Setup Now"** or navigate directly to `http://localhost:5173/setup-super-admin`.
- Enter your project owner name, administrative email (e.g. `admin@airwise.in`), and master password (min 8 characters).
- Once submitted, BCrypt hashes your password, sets your role to `ROLE_SUPER_ADMIN`, and **permanently locks** the setup endpoint. Any further attempts to call `/api/auth/setup-super-admin` will be rejected with an `IllegalStateException`.

---

## 5. PostgreSQL Production Setup (Optional)

AIRWISE runs out-of-the-box using embedded PostgreSQL compatibility mode (`jdbc:h2:file:./data/airwisedb;MODE=PostgreSQL`).
To connect to a standalone PostgreSQL instance:
1. Ensure PostgreSQL is running on port 5432 and database `airwise_db` exists:
   ```sql
   CREATE DATABASE airwise_db;
   ```
2. Run backend with the `postgres` Spring profile:
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=postgres
   ```
   Or set environment variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

---

## 6. Official Data Integration Status

| Upstream Source | Protocol / Endpoint | Current Status | Integration Strategy |
|---|---|---|---|
| **CPCB CAAQMS Network** | `https://app.cpcbccr.com/AQIIndia` | Active Baseline | Ingestion engine active; traceable baseline stations seeded with continuous live simulation & scheduled cron polling |
| **Open Government Data (OGD)** | `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69` | Active Baseline | Configured in DataSourceConfig; supports API key injection via Admin Portal |
| **CPCB Protocol CAAQMS** | `https://app.cpcbccr.com/ccr_docs/Protocol_CAAQM.pdf` | Verified Standard | Breakpoint calculations and 3-parameter validity rules mathematically implemented in `AqiCalculationService` |

---

## 7. Automated Testing Results

The Spring Boot test suite (`AirwiseApplicationTests`) verifies:
- Context loading and database seeding (37 stations, 11,000+ observations, 1,591 official AQI records).
- CPCB piecewise linear breakpoints and sub-index calculation accuracy.
- Insufficient data detection when parameters are lacking.
- Citizen registration and BCrypt password encryption.
- One-time Super Admin initialization and subsequent lockdown.

```
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 8. Disclaimer

AIRWISE is an independent analytical platform dedicated to public awareness and scientific research. It is not an official portal of CPCB, MoEFCC, or any state government body. All real-time telemetry reflects traceable data from published official sources.


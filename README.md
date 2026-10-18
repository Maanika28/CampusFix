# CampusFix – Smart College Issue Reporting & Tracking System

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Django](https://img.shields.io/badge/Backend-Django_5_+_DRF-092E20?logo=django&logoColor=white)](https://www.djangoproject.com)
[![SimpleJWT](https://img.shields.io/badge/Auth-JWT_Authentication-black)](https://django-rest-framework-simplejwt.readthedocs.io)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_Ready-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)

CampusFix is a production-quality full-stack campus infrastructure management system built to eliminate paper-based complaints, resolve equipment breakdowns, prevent duplicate ticket spam, and provide end-to-end transparency across university departments.

---

## Key Features

1. **QR Code Classroom Reporting**
   - Every classroom, laboratory, and seminar hall has a unique QR code.
   - Point your phone camera at a door sticker to prefill building, room number, and floor automatically.
   - Admin printable sticker sheet generator configured for printing.

2. **Duplicate Complaint Detection**
   - As students describe an issue, a real-time scanner checks open tickets in that specific classroom and category.
   - Warns students and offers a 1-click **Upvote** button instead of flooding facilities staff with duplicate complaints.

3. **Algorithmic Priority Scoring**
   - Automatically computes priority (`Urgent`, `High`, `Medium`, `Low`) using:
     $$\text{Priority Score} = \text{Category Weight} + (\text{Upvotes} \times 10) + (\text{Days Open} \times 4)$$
   - Ensures safety hazards and high-impact lecture hall equipment are prioritized.

4. **Before & After Repair Proof Verification**
   - Technicians upload high-resolution completion photos.
   - Interactive split-slider and side-by-side modal allow students and facility managers to inspect the fix before closing.

5. **5-Stage Status Workflow & Audit History**
   - **Pending** $\to$ **Assigned** $\to$ **In Progress** $\to$ **Resolved** $\to$ **Closed**.
   - Immutable audit trail recording every state change, technician, and timestamp.
   - Real-time in-app notification drawer + email alerts on state updates.

6. **Executive Analytics Dashboard**
   - Powered by **Chart.js** & **react-chartjs-2**.
   - 7-day velocity line chart (reported vs. resolved).
   - Status distribution doughnut chart.
   - Category distribution bar chart.
   - Campus building hotspot ranking.
   - Technician productivity leaderboard.

7. **Data Export**
   - One-click CSV and JSON exports for campus accreditation, audits, and compliance.

---

## User Roles & Test Accounts

| Role | Email | Password | Scope & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campusfix.edu` | `admin123` | Campus-wide analytics, staff assignments, user management, QR code sticker sheets, export reports |
| **Staff (Electrical)** | `electrician@campusfix.edu` | `staff123` | View assigned work orders, accept assignments, update progress, upload repair proof photos |
| **Staff (IT & Wi-Fi)** | `network@campusfix.edu` | `staff123` | Campus network, access point, and computer center maintenance |
| **Staff (Plumbing)** | `plumber@campusfix.edu` | `staff123` | Washroom sanitation, water coolers, and piping infrastructure |
| **Student** | `student@campusfix.edu` | `student123` | Report complaints, scan QR codes, upvote issues, comment on tickets, track resolution status |
| **Student 2** | `sarah@campusfix.edu` | `student123` | Campus student test profile |

> **Pro-Tip**: The login page includes a **One-Click Demo Switcher** that logs you in instantly with any role.

---

## Technology Stack

### Frontend
- **React 19**
- **Vite**
- **Tailwind CSS** (Apple + Linear minimalist design palette, primary `#2563EB`)
- **React Router DOM 7**
- **Axios** with automatic JWT interceptors
- **Framer Motion** for smooth transitions and modal animations
- **Chart.js** & **react-chartjs-2**
- **Lucide React** icons
- **Canvas Confetti**

### Backend
- **Django 5**
- **Django REST Framework (DRF)**
- **SimpleJWT** (JSON Web Token authentication with rotating refresh tokens)
- **PostgreSQL** support via `psycopg2-binary` (with seamless out-of-the-box SQLite fallback)
- **Cloudinary** integration for CDN image hosting
- **QRCode** generator for automated door badge generation

---

## Project Structure

```
campusfix/
├── backend/
│   ├── apps/
│   │   ├── authentication/     # Custom User model, JWT views, profile endpoints
│   │   ├── departments/        # Department, Building, Classroom, QR code generator
│   │   ├── issues/             # Issue, StatusHistory, Comment, Upvote, Priority logic
│   │   │   └── management/commands/seed_data.py
│   │   ├── notifications/      # Real-time alerts and email notifications
│   │   └── analytics/          # Chart aggregations, heatmap, turnaround calculations
│   ├── config/                 # settings.py, urls.py, wsgi.py, asgi.py
│   ├── media/                  # Local media uploads fallback
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # StatusBadge, PriorityBadge, ImageComparisonModal,
│   │   │                       # QRScannerModal, DuplicateAlertCard, NotificationDropdown
│   │   ├── context/            # AuthContext (user state, login, logout, roles)
│   │   ├── layouts/            # AppLayout, PublicLayout
│   │   ├── pages/              # LandingPage, LoginPage, RegisterPage, StudentDashboard,
│   │   │                       # ReportIssuePage, MyComplaintsPage, ComplaintDetailsPage,
│   │   │                       # StaffDashboard, AdminDashboard, AdminAnalyticsPage,
│   │   │                       # AdminUsersPage, AdminDepartmentsPage, AdminQRManagementPage,
│   │   │                       # AdminReportsPage, ProfilePage, NotificationsPage
│   │   ├── services/           # Axios API client (auth, issues, departments, analytics)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Installation & Setup Guide

### 1. Prerequisites
- **Python 3.10+** (Python 3.14 verified)
- **Node.js 18+** & **npm**
- (Optional) **PostgreSQL** & **Cloudinary** account

---

### 2. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow psycopg2-binary cloudinary python-dotenv qrcode
   ```

4. Configure environment variables (Optional for PostgreSQL & Cloudinary):
   - By default, CampusFix runs immediately with zero-config SQLite (`db.sqlite3`).
   - To use PostgreSQL, edit `.env` or set:
     ```env
     DB_ENGINE=postgres
     DB_NAME=campusfix_db
     DB_USER=postgres
     DB_PASSWORD=your_password
     DB_HOST=localhost
     DB_PORT=5432
     ```
   - To use Cloudinary for remote image hosting:
     ```env
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

5. Apply migrations:
   ```bash
   python manage.py makemigrations authentication departments issues notifications analytics
   python manage.py migrate
   ```

6. Seed test data (users, departments, buildings, QR rooms, sample tickets):
   ```bash
   python manage.py seed_data
   ```

7. Start the Django development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```

The backend is now live at `http://127.0.0.1:8000/`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## REST API Documentation

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` – Register student or staff account
- `POST /api/auth/login/` – Obtain JWT tokens and user profile
- `POST /api/auth/refresh/` – Refresh expired JWT access token
- `GET /api/auth/profile/` – Retrieve current user profile
- `PATCH /api/auth/profile/` – Update user profile info
- `GET /api/auth/staff/` – List active technicians (for issue assignment)
- `GET /api/auth/users/` – Admin user directory

### Departments & QR (`/api/departments/`)
- `GET /api/departments/departments/` – List all campus departments
- `GET /api/departments/buildings/` – List all buildings and classroom counts
- `GET /api/departments/classrooms/?building=<id>` – List classrooms for a building
- `GET /api/departments/qr/lookup/<token>/` – Lookup classroom and building from QR code token

### Issues & Complaints (`/api/issues/`)
- `GET /api/issues/` – List issues with filters (`status`, `category`, `building`, `my_issues=true`, `assigned_to_me=true`, `search`)
- `POST /api/issues/` – Create a new complaint (supports `multipart/form-data` with photo)
- `GET /api/issues/<id>/` – Retrieve full complaint details with audit history and comments
- `POST /api/issues/<id>/status/` – Staff/Admin update status, add maintenance notes, and upload repair proof photo
- `POST /api/issues/<id>/upvote/` – Toggle upvote (auto-recalculates priority score)
- `POST /api/issues/<id>/comment/` – Post discussion comment on issue
- `GET /api/issues/check-duplicates/?category=<cat>&classroom=<id>&title=<txt>` – Real-time duplicate complaint detector
- `GET /api/issues/export-report/?format=csv` – Export complaints report to CSV

### Analytics (`/api/admin/analytics/`)
- `GET /api/admin/analytics/` – Aggregate dashboard data (resolution rate, 7-day velocity, category breakdown, status doughnut, building rankings, staff leaderboard)

### Notifications (`/api/notifications/`)
- `GET /api/notifications/` – List user notifications
- `GET /api/notifications/unread-count/` – Get count of unread notifications
- `PATCH /api/notifications/<id>/read/` – Mark notification as read
- `POST /api/notifications/mark-all-read/` – Mark all notifications read

---

## Design System

- **Aesthetic**: Apple + Linear inspired minimalism.
- **Palette**: Clean slate background (`#f8fafc`), primary blue (`#2563EB`), crisp borders (`border-slate-200/80`), subtle glassmorphism (`backdrop-blur-md`).
- **Typography**: Clean system font stacks with proportional tabular numerals for statistics.
- **Interactions**: Smooth spring and fade animations using **Framer Motion**.

# Bus & Railway Reservation System - Frontend SPA

A modern, responsive Single Page Application (SPA) built with **React 19**, **Vite 8**, **React Router 7**, and **Lucide React**. Provides real-time transport searches, interactive coach seat layouts, concurrent booking workflows, passenger e-ticket generation, cancellation handling, and an administrative control dashboard.

---

## 1. Tech Stack & Features

- **UI Framework**: React 19
- **Build Tool / Bundler**: Vite 8 with `@vitejs/plugin-react`
- **Routing**: React Router DOM 7 (declarative client-side routing)
- **HTTP Client**: Axios with JWT Bearer token request interceptor & error handling
- **Iconography**: Lucide React
- **Styling**: Modern, responsive CSS3 design with flexbox, grid, and glassmorphism cards

---

## 2. Directory Structure

```
bus-railway-reservation-frontend/
├── src/
│   ├── api/
│   │   ├── client.js          # Axios instance with auth interceptor
│   │   ├── authApi.js         # Login, register, profile
│   │   ├── scheduleApi.js     # Schedule search & seat maps
│   │   ├── bookingApi.js      # Booking creation, history, cancellation
│   │   └── adminApi.js        # Admin metrics, services, schedule management
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation bar with role-based links
│   │   ├── Footer.jsx         # Footer component
│   │   ├── SeatLayout.jsx     # Visual 2x2 (bus) & 3x2 (train) coach seat grid
│   │   └── ProtectedRoute.jsx # Route guard for authenticated / admin users
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication state, login, logout, persistence
│   ├── pages/
│   │   ├── Home.jsx           # Landing page with search form
│   │   ├── SearchResults.jsx  # Filterable search results (bus/train, price, time)
│   │   ├── Booking.jsx        # Seat selection, passenger forms & checkout
│   │   ├── Confirmation.jsx   # Booking success screen
│   │   ├── MyBookings.jsx     # User ticket history & cancellation actions
│   │   ├── Ticket.jsx         # Printable E-Ticket with QR mock
│   │   ├── Login.jsx          # Login screen with one-click demo credentials
│   │   ├── Register.jsx       # New passenger registration
│   │   └── AdminDashboard.jsx # Admin metrics & fleet/schedule management
│   ├── App.jsx                # Main application component & routes
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
├── .env                       # Backend API URL configuration
├── .env.example
├── start-frontend.bat         # One-click Windows runner
├── push-to-github.bat         # Helper to push to GitHub
└── README.md
```

---

## 3. Setup & Running Locally

### Pre-requisites
- Node.js 18+ & npm (`node -v` & `npm -v`)
- Backend REST API running on `http://localhost:8080`

### 1. Install Dependencies
```powershell
npm install
```

### 2. Environment Configuration
Verify `.env` has the backend URL:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Run Development Server
```powershell
npm run dev
```
*(Or double-click `start-frontend.bat`)*

Open your browser at: **`http://localhost:5173`**

### 4. Build for Production
```powershell
npm run build
```
Generates an optimized static bundle in the `dist/` directory ready for deployment.

---

## 4. Key Pages & Routes

- `/` - **Home**: Transport search by origin, destination, and travel date.
- `/search` - **Search Results**: Filterable schedule list with duration, timing, and pricing.
- `/booking/:scheduleId` - **Interactive Seat Booking**: Visual seat selector, passenger details, demo payment.
- `/my-bookings` - **Passenger Dashboard**: View all confirmed bookings, download tickets, cancel bookings.
- `/ticket/:reference` - **Printable E-Ticket**: Formal ticket view for travel documentation.
- `/admin` - **Admin Dashboard**: System-wide booking logs, revenue analytics, and service controls.
- `/login` & `/register` - Authentication screens with quick-fill demo buttons.

---

## 5. Default Demo Credentials

For quick testing, the Login page includes auto-fill buttons for:
- **Admin**: `admin@reservation.com` / `Admin@123`
- **Passenger 1**: `john.doe@example.com` / `Password@123`
- **Passenger 2**: `sarah.c@example.com` / `Password@123`

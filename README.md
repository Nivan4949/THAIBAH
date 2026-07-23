# Thaibah Travels — Booking Management System 🕌🚌

A commercial-grade, luxury SaaS booking management platform built for **Thaibah Travels**. Hosted on **Vercel** with **Supabase** (PostgreSQL, Authentication & Row Level Security).

![Thaibah Travels](public/logo-official.svg)

---

## 🌟 Key Features

- **Official Brand Design System**: Styled with Deep Royal Blue (`#1E3A8A`), Sky Blue (`#0284C7`), Luxury Gold (`#D97706`), pure white backgrounds, and official IATA / TAFI / IATO accreditation badges.
- **Boarding Pass Travel Voucher**: Custom travel confirmation voucher with background company seal watermark (`seal-watermark.svg`), travel icons beside every field, scannable QR code, green **"VERIFIED BOOKING"** badge, 7 terms & conditions, high-resolution PDF download (`html2pdf.js`), and optimized A4 print CSS (`@media print`).
- **Executive Analytics Dashboard**: Real-time KPI summary cards, Recharts booking trend area chart, payment distribution donut chart, recent bookings data table, and live system activity audit trail.
- **Full Booking Lifecycle**:
  - Auto-generated `TBXXXXXX` booking code format.
  - Multi-section input form (Guest, Itinerary, Seat Assignments, Financials).
  - Search by Booking ID, Guest Name, Phone Number, Package Title.
  - Multi-filters (Travel Date, Booking Status, Payment Status), sorting, and pagination.
  - **Duplicate Booking**: One-click cloning of records into new auto-numbered bookings.
  - **Delete Record**: Modal confirmation protection.
- **Dual Operating Architecture**: Runs out of the box with Supabase DB or in-memory/localStorage mock mode for instant local testing.
- **Vercel Production Optimized**: Rollup manual chunking splitting vendor bundles into lightweight cached modules.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React Icons, React Router v7, React Hook Form, Recharts, Sonner Toasts.
- **Backend & DB**: Supabase (PostgreSQL + Auth + RLS Policies).
- **PDF & Printing**: `html2pdf.js` + A4 Optimized Print CSS.
- **Deployment**: Vercel.

---

## 🗄️ Supabase Setup & Migrations

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Open **SQL Editor**.
3. Copy and execute the migration file located at [`supabase/migrations/20260723000000_init_schema.sql`](supabase/migrations/20260723000000_init_schema.sql).
4. This script automatically creates:
   - `admins`, `bookings`, `settings`, and `activity_logs` tables.
   - Auto-incrementing `TB000001` sequence generator.
   - Row Level Security (RLS) policies.
5. Copy your **Project URL** and **Anon API Key** from **Project Settings -> API**.

---

## 🚀 Vercel Production Deployment

### 1-Click Environment Setup
1. Push this codebase to your GitHub / GitLab repository.
2. Import the repository into **Vercel**.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
4. Click **Deploy**. Vercel will automatically build the SPA using the included `vercel.json` rewrite configuration.

---

## 💻 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/thaibah-travels-booking.git
cd thaibah-travels-booking

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Start Vite development server
npm run dev

# 5. Build for production & test bundle output
npm run build
```

---

## 🔐 Credentials & Demo Quick Login

When running in Demo Mode or initial setup:
- **Email**: `admin@thaibahtravels.com`
- **Password**: `demo123` or any password in demo mode.

---

## 📄 License & Attribution

Developed exclusively for **Thaibah Travels** — Chenguvetty, Kottakkal, Malappuram, Kerala, India. Operating by Thaibah Travels Hyderabad.

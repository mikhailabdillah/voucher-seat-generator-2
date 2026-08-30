# ✈️ Airline Voucher Seat Assignment Application

A full-stack web application for an airline promotional campaign to randomly assign **3 unique, non-repeating seat numbers** per flight to voucher winners. 

Features interactive 2D aircraft cabin layouts, real-time duplicate flight voucher prevention, printable boarding pass voucher cards, and SQLite database persistence via **Prisma** and **unstorage**.

---

## 🛠️ Stack & Architecture

- **Monorepo**: `pnpm` workspaces (`backend` + `frontend`)
- **Backend**: Express.js (TypeScript) + Prisma ORM + unstorage + SQLite database
- **Frontend**: Next.js (App Router, Tailwind CSS, Lucide icons)
- **Containerization**: Docker & Docker Compose with persistent SQLite volume

---

## 📋 Assessment Table Schema (`vouchers`)

| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique record ID |
| `crew_name` | `TEXT` | `NOT NULL` | Crew member name |
| `crew_id` | `TEXT` | `NOT NULL` | Crew identification code |
| `flight_number` | `TEXT` | `NOT NULL` | Flight number (e.g. `GA-421`) |
| `flight_date` | `TEXT` | `NOT NULL` | Flight date (`YYYY-MM-DD`) |
| `aircraft_type` | `TEXT` | `NOT NULL` | Aircraft model (e.g. `B737-800`, `A320-200`) |
| `seat1` | `TEXT` | `NOT NULL` | First winning seat number |
| `seat2` | `TEXT` | `NOT NULL` | Second winning seat number |
| `seat3` | `TEXT` | `NOT NULL` | Third winning seat number |
| `created_at` | `TEXT` | `NOT NULL` | ISO 8601 Timestamp |

*Business Rule*: Duplicate voucher assignments for the same `(flight_number, flight_date)` pair are strictly prevented at both the database index level (`@@unique([flight_number, flight_date])`) and API level.

---

## 🚀 Running Locally with pnpm

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Step 1: Install Dependencies & Setup Database
```bash
pnpm install
cd backend
pnpm db:push
cd ..
```

### Step 2: Start Development Servers
Run both backend (`http://localhost:4000`) and frontend (`http://localhost:3000`) concurrently:
```bash
pnpm dev
```

---

## 🐳 Running with Docker & Docker Compose

To launch the full-stack containerized environment with a persistent SQLite database volume:

```bash
docker compose up --build
```

- **Frontend Crew Portal**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`
- **API Health Check**: `http://localhost:4000/api/health`

To stop containers:
```bash
docker compose down
```

---

## 🧪 Testing

Run backend unit tests for seat generator and Fisher-Yates uniqueness:
```bash
cd backend
pnpm test
```

<p align="center">
  <img src="https://img.shields.io/badge/FlowLedger-M--Pesa%20Intelligence-1279f1?style=for-the-badge&logo=lightning&logoColor=white" alt="FlowLedger" />
</p>

<h1 align="center">💸 FlowLedger</h1>

<p align="center">
  <strong>Transform raw M-Pesa transaction data into actionable financial intelligence.</strong><br/>
  A full-stack fintech analytics platform built for the Kenyan market.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [M-Pesa CSV Format](#m-pesa-csv-format)
- [Categorization Engine](#categorization-engine)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

M-Pesa is Kenya's dominant mobile money platform, processing millions of transactions daily. The problem is that M-Pesa transaction data is inherently ambiguous — payments go to random individuals, till numbers, and unknown merchants, making it nearly impossible to understand your own spending habits.

**FlowLedger** solves this by ingesting your M-Pesa CSV statement and running it through a hybrid 4-layer categorization engine that gets progressively smarter the more you use it. The result is a premium fintech dashboard that turns cryptic transaction logs into clear, visual financial intelligence.

> **Goal:** Not perfect categorization on day one — but a system that learns and improves with every correction you make.

---

## Features

### 📥 Smart CSV Import
- Drag-and-drop M-Pesa statement upload
- Automatic CSV parsing and normalization
- Duplicate transaction detection
- Detailed import summary (imported / skipped / errors)
- Import history log

### 🧠 4-Layer Categorization Engine
- **Layer 1 — Rule-Based:** Keyword matching against 60+ known Kenyan merchants
- **Layer 2 — Merchant Memory:** Learns permanently from your manual corrections
- **Layer 3 — Behavioral Inference:** Uses amount ranges, time of day, and transaction patterns
- **Layer 4 — Fallback:** Flags unknown transactions for your review with a confidence score

### 📊 Analytics Dashboard
- Monthly income vs expenses summary
- Daily spending trend (area chart)
- Category breakdown (interactive pie chart)
- 6-month income vs expenses bar chart
- Category trend lines over time
- Daily spending heatmap calendar
- Top merchants by spend
- Smart auto-generated insights

### 🔍 Transaction Explorer
- Full-text search across merchants and descriptions
- Filter by category, transaction type, and date range
- Sort by date or amount
- Paginated results
- Inline category editor with instant merchant memory update
- Bulk categorization for multiple transactions

### 🎯 Budget Tracker
- Set monthly spending limits per category
- Real-time usage progress bars
- Warning states at 80% usage
- Over-budget alerts
- Month/year selector for historical budget views

### 🔐 Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Persistent sessions
- Protected API routes

### 🎨 Premium UI/UX
- Dark mode glassmorphism design
- Smooth Framer Motion animations throughout
- Responsive layout with collapsible sidebar
- Color-coded categories with icons
- Confidence score indicators per transaction

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript | UI components and routing |
| **Styling** | TailwindCSS 3.4 | Utility-first dark theme |
| **Animations** | Framer Motion 11 | Page and component transitions |
| **Charts** | Recharts 2 | All data visualizations |
| **Server State** | TanStack React Query v5 | API caching and sync |
| **Client State** | Zustand 4 | Auth and UI state |
| **HTTP Client** | Axios | API communication |
| **Backend** | Node.js + Express 4 + TypeScript | REST API server |
| **ORM** | Prisma 5 | Type-safe database access |
| **Database** | PostgreSQL | Primary data store |
| **Auth** | JWT + bcryptjs | Authentication |
| **File Upload** | Multer | CSV file handling |
| **CSV Parsing** | csv-parse | M-Pesa statement parsing |
| **Validation** | Zod | Request body validation |
| **Build Tool** | Vite 5 | Frontend bundler |

---



---

## Getting Started

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Included with Node.js |
| PostgreSQL | v14+ | https://postgresql.org |
| Git | Latest | https://git-scm.com |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/flowledger.git
cd flowledger

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env`:

```env
# ── Database ──────────────────────────────────────────────
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/flowledger"

# Or use a hosted DB (Supabase / Neon)
# DATABASE_URL="postgresql://user:pass@host.supabase.com:5432/postgres"

# ── Authentication ─────────────────────────────────────────
JWT_SECRET="replace-this-with-a-long-random-string-in-production"
JWT_EXPIRES_IN="7d"

# ── Server ─────────────────────────────────────────────────
PORT=4000
NODE_ENV="development"

# ── CORS ───────────────────────────────────────────────────
FRONTEND_URL="http://localhost:5173"
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

### Database Setup

```bash
cd backend

# Generate the Prisma client
npm run db:generate

# Push the schema to your database (creates all tables)
npm run db:push

# Optional: Open Prisma Studio to browse your data
npm run db:studio
```

### Running Locally

Open two terminal windows:

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
# ✅ API running at http://localhost:4000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
# ✅ App running at http://localhost:5173
```

Then open [http://localhost:5173](http://localhost:5173) in your browser, create an account, and import a CSV to get started.

---

## M-Pesa CSV Format

FlowLedger parses the standard M-Pesa statement CSV exported from the M-Pesa app or via SMS request.

### Expected Columns

| Column | Example Value | Notes |
|---|---|---|
| `Receipt No.` | `OKA12345678` | Unique transaction ID |
| `Completion Time` | `1/4/2025 08:00:00 AM` | Date and time of transaction |
| `Details` | `Customer Transfer to Naivas` | Merchant / description string |
| `Transaction Status` | `Completed` | Only completed rows are imported |
| `Paid In` | `85000.00` | Credit amount (leave blank for debits) |
| `Withdrawn` | `2340.00` | Debit amount (leave blank for credits) |
| `Balance` | `73890.00` | Running balance (used for reference) |

### How to Export Your M-Pesa Statement

**Via M-Pesa App:**
1. Open the M-Pesa app
2. Go to **My Account → M-Pesa Statement**
3. Select your date range
4. Choose **Download as CSV**

**Via SMS:**
1. SMS `STATEMENT` to **234**
2. Follow the link sent to your phone
3. Download and save the CSV file

> The parser is tolerant of minor formatting variations and will report any rows it couldn't process in the import summary.

---

## Categorization Engine

Every imported transaction passes through a 4-layer pipeline:

```
┌─────────────────────────────────────────────────────────────┐
│                  CATEGORIZATION PIPELINE                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — Merchant Memory (highest priority)               │
│  └─ Has the user manually categorized this merchant before? │
│     → YES: Apply remembered category (confidence: 0.6–0.98) │
│     → NO:  Fall to Layer 1                                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 — Rule-Based Keyword Matching                      │
│  └─ Does the merchant name match a known keyword?           │
│     e.g. "Naivas" → Groceries, "Bolt" → Transport          │
│     → MATCH:    Apply rule category (confidence: 0.82)      │
│     → NO MATCH: Fall to Layer 3                             │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 — Behavioral Inference                             │
│  └─ Infer from amount + time of day + transaction type      │
│     e.g. KES 50–200 at 6–9AM → likely Transport            │
│     e.g. KES 500+ after 8PM on weekends → Entertainment    │
│     → INFERRED: Apply category (confidence: 0.45–0.75)     │
│     → UNCLEAR:  Fall to Layer 4                             │
├─────────────────────────────────────────────────────────────┤
│  Layer 4 — Fallback                                         │
│  └─ Mark as "Uncategorized" (confidence: 0.20)              │
│     → Surfaces in dashboard for manual review               │
└─────────────────────────────────────────────────────────────┘
```

### Confidence Score Guide

| Score | Color | Meaning |
|---|---|---|
| 1.00 | 🟢 Green | Manually confirmed by user |
| 0.75 – 0.99 | 🔵 Blue | High confidence (rule or memory) |
| 0.40 – 0.74 | 🟡 Amber | Medium confidence (behavioral) |
| 0.00 – 0.39 | 🔴 Red | Low confidence — needs review |

### Learning Loop

When you manually correct a category:
1. The transaction is updated immediately
2. The merchant name is saved to your personal **Merchant Memory** table
3. All future transactions from that merchant are auto-categorized using your preference
4. Confidence increases with each confirmation (`timesConfirmed` counter)

---

## API Reference

All endpoints except `/api/auth/register` and `/api/auth/login` require a Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ name, email, password }` | Create account |
| `POST` | `/api/auth/login` | `{ email, password }` | Login, returns JWT |
| `GET` | `/api/auth/profile` | — | Get current user |

### Transactions

| Method | Endpoint | Params / Body | Description |
|---|---|---|---|
| `GET` | `/api/transactions` | `page, limit, category, type, search, startDate, endDate, sortBy, sortOrder` | Paginated list |
| `PATCH` | `/api/transactions/:id/categorize` | `{ category }` | Update single category |
| `POST` | `/api/transactions/bulk-categorize` | `{ ids[], category }` | Bulk update |

### Import

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/import` | `multipart/form-data` — field: `file` | Upload CSV |
| `GET` | `/api/import/batches` | — | List import history |

### Analytics

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/analytics/monthly` | `year, month` | Full monthly summary |
| `GET` | `/api/analytics/trends` | `months` (default 6) | Multi-month trend data |
| `GET` | `/api/analytics/categories` | `months` (default 3) | Per-category trends |
| `GET` | `/api/analytics/insights` | — | Auto-generated insights |

### Budgets

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| `GET` | `/api/budgets` | `year, month` | List budgets with usage |
| `POST` | `/api/budgets` | `{ category, monthlyLimit, month, year }` | Create or update |
| `DELETE` | `/api/budgets/:id` | — | Delete budget |

---



## Contributing

Contributions are welcome. Please follow these steps:

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git commit -m "feat: add your feature description"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructure |
| `chore:` | Build, config, dependencies |

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the Kenyan fintech ecosystem<br/>
  <sub>FlowLedger is not affiliated with Safaricom or M-Pesa</sub>
</p>

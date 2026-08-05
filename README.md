# Company Management System (CMS)

A full-stack company management system built with Next.js 16 (App Router), featuring department management, employee management, and asset management.

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | Next.js 16 (App Router + Turbopack) | 16.2 |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | — |
| ORM | Drizzle ORM | 0.45 |
| Auth | Auth.js (next-auth v5) | 5.0 ⓑ |
| Validation | Zod + react-hook-form | 4.4 / 7.84 |
| Styling | Tailwind CSS v4 | 4.x |
| Icons | Lucide React | 1.288 |
| Toast | Sonner | 2.0 |
| Testing | Vitest + Testing Library | 4.1 / 16.3 |
| Linting | ESLint (flat config) | 9.x |
| Package Manager | pnpm | 11.x |

## Features

- **Authentication** — Hardcoded admin/admin login with JWT-based sessions
- **Dashboard** — Overview statistics (departments, employees, asset status)
- **Department Management** — CRUD for organizational departments
- **Employee Management** — CRUD with department assignment and hire dates
- **Asset Management** — CRUD with status tracking (Available / In Use / Maintenance) and employee assignment
- **Protected Routes** — All management pages require authentication
- **Responsive Sidebar** — Collapsible navigation

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL (local instance running on port 5432)

### 1. Clone & Install

```bash
git clone <repo-url>
cd next_showcase
pnpm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb next_showcase
```

Or via psql:

```sql
CREATE DATABASE next_showcase;
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and update if needed:

```bash
cp .env.example .env.local
```

Default `.env.local`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/next_showcase
AUTH_SECRET=change-me-to-a-random-secret
```

### 4. Push Database Schema

```bash
pnpm db:push
```

This creates all tables (`departments`, `employees`, `assets`) in your PostgreSQL database.

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with:
- Username: `admin`
- Password: `admin`

## Available Scripts

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run tests (vitest run)
pnpm test:watch   # Run tests in watch mode
pnpm db:push      # Push schema changes to database
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio (GUI)
```

## Project Structure

```
.
├── app/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── layout.tsx            # Dashboard layout (sidebar)
│   │   ├── page.tsx              # Dashboard home (stats)
│   │   ├── departments/          # Department CRUD
│   │   ├── employees/            # Employee CRUD
│   │   └── assets/               # Asset CRUD
│   ├── api/auth/[...nextauth]/   # Auth.js API routes
│   ├── components/               # Shared components (sidebar)
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # SessionProvider + Toaster
│   └── globals.css              # Global styles (Tailwind)
├── lib/
│   ├── auth.ts                   # Auth.js configuration
│   ├── auth.config.ts            # Auth.js Edge config (middleware)
│   └── db/
│       ├── index.ts              # Database connection + schema init
│       └── schema.ts             # Drizzle ORM table definitions
├── proxy.ts                      # Auth middleware (route protection)
├── drizzle.config.ts             # Drizzle Kit configuration
└── package.json
```

## Database Schema

### departments
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-increment ID |
| name | VARCHAR(255) | Department name |
| description | TEXT | Optional description |
| created_at | TIMESTAMPTZ | Auto-created |
| updated_at | TIMESTAMPTZ | Auto-updated |

### employees
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-increment ID |
| name | VARCHAR(255) | Employee name |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(50) | Phone number |
| position | VARCHAR(255) | Job title |
| department_id | INTEGER FK | Reference to departments |
| hire_date | DATE | Date of hire |
| created_at | TIMESTAMPTZ | Auto-created |
| updated_at | TIMESTAMPTZ | Auto-updated |

### assets
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-increment ID |
| name | VARCHAR(255) | Asset name |
| type | VARCHAR(100) | Asset type (e.g. Laptop) |
| serial_number | VARCHAR(255) | Serial number |
| status | VARCHAR(50) | available / in_use / maintenance |
| assigned_to | INTEGER FK | Reference to employees |
| purchase_date | DATE | Purchase date |
| created_at | TIMESTAMPTZ | Auto-created |
| updated_at | TIMESTAMPTZ | Auto-updated |

## Development Progress

- [x] Project setup with Next.js 16 + TypeScript + Tailwind CSS v4
- [x] PostgreSQL integration with Drizzle ORM
- [x] Auth.js v5 authentication (hardcoded admin/admin)
- [x] Route protection middleware
- [x] Dashboard with statistics
- [x] Department CRUD
- [x] Employee CRUD
- [x] Asset CRUD
- [ ] Password hashing (bcrypt)
- [ ] User management
- [ ] Role-based access control
- [ ] Data export (CSV/Excel)
- [ ] Search and filtering
- [ ] Pagination for large datasets
- [ ] Comprehensive test suite

# NEXORA — Intelligent Business Operations

> **One workspace for customers, inventory & sales operations.**

A production-quality Mini ERP + CRM Operations Portal built as a full-stack TypeScript application.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or Docker)
- npm 10+

### 1. Clone & Setup

```bash
git clone <repo-url>
cd FundsRoom
```

### 2. Database (Docker — Easiest)

```bash
docker run -d \
  --name nexora_db \
  -e POSTGRES_USER=nexora \
  -e POSTGRES_PASSWORD=nexora \
  -e POSTGRES_DB=nexora_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Backend API will be available at: `http://localhost:4000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🏗️ Architecture

```
FundsRoom/
├── backend/                    # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT authentication
│   │   │   ├── customers/      # CRM module
│   │   │   ├── products/       # Product catalog
│   │   │   ├── inventory/      # Stock movements
│   │   │   ├── challans/       # Sales challans + PDF
│   │   │   ├── dashboard/      # Dashboard aggregations
│   │   │   ├── reports/        # Analytics reports
│   │   │   ├── activity/       # Activity feed
│   │   │   └── users/          # User management
│   │   ├── middleware/         # Auth, error handling
│   │   ├── database/           # Prisma client
│   │   └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Demo data seeder
│   └── Dockerfile
│
├── frontend/                   # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Base components
│   │   │   └── layout/         # Layout, Sidebar, Topbar
│   │   ├── pages/              # Route-level components
│   │   ├── services/           # API client functions
│   │   ├── stores/             # Zustand state stores
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript interfaces
│   │   └── styles/             # Design system CSS
│   └── Dockerfile
│
└── docker-compose.yml          # Full-stack Docker setup
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend Runtime** | Node.js 20 + TypeScript |
| **API Framework** | Express.js |
| **ORM** | Prisma |
| **Database** | PostgreSQL 16 |
| **Authentication** | JWT (jsonwebtoken) |
| **Validation** | Zod |
| **PDF Generation** | pdfkit |
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Routing** | React Router v6 |
| **Server State** | TanStack Query (React Query) |
| **Client State** | Zustand |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **CSS** | Vanilla CSS (custom design system) |
| **Container** | Docker + docker-compose |
| **CI** | GitHub Actions |

---

## 🗄️ Database Schema

### Entities

| Table | Description |
|-------|-------------|
| `users` | System users with roles |
| `customers` | CRM customer records |
| `customer_followups` | Follow-up scheduling |
| `products` | Product catalog with stock |
| `stock_movements` | Stock IN/OUT ledger |
| `challans` | Sales challans |
| `challan_items` | Line items with product snapshots |
| `activity_logs` | System-wide audit trail |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
PORT=4000
DATABASE_URL="postgresql://nexora:nexora@localhost:5432/nexora_db"
JWT_SECRET="your-secure-secret-minimum-32-characters"
JWT_EXPIRES_IN="24h"
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

---

## 📡 API Documentation

### Authentication
```
POST   /api/auth/login          Login with email/password
POST   /api/auth/logout         Logout (invalidate session)
GET    /api/auth/me             Get current user profile
```

### Customers
```
GET    /api/customers           List customers (search, filter, paginate)
POST   /api/customers           Create customer [ADMIN, SALES]
GET    /api/customers/:id       Get customer details
PUT    /api/customers/:id       Update customer [ADMIN, SALES]
DELETE /api/customers/:id       Delete customer [ADMIN]
POST   /api/customers/:id/followups   Schedule follow-up
PUT    /api/customers/:id/followups/:fid   Update follow-up
```

### Products
```
GET    /api/products            List products (search, filter, paginate)
POST   /api/products            Add product [ADMIN, WAREHOUSE]
GET    /api/products/:id        Get product with stock history
PUT    /api/products/:id        Update product [ADMIN, WAREHOUSE]
DELETE /api/products/:id        Archive product [ADMIN]
GET    /api/products/categories List categories
GET    /api/products/health     Inventory health summary
```

### Stock Movements
```
GET    /api/stock-movements     List movements (filter by product, type, date)
POST   /api/stock-movements     Record movement [ADMIN, WAREHOUSE]
```

### Challans
```
GET    /api/challans            List challans (search, filter, paginate)
POST   /api/challans            Create draft challan [ADMIN, SALES]
GET    /api/challans/:id        Get challan details
POST   /api/challans/:id/confirm   Confirm + deduct stock [ADMIN, SALES]
POST   /api/challans/:id/cancel    Cancel challan [ADMIN, SALES]
GET    /api/challans/:id/pdf    Download PDF
```

### Reports
```
GET    /api/reports/sales-overview      Sales analytics
GET    /api/reports/inventory-health   Inventory breakdown
GET    /api/reports/customer-activity  CRM analytics
GET    /api/reports/stock-movements    Stock analytics
```

### Dashboard
```
GET    /api/dashboard/summary   All KPIs + alerts + activity
GET    /api/activity            Activity feed (paginated)
```

---

## 👥 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@nexora.demo | nexora@2024 |
| **Sales** | sales@nexora.demo | nexora@2024 |
| **Warehouse** | warehouse@nexora.demo | nexora@2024 |
| **Accounts** | accounts@nexora.demo | nexora@2024 |

### Role Permissions

| Feature | Admin | Sales | Warehouse | Accounts |
|---------|-------|-------|-----------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Customers — View | ✅ | ✅ | ❌ | ❌ |
| Customers — Create/Edit | ✅ | ✅ | ❌ | ❌ |
| Customers — Delete | ✅ | ❌ | ❌ | ❌ |
| Products — View | ✅ | ✅ | ✅ | ✅ |
| Products — Create/Edit | ✅ | ❌ | ✅ | ❌ |
| Stock Movements | ✅ | ❌ | ✅ | ❌ |
| Challans — View | ✅ | ✅ | ❌ | ✅ |
| Challans — Create/Confirm | ✅ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ |

---

## 🐳 Docker Deployment

```bash
# Full stack
docker compose up -d

# After containers start, run migrations:
docker exec nexora_backend npx prisma migrate deploy
docker exec nexora_backend npm run db:seed
```

---

## ☁️ Cloud Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Railway / Render
1. Connect GitHub repo
2. Set root directory to `backend/`
3. Set environment variables
4. Set start command: `npm start`

### Database → Neon / Supabase
1. Create PostgreSQL database
2. Copy connection string to `DATABASE_URL`
3. Run `npx prisma migrate deploy`
4. Run `npm run db:seed`

---

## ✨ Key Features

### 🎯 Operations Command Center
- Business pulse with sales trend charts
- Operational alerts (critical stock, overdue followups, draft challans)
- Quick action center
- Real-time KPIs

### 👥 Customer CRM
- Customer 360° view with activity timeline
- Follow-up scheduling and tracking
- Customer type classification (Wholesale, Retail, Distributor, Direct)
- Purchase history linked to challans

### 📦 Inventory Management
- Visual inventory health indicator
- Stock status (Healthy / Low / Critical / Out of Stock)
- Per-product stock movement timeline
- Category-based organization

### 📋 Sales Challans
- Multi-step creation wizard (5 steps)
- Real-time stock validation
- Automatic stock deduction on confirmation (transactional)
- Product snapshot preservation
- PDF export with NEXORA branding
- Draft → Confirmed → Cancelled workflow

### 🔍 Global Command Palette
- `Ctrl+K` / `⌘K` to open
- Searches customers, products, challans instantly
- Keyboard navigation (↑↓ arrows, Enter, Escape)

### 🌙 Dark Mode
- Proper dark theme (not just color inversion)
- 3-layer surface hierarchy
- Persisted preference

### 📱 Responsive Design
- Premium desktop experience
- Tablet-adaptive grid
- Mobile drawer navigation

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT authentication with configurable expiry
- Role-based authorization at API level (not just UI)
- Helmet.js security headers
- CORS configured for frontend origin
- Input validation with Zod schemas
- No secrets exposed in frontend code

---

## 📁 Assumptions & Decisions

1. **Product snapshots**: Challan items store a JSON snapshot of product details at creation time, preserving historical accuracy even if product prices change later.
2. **Transaction safety**: Challan confirmation uses PostgreSQL transactions — stock deduction, challan status update, and stock movement records either all succeed or all fail.
3. **Soft delete**: Products use `isActive: false` instead of hard delete to preserve challan item references.
4. **JWT expiry**: Set to 24h for demo convenience. Production should use 15m access + 7d refresh.
5. **Tax**: Currently 0% — the schema supports `taxAmount` field for future implementation.

---

## ⚠️ Known Limitations

1. No email/SMS notifications for follow-ups
2. No real-time updates (no WebSocket — would need to add for multi-user)
3. No image upload (product `imageUrl` is a URL field)
4. No multi-currency support
5. Refresh tokens not implemented (single JWT, 24h expiry)

---

*Built with ❤️ for NEXORA — Intelligent Business Operations*

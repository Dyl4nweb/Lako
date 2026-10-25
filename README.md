# Movli — Modern Local E-Commerce Marketplace
> **Tagline:** Everything moves with Movli.  
> **Target Launch:** Lingayen, Pangasinan provincial hub and neighboring towns.  
> **Platform:** Responsive web application (Customer Storefront, Admin Management Hub, Rider Terminal).

---

## 1. Overview & Value Proposition

Movli is a modern provincial e-commerce marketplace inspired by the intuitive browsing and shopping flow of Shopee, designed specifically for rapid local commerce, fresh market seafood, native Pangasinan delicacies, and daily pantry staples.

### Core Ecosystem Roles
1. **Customers (Storefront):** Browse fresh market catalog, real-time cart, seamless Cash on Delivery (COD) checkout, and live order status tracking with assigned rider contact.
2. **Admins (Management Hub):** Live operational overview, product catalog & stock controls, category organization, dispatch assignment to available riders, and COD collection auditing.
3. **Riders (Mobile Dispatch Terminal):** Touch-friendly mobile interface, one-tap customer calls, maps navigation, step-by-step parcel lifecycle progress (`ASSIGNED` → `PICKED_UP` → `ON_THE_WAY` → `DELIVERED`), and cash collection reconciliation.

---

## 2. Technology Stack

- **Framework:** Next.js (App Router, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS
- **ORM:** Prisma ORM 6
- **Database:** Serverless PostgreSQL hosted on [Neon](https://neon.tech)
- **Authentication:** [Better Auth](https://better-auth.com) with Prisma Adapter
- **Validation:** Zod
- **Forms:** React Hook Form with `@hookform/resolvers`
- **Icons:** Lucide React

---

## 3. Order Lifecycle & Inventory Policy

```
[Customer Checkout]
        ↓
    (PENDING) ───[Customer/Admin Cancel]───> (CANCELLED) [Stock Restored]
        ↓
   [Admin Confirms]
        ↓
   (CONFIRMED) ───[Admin/Customer Cancel]──> (CANCELLED) [Stock Restored]
        ↓
   [Admin Assigns Rider]
        ↓
   (ASSIGNED) ────[Admin Cancel]────────────> (CANCELLED) [Stock Restored]
        ↓
   [Rider Picked Up from Store]
        ↓
   (PICKED_UP)
        ↓
   [Rider On the Way to Customer]
        ↓
  (ON_THE_WAY)
        ↓
   [Rider Handover & Cash Collection]
        ↓
   (DELIVERED) ───[COD Collection Recorded]
```

- **Stock Reservation:** Checkout uses concurrency-safe PostgreSQL transactions (`prisma.$transaction`) with conditional stock decrements (`stock >= quantity`), preventing race conditions and overselling during simultaneous checkouts.
- **Order Snapshots:** Product names, photographs, and unit prices are locked into `OrderItem` records at checkout so subsequent catalog changes never alter previous transactions.
- **COD Separation:** Delivery completion and cash collection status (`UNCOLLECTED` vs `COLLECTED`) are tracked independently.

---

## 4. Getting Started & Setup Guide

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create a Neon PostgreSQL Database Project
1. Log in to [Neon](https://console.neon.tech).
2. Click **Create Project**, name it `movli-db`, and choose your nearest region (e.g., `AWS ap-southeast-1 Singapore` or `us-east-2`).
3. In your Neon Project Dashboard, navigate to **Connection Details**:
   - Enable **Connection Pooling** (port 5432 or 6543, host contains `-pooler`). This provides `DATABASE_URL`.
   - Copy the **Direct Connection** string (host without `-pooler`). This provides `DIRECT_URL` for migrations.

### Step 3: Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

Open `.env` and fill in your connection strings:
```env
# Neon Pooled Runtime Connection:
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Neon Direct Migration Connection:
DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Better Auth Secret (generate with openssl rand -base64 32):
BETTER_AUTH_SECRET="movli_production_secure_secret_32_chars_min"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Default flat delivery fee in PHP
NEXT_PUBLIC_DEFAULT_DELIVERY_FEE="45.00"
```

### Step 4: Run Prisma Migrations
Apply the initial schema to your Neon PostgreSQL database:
```bash
npx prisma migrate dev --name init_movli_schema
```

### Step 5: Generate Prisma Client
```bash
npx prisma generate
```

### Step 6: Seed Development Data
Seed curated categories, fresh local market products, and sample role accounts:
```bash
npx prisma db seed
```

This seeds:
- 6 Curated Categories (Fresh Seafood, Local Delicacies, Pantry, Beverages, Care, Gear)
- Authentic regional products (Dagupan Bangus, Lingayen Bagoong, Tupig, Calasiao Puto, etc.)
- 3 Pre-configured Test Accounts:
  - 👑 **Admin:** `admin@movli.com` (Password: `Password123!`)
  - 🛵 **Rider:** `rider@movli.com` (Password: `Password123!`)
  - 🛒 **Customer:** `customer@movli.com` (Password: `Password123!`)

### Step 7: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Security & Administrative Onboarding

### Creating Additional Admin Accounts
1. Register a standard account via `/register` (all public signups receive `CUSTOMER` role by default).
2. To promote the account to `ADMIN`, run a secure administrative SQL update via Neon SQL Editor or Prisma Studio (`npx prisma studio`):
   ```sql
   UPDATE "user" SET role = 'ADMIN' WHERE email = 'your-admin@example.com';
   ```
3. Admins can register and manage riders directly from the **Admin Hub** at `/admin/riders`.

---

## 6. Production Deployment (e.g. Vercel)

1. Push your repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Add the production environment variables in **Project Settings → Environment Variables**:
   - `DATABASE_URL` (Neon pooled endpoint)
   - `DIRECT_URL` (Neon direct endpoint)
   - `BETTER_AUTH_SECRET` (Cryptographically secure random key)
   - `BETTER_AUTH_URL` (Your production domain, e.g., `https://movli.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` (`https://movli.vercel.app`)
4. Build Command: `npm run build`
5. Output Directory: `.next`

---

## 7. Project Structure

```
movli/
├── prisma/
│   ├── schema.prisma       # Relational models & Better Auth integration
│   ├── seed.ts             # Seeding categories, products & role users
│   └── migrations/         # PostgreSQL migration history
├── src/
│   ├── app/
│   │   ├── (customer)      # Storefront routes (/, /products, /cart, /checkout, /orders, /profile)
│   │   ├── admin/          # Admin portal routes (/admin, /products, /categories, /orders, /riders, /customers)
│   │   ├── rider/          # Rider terminal routes (/rider, /deliveries, /history, /profile)
│   │   └── api/auth/       # Better Auth API route handler
│   ├── components/
│   │   ├── shared/         # MovliLogo, Navbar, Footer, ProductCard, OrderStatusStepper, Providers
│   │   ├── customer/       # CheckoutView, ProductDetailClient, OrderCancellationButton
│   │   ├── admin/          # ProductManagementView, CategoryManagementView, OrderDispatchManagementView, RiderManagementView
│   │   └── rider/          # RiderActiveDeliveriesView, RiderDeliveryDetailClient
│   ├── context/
│   │   └── CartContext.tsx # Persistent shopping cart state & local delivery fees
│   ├── lib/
│   │   ├── prisma.ts       # Prisma Client singleton
│   │   ├── auth.ts         # Better Auth server configuration
│   │   ├── auth-client.ts  # Better Auth React client SDK
│   │   ├── server-auth.ts  # Role authorization helpers (requireAuth, requireAdmin, requireRider)
│   │   ├── validations.ts  # Zod schemas for forms and mutations
│   │   └── order-state-machine.ts # Valid state transitions & stock restoration rules
│   └── server/actions/
│       ├── checkout.ts     # Concurrency-safe atomic checkout & stock deduction
│       ├── orders.ts       # Order lifecycle updates, rider dispatch, COD collection
│       ├── admin.ts        # Product & category CRUD, rider registration
│       └── auth.ts         # Customer signup & credentials
├── .env.example            # Documented environment variables template
└── package.json
```

---

**Movli — Everything moves with Movli.**

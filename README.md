# LAKO — Local Filipino Marketplace & Express Delivery
> **Tagline:** Lokal na paninda, mabilis na hatid sa pinto.  
> **Target Launch:** Lingayen, Pangasinan provincial hub and neighboring towns.  
> **Platform:** Responsive web application (Customer Storefront, Admin Management Hub, Rider Terminal).

---

## 1. Overview & Value Proposition

LAKO is a modern provincial e-commerce marketplace and delivery web app inspired by local Filipino community commerce. It connects neighborhood shoppers with fresh market seafood, native Pangasinan delicacies, pantry essentials, and daily home goods with 100% Cash on Delivery (COD) and real-time rider tracking.

### Core Ecosystem Roles
1. **Customers (Storefront):** Browse fresh market catalog, real-time cart, seamless Cash on Delivery (COD) checkout, live order status tracking with assigned rider contact, and email receipts via Resend.
2. **Admins (Management Hub):** Operational dashboard, product catalog & stock controls, customer management (with delete & status toggles), dispatch assignment to available riders, and COD collection auditing.
3. **Riders (Mobile Dispatch Terminal):** Touch-friendly mobile interface, one-tap customer calls, step-by-step delivery progress (`ASSIGNED` → `PICKED_UP` → `ON_THE_WAY` → `DELIVERED`), and cash collection reconciliation.

---

## 2. Technology Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 with custom brand tokens (`#FF7A1A`, `#242424`, `#FFF6EA`)
- **ORM:** Prisma ORM 6
- **Database:** PostgreSQL
- **Authentication:** [Better Auth](https://better-auth.com) with Prisma Adapter & Google OAuth
- **Email:** [Resend](https://resend.com) for order confirmation receipts
- **Validation:** Zod
- **Forms:** React Hook Form with `@hookform/resolvers`
- **Icons:** Lucide React & Custom LAKO 3D Mascot suite

---

## 3. Brand Identity & Design Tokens

- **Primary Brand Orange:** `#FF7A1A`
- **Base Charcoal Dark:** `#242424`
- **Warm Cream Accent:** `#FFF6EA`
- **Pure White:** `#FFFFFF`

---

## 4. Default Seeded Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lako.com` | `Password123!` | `/admin` (Manage products, orders, customers, riders) |
| **Rider** | `rider@lako.com` | `Password123!` | `/rider` (Deliveries portal & route tracker) |
| **Customer** | `customer@lako.com` | `Password123!` | `/` (Shopping catalog, cart, checkout, orders) |

---

## 5. Local Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/Dyl4nweb/Lako.git
   cd Lako
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Copy `.env.example` to `.env` and fill in your PostgreSQL credentials, Google OAuth keys, and Resend API key:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/lako_db?schema=public"
   DIRECT_URL="postgresql://postgres:password@localhost:5432/lako_db?schema=public"
   BETTER_AUTH_SECRET="your-32-chars-random-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   RESEND_API_KEY="re_xxxx"
   ```

4. **Sync Schema & Seed Database:**
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 6. Deployment on Vercel

```bash
vercel --prod
```

Configure your Production Environment Variables on the Vercel Dashboard:
- `DATABASE_URL`
- `DIRECT_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (e.g. `https://your-lako.vercel.app`)
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

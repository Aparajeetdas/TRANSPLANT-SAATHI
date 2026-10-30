# Transplant Saathi (ट्रांसप्लांट साथी)

> **Compassionate, Statutary-Compliant Healthcare Navigation for Organ Transplant Candidates and Caregivers in India**

Transplant Saathi is a public-interest digital platform engineered to assist vulnerable organ failure patients and their families through the complex administrative, legal, and logistical landscape of organ transplantation in India. Built with strict adherence to the **Transplantation of Human Organs and Tissues Act (THOTA), 1994** and the **Digital Personal Data Protection (DPDP) Act, 2023**, the platform provides transparent government hospital registries, statutory legal document preparation, welfare assistance coordination, and least-privilege peer volunteer accompaniment.

---

## 🏛️ Statutory Compliance & Ethical Principles

1. **Anti-Commercialization Guarantee (THOTA 1994, Section 19):**  
   Organ donation in India is strictly altruistic. Buying, selling, brokering, or offering financial inducement for organs is a non-bailable offense carrying rigorous imprisonment of 5 to 10 years and fines of up to ₹1 Crore. Transplant Saathi strictly prohibits any commercial matching, paid donation solicitations, or financial intermediary services.
2. **No Autonomous Clinical Candidacy Decisions:**  
   The platform provides purely administrative, logistical, and document preparation navigation. It never evaluates laboratory results, HLA tissue compatibility, or medical candidacy. Clinical evaluations remain the sole prerogative of registered transplant surgeons at licensed medical centers.
3. **No Organ Allocation Waitlist Control:**  
   Transplant Saathi does not possess, manage, or influence any deceased donor or living donor waitlists. In India, organ allocation is legally managed exclusively by government authorities (**NOTTO**, **ROTTO**, and **SOTTO**) through official computerized registries.
4. **Least-Privilege Privacy by Design (DPDP Act 2023):**  
   Patient case files, sensitive phone numbers, and clinical documentation are isolated through PostgreSQL Row Level Security (RLS). Peer volunteers may only inspect and accompany patients explicitly assigned to them by an authorized Hospital Coordinator.

---

## 🛠️ Technology Stack

- **Frontend Core:** React 19, TypeScript 5, Vite 8 (Rolldown engine)
- **Styling & Design System:** TailwindCSS v4 with an accessible, high-contrast blue-and-white clinical palette (`#FFFFFF`, `#F4F8FF`, `#2563EB`, `#1D4ED8`, `#0F172A`, `#64748B`, `#E2E8F0`)
- **Routing:** React Router DOM (v7) with Single Page App (SPA) fallback rules
- **State & Data Fetching:** TanStack React Query v5 with local storage fallback store
- **Form Handling & Validation:** React Hook Form with Zod schemas
- **Icons & Visuals:** Lucide React icons & Google Maps via `@vis.gl/react-google-maps`
- **Backend & Authentication:** Supabase Auth (JWT), PostgreSQL 15, and Row Level Security (RLS) policies
- **Testing & Quality Assurance:** Vitest, React Testing Library, ESLint with React Compiler plugins

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js `v20.x` or higher
- npm `v10.x` or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/transplant-saathi.git
cd transplant-saathi

# Install dependencies
npm install
```

### 3. Environment Configuration
The platform functions out-of-the-box in **Resilient Local Prototype Mode** (mock local storage with pre-seeded personas). To connect to a live Supabase backend:

```bash
# Copy example environment configuration
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here
VITE_APP_URL=http://localhost:5174
```

### 4. Running Locally
```bash
# Start the Vite development server (default port: 5174)
npm run dev
```

### 5. Running Quality Checks
```bash
# Execute ESLint validation (0 errors, 0 warnings enforced)
npm run lint

# Run all test suites
npm test -- --run

# Compile TypeScript and generate production bundle
npm run build
```

---

## 🗺️ Hospital Map Navigation

Transplant Saathi provides direct Google Maps search links using verified facility addresses and statutory GPS coordinates, opening directly in external tabs (`https://www.google.com/maps/search/?api=1&query=...`) without requiring a Google Maps API key or paid third-party mapping dependencies.

---

## 🔐 Environment Variables & Security Hygiene

All client-side environment variables must be prefixed with `VITE_`:

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Optional (Prod) | Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Optional (Prod) | Supabase public anonymous key (JWT) | `eyJhbGci...` |
| `VITE_APP_URL` | Optional (Prod) | Frontend base URL for auth redirects | `http://localhost:5174` |
| `VITE_SUPABASE_STORAGE_BUCKET_DOCUMENTS` | Optional | Supabase storage bucket name | `patient_documents` |
| `VITE_NOTTO_HELPLINE` | Optional | National emergency helpline number | `1800-11-4770` |
| `VITE_NOTTO_PORTAL_URL` | Optional | National organ authority portal URL | `https://notto.mohfw.gov.in` |
| `VITE_PMJAY_PORTAL_URL` | Optional | Ayushman Bharat PMJAY portal URL | `https://pmjay.gov.in` |

> ⚠️ **CRITICAL SECURITY RULE:** Never put `SUPABASE_SERVICE_ROLE_KEY`, database passwords, or private signing certificates into `.env` or any file prefixed with `VITE_`. Any `VITE_` variable is compiled directly into the public JavaScript bundle and visible to all users.

---

## 🗄️ Database Schema & Supabase Migrations

The project includes 7 sequential, idempotent PostgreSQL migrations located in `supabase/migrations/`:

1. `20261027000000_init_transplant_saathi.sql`: Base tables (`profiles`, `verified_hospitals`, `official_sources`, `assistance_requests`, `audit_logs`), ENUM types, and foundational RLS policies.
2. `20261027000001_patient_expense_and_governance.sql`: Patient journey progress, administrative checklists, appointment notes, expense planner tables, and cascade constraints.
3. `20261029000000_hospital_directory_review_status.sql`: Hospital accreditation fields, review status enum (`verified`, `pending`, `flagged`), and audit date tracking.
4. `20261029000001_comprehensive_governance_and_synthetic_seed.sql`: Full demonstration dataset with NOTTO-compliant hospital citations and mock profiles.
5. `20261029000002_assistance_workflow_and_expense_governance.sql`: Hospital staff assignment workflow and non-clinical support verification.
6. `20261029000003_volunteer_least_privilege_rls.sql`: Strict RLS case isolation preventing peer navigators from inspecting unassigned requests.
7. `20261029000004_admin_governance_and_privilege_escalation_guard.sql`: Sole-admin protection triggers and administrative audit trail logging.

### Applying Migrations to Live Supabase:
```bash
# Link your local repository to your Supabase project
npx supabase link --project-ref your-project-ref

# Push migrations to the remote database
npx supabase db push
```

---

## 🌐 Production Deployment Guide

### Deployment Options

#### Option A: Vercel (Recommended)
1. Import repository on [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Set Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL`.
6. SPA rewrites and security headers are automatically handled via the included [`vercel.json`](./vercel.json).

#### Option B: Netlify
1. Connect repository on [Netlify](https://netlify.com).
2. Build Command: `npm run build`.
3. Publish Directory: `dist`.
4. SPA routing fallback is automatically configured via [`public/_redirects`](./public/_redirects).

#### Option C: Docker / Static Nginx
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Configure SPA fallback
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📋 Step-by-Step Pre-Deployment Checklist

Before deploying Transplant Saathi to a staging or production environment, execute the following checklist:

### Step 1: Quality & Compilation Checks
- [ ] Run `npm run lint` and confirm 0 errors and 0 warnings.
- [ ] Run `npm test -- --run` and verify all 132 tests across all 13 test suites pass.
- [ ] Run `npm run build` (`tsc -b && vite build`) and verify clean bundle output in `dist/`.

### Step 2: Secret Hygiene & Environment Verification
- [ ] Verify `.gitignore` contains `.env`, `.env.*`, and `!.env.example`.
- [ ] Confirm no backend service role keys or database passwords exist in frontend code or Git history.
- [ ] In your hosting platform settings, define `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL`.

### Step 3: Supabase Authentication & Redirect Endpoints
In your **Supabase Dashboard** under **Authentication -> URL Configuration**:
- [ ] Set **Site URL** to your production domain: `https://your-domain.com`.
- [ ] Add the following entries to **Redirect URLs**:
  - `https://your-domain.com/auth/verify-email`
  - `https://your-domain.com/auth/reset-password`
  - `http://localhost:5174/auth/verify-email` (for local dev)
  - `http://localhost:5174/auth/reset-password` (for local dev)

### Step 4: Database Migrations & RLS Enforcement
- [ ] Apply all 7 migrations from `supabase/migrations/` using `npx supabase db push`.
- [ ] Verify that Row Level Security (RLS) is enabled on all tables:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
  ```
- [ ] Verify least-privilege policies: confirm unassigned volunteers cannot select rows from `assistance_requests`.

### Step 5: Route Fallback Verification
- [ ] Access a deep route directly (e.g. `https://your-domain.com/directory` or `/patient`).
- [ ] Refresh the page in the browser and confirm it loads without returning an HTTP 404 or Nginx/Apache error.

---

## 🚦 Pre-Launch Blockers (Before Claiming Full Production Status)

Before transitioning from a vetted prototype to an official live public service, address these critical dependencies:

1. **Official Government Data Ingestion:**  
   The current directory contains synthetic demonstration records. For a live deployment, coordinate with the National Organ and Tissue Transplant Organisation (**NOTTO**) and state **SOTTOs** to import verified gazette citations and licensed centers.
2. **MoHFW Regulatory Sign-Off:**  
   Because the site deals with statutory provisions under THOTA 1994, obtain formal institutional clearance from hospital nodal officers and legal counsel prior to public marketing.
3. **Dedicated SMTP Email Delivery:**  
   Supabase default email providers have low hourly rate limits (30 emails/hour). Configure custom SMTP (SendGrid, AWS SES, or Resend) in Supabase Dashboard -> Authentication -> Email Settings for reliable verification and password reset emails.
4. **Custom Domain TLS & Content Security Policy (CSP):**  
   Configure custom domain SSL certificates (e.g. via Cloudflare/Vercel) and establish strict Content Security Policy headers restricting inline scripts and unauthorized external API connections.

---

## 📄 License & Attribution

- **Project:** Transplant Saathi (Public-Interest Health Informatics)
- **Legal Jurisdiction:** Republic of India (THOTA 1994 & DPDP Act 2023)
- **Helpline Integration:** National 24/7 Organ & Tissue Helpline: `1800-11-4770`

# Tech Stack

## Frontend (`apps/web`)

- **React 19** + **Vite 8**
- **TypeScript 6**
- **React Router v7** — routing
- **Redux Toolkit** + **Zustand** — global and local state
- **React Query (@tanstack/react-query v5)** — server state / data fetching
- **Framer Motion** — animations
- **Recharts** — data visualization
- **Lucide React** — icons
- **Sonner** — toast notifications
- **CSS Modules** + global CSS with design tokens
- **ESLint** (eslint-plugin-react-hooks, eslint-plugin-react-refresh)
- **Playwright** — E2E testing

## Backend (`apps/api`)

- **Node.js 20+** + **Express 4**
- **TypeScript 5.7**
- **Prisma 5** — ORM
- **PostgreSQL** (hosted on Neon)
- **JWT** — authentication
- **Bcrypt** — password hashing
- **Stripe** — payments and subscription management
- **Groq API** (via `openai` SDK, model `openai/gpt-oss-120b`) — AI question generation and feedback
- **Sentry** — error monitoring
- **Zod** — input validation
- **Multer** — file uploads
- **ts-node-dev** — dev server with hot reload

## Infrastructure

- **Railway** — API deployment
- **Vercel** — frontend deployment
- **Neon** — PostgreSQL database

---

## Common Commands

### Frontend (`apps/web`)

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # TypeScript check + production build
npm run lint         # ESLint
npm run test:e2e     # Playwright E2E tests (seeds test users first)
npm run test:e2e:ui  # Playwright with UI
```

### Backend (`apps/api`)

```bash
npm run dev                  # Start dev server with ts-node-dev (port 3000)
npm run build                # Compile TypeScript to dist/
npm run start                # Run compiled output

npm run db:migrate           # Run Prisma migrations (dev)
npm run db:seed              # Seed initial data
npm run db:seed:test-users   # Seed E2E test users
npm run db:studio            # Open Prisma Studio

npm run generate:questions   # Generate AI questions via Groq (slow, batched)
npm run ingest:exam-docs     # Ingest official exam documents
```

### Database (production)

```bash
npx prisma migrate deploy    # Apply migrations in production
```

---

## Environment Variables

### API (`apps/api/.env`)

```
DATABASE_URL
JWT_SECRET
GROQ_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID
FRONTEND_URL
PORT
NODE_ENV
SENTRY_DSN        # optional in local
```

### Frontend (`apps/web/.env.local`)

```
VITE_API_URL
VITE_SENTRY_DSN   # optional in local
```

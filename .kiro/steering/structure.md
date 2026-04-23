# Project Structure

Monorepo with two apps — no shared packages workspace, each app manages its own dependencies.

```
preprueba/
├── apps/
│   ├── api/                        # Express backend
│   │   ├── src/
│   │   │   ├── index.ts            # Entry point, Express setup, route registration
│   │   │   ├── routes/             # One file per resource (auth, materias, sesiones, stats,
│   │   │   │                       #   stripe, admin, planner, forum, errores, favoritos,
│   │   │   │                       #   flashcards, examenes, exam-docs, simulacros)
│   │   │   ├── services/           # Business logic (Stripe, Groq/AI)
│   │   │   ├── middleware/         # Auth, admin, subscription/premium checks
│   │   │   ├── lib/                # Prisma client singleton
│   │   │   ├── types/              # Shared TypeScript types
│   │   │   ├── scripts/            # One-off scripts (ingestExamDocs)
│   │   │   └── exam-docs/          # Document ingestion pipeline
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema (source of truth)
│   │   │   ├── migrations/         # Prisma migration history
│   │   │   ├── seed.ts             # Initial data seed
│   │   │   ├── seed-test-users.ts  # E2E test user seed
│   │   │   └── generate-questions.ts # AI question generation script
│   │   ├── uploads/                # User-uploaded files (served as static)
│   │   └── package.json
│   │
│   └── web/                        # React frontend
│       ├── src/
│       │   ├── main.tsx            # App entry point
│       │   ├── App.tsx             # Router setup
│       │   ├── pages/              # Route-level page components
│       │   ├── features/           # Self-contained feature modules
│       │   │   ├── workspace/      # Study workspace UI
│       │   │   ├── community/      # Forum and community
│       │   │   └── exam-docs/      # Exam document browser
│       │   ├── components/         # Reusable UI components
│       │   │   └── layout/         # Layout components (CSS Modules)
│       │   ├── store/              # Redux slices + Zustand stores
│       │   ├── services/           # API client functions
│       │   ├── hooks/              # Custom React hooks
│       │   ├── lib/                # Utilities (query client, animation helpers)
│       │   ├── types/              # TypeScript types
│       │   └── styles/             # Global CSS, design tokens
│       ├── e2e/                    # Playwright test specs
│       └── package.json
│
├── docs/                           # Project documentation
├── assets/                         # Shared static assets
└── .agent/                         # Kiro AI agent config (agents, skills, rules)
```

## Architecture Patterns

### Backend
- **Route → Service → Prisma** layered pattern. Routes handle HTTP, services hold business logic, Prisma handles DB access.
- Middleware chain for access control: `authMiddleware` → `adminMiddleware` / `subscriptionMiddleware` as needed.
- Centralized error handler in `index.ts` catches unhandled errors and reports to Sentry.
- Stripe webhook requires raw body — registered before `express.json()`.

### Frontend
- **Feature-based** organization under `features/` for complex domains; shared UI goes in `components/`.
- **React Query** for all server data fetching and caching. Avoid manual fetch calls in components.
- **Redux Toolkit** for global auth state; **Zustand** for local/ephemeral UI state.
- **CSS Modules** for component styles; global tokens in `styles/`.
- API calls go through `services/` — never call `fetch` directly from pages or components.

## Key Conventions

- All domain terms in Spanish (see `product.md`).
- TypeScript strict mode — no `any` without justification.
- Zod for request validation on the API.
- New API routes must be registered in `src/index.ts`.
- New Prisma models require a migration (`npm run db:migrate`).
- Environment secrets never committed — use `.env` / `.env.local` (gitignored).

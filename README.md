# Enterprise Next.js Boilerplate

Production-ready Next.js App Router boilerplate for SaaS, fintech, AI platforms, healthcare, ERP/CRM, and large-scale enterprise dashboards.

Built on **Next.js 16.3** with TypeScript strict mode, Tailwind CSS 4, Shadcn-style UI, JWT auth + refresh rotation, RBAC, and hardened security defaults.

## Stack

- Next.js App Router + TypeScript (strict)
- Tailwind CSS + Shadcn UI primitives
- React Hook Form + Zod
- Axios + TanStack Query
- Zustand + Next Themes
- ESLint + Prettier + Husky + Lint-Staged

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Email | Password | Role |
| --- | --- | --- |
| `admin@example.com` | `Admin123!` | ADMIN |
| `user@example.com` | `User1234!` | USER |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run typecheck` | TypeScript check |

## Architecture

```text
src/
├── app/                 # Routes, layouts, API handlers
├── components/          # UI, forms, shared, layouts
├── features/            # Domain modules (auth, users, dashboard, settings)
├── services/            # API clients + TanStack Query hooks
├── hooks/               # Shared React hooks
├── store/               # Zustand stores
├── lib/                 # Auth, security, env, axios, utils
├── middleware/          # Auth, role, security middleware helpers
├── schemas/             # Zod schemas
├── types/               # Shared TypeScript types
├── constants/           # Roles, routes, cookies
├── providers/           # App providers
└── styles/              # Global styles
```

## Security features

- JWT access + refresh token strategy (httpOnly cookies)
- Refresh token rotation with reuse detection
- RBAC permissions + middleware route protection
- CSP, CSRF double-submit cookie, clickjacking protections
- Secure headers (`X-Frame-Options`, `nosniff`, HSTS in production)
- Zod request validation + input sanitization
- Rate limiting structure (in-memory; swap for Redis in prod)
- Environment validation via Zod
- Safe error responses (no sensitive leakage)

## Auth flow

1. Login/register issues short-lived access token + refresh token cookies
2. Middleware validates session for protected routes
3. Axios interceptor refreshes tokens on `401`
4. Logout clears cookies and revokes refresh token JTI

## Environment

Copy `.env.example` to:

- `.env.local` (local development)
- `.env.staging`
- `.env.production`

Never commit real secrets. Generate secrets with:

```bash
openssl rand -base64 64
```

## Production notes

- Replace the in-memory `userStore` with a database + ORM (Prisma/Drizzle)
- Move rate limiting to Redis/Upstash
- Wire password reset emails to your provider
- Configure real `ALLOWED_ORIGINS`, cookie domain, and secret rotation
- Add observability (Sentry, OpenTelemetry) as needed

## License

Private boilerplate — adapt for your organization.

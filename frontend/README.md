# Frontend

React 19 application built with Vite.

## Tech Stack

| Concern | Library |
|---------|---------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| HTTP client | Axios (via `src/api/client.ts`) |
| Testing | Vitest + Testing Library |
| API mocking | MSW v2 |
| Validation | Zod |

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Runs at `http://localhost:5173`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Typecheck + lint + production build |
| `npm run lint` | ESLint (zero warnings) |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run tests once |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Run with coverage report |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting (used in CI) |

## Project Structure

```
src/
├── api/              # Axios client + shared response types
├── features/         # Feature modules (components, hooks, api, types)
│   └── example/      # Example feature — copy this for new features
├── lib/              # Third-party setup (queryClient)
├── mocks/            # MSW handlers, browser + server setup
├── test/             # Global test setup
└── env.ts            # Zod-validated env vars
```

## Adding a New Feature

1. Create `src/features/<name>/` with `components/`, `hooks/`, `api/`, `types/`, `index.ts`
2. Add API handlers to `src/mocks/handlers.ts` for tests
3. Export public API from `index.ts`
4. Import via `@/features/<name>` — not deep paths

## Environment Variables

Defined and validated in `src/env.ts`. All vars are prefixed with `VITE_`.

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL for the backend API |

Copy `.env.example` to `.env` to get started.

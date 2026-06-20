# Frontend — React

## Tech Stack
- React + TypeScript
- Vite (build tool)
- Vitest + Testing Library (unit/component tests)
- Playwright (E2E — separate pipeline, not required for unit test gate)
- TanStack Query (server state)
- Zustand or Jotai (client state)
- MSW (API mocking in tests)
- ESLint + Prettier

## Build Gates
All must pass in CI — failures block the build:

```bash
npm run lint        # ESLint --max-warnings 0
npm run typecheck   # tsc --noEmit
npm run test        # Vitest with coverage thresholds
npm run build       # Vite production build
```

### Coverage Thresholds (vitest.config.ts)
```ts
coverage: {
  thresholds: {
    lines: 80,
    branches: 75,
    functions: 80,
    statements: 80,
  }
}
```

## Folder Structure

```
src/
├── features/
│   └── feature-name/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       ├── types/
│       └── index.ts       # barrel export
├── components/            # shared/generic components only
├── hooks/                 # shared hooks
├── api/                   # API client, base config, shared types
├── lib/                   # third-party setup (queryClient, etc.)
├── types/                 # global types
└── env.ts                 # env validation (Zod)
```

## Imports
- Use `@/` path alias for all internal imports (e.g. `@/features/auth`)
- No relative imports that traverse more than one level up (`../../` is a smell)
- Each feature folder exports via `index.ts` — import from the folder, not deep paths

## Components
- One component per file
- Named exports for all components, hooks, and utilities
- Default exports only for route-level page components
- Colocate tests (`Component.test.tsx`) and styles with the component file
- Extract logic to a `useXxx` hook when component body exceeds ~30 lines
- No prop drilling beyond 2 levels — use context or state manager

## State Management
- Server state (API data): TanStack Query only — no `useEffect` for data fetching
- Client/UI state: Zustand or Jotai
- Do not mix server state into client state stores

## Data Fetching & API Layer
- All API calls go through `src/api/` — never call `fetch`/`axios` directly from components or hooks
- API functions return typed responses — no `any`
- Use React Query `onMutate` for optimistic updates where UX requires it

### Pagination
- Use cursor-based pagination with `useInfiniteQuery`
- Expect API responses shaped as: `{ data: T[], meta: { nextCursor: string | null, total: number } }`

## Testing
- Use `@testing-library/react` for all component tests — no Enzyme
- Test behavior from the user's perspective — no testing internal state, refs, or implementation details
- Use MSW (`src/mocks/`) to mock API responses — do not mock `fetch` or `axios` directly
- Test file naming: `ComponentName.test.tsx`, `useHookName.test.ts`

## Environment Variables
- Validate all `VITE_` env vars using Zod in `src/env.ts` at app startup
- Access env only via the validated `env` object — never `import.meta.env.X` directly in components

```ts
// src/env.ts
import { z } from 'zod'

const schema = z.object({
  VITE_API_URL: z.string().url(),
})

export const env = schema.parse(import.meta.env)
```

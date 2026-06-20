# App Bootstrapper

## Repository Structure

```
app-bootstrapper/
├── frontend/    # React application
└── backend/     # NestJS + Fastify application
```

Each subfolder has its own `CLAUDE.md` with app-specific coding rules. Read the relevant one before making changes.

## Shared Conventions

### Commits
- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- Scope to app when relevant: `feat(frontend):`, `fix(backend):`

### Environment Variables
- Never commit secrets or `.env` files
- Each app has a `.env.example` with all required keys (no values)
- Validate all env vars at startup — fail fast on missing required vars

### TypeScript
- Strict mode enabled in both apps (`"strict": true`)
- No `any` — use `unknown` and narrow, or define proper types
- No `@ts-ignore` or `@ts-expect-error` without an explanatory comment

### Code Style
- Prettier for formatting — enforced in CI
- ESLint with zero warnings allowed — enforced in CI
- Match existing patterns in the file you are editing — do not reformat surrounding code

## Running the Apps

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run start:dev
```

## CI Checks (both apps)
All of the following must pass before merging:
1. `lint` — zero warnings
2. `typecheck` — no type errors
3. `test` — coverage thresholds met
4. `build` — production build succeeds

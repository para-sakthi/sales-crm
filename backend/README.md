# Backend

NestJS 11 application using the Fastify adapter.

## Tech Stack

| Concern | Library |
|---------|---------|
| Framework | NestJS 11 + Fastify |
| Language | TypeScript (strict) |
| Validation | class-validator + class-transformer |
| Security | @fastify/helmet |
| Logging | Pino (via Fastify) |
| Testing | Jest + ts-jest |
| Env validation | Zod |

## Setup

```bash
cp .env.example .env   # fill in real values
npm install
npm run start:dev
```

Runs at `http://localhost:3000`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start with watch mode |
| `npm run start:prod` | Start production build |
| `npm run build` | Typecheck + lint + NestJS build |
| `npm run lint` | ESLint (zero warnings) |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run with coverage report |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting (used in CI) |

## Project Structure

```
src/
├── common/
│   ├── dto/            # Shared DTOs (PaginatedResponseDto)
│   ├── filters/        # GlobalExceptionFilter
│   └── interceptors/   # ResponseTransformInterceptor
├── config/
│   └── env.validation.ts  # Zod env schema — app refuses to start on invalid env
├── modules/
│   └── example/        # Example feature module — copy this for new modules
│       ├── dto/
│       ├── entities/
│       ├── repositories/
│       ├── example.controller.ts
│       ├── example.service.ts
│       └── example.module.ts
└── main.ts             # Fastify + global setup
```

## API Conventions

### Versioning
All routes are prefixed with the version: `GET /v1/example`

### Response Envelope

**List endpoint:**
```json
{
  "data": [...],
  "meta": { "nextCursor": "abc", "total": 42 }
}
```

**Single resource:**
```json
{ "data": { "id": "1", "name": "..." } }
```

**Error:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Example 99 not found"
  }
}
```

### Pagination
All list endpoints use cursor-based pagination via `?cursor=<id>&limit=<n>` (default 20, max 100).

### HTTP Status Codes
| Scenario | Code |
|----------|------|
| Created | 201 |
| Deleted (no content) | 204 |
| Validation error | 422 |
| Not found | 404 |
| Unauthorized | 401 |
| Forbidden | 403 |

## Adding a New Module

1. Create `src/modules/<name>/` following the example module structure
2. Add controller, service, repository, DTOs, entity
3. Import the module in `app.module.ts`
4. Services must be `async` — all methods return `Promise<T>`

## Environment Variables

Validated at startup by `src/config/env.validation.ts`. App refuses to start if any are missing or invalid.

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` / `production` / `test` |
| `PORT` | Port to listen on (default: 3000) |
| `DATABASE_URL` | PostgreSQL connection URL |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) |

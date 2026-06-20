# Backend — NestJS + Fastify

## Tech Stack
- NestJS + Fastify adapter
- TypeScript (strict mode)
- Jest (unit tests)
- class-validator + class-transformer (validation & serialization)
- Pino (structured logging via Fastify)
- ESLint + Prettier

## Build Gates
All must pass in CI — failures block the build:

```bash
npm run lint        # ESLint --max-warnings 0
npm run typecheck   # tsc --noEmit
npm run test        # Jest with coverage thresholds
npm run build       # NestJS production build
```

### Coverage Thresholds (jest.config.ts)
```ts
coverageThreshold: {
  global: {
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
├── modules/
│   └── feature-name/
│       ├── feature-name.controller.ts
│       ├── feature-name.service.ts
│       ├── feature-name.module.ts
│       ├── dto/
│       │   ├── create-feature.dto.ts
│       │   └── update-feature.dto.ts
│       ├── entities/
│       │   └── feature-name.entity.ts
│       └── repositories/
│           └── feature-name.repository.ts
├── common/
│   ├── filters/       # global exception filters
│   ├── interceptors/  # response transform, serialization
│   ├── guards/        # auth guards
│   ├── decorators/    # custom decorators
│   └── pipes/         # custom pipes
├── config/            # config modules, env validation
└── main.ts
```

## Global Setup (main.ts)

Apply these globally — do not rely on per-controller setup:

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,             // strip unknown properties
  forbidNonWhitelisted: true,  // throw on unknown properties
  transform: true,             // auto-transform to DTO class instances
}))

app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
app.useGlobalFilters(new GlobalExceptionFilter())

// Fastify security headers
await app.register(helmet)

// API versioning
app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
// Routes: /v1/resource
```

## NestJS Patterns

### Async by Default
- All service methods and repository methods must be `async` and return `Promise<T>` — even if currently synchronous
- This ensures consistent interfaces as async operations are added and prevents refactoring churn
- Controllers should `await` service calls — never return unresolved promises

### Controllers
- Controllers are thin — no business logic, no direct DB access
- Validate input via DTOs + `ValidationPipe` (globally applied)
- Return domain objects/entities — let `ClassSerializerInterceptor` handle serialization

### Services
- All business logic lives in services
- Services never access the ORM/DB directly — call the repository

### Repositories
- All DB access is abstracted behind repository classes
- Services depend on repository interfaces — not concrete implementations
- This keeps services unit-testable without a real DB

### Modules
- Each domain feature is a self-contained NestJS module
- No cross-module direct class imports — import via the module's exported providers
- Shared utilities go in `CommonModule`

## API Design

### Response Shape
All responses use a consistent envelope:

```ts
// Success (list)
{
  data: T[],
  meta: {
    offset: number,      // items skipped
    limit: number,       // page size used
    total: number,       // total matching records
    hasMore: boolean     // true if offset + limit < total
  }
}

// Success (single)
{
  data: T
}

// Error
{
  error: {
    code: string,
    message: string,
    details?: Record<string, string[]>  // validation errors
  }
}
```

### Pagination
- All list endpoints use offset-based pagination
- Query params: `?offset=<number>&limit=<number>` (default offset: 0, default limit: 20, max limit: 100)
- `offset` is the number of records to skip; `limit` is the page size
- Validate query params via a shared `PaginationQueryDto`:

```ts
// common/dto/pagination-query.dto.ts
import { IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20
}
```

- Repositories run the query with `skip: offset, take: limit` and return both the page and the total `count` (e.g. via a transaction / `Promise.all`)
- Compute `hasMore` as `offset + data.length < total` and include `offset`, `limit`, `total`, and `hasMore` in the response `meta`

### HTTP Status Codes
| Scenario | Status |
|----------|--------|
| Resource created | 201 |
| No content (delete) | 204 |
| Validation error | 422 |
| Not found | 404 |
| Unauthorized | 401 |
| Forbidden | 403 |
| Server error | 500 |

### Idempotency
- POST endpoints that create resources accept an optional `Idempotency-Key` header
- Duplicate requests with the same key within a TTL window return the original response

### Versioning
- URI versioning: `/v1/resource`
- Never remove or break a versioned endpoint — add a new version instead

## Validation & Serialization

### DTOs
- All request bodies modeled as DTO classes with `class-validator` decorators
- Use `@Exclude()` on entity fields that must not be exposed (passwords, internal IDs)
- Use `@Expose()` on fields to include in serialized output

### Entities
- Decorate with `@Exclude()` at class level, `@Expose()` on public fields
- `ClassSerializerInterceptor` handles response serialization globally

## Security
- `@fastify/helmet` registered globally for security headers
- Auth enforced via NestJS Guards — no manual token parsing in controllers
- `ValidationPipe` with `whitelist: true` strips all properties not in the DTO
- No secrets in source code — all via env vars, validated at startup

## Error Handling
- A global exception filter maps all errors to the standard error envelope
- Domain-specific errors are custom exception classes extending `HttpException`
- Never let ORM/DB errors bubble up raw to the client

## Logging
- Pino is configured as Fastify's logger — structured JSON output
- Each request automatically gets a correlation ID (via Fastify's `requestId`)
- Log levels: `error` for unhandled exceptions, `warn` for handled domain errors, `info` for key operations
- Never log sensitive data (tokens, passwords, PII)

## Testing

### Unit Tests (services)
- Mock all dependencies (repositories, external services) with Jest mocks
- Test service methods in isolation
- Test file naming: `feature-name.service.spec.ts`

### Integration Tests (controllers)
- Use `@nestjs/testing` `Test.createTestingModule()` with real service wired in
- Use `supertest` against the NestJS app
- Mock only the repository layer — services run for real
- Test file naming: `feature-name.controller.spec.ts`

## Environment Variables
- Define and validate all env vars using Zod or Joi in `src/config/`
- Use NestJS `ConfigModule` with the validated config
- App refuses to start if required env vars are missing or invalid

```ts
// src/config/env.validation.ts
import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
})
```

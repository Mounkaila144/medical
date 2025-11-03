# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **NestJS medical management monolith** for healthcare clinics. It implements a multi-tenant architecture where:
- A **SUPERADMIN** can create tenants (clinics) with their own CLINIC_ADMIN
- Each tenant represents a clinic with isolated data
- Clinic admins manage their employees, practitioners, and clinic operations

The system integrates PostgreSQL (or MySQL), RabbitMQ for messaging, MinIO for document storage, and GraphQL + REST APIs.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Development server (port 3001 by default)
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm test                    # Unit tests
npm run test:watch          # Watch mode
npm run test:cov           # With coverage
npm run test:e2e           # E2E tests
npm run test:debug         # Debug mode

# Database seeding
npm run seed                          # Create superadmin (admin@example.com / password123)
npm run seed:practitioners            # Seed practitioners
npm run create:test-practitioner      # Create test practitioner
```

## Architecture

### Multi-tenant System

All user operations are tenant-scoped. Key concepts:

- **Tenant Entity**: Represents a clinic with `id`, `name`, `slug`, and `isActive` status
- **User Entity**: Has `tenantId` foreign key and `role` (SUPERADMIN, CLINIC_ADMIN, EMPLOYEE, PRACTITIONER)
- **Tenant Guard**: Validates tenant access via `x-tenant-id` header or request params
- **Public Endpoints**: Use `@Public()` decorator to bypass JWT authentication

### Module Structure

The codebase is organized into domain modules:

- **auth**: Authentication, user management, tenant management, JWT/Passport strategies
- **patients**: Patient records, medical history, document scanning, WhatsApp integration
- **scheduling**: Appointments, practitioner availability, wait queue management
- **ehr**: Electronic Health Records (encounters, prescriptions, lab results, audit logs)
- **billing**: Invoicing, payments, tariffs, invoice lines
- **inventory**: Stock management, suppliers, lot tracking, low-stock alerts
- **hr**: Staff management, shifts, timesheets, leave requests, payroll exports
- **analytics**: Reporting and analytics with materialized views
- **common**: Shared decorators, guards, filters, pipes, enums

Each module follows the pattern:
```
module-name/
├── controllers/     # REST endpoints
├── resolvers/       # GraphQL resolvers
├── services/        # Business logic
├── entities/        # TypeORM entities
├── dto/            # Data transfer objects
├── events/         # Event emitters/listeners
├── guards/         # Authorization guards
└── __tests__/      # Unit and E2E tests
```

### Database Configuration

TypeORM is configured to support multiple databases via environment variables:
- **PostgreSQL** (default): Uses `DATABASE_*` or `DB_*` prefix
- **MySQL**: Set `DB_TYPE=mysql`
- **SQLite**: Set `DATABASE_TYPE=sqlite` (for testing)

Database synchronization is enabled in non-production environments. Migrations are in `src/migrations/` and module-specific migrations are in their respective module folders.

### GraphQL

Auto-generated schema at `src/schema.gql` (code-first approach). GraphQL Playground enabled. Entities use `@ObjectType()` and `@Field()` decorators from `@nestjs/graphql`.

### Authentication Flow

1. **Login**: POST `/auth/login` returns `accessToken` (15m expiry) and `refreshToken`
2. **Refresh**: POST `/auth/refresh` with refresh token
3. **Logout**: POST `/auth/logout` invalidates the session
4. **Global Guard**: `JwtAuthGuard` is applied globally via `APP_GUARD`
5. **Public Routes**: Use `@Public()` decorator to bypass authentication

Strategies:
- `LocalStrategy`: Username/password validation
- `JwtAccessStrategy`: Validates access tokens
- `JwtRefreshStrategy`: Validates refresh tokens

### Authorization

Use the `@Roles()` decorator with `RolesGuard`:
```typescript
@Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.SUPERADMIN)
@UseGuards(RolesGuard)
```

For GraphQL, use `GqlRolesGuard`.

### Event-Driven Architecture

The system uses `@nestjs/event-emitter` for domain events:
- `AppointmentCreatedEvent` / `AppointmentCancelledEvent`
- `EncounterLockedEvent` / `PrescriptionGeneratedEvent`
- `InvoicePaidEvent` / `InvoiceSentEvent`
- `StockLowEvent` with automated listener
- `WaitQueueUpdatedEvent`

Emit events with `EventEmitter2`:
```typescript
this.eventEmitter.emit('event.name', new EventPayload());
```

### External Services

- **RabbitMQ**: Message queue for async operations (patients module uses `patients_queue`)
- **MinIO**: Object storage for documents (configured via `MINIO_*` env vars)
- **WhatsApp Integration**: Patient notification service in patients module

## Testing Strategy

- **Unit tests**: `*.spec.ts` files colocated with source, use mocked repositories
- **E2E tests**: Located in `__tests__/e2e/` directories within modules
- Test modules often use SQLite in-memory database (`DATABASE_TYPE=sqlite`, `DATABASE_MEMORY=true`)
- Mock entities and repositories are in `__tests__/mocks/` or `__mocks__/` directories
- Setup files like `setup-env.ts` configure test environments

## Working with Migrations

Migrations are scattered:
- Core migrations: `src/migrations/`
- Module migrations: `src/{module}/migrations/`

When creating entities, ensure proper migration files exist or rely on `synchronize: true` in dev.

## Common Patterns

### Creating a New Endpoint

1. Define DTO with `class-validator` decorators
2. Create/update entity with TypeORM decorators + GraphQL decorators if needed
3. Implement service method with business logic
4. Add controller method (REST) or resolver (GraphQL)
5. Apply appropriate guards (`@UseGuards(JwtAuthGuard, RolesGuard)`)
6. For public endpoints, add `@Public()` decorator

### Working with Tenants

Always filter queries by `tenantId` unless user is SUPERADMIN. Extract tenantId from request:
```typescript
const tenantId = req.user.tenantId;
```

### Error Handling

Global filters configured:
- `DatabaseExceptionFilter`: Handles database errors
- `ValidationPipe`: Validates DTOs with `whitelist: true` and `forbidNonWhitelisted: true`

## Environment Setup

Required services (via Docker Compose):
```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- RabbitMQ (port 5672, management UI at 15672)
- MinIO (API at 9000, console at 9001)

Default credentials in `.env`:
- DB: root / (no password) / database: medical
- RabbitMQ: admin / admin
- MinIO: minioadmin / minioadmin

## GraphQL Playground

Access at `http://localhost:3001/graphql` when server is running.

## Postman Collection

See `README.md` for Postman collection documentation of auth module endpoints.

## Key Conventions

- DTOs use `class-validator` and `class-transformer`
- All dates are handled with TypeORM's `CreateDateColumn` / `UpdateDateColumn`
- UUIDs are used for primary keys (`@PrimaryGeneratedColumn('uuid')`)
- Soft deletes not implemented; use `isActive` boolean flags
- File uploads use Multer with memory storage (10MB limit)
- CORS is wide open (`origin: '*'`) - restrict in production
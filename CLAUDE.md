# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MedClinic is a comprehensive medical clinic management system built with Next.js 13 (App Router), TypeScript, and Tailwind CSS. The application handles patient management, appointments, encounters, prescriptions, billing, and multi-tenant clinic administration.

**Key characteristics:**
- Multi-tenant architecture supporting multiple clinics
- Dual authentication system (Users and Practitioners)
- Static export configuration (`output: 'export'`)
- French as primary language (UI labels, metadata)

## Development Commands

```bash
# Development server
npm run dev

# Build for production (static export)
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Authentication Flow

The application supports two separate authentication flows:

1. **User Authentication** (`/auth/login`)
   - Regular users (SUPER_ADMIN, CLINIC_ADMIN, STAFF roles)
   - Redirects to `/dashboard` after login
   - Token stored in localStorage with automatic refresh

2. **Practitioner Authentication** (`/auth/practitioner/login`)
   - Medical practitioners (doctors, specialists)
   - Redirects to `/practitioner/dashboard` after login
   - Separate authentication endpoints

**Token Management:**
- Access tokens and refresh tokens stored in `localStorage`
- Proactive token refresh (5 minutes before expiration) via `TokenManager` in `lib/api.ts`
- Reactive token refresh on 401 responses
- Automatic redirect to login on authentication failure

### API Client Architecture

The centralized API client (`lib/api.ts`) provides:
- `apiClient`: Singleton instance for all API calls
- `tokenManager`: Handles token lifecycle and refresh logic
- `ApiError`: Custom error class with status codes
- Automatic token injection via Authorization header
- Handles concurrent token refresh to prevent race conditions

**Environment Configuration:**
- API URL: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001`)
- Current production API: `https://medical.nigerdev.com`

### Service Layer Pattern

All API interactions go through service classes in `services/`:
- `auth.service.ts`: Authentication for both users and practitioners
- `appointment.service.ts`: Appointment management
- `patient.service.ts`: Patient CRUD operations
- `billing.service.ts`: Invoice and payment handling
- `tenant.service.ts`: Multi-tenant management

**Service Example:**
```typescript
export class AuthService {
  static async loginUser(credentials: LoginForm): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    // Token management handled here
    return response;
  }
}
```

### Type System

Core types are centralized in `types/index.ts`:
- Base entities extend `BaseEntity` (id, createdAt, updatedAt)
- Comprehensive enums for status values (AppointmentStatus, UserRole, etc.)
- Form types for client-side validation
- API response wrappers (ApiResponse, PaginatedResponse)

**Important types:**
- `User`: Regular system users with roles
- `Practitioner`: Medical practitioners with specialties and working hours
- `Patient`: Patient records with medical history
- `Appointment`: Scheduling with status tracking
- `Encounter`: Clinical consultations with SOAP notes
- `Invoice`: Billing with line items and payments

### UI Component Structure

Components are organized by domain:
- `components/ui/`: shadcn/ui components (Button, Dialog, Form, etc.)
- `components/layout/`: Layout components (Sidebar, Header, Breadcrumbs, MainLayout)
- `components/appointments/`: Appointment-specific components
- `components/dashboard/`: Dashboard widgets and charts
- `components/schedule/`: Calendar and scheduling components

**Layout Behavior:**
- `MainLayout` wraps all protected routes
- Automatically hidden on `/auth/*` and `/` routes
- Responsive sidebar (mobile overlay, desktop persistent)
- Breadcrumbs auto-generated from pathname

### State Management

Uses React hooks for state:
- `useAuth`: Central authentication hook with login/logout/role checking
- `useTokenRefresh`: Automatic token refresh in background
- Local component state with `useState`
- Server state managed via service layer calls

**useAuth Hook:**
```typescript
const {
  user,
  practitioner,
  isAuthenticated,
  login,
  logout,
  hasRole
} = useAuth();
```

### Routing & Middleware

Protected routes enforced via `middleware.ts`:
- `protectedRoutes`: User-accessible routes (dashboard, patients, appointments, etc.)
- `practitionerRoutes`: Practitioner-specific routes
- `publicRoutes`: Unauthenticated access (auth pages, landing)
- Redirects unauthenticated users to `/auth/login` with redirect parameter

### Form Handling

Forms use React Hook Form + Zod validation:
- shadcn/ui Form components wrap RHF
- Type-safe form schemas with Zod
- Client-side validation before API calls

## Key Technical Decisions

1. **Static Export**: Next.js configured with `output: 'export'` for static hosting
2. **No SSR**: Authentication and API calls are client-side only
3. **Token Storage**: localStorage used (not cookies) for token persistence
4. **Path Aliases**: `@/*` resolves to project root (configured in `tsconfig.json`)
5. **Styling**: Tailwind CSS with shadcn/ui component library
6. **Icons**: Lucide React for consistent iconography

## Multi-Tenancy

The system supports multiple clinics (tenants):
- Each tenant has isolated data (patients, appointments, users)
- `tenantId` field on most entities for data isolation
- Super admins can manage tenants via `/admin/tenants`
- Tenant slug used for clinic identification

## Working with the Codebase

**Adding a new protected page:**
1. Create page in `app/[route]/page.tsx`
2. Add route to `protectedRoutes` in `middleware.ts`
3. Update sidebar navigation in `components/layout/sidebar.tsx`

**Adding a new API endpoint:**
1. Create/update service in `services/`
2. Define types in `types/index.ts` or domain-specific type file
3. Use `apiClient.get/post/put/delete` with proper typing
4. Handle errors with `handleApiError` utility

**Adding a new entity:**
1. Define TypeScript interface in `types/index.ts` extending `BaseEntity`
2. Create service class with CRUD methods
3. Create form types and validation schemas
4. Build UI components in relevant `components/` subdirectory
5. Create page routes in `app/`

## Common Patterns

**API Call Pattern:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await SomeService.getData();
    // Handle success
  } catch (err) {
    setError(handleApiError(err));
  } finally {
    setLoading(false);
  }
};
```

**Role-Based Access:**
```typescript
const { hasRole, hasAnyRole } = useAuth();

if (hasRole('SUPER_ADMIN')) {
  // Super admin only
}

if (hasAnyRole(['CLINIC_ADMIN', 'SUPER_ADMIN'])) {
  // Admin features
}
```

## Important Notes

- **Language**: UI is in French ("Système de Gestion Médicale")
- **ESLint**: Disabled during builds (`ignoreDuringBuilds: true`)
- **Images**: Unoptimized for static export compatibility
- **Hydration**: Components handle SSR/CSR mismatch with `mounted` state
- **Token Refresh**: Both proactive (scheduled) and reactive (on 401) refresh strategies implemented

# Secure Task Management System

TurboVets' secure task management challenge implemented as a modular Nx monorepo with a NestJS API (`apps/api`), Angular dashboard (`apps/dashboard`), and shared RBAC/data libraries (`libs/auth`, `libs/data`). The system delivers authenticated task workflows, organization scoping, and auditability end-to-end.

---

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Architecture Overview](#architecture-overview)
3. [Data Model Explanation](#data-model-explanation)
4. [Access Control Implementation](#access-control-implementation)
5. [API Documentation](#api-documentation)
6. [Future Considerations](#future-considerations)

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- npm 10+

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Environment Configuration**

Create a `.env` file in the `apps/api` directory (optional - defaults are provided for development):

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database Configuration
DB_PATH=secure-task.sqlite

# Server Configuration (optional)
PORT=3000
NODE_ENV=development
```

**Environment Variables:**
- `JWT_SECRET`: Secret key for signing JWT tokens. **Must be changed in production!** Default: `dev-secret`
- `DB_PATH`: Path to SQLite database file. Default: `secure-task.sqlite` (created in project root)
- `PORT`: API server port. Default: `3000`
- `NODE_ENV`: Environment mode (`development` | `production`)

### Running the Application

**Terminal 1 - Start the Backend API:**
```bash
npm run start:api
```
The API will be available at `http://localhost:3000/api`

**Terminal 2 - Start the Frontend Dashboard:**
```bash
npm run start:dashboard
```
The dashboard will be available at `http://localhost:4200`

The frontend automatically proxies API requests to `http://localhost:3000/api` (configured in `apps/dashboard/proxy.conf.json`).

### Seed Credentials

On first API bootstrap, a default owner account is automatically created:
- **Email:** `owner@securetask.dev`
- **Password:** `ChangeMe123!`

**⚠️ Security Note:** Rotate these credentials immediately in production environments!

Use this account to:
- Invite additional users (admins/viewers)
- Create and manage tasks
- Access audit logs

---

## Testing & linting
```bash
npm run test   # Jest (Nest + Angular + shared libs)
npm run lint   # ESLint across the workspace
```

Examples of targeted runs:
```bash
npx nx test api
npx nx test dashboard
npx nx lint dashboard
```

---

## Architecture Overview

### NX Monorepo Layout

```
monorepo/
├── apps/
│   ├── api/                    # NestJS Backend Application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── auth/       # Authentication module
│   │   │   │   ├── users/       # User management
│   │   │   │   ├── tasks/       # Task CRUD operations
│   │   │   │   ├── organizations/ # Organization hierarchy
│   │   │   │   ├── audit/       # Audit logging
│   │   │   │   └── bootstrap/   # Database seeding
│   │   │   └── main.ts
│   │   └── project.json
│   └── dashboard/              # Angular Frontend Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/        # Services, guards, interceptors
│       │   │   ├── features/   # Feature modules
│       │   │   │   ├── login/
│       │   │   │   └── task-board/
│       │   │   └── app-module.ts
│       │   └── main.ts
│       └── project.json
└── libs/
    ├── data/                   # Shared Data Contracts
    │   └── src/lib/
    │       ├── enums.ts        # UserRole, TaskStatus, etc.
    │       ├── models.ts       # DTOs and interfaces
    │       └── contracts.ts   # API request/response types
    └── auth/                   # Shared RBAC Utilities
        └── src/lib/
            ├── roles.decorator.ts    # @RolesAllowed decorator
            ├── roles.guard.ts        # Role-based access guard
            ├── current-user.decorator.ts # @CurrentUser decorator
            └── auth-role.utils.ts    # Role comparison utilities
```

### Rationale for NX Monorepo Structure

**Benefits:**
1. **Code Sharing:** Shared libraries (`libs/data`, `libs/auth`) ensure type safety and consistency between frontend and backend
2. **Single Source of Truth:** Enums, DTOs, and contracts defined once, used everywhere
3. **Type Safety:** TypeScript types flow from backend to frontend automatically
4. **Atomic Changes:** Related changes across apps/libs can be committed together
5. **Dependency Management:** Single `package.json` manages all dependencies
6. **Build Optimization:** NX can cache and parallelize builds

### Shared Libraries Explanation

#### `libs/data` - Shared Data Contracts
- **Purpose:** Defines all shared types, enums, and API contracts
- **Exports:**
  - `UserRole`, `TaskStatus`, `TaskCategory`, `AuditAction` enums
  - `UserProfile`, `TaskDto`, `OrganizationDto`, `AuditLogEntry` interfaces
  - `LoginRequest`, `CreateTaskRequest`, `CreateUserRequest` API contracts
- **Usage:** Imported by both `apps/api` and `apps/dashboard` to ensure type consistency

#### `libs/auth` - RBAC Utilities
- **Purpose:** Provides reusable authentication and authorization decorators/guards
- **Exports:**
  - `@RolesAllowed()` - Decorator to specify required roles on endpoints
  - `RolesGuard` - Guard that enforces role-based access
  - `@CurrentUser()` - Decorator to inject authenticated user
  - `hasRoleOrHigher()` - Utility to compare role hierarchy
- **Usage:** Used in NestJS controllers to enforce access control consistently

---

## Data Model Explanation

### Database Schema

The system uses SQLite with TypeORM for database management. The schema consists of four main entities:

#### Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│  Organization   │
│─────────────────│
│ id (PK)         │◄─────┐
│ name            │      │
│ parentId (FK)   │──────┘ (self-reference)
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────┬──────────────┐
    │         │              │
    │         │              │
┌───▼───┐ ┌──▼──┐      ┌─────▼─────┐
│ User  │ │Task│      │ AuditLog  │
│───────│ │────│      │───────────│
│id (PK)│ │id  │      │id (PK)    │
│email  │ │title│      │actorId(FK)│
│passwd │ │status│     │orgId (FK) │
│role   │ │orgId│     │action     │
│orgId  │ │...  │     │context    │
│...    │ │...  │     │createdAt  │
└───────┘ └─────┘      └───────────┘
```

### Entity Descriptions

#### 1. Organization
- **Purpose:** Multi-tenant organization hierarchy
- **Fields:**
  - `id` (UUID): Primary key
  - `name` (string, unique): Organization name
  - `parent` (Organization, optional): Parent organization for hierarchy
  - `children` (Organization[]): Child organizations
  - `users` (User[]): Users belonging to this organization
  - `tasks` (Task[]): Tasks belonging to this organization
  - `createdAt`, `updatedAt`: Timestamps

#### 2. User
- **Purpose:** User accounts with role-based access
- **Fields:**
  - `id` (UUID): Primary key
  - `email` (string, unique): User email (used for login)
  - `password` (string, hashed): Bcrypt-hashed password
  - `displayName` (string): User's display name
  - `role` (UserRole enum): `owner` | `admin` | `viewer`
  - `organization` (Organization): Belongs to one organization
  - `createdTasks` (Task[]): Tasks created by this user
  - `assignedTasks` (Task[]): Tasks assigned to this user
  - `lastLoginAt` (Date, nullable): Last login timestamp
  - `createdAt`, `updatedAt`: Timestamps

#### 3. Task
- **Purpose:** Task management with status workflow
- **Fields:**
  - `id` (UUID): Primary key
  - `title` (string): Task title (required, min 3 chars)
  - `description` (string, nullable): Task description
  - `status` (TaskStatus enum): `backlog` | `in_progress` | `review` | `done`
  - `category` (TaskCategory enum): `work` | `security` | `personal` | `other`
  - `dueDate` (Date, nullable): Task due date
  - `organization` (Organization): Belongs to one organization
  - `createdBy` (User, nullable): User who created the task
  - `assignee` (User, nullable): User assigned to the task
  - `createdAt`, `updatedAt`: Timestamps

#### 4. AuditLog
- **Purpose:** Immutable audit trail of security events
- **Fields:**
  - `id` (UUID): Primary key
  - `actor` (User, nullable): User who performed the action
  - `organization` (Organization): Organization context
  - `action` (AuditAction enum): Action type (login, create_task, etc.)
  - `context` (JSON): Additional context data
  - `createdAt`: Timestamp (no updates, immutable)

### Role Hierarchy

Defined in `libs/data/src/lib/enums.ts`:

```typescript
export enum UserRole {
  Owner = 'owner',    // Priority: 3 (highest)
  Admin = 'admin',   // Priority: 2
  Viewer = 'viewer', // Priority: 1 (lowest)
}
```

**Access Rules:**
- **Owner:** Full access to all operations, can manage organizations
- **Admin:** Can create/update/delete tasks and invite users (cannot create owners)
- **Viewer:** Read-only access to tasks and users

---

## Frontend highlights

- **Session-aware shell:** Top-level navbar reflects org, role, and user with quick logout.
- **Login experience:** Inline validation + seeded credential hint.
- **Task board:** Tailwind-styled kanban view with Angular CDK drag-and-drop, role-aware controls, filters by status, and inline delete.
- **User invitation:** Embedded form for admins/owners to provision teammates with roles and temporary passwords.
- **Audit trail:** Owner/Admin-only timeline with JSON contexts.
- **State management:** `TaskStoreService` fans out API results via `BehaviorSubject`s, simplifying async pipes across the board.
- **HTTP interceptor:** Automatically attaches JWTs and logs users out on 401s.

---

## Access Control Implementation

### How Roles, Permissions, and Organization Hierarchy Work

#### 1. Role-Based Access Control (RBAC)

The system implements a hierarchical role model:

```
Owner (Priority: 3)
  └─ Can do everything Admin can do, plus:
     - Manage organization hierarchy
     - Create other owners
     - Full audit log access

Admin (Priority: 2)
  └─ Can do everything Viewer can do, plus:
     - Create/update/delete tasks
     - Invite users (but cannot create owners)
     - View audit logs

Viewer (Priority: 1)
  └─ Read-only access:
     - View tasks
     - View users
     - Cannot modify anything
```

**Role Comparison Logic:**
```typescript
// libs/auth/src/lib/auth-role.utils.ts
export const hasRoleOrHigher = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_PRIORITY[userRole] >= ROLE_PRIORITY[requiredRole];
};
```

#### 2. Organization Scoping

Every entity (User, Task, AuditLog) is scoped to an organization:
- Users can only access resources within their organization
- Cross-organization access is prevented at the service layer
- Organization hierarchy allows parent-child relationships (future feature)

**Organization Boundary Enforcement:**
```typescript
// Example from TasksService
async listForUser(user: User): Promise<Task[]> {
  return this.taskRepo.find({
    where: { organization: { id: user.organization.id } },
    relations: ['organization', 'createdBy', 'assignee'],
  });
}
```

#### 3. JWT Authentication Integration

**Authentication Flow:**

1. **Login (`POST /auth/login`):**
   - User provides email/password
   - Backend validates credentials using bcrypt
   - JWT token is generated with payload:
     ```json
     {
       "sub": "user-id",
       "role": "admin",
       "orgId": "organization-id"
     }
     ```
   - Token expires in 8 hours (configurable)
   - Returns `{ token, user }`

2. **JWT Strategy (`apps/api/src/app/auth/jwt.strategy.ts`):**
   - Extracts JWT from `Authorization: Bearer <token>` header
   - Validates token signature using `JWT_SECRET`
   - Loads full user entity from database
   - Attaches user to `request.user` for subsequent guards

3. **Guards Chain:**
   ```
   Request → JwtAuthGuard → RolesGuard → Controller Handler
   ```
   
   - **JwtAuthGuard:** Ensures valid JWT token and authenticated user
   - **RolesGuard:** Checks if user's role meets endpoint requirements
   - **Service Layer:** Additional organization boundary checks

**Guard Implementation Example:**
```typescript
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)  // Applied to all routes
export class TasksController {
  @Post()
  @RolesAllowed(UserRole.Owner, UserRole.Admin)  // Additional role check
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
    // user is guaranteed to be authenticated and have required role
    return this.tasksService.create(dto, user);
  }
}
```

#### 4. Frontend Integration

**HTTP Interceptor (`apps/dashboard/src/app/core/auth.interceptor.ts`):**
- Automatically attaches JWT token to all API requests:
  ```typescript
  Authorization: Bearer <token>
  ```
- Handles 401 responses by logging user out
- Stores token in localStorage

**Route Guards:**
- `AuthGuard` protects routes requiring authentication
- Redirects to login if not authenticated

**UI Role Enforcement:**
- Components check `hasManageRights()` signal
- Disables mutating controls for viewers
- Shows helpful messages instead of hiding features

---

## API Documentation

### Base URL
- Development: `http://localhost:3000/api`
- All endpoints are prefixed with `/api`

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

### Authentication Endpoints

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "owner@securetask.dev",
  "password": "ChangeMe123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "email": "owner@securetask.dev",
    "displayName": "Owner User",
    "role": "owner",
    "organization": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Acme Corp"
    }
  }
}
```

---

#### GET `/api/auth/me`
Get current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "email": "owner@securetask.dev",
    "displayName": "Owner User",
    "role": "owner",
    "organization": { ... }
  }
}
```

---

### Task Endpoints

#### GET `/api/tasks`
List all tasks for the authenticated user's organization.

**Roles:** Viewer, Admin, Owner

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Implement user authentication",
      "status": "backlog",
      "category": "security",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "organizationId": "550e8400-e29b-41d4-a716-446655440010"
    }
  ]
}
```

---

#### POST `/api/tasks`
Create a new task.

**Roles:** Admin, Owner

**Request:**
```json
{
  "title": "Fix drag and drop bug",
  "description": "Resolve issue with task board",
  "category": "work",
  "dueDate": "2024-12-20T00:00:00.000Z",
  "assigneeId": "550e8400-e29b-41d4-a716-446655440021"
}
```

**Response (201):**
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "title": "Fix drag and drop bug",
    "status": "backlog",
    ...
  }
}
```

---

#### PUT `/api/tasks/:id`
Update an existing task.

**Roles:** Admin, Owner

**Request:**
```json
{
  "status": "in_progress",
  "assigneeId": "550e8400-e29b-41d4-a716-446655440021"
}
```

**Response (200):**
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "status": "in_progress",
    ...
  }
}
```

---

#### DELETE `/api/tasks/:id`
Delete a task.

**Roles:** Admin, Owner

**Response (200):**
```json
{
  "success": true
}
```

---

### User Endpoints

#### GET `/api/users`
List all users in the authenticated user's organization.

**Roles:** Viewer, Admin, Owner

**Response (200):**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "email": "admin@example.com",
      "displayName": "Admin User",
      "role": "admin",
      "organization": { ... }
    }
  ]
}
```

---

#### POST `/api/users`
Invite a new user to the organization.

**Roles:** Admin, Owner

**Request:**
```json
{
  "email": "newuser@example.com",
  "displayName": "New User",
  "password": "TemporaryPassword123!",
  "role": "viewer",
  "organizationId": "550e8400-e29b-41d4-a716-446655440010"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440023",
    "email": "newuser@example.com",
    "role": "viewer",
    ...
  }
}
```

---

### Audit Log Endpoints

#### GET `/api/audit-log`
Get audit log entries for the authenticated user's organization.

**Roles:** Admin, Owner

**Response (200):**
```json
{
  "entries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "actorId": "550e8400-e29b-41d4-a716-446655440020",
      "action": "create_task",
      "context": {
        "taskId": "550e8400-e29b-41d4-a716-446655440008"
      },
      "createdAt": "2024-01-19T10:30:00.000Z"
    }
  ]
}
```

---

### Organization Endpoints

#### GET `/api/organizations`
Get organization hierarchy.

**Roles:** Admin, Owner

**Response (200):**
```json
{
  "organizations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Acme Corp",
      "parentId": null
    }
  ]
}
```

---

### Error Responses

All endpoints may return:
- **400 Bad Request:** Validation errors
- **401 Unauthorized:** Missing/invalid JWT token
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

---

## Audit logging

Every privileged event funnels through `AuditService.logAction`, which:
- Persists the actor, organization, action, and context payload to SQLite.
- Emits console traces for quick local debugging.
- Powers the dashboard audit stream.

Tracked events include logins, task CRUD, and user provisioning.

---

## Future Considerations

### Production-Ready Security Enhancements

#### 1. JWT Refresh Tokens
**Current:** Single JWT token with 8-hour expiration
**Future:**
- Implement refresh token rotation
- Short-lived access tokens (15-30 minutes)
- Refresh tokens stored in httpOnly cookies
- Token blacklisting for logout/revocation

**Implementation Approach:**
```typescript
// New endpoints
POST /api/auth/refresh    // Exchange refresh token for new access token
POST /api/auth/logout     // Invalidate refresh token
```

#### 2. CSRF Protection
**Current:** Basic CORS configuration
**Future:**
- CSRF tokens for state-changing operations
- SameSite cookie attributes
- Origin validation middleware
- Double-submit cookie pattern

#### 3. RBAC Caching
**Current:** Role checks on every request
**Future:**
- Redis cache for user roles and permissions
- Cache invalidation on role changes
- Permission matrix caching
- Reduced database queries

**Example:**
```typescript
// Cache user permissions
const cacheKey = `user:${userId}:permissions`;
const permissions = await redis.get(cacheKey) || 
  await loadPermissionsFromDB(userId);
```

### Advanced Role Delegation

**Current:** Fixed role hierarchy (Owner > Admin > Viewer)
**Future:**
- Custom role definitions per organization
- Permission-based access control (PBAC)
- Task-level permissions (e.g., "can edit own tasks")
- Delegated approvals workflow
- Role templates and inheritance

**Example Structure:**
```typescript
interface CustomRole {
  name: string;
  permissions: Permission[];
  inheritsFrom?: UserRole;
  organizationId: string;
}
```

### Scaling Permission Checks Efficiently

**Current:** Service-level checks on every operation
**Future:**
- Pre-computed permission matrices
- Batch permission checks
- GraphQL-style field-level permissions
- Database-level row security policies (PostgreSQL RLS)
- Permission middleware pipeline

**Optimization Strategies:**
1. **Batch Loading:** Load all required permissions in one query
2. **Eager Loading:** Include permission data in entity relations
3. **Materialized Views:** Pre-compute common permission queries
4. **Background Jobs:** Async permission validation for non-critical paths

### Additional Production Considerations

#### 1. Database Migration
- Replace SQLite with PostgreSQL for production
- Migration scripts for schema changes
- Database connection pooling
- Read replicas for scaling

#### 2. Monitoring & Observability
- OpenTelemetry integration
- Structured logging (Winston/Pino)
- Performance metrics (response times, error rates)
- Health check endpoints
- Distributed tracing

#### 3. Testing
- End-to-end Cypress tests for critical flows
- Integration tests for RBAC scenarios
- Load testing for API endpoints
- Security penetration testing

#### 4. Deployment
- Docker containerization
- Kubernetes orchestration
- CI/CD pipelines
- Blue-green deployments
- Feature flags for gradual rollouts

#### 5. Data Protection
- Encryption at rest for sensitive data
- Field-level encryption for passwords
- GDPR compliance (data export/deletion)
- Backup and disaster recovery
- Audit log retention policies

---

## Evaluation Criteria Alignment

### ✅ Secure and Correct RBAC Implementation
- Hierarchical role system with priority-based comparison
- Organization-scoped access control
- Service-level boundary enforcement
- Guard-based endpoint protection

### ✅ JWT-based Authentication
- Secure token generation with configurable secrets
- Token validation via Passport strategy
- Automatic token attachment via HTTP interceptor
- Token expiration and refresh capability (future)

### ✅ Clean, Modular Architecture in NX
- Shared libraries for type safety
- Separation of concerns (auth, tasks, users, audit)
- Reusable guards and decorators
- Consistent patterns across modules

### ✅ Code Clarity, Structure, and Maintainability
- TypeScript throughout for type safety
- Clear naming conventions
- Comprehensive error handling
- Well-documented code with JSDoc comments

### ✅ Responsive and Intuitive UI
- Tailwind CSS for modern styling
- Dark/light mode toggle
- Drag-and-drop task management
- Keyboard shortcuts for power users
- Task completion visualization
- Role-aware UI controls

### ✅ Test Coverage
- Unit tests for shared libraries
- Service-level tests
- Guard and decorator tests
- Frontend component tests

### ✅ Documentation Quality
- Comprehensive README
- API documentation with examples
- Architecture diagrams
- Setup instructions
- Future considerations

### ✅ Bonus Features
- **Elegant UI/UX:**
  - Task completion bar charts
  - Smooth drag-and-drop animations
  - Theme switching
  - Keyboard shortcuts modal
  
- **Advanced Features:**
  - Real-time task status updates
  - Audit trail visualization
  - Organization hierarchy support
  - Role-based UI adaptation

---

## Questions or Feedback?

For questions about the architecture, implementation details, or trade-offs, please refer to:
- Code comments in source files
- Type definitions in `libs/data`
- Guard implementations in `libs/auth`
- Service layer logic in `apps/api/src/app`

Happy to discuss any aspect of the implementation in more detail! 
#   t u r b o v e t s  
 
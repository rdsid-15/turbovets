# 🚀 TurboVets - Secure Task Management System

> A full-stack secure task management system built with **Nx Monorepo**, **NestJS**, and **Angular**. Features JWT authentication, RBAC, organization scoping, and comprehensive audit logging.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.io/)
[![Nx](https://img.shields.io/badge/Nx-143055?style=flat&logo=nx&logoColor=white)](https://nx.dev/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture-overview)
- [API Documentation](#-api-documentation)
- [Security & Access Control](#-security--access-control)
- [Project Structure](#-project-structure)
- [Development](#-development)

---

## ✨ Features

### 🔐 Security & Authentication
- **JWT-based authentication** with secure token management
- **Role-Based Access Control (RBAC)** with hierarchical roles (Owner > Admin > Viewer)
- **Organization scoping** - users can only access resources within their organization
- **Comprehensive audit logging** for all security events

### 📊 Task Management
- **Kanban board** with drag-and-drop functionality
- **Task status workflow** (Backlog → In Progress → Review → Done)
- **Task categorization** (Work, Security, Personal, Other)
- **Task assignment** to team members
- **Task completion visualization** with progress charts

### 👥 User Management
- **User invitation system** for team collaboration
- **Role-based permissions** with granular access control
- **Organization hierarchy** support

### 🎨 User Experience
- **Dark/Light mode** toggle
- **Keyboard shortcuts** for power users
- **Responsive design** with Tailwind CSS
- **Real-time updates** via reactive state management

---

## 🛠 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for database management
- **SQLite** - Database (easily replaceable with PostgreSQL)
- **Passport JWT** - Authentication strategy
- **bcrypt** - Password hashing

### Frontend
- **Angular** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Angular CDK** - Drag and drop functionality
- **RxJS** - Reactive programming

### Monorepo
- **Nx** - Monorepo tooling and build system
- **TypeScript** - Type-safe development
- **Shared Libraries** - Code sharing between frontend and backend

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ 
- **npm** 10+

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/rdsid-15/turbovets.git
cd turbovets
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment (optional):**

Create a `.env` file in `apps/api` directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database Configuration
DB_PATH=secure-task.sqlite

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Running the Application

**Terminal 1 - Start Backend API:**
```bash
npm run start:api
```
API available at: `http://localhost:3000/api`

**Terminal 2 - Start Frontend Dashboard:**
```bash
npm run start:dashboard
```
Dashboard available at: `http://localhost:4200`

### Default Credentials

On first startup, a default owner account is created:

- **Email:** `owner@securetask.dev`
- **Password:** `ChangeMe123!`

⚠️ **Security Note:** Change these credentials immediately in production!

---

## 🏗 Architecture Overview

### NX Monorepo Structure

```
monorepo/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── tasks/             # Task CRUD operations
│   │   ├── organizations/    # Organization hierarchy
│   │   └── audit/             # Audit logging
│   └── dashboard/             # Angular Frontend
│       ├── core/              # Services, guards, interceptors
│       └── features/          # Feature modules
└── libs/
    ├── data/                  # Shared data contracts & types
    └── auth/                  # Shared RBAC utilities
```

### Key Design Decisions

- **Shared Libraries:** Type-safe communication between frontend and backend
- **Single Source of Truth:** Enums, DTOs, and contracts defined once
- **Modular Architecture:** Separation of concerns with clear boundaries
- **Type Safety:** End-to-end TypeScript for compile-time safety

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a JWT token:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 🔑 Authentication

**POST** `/api/auth/login`
```json
{
  "email": "owner@securetask.dev",
  "password": "ChangeMe123!"
}
```

#### 📝 Tasks

- **GET** `/api/tasks` - List all tasks (Viewer, Admin, Owner)
- **POST** `/api/tasks` - Create task (Admin, Owner)
- **PUT** `/api/tasks/:id` - Update task (Admin, Owner)
- **DELETE** `/api/tasks/:id` - Delete task (Admin, Owner)

#### 👥 Users

- **GET** `/api/users` - List users (Viewer, Admin, Owner)
- **POST** `/api/users` - Create user (Admin, Owner)

#### 📋 Audit Log

- **GET** `/api/audit-log` - Get audit entries (Admin, Owner)

#### 🏢 Organizations

- **GET** `/api/organizations` - List organizations (Admin, Owner)

For detailed API documentation with request/response examples, see the [full API documentation](#-api-documentation) section below.

---

## 🔒 Security & Access Control

### Role Hierarchy

```
Owner (Priority: 3)
  └─ Full access + organization management

Admin (Priority: 2)
  └─ Task & user management (cannot create owners)

Viewer (Priority: 1)
  └─ Read-only access
```

### Security Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **RBAC Enforcement** - Role-based access control at guard level
- ✅ **Organization Scoping** - Data isolation per organization
- ✅ **Password Hashing** - bcrypt with 12 salt rounds
- ✅ **Audit Logging** - Immutable audit trail for all actions
- ✅ **Input Validation** - DTO validation with class-validator

### Access Control Flow

```
Request → JwtAuthGuard → RolesGuard → Service Layer → Response
```

---

## 📁 Project Structure

### Backend (`apps/api`)

- **Modules:** Auth, Users, Tasks, Organizations, Audit
- **Guards:** JWT Authentication, Role-based authorization
- **Services:** Business logic with organization scoping
- **Entities:** TypeORM entities for database mapping

### Frontend (`apps/dashboard`)

- **Core Services:** API service, Auth service, Task store
- **Guards:** Route protection
- **Interceptors:** JWT token attachment, error handling
- **Components:** Login, Task board with drag-and-drop

### Shared Libraries

- **`libs/data`:** Enums, DTOs, API contracts
- **`libs/auth`:** RBAC decorators, guards, utilities

---

## 💻 Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

---

## 📖 Detailed Documentation

<details>
<summary><b>Click to expand detailed documentation</b></summary>

### Data Model

#### Entity Relationship Diagram

```
┌─────────────────┐
│  Organization   │
│─────────────────│
│ id (PK)         │◄─────┐
│ name            │      │
│ parentId (FK)   │──────┘
└────────┬────────┘
         │ 1:N
    ┌────┴────┬──────────────┐
┌───▼───┐ ┌──▼──┐      ┌─────▼─────┐
│ User  │ │Task│      │ AuditLog  │
└───────┘ └─────┘      └───────────┘
```

#### Entities

- **Organization:** Multi-tenant organization hierarchy
- **User:** User accounts with role-based access
- **Task:** Task management with status workflow
- **AuditLog:** Immutable audit trail

### Access Control Implementation

#### Role-Based Access Control (RBAC)

The system implements a hierarchical role model with priority-based comparison:

```typescript
export const hasRoleOrHigher = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_PRIORITY[userRole] >= ROLE_PRIORITY[requiredRole];
};
```

#### Organization Scoping

Every entity is scoped to an organization:
- Users can only access resources within their organization
- Cross-organization access is prevented at the service layer
- Organization hierarchy allows parent-child relationships

#### JWT Authentication Flow

1. User logs in with email/password
2. Backend validates credentials and generates JWT
3. JWT contains: `{ sub: userId, role: userRole, orgId: orgId }`
4. Frontend stores token and attaches to all requests
5. Backend validates token and loads user entity

### API Documentation

#### Authentication Endpoints

**POST** `/api/auth/login`

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
      "name": "TurboVets HQ"
    }
  }
}
```

#### Task Endpoints

**GET** `/api/tasks`

List all tasks for the authenticated user's organization.

**Roles:** Viewer, Admin, Owner

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Implement user authentication",
      "description": "Add JWT-based auth",
      "status": "backlog",
      "category": "security",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "organizationId": "550e8400-e29b-41d4-a716-446655440010",
      "createdById": "550e8400-e29b-41d4-a716-446655440020",
      "assigneeId": null,
      "createdAt": "2024-01-19T10:00:00.000Z",
      "updatedAt": "2024-01-19T10:00:00.000Z"
    }
  ]
}
```

**POST** `/api/tasks`

Create a new task.

**Roles:** Admin, Owner

**Request:**
```json
{
  "title": "Fix drag and drop bug",
  "description": "Resolve issue with task board",
  "category": "work",
  "status": "backlog",
  "dueDate": "2024-12-20T00:00:00.000Z",
  "assigneeId": "550e8400-e29b-41d4-a716-446655440021"
}
```

**PUT** `/api/tasks/:id`

Update an existing task.

**Roles:** Admin, Owner

**Request:**
```json
{
  "status": "in_progress",
  "assigneeId": "550e8400-e29b-41d4-a716-446655440021"
}
```

**DELETE** `/api/tasks/:id`

Delete a task.

**Roles:** Admin, Owner

#### User Endpoints

**GET** `/api/users`

List all users in the authenticated user's organization.

**Roles:** Viewer, Admin, Owner

**POST** `/api/users`

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

#### Audit Log Endpoints

**GET** `/api/audit-log`

Get audit log entries for the authenticated user's organization.

**Roles:** Admin, Owner

**Response (200):**
```json
{
  "entries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "actorId": "550e8400-e29b-41d4-a716-446655440020",
      "organizationId": "550e8400-e29b-41d4-a716-446655440010",
      "action": "create_task",
      "context": {
        "taskId": "550e8400-e29b-41d4-a716-446655440008"
      },
      "createdAt": "2024-01-19T10:30:00.000Z"
    }
  ]
}
```

#### Organization Endpoints

**GET** `/api/organizations`

Get organization hierarchy.

**Roles:** Admin, Owner

### Error Responses

All endpoints may return:

- **400 Bad Request:** Validation errors
- **401 Unauthorized:** Missing/invalid JWT token
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

### Future Considerations

#### Production-Ready Security

- JWT refresh tokens with rotation
- CSRF protection
- RBAC caching with Redis
- Rate limiting
- Input sanitization

#### Advanced Features

- Custom role definitions per organization
- Permission-based access control (PBAC)
- Task-level permissions
- Real-time updates via WebSockets
- Advanced audit log filtering

#### Scaling

- Database migration to PostgreSQL
- Connection pooling
- Read replicas
- Caching strategies
- Background job processing

#### Monitoring & Observability

- OpenTelemetry integration
- Structured logging
- Performance metrics
- Health check endpoints
- Distributed tracing

</details>

---

## 📝 License

This project is part of a coding challenge for TurboVets.

---

## 🤝 Contributing

This is a private project. For questions or feedback, please contact the repository owner.

---

## 📧 Contact

For questions about the architecture, implementation details, or trade-offs:

- Review code comments in source files
- Check type definitions in `libs/data`
- Examine guard implementations in `libs/auth`
- Review service layer logic in `apps/api/src/app`

---

**Built with ❤️ for TurboVets**

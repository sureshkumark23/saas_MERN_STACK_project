# mern-saas-workspace

A production-structured **Multi-Tenant Workspace & Task Management Platform** built with **MongoDB + Express + React + Node.js (MERN) + TypeScript**.

Demonstrates enterprise-grade full-stack architecture patterns including aggressive frontend caching, centralized network interceptors, strict payload validation, optimistic UI updates, and true multi-tenant data isolation.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript (Vite) |
| Framework | Express (Backend) + React (Frontend) |
| ODM | Mongoose v8 |
| Database | MongoDB 7 |
| Validation | Zod |
| State & Caching | TanStack React Query v5 |
| UI & Styling | Tailwind CSS + Shadcn UI |
| Auth | JWT (Access Tokens) |

---

## Domain

**Workspace & Project Management Platform** — an Asana/Trello-inspired full-stack application covering user authentication, isolated workspaces (tenants), projects, kanban-style tasks, threaded comments, and team management via email invitations.

---

## Features

- **True Multi-Tenancy** — Users can create, manage, and seamlessly switch between isolated data silos (workspaces) using a single account
- **JWT Authentication & Recovery** — Secure auth flow with access tokens, password hashing, and forgot-password reset flows via secure email links powered by `Nodemailer`
- **Zod-Validated Requests** — Request bodies and parameters are parsed in middleware using strict Zod schemas before ever reaching the controller or database
- **Optimistic UI Updates** — Drag-and-drop Kanban board uses React Query's `onMutate` to instantly update the UI before the server responds, snapping back on failure
- **Centralized Network Layer** — Custom Axios interceptors automatically inject authorization headers and handle global 401 logouts
- **Cascading Deletes** — Deleting a workspace executes strict cascading cleanup, automatically purging all associated projects, tasks, and user linkages to prevent orphaned records
- **Role-Based Access Control (RBAC)** — Granular permissions (`owner`, `admin`, `member`) where destructive actions are protected by strict role guards

---

## Enterprise Patterns Coverage

Every layer demonstrates production-ready patterns:

**Frontend State Management**
`useQuery` for aggressive caching, `useMutation` with `invalidateQueries` for background refreshing, and cache manipulation for optimistic drag-and-drop

**Backend Middleware**
Reusable `validate(schema)` guard to reject malformed data before it reaches the controller, stateless `authMiddleware` for verifying JWTs

**Mongoose Features**
Relational references (`ObjectId`), `populate()` queries, dynamic filters (fetching tasks by active `tenantId`), and multi-model cascading deletes using `deleteMany`

**UI/UX**
Fully responsive, accessible components using Radix UI primitives (via Shadcn) with seamless Light/Dark mode transitions

---

## Project Structure

```
mern-saas-workspace/
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   └── validateMiddleware.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Tenant.ts
│   │   ├── Project.ts
│   │   └── Task.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── workspaces.ts
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   ├── team.ts
│   │   └── dashboard.ts
│   ├── .env.example
│   └── server.ts
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/                   # Shadcn UI primitives
    │   │   ├── AppLayout.tsx         # Main dashboard shell
    │   │   └── ProtectedRoute.tsx
    │   ├── context/
    │   │   └── WorkspaceContext.tsx  # Global multi-tenant state
    │   ├── lib/
    │   │   └── api.ts                # Axios config & interceptors
    │   ├── pages/
    │   │   ├── DashboardPage.tsx
    │   │   ├── ProjectsPage.tsx
    │   │   ├── TasksPage.tsx
    │   │   ├── TeamPage.tsx
    │   │   ├── SettingsPage.tsx
    │   │   └── auth/                 # Login, Register, Onboarding
    │   ├── App.tsx
    │   └── main.tsx
    ├── tailwind.config.ts
    ├── vite.config.ts
    └── package.json
```

---

## Data Model

```
User
 ├── role: 'owner' | 'admin' | 'member'
 ├── belongs to → [Tenant] (workspaces array)
 └── active workspace → Tenant (tenantId ref)

Tenant (Workspace)
 ├── has many → User (implicit via User.workspaces)
 └── has many → Project (cascade on delete)

Project
 ├── belongs to → Tenant
 └── has many → Task (cascade on delete)

Task
 ├── belongs to → Project
 ├── status: 'todo' | 'in-progress' | 'done'
 └── has many → Comment (embedded array)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or MongoDB Atlas)
- Gmail account with an App Password (for Nodemailer)

### 1. Configure the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` — the values you must set:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-random-secure-string
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
FRONTEND_URL=http://localhost:8080
```

Start the backend server:

```bash
npm run dev
```

### 2. Configure the Frontend

Open a new terminal window:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` to point to your backend:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

Application runs on `http://localhost:8080`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user & return JWT |
| POST | `/api/auth/login` | Authenticate user & return JWT |
| POST | `/api/auth/forgot-password` | Send password reset email via Nodemailer |
| PUT | `/api/auth/reset-password/:token` | Reset password via secure hash |
| PUT | `/api/auth/profile` | Update current user profile |
| PUT | `/api/auth/password` | Update current user password |

### Workspaces (Tenants)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/workspaces` | List all workspaces for current user |
| POST | `/api/workspaces` | Create new workspace |
| PUT | `/api/workspaces/switch/:id` | Switch active workspace (`tenantId`) |
| PUT | `/api/workspaces/:id` | Rename workspace (Owner only) |
| DELETE | `/api/workspaces/:id` | Delete workspace & cascade all data |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | List projects for active workspace |
| POST | `/api/projects` | Create project |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks (optional `?projectId=`) |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task status (Drag & Drop) |
| POST | `/api/tasks/:id/comments` | Add threaded comment to task |

### Team
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/team` | List all users in active workspace |
| POST | `/api/team/invite` | Send email invite to join workspace |

---

## Available Scripts

### Backend

| Script | Description |
|---|---|
| `npm run dev` | Start Express server with Nodemon hot-reload |
| `npm start` | Start production server |

### Frontend

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Compile TypeScript and build for production |
| `npm run preview` | Preview production build locally |
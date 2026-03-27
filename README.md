# 🚀 Enterprise SaaS Project Management Platform (MERN Stack)

A production-ready, multi-tenant Software as a Service (SaaS) application built with the MERN stack. This platform allows organizations to create isolated workspaces, manage projects and tasks, and collaborate with team members using Role-Based Access Control (RBAC).

Designed with enterprise-grade architecture, this project features robust backend payload validation, global frontend state caching, an automated network layer, and secure relational data management.

## ✨ Key Features

### 🏢 Multi-Tenant Architecture
* **Isolated Workspaces:** Users can create, switch, and manage multiple isolated workspaces (tenants) from a single account.
* **Cascading Deletes:** Deleting a workspace automatically performs a cascading cleanup, purging all associated projects, tasks, and team linkages to maintain strict data integrity and prevent orphaned documents.

### 🔐 Authentication & RBAC (Role-Based Access Control)
* **JWT Security:** Stateless authentication using JSON Web Tokens.
* **Granular Permissions:** Roles include `Owner`, `Admin`, and `Member`. Only Workspace Owners can execute destructive actions (e.g., deleting a workspace or renaming it).
* **Automated Email Invites:** Integrated with `Nodemailer` to send beautiful HTML email invitations to new team members and handle secure "Forgot Password" reset flows.

### ⚡ Advanced Frontend Architecture
* **React Query (TanStack):** Implemented aggressive data caching, background syncing, and optimistic UI updates (e.g., instant drag-and-drop task movement before server validation) to eliminate loading spinners and race conditions.
* **Centralized API Client:** Engineered an Axios Interceptor tollbooth that automatically injects Authorization headers and handles global 401 Unauthorized logouts, adhering strictly to DRY principles.
* **Modern UI/UX:** Built with React, Tailwind CSS, and Shadcn UI components featuring a fully responsive layout and seamless Light/Dark mode toggling.

### 🛡️ Secure Backend Operations
* **Strict Payload Validation:** Utilized **Zod** schema validation via Express middleware to strictly enforce data shapes, lengths, and formats *before* the request reaches the database controller.
* **Optimized MongoDB Queries:** Efficient Mongoose schemas utilizing `.populate()` and complex `$in` queries for relational data retrieval.

---

## 🛠️ Technology Stack

**Frontend:**
* React.js (Vite)
* TypeScript
* Tailwind CSS & Shadcn UI (Component Library)
* TanStack React Query (State Management & Caching)
* Axios (Network Layer & Interceptors)
* React Router DOM
* Lucide React (Icons)

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose (ODM)
* Zod (Schema Validation)
* JSON Web Tokens (JWT) & bcrypt.js (Cryptography)
* Nodemailer (Email Service Integration)

---

## ⚙️ Local Development Setup

Follow these steps to run the application locally.

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/saas-mern-stack.git
cd saas-mern-stack
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`

Create a `.env` file in the `backend` directory:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_character_google_app_password
FRONTEND_URL=http://localhost:8080
\`\`\`

Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
\`\`\`

Create a `.env` file in the `frontend` directory:
\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

---

## 📁 Project Structure Highlights

\`\`\`text
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT token verification
│   │   └── validateMiddleware.js  # Zod schema guard
│   ├── models/                    # Mongoose Schemas (User, Tenant, Project, Task)
│   ├── routes/                    # RESTful API Endpoints
│   └── server.js                  # Express initialization
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI elements (Shadcn, Layouts)
│   │   ├── context/               # Global Workspace Context Provider
│   │   ├── lib/
│   │   │   └── api.ts             # Axios Interceptor configuration
│   │   ├── pages/                 # Route-level components (Dashboard, Tasks, etc.)
│   │   └── App.tsx                # Routing and QueryClient wrapping
\`\`\`

---

## 💡 Future Roadmap
* Implement Stripe billing integration for tiered workspace subscriptions (Free, Pro, Enterprise).
* Add WebSocket (Socket.io) integration for live, multi-user real-time task collaboration.
* Implement advanced analytics charts using Recharts.

---
*Designed and built by [K.Suresh Kumar].*
# saas_MERN_STACK_project
🧩 Multi-Tenant Task Management SaaS (MERN Stack)

A full-stack multi-tenant SaaS application that enables teams to collaborate using workspaces, projects, and tasks with role-based access, activity tracking, and notifications.

Built with MongoDB, Express.js, React, and Node.js (MERN).

🚀 Features
🔐 Authentication & Authorization

JWT-based authentication

Role-based access control (Workspace Owner & Members)

Secure protected routes (backend + frontend)

🏢 Workspaces (Multi-Tenancy)

Create and manage multiple workspaces

Workspace owner has admin privileges

Invite users to workspaces via email

Members can access only assigned workspaces

📁 Projects

Create projects under a workspace

Only workspace members can access projects

Project-level task segregation

✅ Task Management

Create, update, and delete tasks

Task status workflow: Todo → In Progress → Completed

Assign tasks to workspace members

Only workspace owner can delete tasks

🔔 Notifications

User invitation notifications

Task assignment notifications

Task status update notifications

Mark notifications as read

📜 Activity Feed (Audit Logs)

Track all important actions:

Workspace creation

Project creation

Task creation, updates, deletion

User invitations

Paginated activity feed per workspace

🧱 Architecture Highlights

RESTful APIs with proper HTTP status codes

MongoDB relations using Mongoose

Pagination support (activities, notifications)

Clean separation of routes, controllers, and models

🛠 Tech Stack

Frontend

React

React Router

Axios

Backend

Node.js

Express.js

MongoDB + Mongoose

JWT Authentication

Other

REST APIs

Role-based access control

MVC architecture

📂 Project Structure
backend/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middlewares/
 ├── app.js
 └── server.js

frontend/
 ├── src/
 │   ├── pages/
 │   ├── services/
 │   ├── components/
 │   └── App.jsx

⚙️ Environment Variables

Create a .env file in the backend folder:

PORT=5010
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


⚠️ Never commit .env to GitHub

▶️ Run Locally
Backend
cd backend
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev

🧪 API Highlights

POST /api/auth/login

POST /api/workspaces

POST /api/workspaces/:id/invite

POST /api/projects/:projectId/tasks

GET /api/workspaces/:id/activities

GET /api/notifications

📌 Current Status

✅ Core features completed
🚧 UI polish & production deployment pending

🎯 Future Enhancements

Email notifications

File attachments in tasks

Workspace roles (Viewer / Editor)

Deployment with Docker & CI/CD

Improved UI with Tailwind / Material UI

👨‍💻 Author

Suresh Kumar
MERN Stack Developer
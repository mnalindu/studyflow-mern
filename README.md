# StudyFlow 🎓

### Smart Student Productivity System

**Your space to grow.**

StudyFlow is a student-focused productivity application that brings study planning, task management, focus tracking, notes, and progress insights into one place. Built with the **MERN stack**, it aims to help students organize their academic work and build consistent study habits.

**[🌐 Live Website](https://studyflow-mern.netlify.app/)** · **[💻 GitHub Repository](https://github.com/mnalindu/studyflow-mern)**

---

## ✨ Features

- **User authentication:** Email/password signup and login, secure sessions, and Google sign-in.
- **Task management:** Create, update, organize, and track study tasks and deadlines.
- **Notes:** Save and manage study notes in one workspace.
- **Focus sessions:** Track time spent studying and support focused work sessions.
- **Study insights:** View productivity information and study activity.
- **Study rooms:** Manage shared study spaces.
- **Notifications and reminders:** Keep track of important tasks and upcoming deadlines.
- **Responsive interface:** Designed for desktop and mobile screens.

> StudyFlow is an actively developed project. Features and UI may continue to evolve.

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, JavaScript, CSS, Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, HTTP-only cookies, bcryptjs, Google authentication |
| Hosting | Netlify (static frontend + serverless functions) |
| Development tools | VS Code, Git, GitHub, Postman |

## 📁 Project Structure

```text
studyflow-mern/
├── backend/                 # Express API, models, controllers and routes
│   ├── .env.example         # Safe environment-variable template
│   ├── app.js               # Express app and API route registration
│   └── index.js             # Local backend entry point
├── frontend/                # React + Vite application
├── netlify/
│   └── functions/           # Netlify serverless API entry point
└── netlify.toml             # Netlify build and routing configuration
```

## 🚀 Run Locally

### Prerequisites

- Node.js and npm
- A MongoDB Atlas database and database user
- Git
- A Google OAuth web client ID **if** testing Google sign-in

### 1. Clone the repository

```bash
git clone https://github.com/mnalindu/studyflow-mern.git
cd studyflow-mern
```

### 2. Install dependencies

Run these commands from the repository root:

```bash
npm ci --prefix backend
npm ci --prefix frontend
```

### 3. Configure backend environment variables

Copy `backend/.env.example` to a new private file named `backend/.env`. On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` with your **own** credentials:

```dotenv
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_private_mongodb_connection_string
JWT_SECRET=your_private_random_secret_at_least_32_characters
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
```

`GOOGLE_CLIENT_ID` is needed for Google authentication. Generate a long random `JWT_SECRET`; do not reuse the example text as a real secret.

### 4. Configure frontend environment variables

Create `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
```

Vite exposes variables prefixed with `VITE_` to browser code, so **never put passwords, JWT secrets, or MongoDB connection strings in `VITE_` variables**.

### 5. Start the backend and frontend

Open two terminals in the repository root.

**Terminal 1 — Backend:**

```bash
npm run dev --prefix backend
```

**Terminal 2 — Frontend:**

```bash
npm run dev --prefix frontend
```

Open **http://localhost:5173** in your browser.

To check the local API, visit **http://localhost:5000/api/health**.

## 🔌 Backend API

The Express API provides routes under these prefixes:

| Route prefix | Purpose |
| --- | --- |
| `/api/auth` | Authentication and Google account integration |
| `/api/tasks` | Task management |
| `/api/notes` | Study notes |
| `/api/study-sessions` | Focus and study sessions |
| `/api/study-insights` | Study activity and insights |
| `/api/study-rooms` | Study rooms |
| `/api/notifications` | Notifications and reminders |
| `/api/health` | Backend and database health check |

Protected endpoints require authentication. When testing authenticated browser requests, the client uses credentials/cookies, and state-changing requests are checked against the trusted frontend origin.

## ☁️ Netlify Deployment

This repository uses `netlify.toml` to build the Vite frontend and deploy the Express API as a Netlify Function.

**Production build settings:**

```text
Base directory: repository root
Publish directory: frontend/dist
Functions directory: netlify/functions
```

**Environment variables to configure in Netlify:**

```dotenv
NODE_ENV=production
CLIENT_URL=https://studyflow-mern.netlify.app
VITE_API_URL=https://studyflow-mern.netlify.app
MONGO_URI=your_private_mongodb_connection_string
JWT_SECRET=your_private_random_secret_at_least_32_characters
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
VITE_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
```

Add the production website origin to the authorized JavaScript origins of your Google OAuth web client, if using Google sign-in.

The `/api/*` routes are forwarded to the Netlify serverless function, while other routes use the frontend single-page application fallback.

## 🔒 Security Notes

- **Never commit** `backend/.env`, `frontend/.env.local`, database passwords, JWT secrets, or API tokens.
- Keep only **placeholder values** in `backend/.env.example`.
- Configure private production values through Netlify Environment Variables.
- If a secret is accidentally committed, **rotate it immediately**; editing the latest file does not remove the value from Git history.
- Use HTTPS for production and review CORS, cookie, and Google OAuth settings before deployment.

## 🌱 Development Workflow

Development changes are prepared on the `backend-development` branch and merged into `main` using a GitHub pull request. The `main` branch is used for the production Netlify deployment.

## 📌 Project Status

**Active development — deployed on Netlify.**

StudyFlow is being improved through ongoing feature development, testing, and deployment refinements.

---

<p align="center"><strong>StudyFlow — Your space to grow. 🌱</strong></p>

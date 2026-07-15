# Todo App

This is a very simple, but fun to use To-Do list app. Users can create an account, login, and create, edit, or delete to-do items. Emphasis is definitely on to-do items that are due shortly. Data persists in SQLite across restarts.

## What I Built

### Backend (`backend/TodoApi`)

- ASP.NET Core 10 Web API with a single project
- EF Core + SQLite for durable storage
- JWT authentication with register/login endpoints
- Todo CRUD scoped to the authenticated user
- Validation for empty titles, whitespace-only titles, and past due dates
- Swagger UI in development with JWT auth support
- Integration tests covering ownership enforcement and validation

### Frontend (`frontend`)

- React + TypeScript (Vite)
- Register / login flow with token persistence in `localStorage`
- Full todo UI: add, edit, delete, complete, and some basic filtering (all / active / completed)
- Client-side validation with server error surfacing

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (LTS)
- [Node.js](https://nodejs.org/) 18+

## Setup and Run

### 1. Start the API

```bash
cd backend/TodoApi
dotnet restore
dotnet run
```

API runs at `http://localhost:5280`. Swagger is available at `http://localhost:5280/swagger`.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

The frontend expects the API at `http://localhost:5280` (configured in `frontend/.env`).

### 3. Run tests

```bash
cd backend/TodoApi.Tests
dotnet test
```

## API Overview

| Method | Endpoint                                   | Auth | Description                 |
| ------ | ------------------------------------------ | ---- | --------------------------- |
| POST   | `/api/auth/register`                       | No   | Create account, returns JWT |
| POST   | `/api/auth/login`                          | No   | Sign in, returns JWT        |
| GET    | `/api/auth/me`                             | Yes  | Current user info           |
| GET    | `/api/todos?filter=all\|active\|completed` | Yes  | List user's todos           |
| GET    | `/api/todos/{id}`                          | Yes  | Get one todo (owned only)   |
| POST   | `/api/todos`                               | Yes  | Create todo                 |
| PATCH  | `/api/todos/{id}`                          | Yes  | Partial update (owned only) |
| DELETE | `/api/todos/{id}`                          | Yes  | Delete todo (owned only)    |

## Assumptions and Trade-offs

**Authentication:** Implemented with JWT. Every todo query filters by `UserId` from the token. User A cannot read, update, or delete User B's todos (covered by tests).

**Architecture:** One API project, and controllers talk directly to EF Core. So there is no repository layer - I thought this app was simple enough that that would be unnecessary.

**Persistence:** SQLite file (`todos.db`) instead of in-memory so data survives restarts. Fine for a single-instance MVP; I would move to PostgreSQL/SQL Server beyond that. Note: I do use an extension in my IDE to easily read the todos.db file.

**Security:** Passwords hashed with ASP.NET Core's `PasswordHasher`. JWT secret is in `appsettings.json` for local dev only — in production this would come from a secrets manager and use refresh tokens / shorter expiry.

**Validation:** Server-side is the source of truth. Frontend mirrors key rules (required title, no past due dates) for faster feedback.

**Deliberately left out:**

- Refresh tokens
- Password reset/Forgot password
- Pagination (ideally server-side for scalability)
- CI/CD or containerization for running an actual sql server
- Email verification
- Role-based access (only user-owned data matters here)
- Customized sorting (there is some basic sorting for completed items and due date proximity)

## What I'd Add Next

With another day:

- Refresh tokens and secure httpOnly cookie option
- Pagination and sorting on the todo list
- Due-date reminders and overdue highlighting
- EF Core migrations instead of `EnsureCreated()`
- Frontend tests for critical flows (auth + todo CRUD)
- Rate limiting on auth endpoints
- Structured logging and health checks for deployment

## Project Structure

```
todo-app/
├── backend/
│   ├── TodoApp.sln
│   ├── TodoApi/           # .NET Web API
│   └── TodoApi.Tests/     # Integration tests
├── frontend/              # React app
└── README.md
```

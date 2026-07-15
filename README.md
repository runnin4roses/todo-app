# Todo App

This is a very simple, but fun to use To-Do list app. Users can create an account, login, and create, edit, or delete to-do items. Emphasis is definitely on to-do items that are due shortly. Data persists in SQLite across restarts.
<img width="1952" height="1586" alt="image" src="https://github.com/user-attachments/assets/23ae155a-5ad7-4bf5-8b50-b2571d2fc3d7" />


## What I Built

### Backend (`backend/TodoApi`)

- ASP.NET Core 10 Web API with a single project
- EF Core + SQLite for durable storage
- JWT authentication with register/login endpoints
- Todo CRUD scoped to the authenticated user
- PATCH endpoint supports partial updates
- Validation for empty titles, whitespace-only titles, and past due dates
- Swagger UI in development with JWT auth support
- 13 integration tests covering ownership isolation, input validation, auth flows, and CRUD happy paths

### Frontend (`frontend`)

- React + TypeScript (Vite)
- Register / login flow with token persistence in `localStorage`
- Full todo UI: add, edit, delete, complete, and some basic filtering (all / active / completed)
- Session validation on startup via `/api/auth/me`; expired tokens trigger auto-logout on 401
- Client-side validation with server error surfacing
- Claymorphism styling

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
cp .env.example .env   # if .env does not exist yet
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

The frontend expects the API at `http://localhost:5280` (set in `frontend/.env`).

### 3. Run tests

```bash
cd backend/TodoApi.Tests
dotnet test
```

## API Overview

| Method | Endpoint                                   | Auth | Description                         |
| ------ | ------------------------------------------ | ---- | ----------------------------------- |
| POST   | `/api/auth/register`                       | No   | Create account, returns JWT (`201`) |
| POST   | `/api/auth/login`                          | No   | Sign in, returns JWT                |
| GET    | `/api/auth/me`                             | Yes  | Current user info                   |
| GET    | `/api/todos?filter=all\|active\|completed` | Yes  | List user's todos                   |
| GET    | `/api/todos/{id}`                          | Yes  | Get one todo (owned only)           |
| POST   | `/api/todos`                               | Yes  | Create todo (`201`)                 |
| PATCH  | `/api/todos/{id}`                          | Yes  | Partial update (owned only)         |
| DELETE | `/api/todos/{id}`                          | Yes  | Delete todo (owned only)            |
| GET    | `/health`                                  | No   | Health check (returns `Healthy`)    |

## Assumptions, Limitations, and Trade-offs

**Authentication:** While Authentication was not listed in the MVP requirements, I am making an assumption that users only want to view their own to-do items, and do not want anyone else viewing them. Every todo query filters by `UserId` from a JWT token. User A cannot read, update, or delete User B's todos (covered by tests).

**Architecture:** One API project, and controllers talk directly to EF Core. So there is no repository layer - I thought this app was simple enough that that would be unnecessary.

**Persistence:** SQLite file (`todos.db`) instead of in-memory so data survives restarts. Fine for a single-instance MVP; I would move to PostgreSQL/SQL Server beyond that.

**Security:** Passwords hashed with ASP.NET Core's `PasswordHasher`. JWT secret is in `appsettings.json` for local dev only — in production this would come from a secrets manager and use refresh tokens / shorter expiry.

**Validation:** Server-side is the source of truth. Frontend mirrors key rules (required title, no past due dates) for faster feedback. Due dates are compared as calendar dates (UTC on the server, local date in the browser).

**Filtering:** The API supports `?filter=active|completed`, but the frontend filters client-side for instant tab switching (originally I thought I would use the server-side filtering, but opted not to). Server-side filtering is ready for when pagination is added.

**Scalability:** This MVP targets single-instance deployment with SQLite — fine for low traffic. The main limits are SQLite (no multi-instance writes), unpaginated list endpoints (the API returns a user's full todo list per request), and full-list refetches on the frontend after create/edit/delete. JWT auth is stateless, so horizontal API scaling is viable once the database moves to PostgreSQL. Per-user query scoping and the `?filter=` param are deliberate hooks for pagination and larger datasets.

**Deliberately left out**:

- Refresh tokens, password reset, and email verification — simple JWT register/login was sufficient for MVP
- Pagination — list sizes don't require it yet; the API `?filter=` param is ready when needed
- CI/CD and containerization
- Role-based access beyond per-user todo scoping
- User-selectable sort order — the list auto-sorts by due-date urgency and completed items
- Frontend tests — prioritized backend integration tests
- Overdue task highlighting — due-date indicators exist for today/tomorrow/this week, but not past-due
- Archive or handling of "stale" old completed to-do items so they don't appear in the UI forever.
- Additional properties such as priority, tags, groups

## What I'd Add Next

Production hardening and follow-on work:

- EF Core migrations instead of `EnsureCreated()`
- Structured logging beyond the `/health` endpoint
- Rate limiting and httpOnly cookie option for auth endpoints
- PostgreSQL when moving beyond single-instance SQLite
- Frontend tests for auth and todo CRUD flows
- Due-date reminders (e.g. email or push notifications)

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

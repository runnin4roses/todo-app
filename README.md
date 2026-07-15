# Todo App

Full-stack task management app (ASP.NET Core + React).

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 18+

## Setup

### Backend

```bash
cd backend/TodoApi
dotnet restore
dotnet run
```

API runs at `http://localhost:5280`. Swagger UI: `http://localhost:5280/swagger`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

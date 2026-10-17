# Lesson 5 — Todo API Starter

This is the starting codebase for the guided lab **Backend Architecture & Codebase Design**.

The `POST /todos` endpoint intentionally starts with multiple responsibilities in one route handler. Your first task is to extract database access into a repository, then continue with service and controller layers.

## Requirements

- Node.js 20+
- PostgreSQL 14+ (or a compatible PostgreSQL instance)

## 1. Install dependencies

```bash
npm install
```

## 2. Start PostgreSQL

If you have Docker installed, the included Compose file starts a local PostgreSQL database:

```bash
docker compose up -d db
cp .env.example .env
```

The example `.env` is configured for this local database. Apply the schema:

```bash
docker compose exec -T db psql -U postgres -d lesson5_todos < db/schema.sql
```

If you already have PostgreSQL running locally, you can instead update `DATABASE_URL` in `.env` to use your own credentials and run `db/schema.sql` against that database.

## 3. Run the API

Development mode:

```bash
npm run dev
```

Or:

```bash
npm start
```

The API listens on `http://localhost:3000` by default.

Health check:

```bash
curl http://localhost:3000/health
```

## 4. Try the current endpoint

```bash
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn backend architecture"}'
```

Expected successful response: `201 Created`, with a `data` object containing `id`, `title`, and `status`.

Try an invalid title:

```bash
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"   "}'
```

Expected response: `400 Bad Request`.

## 5. Lesson tasks

Do not rewrite everything at once. Make one small change, run the endpoint, and inspect the result.

1. **Step 1 — Extract Repository:** Create `src/repositories/todo.repository.js`. Move the SQL query there. The repository should return the created Todo object and should not know about Express or HTTP status codes.
2. **Step 2 — Extract Service:** Create `src/services/todo.service.js`. Move application/business rules out of the route handler. Decide which validation belongs at the request boundary and which rules belong in the service.
3. **Step 3 — Extract Controller:** Create `src/controllers/todo.controller.js`. Keep HTTP request/response mapping in the controller.
4. **Step 4 — Wire dependencies:** Keep route definitions focused on mapping the HTTP route to the controller. Keep centralized error handling.
5. **Step 5 — Review:** Explain the dependency direction, what can be unit-tested independently, and whether a separate repository is worth it for this small API.

## Current structure

```text
lesson5-todo-api-starter/
├── db/
│   └── schema.sql
├── docker-compose.yml
├── src/
│   ├── db/
│   │   └── pool.js
│   ├── routes/
│   │   └── todos.routes.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The `repositories/`, `services/`, and `controllers/` directories are intentionally not created yet; you will add them during the lab.

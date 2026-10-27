# Lesson 5 — Todo API

Codebase for the guided lab **Backend Architecture & Codebase Design**.

The lab started with a `POST /todos` endpoint that did everything in one route handler. It has since been split into routes, controllers, services and repositories, wired together in one composition root. Creating a todo also writes an audit log entry in the same database transaction.

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

The example `.env` is configured for this local database. Apply the schema, which creates the `todos` and `audit_logs` tables:

```bash
docker compose exec -T db psql -U postgres -d lesson5_todos < db/schema.sql
```

If you already have PostgreSQL running locally, you can instead update `DATABASE_URL` in `.env` to use your own credentials and run `db/schema.sql` against that database.

| Variable       | Default                                                       | Description                                        |
| -------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| `PORT`         | `3000`                                                        | Port the API listens on                            |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/lesson5_todos` | PostgreSQL connection string                       |
| `DATABASE_SSL` | `false`                                                       | Set to `true` only if your PostgreSQL requires SSL |

## 3. Run the API

Development mode (restarts on file changes):

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

## 4. Try the endpoint

```bash
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn backend architecture"}'
```

Expected successful response: `201 Created`, with a `data` object containing `id`, `title`, and `status`. A matching row with action `TODO_CREATED` is written to `audit_logs`.

Try an invalid title:

```bash
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"   "}'
```

Expected response: `400 Bad Request` with a `message`. A non-string `title` is also rejected with `400`.

## 5. Tests and formatting

```bash
npm test                     # run unit tests (no database needed)
npm run format               # format all files with Prettier
npm run format:check         # check formatting without changing files
```

Run a single test by name:

```bash
node --test --test-name-pattern="trim" src/tests/*.test.js
```

## Architecture

```text
HTTP request
  → routes/todos.routes.js              maps the URL to a controller
  → controllers/todos.controllers.js    reads the request, checks its shape, sends the response
  → services/todos.services.js          business rules, transaction boundary
  → repositories/*.repositories.js      SQL only
  → db/pool.js                          shared pg connection pool
```

- **Dependency wiring:** `src/container.js` creates the repositories and the service and passes in their dependencies. Each layer is a factory function, such as `createTodoService({ todoRepository, auditRepository, withTransaction })`, so unit tests can pass fakes instead of a real database.
- **Transactions:** `src/db/transaction-manager.js` provides `withTransaction`, which runs a callback inside `BEGIN`/`COMMIT` and rolls back on error. Repository methods take an optional `client` argument, so they can run inside a transaction or directly on the pool.
- **Validation:** the controller checks that `title` is a string. The service checks that the trimmed title is not empty. Both throw `ValidationError`.
- **Error handling:** the error middleware in `src/app.js` turns `ValidationError` into `400` and any other error into `500 Internal server error`.

## Project structure

```text
├── db/
│   └── schema.sql
├── docker-compose.yml
├── src/
│   ├── controllers/
│   │   └── todos.controllers.js
│   ├── db/
│   │   ├── pool.js
│   │   └── transaction-manager.js
│   ├── errors/
│   │   └── validation.error.js
│   ├── repositories/
│   │   ├── audits.repositories.js
│   │   └── todos.repositories.js
│   ├── routes/
│   │   └── todos.routes.js
│   ├── services/
│   │   └── todos.services.js
│   ├── tests/
│   │   └── todo.service.test.js
│   ├── app.js
│   ├── container.js
│   └── server.js
├── .env.example
├── .prettierrc.json
├── package.json
└── README.md
```

## Lesson tasks

1. **Extract Repository:** done in `src/repositories/todos.repositories.js`.
2. **Extract Service:** done in `src/services/todos.services.js`.
3. **Extract Controller:** done in `src/controllers/todos.controllers.js`.
4. **Wire dependencies:** done in `src/container.js`. Error handling stays centralized in `src/app.js`.
5. **Review:** explain the dependency direction, what can be unit-tested independently, and whether a separate repository is worth it for this small API.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

Teaching codebase for "Lesson 5: Backend Architecture & Codebase Design". The README describes the lab: refactoring a fat `POST /todos` route handler into repository → service → controller layers. That refactor is already done here, so the README's "Current structure" tree and suggested filenames (e.g. `todo.repository.js`) are out of date. The real files use plural names: `<resource>.<layer>.js`, e.g. `todos.repositories.js`, `todos.services.js`, `todos.controllers.js`.

## Commands

```bash
npm install
docker compose up -d db && cp .env.example .env               # local PostgreSQL 16
docker compose exec -T db psql -U postgres -d lesson5_todos < db/schema.sql

npm run dev                     # nodemon, http://localhost:3000
npm start
npm test                        # node:test runner, src/tests/*.test.js
node --test --test-name-pattern="trim" src/tests/*.test.js     # single test
npm run format                  # Prettier write
npm run format:check            # Prettier check (no lint setup exists)
```

Unit tests use fakes and need no database.

## Architecture

CommonJS, Express 4, raw `pg` (no ORM). Node >= 20.

Request flow: `routes/` → `controllers/` → `services/` → `repositories/` → `db/pool`.

- **Composition root, `src/container.js`:** builds repositories and services by hand-wiring factories, then exports ready instances. Controllers import `todoService` from the container. Nothing else should instantiate services.
- **Factory-style DI:** layers are `createXxx(deps)` functions that return objects, not classes. Services receive `{ todoRepository, auditRepository, withTransaction }`, so tests can substitute fakes.
- **Transactions, `src/db/transaction-manager.js`:** `withTransaction(async (client) => ...)` handles BEGIN/COMMIT/ROLLBACK. Each repository method takes an optional trailing `client` and falls back to the shared pool (`client ?? pool`), so the same method works inside and outside a transaction. Creating a todo also writes an `audit_logs` row in the same transaction.
- **Validation is split across layers:** controllers check request shape (e.g. `title` must be a string), while services enforce business rules (trimmed title must be non-empty). Both throw `ValidationError` (`src/errors/`).
- **Errors:** the central error middleware in `src/app.js` maps `ValidationError` to 400 and everything else to 500. Controllers wrap their bodies in `try/catch` and call `next(error)`. Responses look like `{ data: ... }` on success and `{ message }` on error.
- **Shutdown:** `src/server.js` loads `.env` via dotenv and closes the HTTP server before ending the pg pool on SIGINT/SIGTERM.

Service tests (`src/tests/`) build the service with fakes for every dependency, including a `withTransaction` that just calls `operation(fakeClient)`.

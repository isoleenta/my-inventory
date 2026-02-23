# Quickstart: 002-inventory-organizer

**Branch**: `002-inventory-organizer` | **Date**: 2025-02-20

All backend commands must be run inside the Docker container per constitution (§32):

```bash
docker compose exec api <command>
```

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (or use Node inside a container if project provides one) for frontend build

## Setup

1. **Clone and branch**
   - Ensure you're on branch `002-inventory-organizer`.

2. **Environment**
   - Copy `.env.example` to `.env` if needed.
   - Run `docker compose exec api php artisan key:generate` if required.
   - Configure DB_* for MySQL/PostgreSQL or SQLite.

3. **Dependencies (backend)**
   ```bash
   docker compose exec api composer install
   ```

4. **Database**
   ```bash
   docker compose exec api php artisan migrate
   ```
   Run feature migrations for `inventory_items` and `inventory_item_photos` when added.

5. **Frontend**
   ```bash
   npm install
   npm run build
   # or for dev: npm run dev
   ```

6. **Storage link** (for item photos)
   ```bash
   docker compose exec api php artisan storage:link
   ```

## Run the app

- Start stack: `docker compose up -d` (or as per project).
- Backend: served by project web server (e.g. Laravel Sail / nginx).
- Frontend: built with Vite; hot reload with `npm run dev` if configured.

Visit `/` for landing; `/register` or `/login` for auth; `/inventory` for item list (after auth).

## Commands (all backend via Docker)

| Task | Command |
|------|--------|
| Migrate | `docker compose exec api php artisan migrate` |
| Run tests | `docker compose exec api php artisan test` |
| Lint (Pint) | `docker compose exec api ./vendor/bin/pint` |
| Static analysis (PHPStan) | `docker compose exec api ./vendor/bin/phpstan analyse` |
| Tinker | `docker compose exec api php artisan tinker` |

## Feature-specific

- **Enums**: `app/Enums/InventoryCategory.php`, `app/Enums/InventoryPlace.php` — add cases to match spec and OpenAPI.
- **Seeding**: No required seeders for categories/places (enums); optional `InventoryItemSeeder` for dev data.
- **Auth**: Use Breeze scaffolding; ensure `Sanctum` and Inertia middleware are configured for SPA.

## References

- [Spec](./spec.md) — requirements and success criteria.
- [Plan](./plan.md) — technical context and structure.
- [Data model](./data-model.md) — entities and migrations.
- [Contracts](./contracts/) — OpenAPI and Inertia page contracts.
- Constitution: `.specify/memory/constitution.md`.

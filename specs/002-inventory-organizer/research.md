# Research: 002-inventory-organizer

**Branch**: `002-inventory-organizer` | **Date**: 2025-02-20

## Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Laravel + React integration | Inertia.js with React 18 | Matches existing project (composer.json). Single codebase, no separate SPA; server-side routing and shared auth. Constitution prefers standard Laravel tooling. |
| Category and Place | PHP backed enums (`InventoryCategory`, `InventoryPlace`) | Spec requires prebuilt lists only. Enums avoid extra tables and migrations, keep validation and i18n in one place. Aligns with constitution §24 (Enum singular). |
| Item photos | `InventoryItemPhoto` model + Laravel filesystem (e.g. `storage/app/public/item-photos`) | One-to-many Item → Photos. Store path in DB; serve via symbolic link or CDN later. Enforce max photos per item in validation (e.g. 10). |
| Auth | Laravel Breeze + Sanctum | Constitution: "Authentication: Built-in". Breeze provides registration/login; Sanctum for SPA token/session auth with Inertia. |
| Styling | Tailwind CSS + black-green theme | Spec requires black-green design. Tailwind for utility-first; theme via config (colors, dark accents). |
| Commands | All run inside container | Constitution §32: `docker compose exec api <command>` for composer, artisan, pint, phpunit. |

## Alternatives Considered

- **Separate React SPA + Laravel API**: Rejected for this feature; Inertia keeps one app and avoids CORS/session complexity.
- **Category/Place as DB tables with seeders**: Rejected; spec says "prebuilt" and fixed set; enums are simpler and type-safe.
- **Photo storage in DB (BLOB)**: Rejected; file storage is standard in Laravel and scales better.

## References

- [Laravel Inertia.js](https://inertiajs.com/) — server-driven SPAs.
- [Laravel file storage](https://laravel.com/docs/filesystem) — `Storage::disk('public')`, `store()`, visibility.
- [PHP 8.1 Enums](https://www.php.net/manual/en/language.types.enumerations.php) — backed enums for category/place values.
- Constitution: `.specify/memory/constitution.md` (PSR-12, Controller → Service → Repository, Form Requests, DTOs, Policies, Docker).

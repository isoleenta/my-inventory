# Inertia Pages Contract: 002-inventory-organizer

**Branch**: `002-inventory-organizer` | **Date**: 2025-02-20

All pages use Inertia.js with React. Shared layout and black-green theme apply across pages.

## Page: Welcome (Landing)

- **Route**: `GET /`
- **Component**: `resources/js/Pages/Welcome.jsx`
- **Purpose**: Landing page describing the product; black-green design; interactive elements (hover/click feedback).
- **Props** (optional): `{ auth: { user? } }` for conditional "Get started" / "Go to inventory".
- **No auth required**: Public.

---

## Page: Auth

- **Routes**: `GET /login`, `GET /register`
- **Components**: `resources/js/Pages/Auth/Login.jsx`, `Register.jsx`
- **Props**: As provided by Breeze (e.g. `errors`, `status`).
- **No extra contract**; follow Laravel Breeze defaults.

---

## Page: Inventory Index

- **Route**: `GET /inventory` (or `/items`)
- **Component**: `resources/js/Pages/Inventory/Index.jsx`
- **Purpose**: List user's items; filter by category and place; empty state when no items.
- **Props**:
  - `items`: Paginated list of `InventoryItem` (id, title, description, category, place, photos[], created_at).
  - `categories`: Array of `{ value, label }` from `InventoryCategory` enum.
  - `places`: Array of `{ value, label }` from `InventoryPlace` enum.
  - `filters`: `{ category?, place? }` current query params.
- **Auth**: Required (middleware `auth`).

---

## Page: Inventory Create

- **Route**: `GET /inventory/create`
- **Component**: `resources/js/Pages/Inventory/Create.jsx`
- **Props**:
  - `categories`: Array of `{ value, label }`.
  - `places`: Array of `{ value, label }`.
- **Auth**: Required.
- **Form**: POST to store endpoint (multipart if photos); redirect to Index or Show on success; validation errors returned via Inertia.

---

## Page: Inventory Edit

- **Route**: `GET /inventory/{id}/edit`
- **Component**: `resources/js/Pages/Inventory/Edit.jsx`
- **Props**:
  - `item`: Single `InventoryItem` (with photos).
  - `categories`: Array of `{ value, label }`.
  - `places`: Array of `{ value, label }`.
- **Auth**: Required; policy ensures user owns item.
- **Form**: PUT/PATCH to update endpoint; redirect on success; validation errors via Inertia.

---

## Page: Inventory Show

- **Route**: `GET /inventory/{id}`
- **Component**: `resources/js/Pages/Inventory/Show.jsx`
- **Props**: `item`: Single `InventoryItem` with photos.
- **Auth**: Required; policy ensures user owns item.

---

## Shared Conventions

- **Errors**: Inertia shared validation errors; display per-field in forms.
- **Flash**: Use Inertia flash (e.g. `success` message) for redirect feedback.
- **Links**: Use Inertia `<Link>` for in-app navigation to avoid full reloads.
- **Forms**: Use Inertia router post/put for form submit; optional `forceFormData: true` for file uploads.

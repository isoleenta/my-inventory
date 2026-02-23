# Data Model: 002-inventory-organizer

**Branch**: `002-inventory-organizer` | **Date**: 2025-02-20

## Entities

### User

- **Purpose**: Laravel default. Owner of inventory items; auth via Breeze + Sanctum.
- **Attributes**: (use Laravel default: id, name, email, password, timestamps)
- **Relations**: `hasMany(InventoryItem::class)`

---

### InventoryItem

- **Purpose**: A single inventory entry (title, description, category, place, photos).
- **Table**: `inventory_items`
- **Attributes**:
  - `id` (bigint, PK)
  - `user_id` (FK → users.id, not null, index)
  - `title` (string, required, max length e.g. 255)
  - `description` (text, nullable)
  - `category` (string, nullable) — value from `InventoryCategory` enum
  - `place` (string, nullable) — value from `InventoryPlace` enum
  - `created_at`, `updated_at`
- **Validation**: Title required; title/description max length; category and place must be valid enum cases; max N photos per item (e.g. 10) enforced in request/service.
- **Relations**: `belongsTo(User::class)`, `hasMany(InventoryItemPhoto::class)`
- **Scopes**: e.g. `scopeForUser($query, $user)`, `scopeByCategory($query, $category)`, `scopeByPlace($query, $place)`
- **State**: No state machine; soft deletes optional (spec allows delete).

---

### InventoryItemPhoto

- **Purpose**: One image attached to an item; stored on filesystem, path in DB.
- **Table**: `inventory_item_photos`
- **Attributes**:
  - `id` (bigint, PK)
  - `inventory_item_id` (FK → inventory_items.id, not null, index)
  - `path` (string, not null) — storage path relative to disk (e.g. `item-photos/{item_id}/{filename}`)
  - `sort_order` (unsigned tinyint, default 0) — for display order
  - `created_at`, `updated_at`
- **Relations**: `belongsTo(InventoryItem::class)`
- **Validation**: Allowed mime types (e.g. image/jpeg, image/png); max file size (e.g. 5MB); max count per item in Store/Update request.

---

### Enums (no tables)

**InventoryCategory** (PHP backed enum, string)

- Cases (spec): Electronics, Tools, Food, Clothing, Documents, Media, Sports, Other.
- Value used in DB and API: enum case value (e.g. `electronics`, `tools`).

**InventoryPlace** (PHP backed enum, string)

- Cases (spec): Garage, Bedroom, Kitchen, Fridge, Drawers, Bathroom, Office, Living room, Storage, Other.
- Value used in DB and API: enum case value (e.g. `garage`, `kitchen`, `fridge`).

---

## ER (conceptual)

```text
User 1 ---- * InventoryItem 1 ---- * InventoryItemPhoto
                |
                +-- category (enum)
                +-- place (enum)
```

## Indexes

- `inventory_items`: `user_id`, optional composite `(user_id, category)`, `(user_id, place)` for filter performance.
- `inventory_item_photos`: `inventory_item_id`.

## Migration Order

1. `create_inventory_items_table` (users already exists).
2. `create_inventory_item_photos_table`.

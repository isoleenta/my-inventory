# Implementation Plan: Inventory Organizer Website

**Branch**: `002-inventory-organizer` | **Date**: 2025-02-20 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification + user choice: Laravel + React; follow all rules in constitution.

## Summary

Build a modern inventory organizer website with a black-green design. Users discover the product on a landing page and manage inventory items with prebuilt categories and places (e.g., Garage, Kitchen, Fridge). Items have title, description, category, place, and photos. Technical approach: Laravel 11 backend with Inertia.js + React frontend, Controller → Service → Repository architecture, Spatie DTOs, PHP enums for Category and Place, Tailwind for styling. All commands run inside Docker per constitution.

## Technical Context

**Language/Version**: PHP 8.2  
**Primary Dependencies**: Laravel 11, Inertia.js, React 18, Vite, Tailwind CSS, Sanctum, Laravel Breeze (or equivalent), Spatie Data Transfer Object  
**Storage**: MySQL / PostgreSQL (or SQLite for dev)  
**Testing**: PHPUnit (Feature + Unit), Pest optional  
**Target Platform**: Web (browser)  
**Project Type**: web (Laravel monolith with React frontend via Inertia)  
**Performance Goals**: Landing page interactive &lt;3s; filter/list response &lt;2s  
**Constraints**: All backend commands via `docker compose exec api` (constitution §32)  
**Scale/Scope**: Single-tenant; users manage personal inventory; prebuilt categories and places only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Constitution Rule | Status | Notes |
|-------------------|--------|-------|
| PSR-12, Laravel conventions | ✓ | Adhered |
| Controller → Service → Repository | ✓ | Plan uses this layering |
| No Eloquent/SQL outside repositories | ✓ | Enforced in design |
| Form Requests + Spatie DTO + toDTO() | ✓ | Data flow defined |
| getFillable() on DTOs for create/update | ✓ | Repositories use this |
| Form Requests, Resources | ✓ | Validation + response transformation |
| Policies for authorization | ✓ | User owns items only |
| PHPStan / Pint, PHP-CS-Fixer | ✓ | Existing tooling |
| All commands via docker compose exec api | ✓ | Documented in quickstart |
| No JS/CSS in Blade, no HTML in PHP | ✓ | React in resources/js; Blade minimal |
| Config/lang for literals | ✓ | Categories/places via enums and config |
| Standard Laravel tools (Vite, Sanctum) | ✓ | No 3rd-party auth or build |

**Gate**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/002-inventory-organizer/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   ├── openapi.yaml
│   └── inertia-pages.md
└── tasks.md             # Phase 2 (speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── Enums/
│   ├── InventoryCategory.php   # Electronics, Tools, Food, Clothing, etc.
│   └── InventoryPlace.php       # Garage, Bedroom, Kitchen, Fridge, etc.
├── Http/
│   ├── Controllers/
│   │   ├── Auth/                # Login, Register (Breeze)
│   │   ├── InventoryItemController.php
│   │   └── WelcomeController.php
│   ├── Requests/
│   │   ├── Auth/                # Breeze
│   │   └── Inventory/
│   │       ├── StoreInventoryItemRequest.php
│   │       └── UpdateInventoryItemRequest.php
│   └── Resources/
│       └── InventoryItemResource.php
├── Repositories/
│   └── InventoryItemRepository.php
├── Services/
│   └── InventoryItemService.php
├── DTOs/
│   └── InventoryItemData.php
├── Models/
│   ├── User.php
│   ├── InventoryItem.php
│   └── InventoryItemPhoto.php
└── Policies/
    └── InventoryItemPolicy.php

database/
├── migrations/
│   ├── create_inventory_items_table.php
│   └── create_inventory_item_photos_table.php
├── seeders/             # Optional: if enums are backed by DB later
└── factories/
    └── InventoryItemFactory.php

resources/
├── js/
│   ├── app.jsx                 # React + Inertia entry
│   ├── Pages/
│   │   ├── Welcome.jsx          # Landing (black-green, interactive)
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── Inventory/
│   │       ├── Index.jsx        # List, filter by category/place
│   │       ├── Create.jsx
│   │       ├── Edit.jsx
│   │       └── Show.jsx
│   └── components/
└── css/
    └── app.css                  # Tailwind + black-green theme

routes/
├── web.php
└── api.php
```

**Structure Decision**: Laravel monolith. Frontend in `resources/js` with React + Inertia. Backend follows Controller → Service → Repository. Category and Place are PHP enums (no separate tables). Item photos stored via `InventoryItemPhoto` model and file storage.

## Complexity Tracking

> No constitution violations requiring justification.

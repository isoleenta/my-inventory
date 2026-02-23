# Tasks: Inventory Organizer Website

**Input**: Design documents from `/specs/002-inventory-organizer/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the spec; no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Laravel monolith: `app/`, `database/`, `resources/js/`, `routes/` at repository root (per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [x] T001 Verify or create Laravel project structure per plan.md (app/Enums, app/Http/Controllers, app/Repositories, app/Services, app/DTOs, app/Policies, resources/js/Pages)
- [x] T002 Install and configure Laravel Breeze with React stack and Sanctum if not present (composer + npm; run via docker compose exec api per quickstart)
- [x] T003 [P] Install Spatie Data Transfer Object package and ensure Inertia + Vite + React 18 + Tailwind are configured in app
- [x] T004 [P] Add black-green theme to Tailwind (e.g. extend colors in tailwind.config.js and base styles in resources/css/app.css)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Create InventoryCategory enum with cases Electronics, Tools, Food, Clothing, Documents, Media, Sports, Other in app/Enums/InventoryCategory.php
- [x] T006 [P] Create InventoryPlace enum with cases Garage, Bedroom, Kitchen, Fridge, Drawers, Bathroom, Office, Living room, Storage, Other in app/Enums/InventoryPlace.php
- [x] T007 Create migration for inventory_items table (user_id, title, description, category, place, timestamps; indexes per data-model.md) in database/migrations/
- [x] T008 Create migration for inventory_item_photos table (inventory_item_id, path, sort_order, timestamps) in database/migrations/
- [x] T009 Create InventoryItem model with fillable, casts, user and photos relations, scopes forUser/byCategory/byPlace in app/Models/InventoryItem.php
- [x] T010 Create InventoryItemPhoto model with fillable, item relation in app/Models/InventoryItemPhoto.php
- [x] T011 Run migrations (docker compose exec api php artisan migrate) and ensure storage link exists for item photos (storage/app/public/item-photos)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Discover the Product (Priority: P1) 🎯 MVP

**Goal**: Visitor sees landing page with black-green design and interactive elements describing the inventory organizer idea.

**Independent Test**: Open GET /; verify message, black-green theme, and interactive feedback on buttons/cards/sections.

### Implementation for User Story 1

- [x] T012 [US1] Create WelcomeController returning Inertia response for Welcome page with optional auth prop in app/Http/Controllers/WelcomeController.php
- [x] T013 [US1] Register GET / route for WelcomeController in routes/web.php
- [x] T014 [US1] Implement Welcome.jsx with product description, black-green layout, and interactive elements (hover/click feedback) in resources/js/Pages/Welcome.jsx
- [x] T015 [US1] Apply black-green theme and any shared layout (e.g. layout with nav) in resources/css/app.css and shared React layout if needed

**Checkpoint**: User Story 1 complete — landing page is testable independently

---

## Phase 4: User Story 2 - Add and Manage Inventory Items (Priority: P1)

**Goal**: Authenticated user can create, view, edit, delete items with title, description, category, place, and photos; filter by category and place; validation inline per field.

**Independent Test**: Register/login, create item with title/category/place/photos, view list, filter, edit, delete; verify persistence and inline validation errors.

### Implementation for User Story 2

- [x] T016 [US2] Create InventoryItemRepository with methods for user-scoped index (with filters, pagination), find, create, update, delete; all Eloquent in app/Repositories/InventoryItemRepository.php
- [x] T017 [US2] Create InventoryItemData DTO with getFillable() and optional toDTO() from request in app/DTOs/InventoryItemData.php
- [x] T018 [US2] Create StoreInventoryItemRequest with validation (title required max 255, description max 5000, category/place enum, photos array max 10, file types/size) in app/Http/Requests/Inventory/StoreInventoryItemRequest.php
- [x] T019 [US2] Create UpdateInventoryItemRequest with same validation as store in app/Http/Requests/Inventory/UpdateInventoryItemRequest.php
- [x] T020 [US2] Create InventoryItemService that uses repository and handles photo storage (store in storage/app/public/item-photos), calling repository create/update/delete in app/Services/InventoryItemService.php
- [x] T021 [US2] Create InventoryItemResource for API/Inertia response shape (id, title, description, category, place, photos, timestamps) in app/Http/Resources/InventoryItemResource.php
- [x] T022 [US2] Create InventoryItemPolicy (view, create, update, delete for item owner only) in app/Policies/InventoryItemPolicy.php
- [x] T023 [US2] Create InventoryItemController (index, create, store, show, edit, update, destroy) using Service, Form Requests, Resource, Policy; return Inertia with items, categories, places, filters; pass validation errors for inline display in app/Http/Controllers/InventoryItemController.php
- [x] T024 [US2] Register inventory routes (resource or named) under auth middleware in routes/web.php (e.g. /inventory, /inventory/create, /inventory/{id}, /inventory/{id}/edit)
- [x] T025 [US2] Implement Inventory Index page with list, filter by category/place, empty state, and link to create in resources/js/Pages/Inventory/Index.jsx
- [x] T026 [US2] Implement Inventory Create page with form (title, description, category, place, photos), inline validation errors, multipart submit in resources/js/Pages/Inventory/Create.jsx
- [x] T027 [US2] Implement Inventory Edit page with form pre-filled, inline validation, multipart submit in resources/js/Pages/Inventory/Edit.jsx
- [x] T028 [US2] Implement Inventory Show page with item details and photos in resources/js/Pages/Inventory/Show.jsx

**Checkpoint**: User Story 2 complete — full CRUD and filtering testable

---

## Phase 5: User Story 3 - Use Prebuilt Categories and Places (Priority: P2)

**Goal**: User sees prebuilt category and place options in Create/Edit (and Index filters); selecting one associates the item correctly.

**Independent Test**: Open Create or Edit; confirm category and place dropdowns show prebuilt options; select and save; confirm filter/list show correct values.

### Implementation for User Story 3

- [x] T029 [US3] Ensure controllers pass categories and places as arrays of { value, label } from InventoryCategory and InventoryPlace enums to Index, Create, Edit (add helper or enum method if needed) in app/Http/Controllers/InventoryItemController.php and any shared Inertia middleware or view composer
- [x] T030 [US3] Add category and place select dropdowns with prebuilt options and clear labels to Create.jsx and Edit.jsx; ensure Index filter UI uses same options in resources/js/Pages/Inventory/Create.jsx, Edit.jsx, Index.jsx

**Checkpoint**: User Story 3 complete — prebuilt lists are visible and functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration and validation

- [x] T031 Ensure storage link exists and photo URLs are generated correctly for display (e.g. Storage::url in Resource or model accessor) in app/Http/Resources/InventoryItemResource.php or app/Models/InventoryItemPhoto.php
- [x] T032 Add flash success messages on create/update/delete redirect and display in layout or Inventory pages per contracts/inertia-pages.md
- [x] T033 Run quickstart.md validation (migrate, npm build, storage:link, smoke test landing and one item flow)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — no dependency on US2/US3
- **User Story 2 (Phase 4)**: Depends on Foundational — no dependency on US1; US3 tasks can overlap with US2 (dropdowns are part of Create/Edit)
- **User Story 3 (Phase 5)**: Depends on US2 controller and pages existing — completes prebuilt lists in forms
- **Polish (Phase 6)**: Depends on US1, US2, US3 being complete

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — landing only; no inventory code
- **User Story 2 (P2)**: After Foundational — full inventory CRUD; enums and models from Foundational
- **User Story 3 (P3)**: After US2 controller and pages — wire prebuilt options into existing forms

### Within Each User Story

- Models/migrations before Repository/Service; Repository before Service; Service before Controller
- Form Requests and Policy before Controller
- Controller and routes before React pages

### Parallel Opportunities

- T005 and T006 (enums) can run in parallel
- T003 and T004 (Setup) can run in parallel
- T018 and T019 (Store vs Update request) can run in parallel
- After T023, T025–T028 (React pages) can be done in parallel by file

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Open / and verify landing page
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → landing page live (MVP)
3. Add User Story 2 → full inventory CRUD and filter
4. Add User Story 3 → prebuilt dropdowns confirmed
5. Polish → flash messages and quickstart validation

---

## Notes

- All backend commands via `docker compose exec api` (constitution).
- Controller → Service → Repository; no Eloquent outside repositories.
- Form Requests validate; DTO getFillable() for create/update; Resources for response shape.
- Inline validation errors per FR-011; max 10 photos, title 255, description 5000 per spec.

<?php

namespace App\Http\Controllers;

use App\DTOs\InventoryItemData;
use App\Enums\InventoryCategory;
use App\Http\Requests\Inventory\StoreInventoryItemRequest;
use App\Models\Place;
use App\Http\Requests\Inventory\UpdateInventoryItemRequest;
use App\Http\Resources\InventoryItemResource;
use App\Models\InventoryItem;
use App\Services\InventoryItemService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryItemController extends Controller
{
    public function __construct(
        private InventoryItemService $service
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', InventoryItem::class);

        $filters = [
            'category' => $request->query('category'),
            'place' => $request->query('place'),
        ];

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $this->service->index($request->user(), $filters);

        // Explicit paginated structure so Inertia receives data + links (Resource::collection
        // only exposes this when used as HTTP response, not when serialized as Inertia prop)
        $items = [
            'data' => InventoryItemResource::collection($paginator->getCollection())->resolve(),
            'links' => $paginator->linkCollection()->toArray(),
        ];

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'categories' => InventoryCategory::options(),
            'places' => Place::optionsForUser($request->user()),
            'filters' => $filters,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', InventoryItem::class);

        return Inertia::render('Inventory/Create', [
            'categories' => InventoryCategory::options(),
            'places' => Place::optionsForUser($request->user()),
        ]);
    }

    public function store(StoreInventoryItemRequest $request): RedirectResponse
    {
        $this->authorize('create', InventoryItem::class);

        $data = InventoryItemData::fromRequest($request->validated());
        $photos = $request->file('photos', []);

        $item = $this->service->create($request->user(), $data, $photos);

        return redirect()
            ->route('inventory.show', $item)
            ->with('success', __('Item created successfully.'));
    }

    public function show(InventoryItem $inventory): Response
    {
        $this->authorize('view', $inventory);

        $inventory->load('photos');

        // Pass resolved array so Inertia gets flat item (no JsonResource 'data' wrapper)
        return Inertia::render('Inventory/Show', [
            'item' => (new InventoryItemResource($inventory))->resolve(request()),
        ]);
    }

    public function edit(InventoryItem $inventory): Response
    {
        $this->authorize('update', $inventory);

        $inventory->load('photos');

        return Inertia::render('Inventory/Edit', [
            'item' => (new InventoryItemResource($inventory))->resolve(request()),
            'categories' => InventoryCategory::options(),
            'places' => Place::optionsForUser($request->user()),
        ]);
    }

    public function update(UpdateInventoryItemRequest $request, InventoryItem $inventory): RedirectResponse
    {
        $data = InventoryItemData::fromRequest($request->validated());
        $newPhotos = $request->file('photos', []);

        $this->service->update($inventory, $data, $newPhotos);

        return redirect()
            ->route('inventory.show', $inventory)
            ->with('success', __('Item updated successfully.'));
    }

    public function destroy(InventoryItem $inventory): RedirectResponse
    {
        $this->authorize('delete', $inventory);

        $this->service->delete($inventory);

        return redirect()
            ->route('inventory.index')
            ->with('success', __('Item deleted successfully.'));
    }
}

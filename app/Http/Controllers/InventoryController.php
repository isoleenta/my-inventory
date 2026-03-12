<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexInventoryRequest;
use App\Models\Place;
use App\Services\CategoryService;
use App\Services\ItemService;
use App\Services\PlaceService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        private readonly ItemService $itemService,
        private readonly CategoryService $categoryService,
        private readonly PlaceService $placeService
    ) {}

    public function index(IndexInventoryRequest $request): Response
    {
        $user = $request->user('web_user');

        $items = $this->itemService->listForUserWithQueryBuilder($user, $request);
        $categories = $this->categoryService->listForUser($user);
        $placeOptions = $this->placeService->getOptionsForUser($user);

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'categories' => $categories,
            'placeOptions' => $placeOptions,
            'filters' => $request->getFilters(),
            'sort' => $request->getSort(),
        ]);
    }

    public function place(Place $place): RedirectResponse
    {
        return redirect()->route('inventory.index', ['filter' => ['place_id' => $place->id]]);
    }
}

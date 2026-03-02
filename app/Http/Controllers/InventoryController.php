<?php

namespace App\Http\Controllers;

use App\Enums\PlaceType;
use App\Http\Requests\IndexInventoryRequest;
use App\Services\CategoryService;
use App\Services\ItemService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        private readonly ItemService $itemService,
        private readonly CategoryService $categoryService
    ) {}

    public function index(IndexInventoryRequest $request): Response
    {
        $user = $request->user('web_user');

        $items = $this->itemService->listForUserWithQueryBuilder($user, $request);
        $categories = $this->categoryService->listForUser($user);

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'categories' => $categories,
            'placeOptions' => PlaceType::options(),
            'filters' => $request->getFilters(),
            'sort' => $request->getSort(),
        ]);
    }

    public function place(string $place): RedirectResponse
    {
        return redirect()->route('inventory.index', ['filter' => ['place' => $place]]);
    }
}

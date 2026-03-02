<?php

namespace App\Http\Controllers;

use App\Enums\PlaceType;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\Item;
use App\Services\CategoryService;
use App\Services\ItemService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    public function __construct(
        private readonly ItemService $itemService,
        private readonly CategoryService $categoryService
    ) {}

    public function create(Request $request): Response
    {
        $user = $request->user('web_user');
        $categories = $this->categoryService->listForUser($user);

        return Inertia::render('Items/Create', [
            'categories' => $categories,
            'placeOptions' => PlaceType::options(),
        ]);
    }

    public function store(StoreItemRequest $request): RedirectResponse
    {
        $user = $request->user('web_user');
        $item = $this->itemService->create($user, $request->toDTO(), $request->file('photos', []));

        return redirect()->route('inventory.show', ['place' => $item->place->value])
            ->with('success', __('Item created.'));
    }

    public function show(Item $item): Response
    {
        $item = $this->itemService->loadDisplayRelations($item);

        return Inertia::render('Items/Show', [
            'item' => $item,
        ]);
    }

    public function edit(Request $request, Item $item): Response
    {
        $user = $request->user('web_user');
        $categories = $this->categoryService->listForUser($user);

        return Inertia::render('Items/Edit', [
            'item' => $item,
            'categories' => $categories,
            'placeOptions' => PlaceType::options(),
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item): RedirectResponse
    {
        $this->itemService->update($item, $request->toDTO(), $request->file('photos', []));

        return redirect()->route('inventory.show', ['place' => $item->place->value])
            ->with('success', __('Item updated.'));
    }

    public function destroy(Item $item): RedirectResponse
    {
        $place = $item->place->value;
        $this->itemService->delete($item);

        return redirect()->route('inventory.show', ['place' => $place])->with('success', __('Item deleted.'));
    }
}

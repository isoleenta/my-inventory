<?php

namespace App\Http\Controllers;

use App\Exceptions\OllamaRegenerationFailedException;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\Item;
use App\Services\CategoryService;
use App\Services\ItemService;
use App\Services\PlaceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    public function __construct(
        private readonly ItemService $itemService,
        private readonly CategoryService $categoryService,
        private readonly PlaceService $placeService
    ) {}

    public function create(Request $request): Response
    {
        $user = $request->user('web_user');
        $categories = $this->categoryService->listForUser($user);
        $placeOptions = $this->placeService->getOptionsForUser($user);

        return Inertia::render('Items/Create', [
            'categories' => $categories,
            'placeOptions' => $placeOptions,
        ]);
    }

    public function store(StoreItemRequest $request): RedirectResponse
    {
        $user = $request->user('web_user');
        $item = $this->itemService->create($user, $request->toDTO(), $request->file('photos', []));

        if ($request->boolean('add_another')) {
            return redirect()->route('items.create')->with('success', __('Item created.'));
        }

        return redirect()->route('inventory.show', ['place' => $item->place_id])
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
        $placeOptions = $this->placeService->getOptionsForUser($user);

        return Inertia::render('Items/Edit', [
            'item' => $item,
            'categories' => $categories,
            'placeOptions' => $placeOptions,
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item): RedirectResponse
    {
        $this->itemService->update($item, $request->toDTO(), $request->file('photos', []));

        return redirect()->route('inventory.show', ['place' => $item->place_id])
            ->with('success', __('Item updated.'));
    }

    public function regenerate(Request $request, Item $item): RedirectResponse
    {
        try {
            $this->itemService->regenerateTitleAndCategory($request->user('web_user'), $item);
        } catch (OllamaRegenerationFailedException $e) {
            return redirect()->route('items.show', $item)->with('error', $e->getMessage());
        }

        return redirect()->route('items.show', $item)->with('success', __('Title and category regenerated.'));
    }

    public function destroy(Item $item): RedirectResponse
    {
        $placeId = $item->place_id;
        $this->itemService->delete($item);

        return redirect()->route('inventory.show', ['place' => $placeId])->with('success', __('Item deleted.'));
    }
}

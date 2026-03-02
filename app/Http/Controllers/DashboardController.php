<?php

namespace App\Http\Controllers;

use App\Services\CategoryService;
use App\Services\ItemService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly ItemService $itemService,
        private readonly CategoryService $categoryService
    ) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user('web_user');
        $places = $this->itemService->getPlacesWithCounts($user);
        $totalItems = $this->itemService->getTotalCountByUser($user);
        $categoriesCount = $this->categoryService->getCountByUser($user);
        $categoriesWithStats = $this->categoryService->listForUserWithItemStats($user);

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalItems' => $totalItems,
                'categoriesCount' => $categoriesCount,
            ],
            'places' => $places,
            'categoriesWithStats' => $categoriesWithStats->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'items_count' => $c->items_count,
                'items_sum_price' => $c->items_sum_price !== null ? (float) $c->items_sum_price : 0.0,
            ]),
        ]);
    }
}

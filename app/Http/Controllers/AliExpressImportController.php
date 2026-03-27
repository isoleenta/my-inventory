<?php

namespace App\Http\Controllers;

use App\Http\Requests\PreviewAliExpressImportRequest;
use App\Http\Requests\StoreAliExpressImportRequest;
use App\Services\AliExpressImportService;
use App\Services\CategoryService;
use App\Services\PlaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AliExpressImportController extends Controller
{
    public function __construct(
        private readonly AliExpressImportService $aliExpressImportService,
        private readonly CategoryService $categoryService,
        private readonly PlaceService $placeService
    ) {}

    public function create(Request $request): Response
    {
        $user = $request->user('web_user');

        return Inertia::render('Items/AliExpressImport', [
            'categories' => $this->categoryService->listForUser($user),
            'placeOptions' => $this->placeService->getOptionsForUser($user),
        ]);
    }

    public function preview(PreviewAliExpressImportRequest $request): JsonResponse
    {
        return response()->json([
            'items' => $this->aliExpressImportService->preview($request->htmlContent()),
        ]);
    }

    public function store(StoreAliExpressImportRequest $request): RedirectResponse
    {
        $result = $this->aliExpressImportService->import(
            $request->user('web_user'),
            $request->placeId(),
            $request->categoryId(),
            $request->htmlContent()
        );

        return redirect()
            ->route('inventory.show', ['place' => $result['place_id']])
            ->with('success', __('Imported :count AliExpress items.', ['count' => $result['count']]));
    }
}

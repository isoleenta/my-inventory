<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user('web_user');
        $categories = $this->categoryService->listForUser($user);

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Categories/Create');
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $user = $request->user('web_user');
        $this->categoryService->create($user, $request->toDTO());

        return redirect()->route('categories.index')->with('success', __('Category created.'));
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $this->categoryService->update($category, $request->toDTO());

        return redirect()->route('categories.index')->with('success', __('Category updated.'));
    }

    public function destroy(Category $category): RedirectResponse
    {
        $this->categoryService->delete($category);

        return redirect()->route('categories.index')->with('success', __('Category deleted.'));
    }
}

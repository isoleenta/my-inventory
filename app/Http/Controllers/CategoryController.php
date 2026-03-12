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

        $selectedCategory = null;
        $eligibleParents = [];

        $categoryId = $request->integer('category', 0);
        if ($categoryId > 0) {
            $selectedCategory = $this->categoryService->findForUser($categoryId, $user);

            if ($selectedCategory !== null) {
                $eligibleParents = $this->categoryService->listEligibleParents($user, $selectedCategory->id);
            }
        }

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'selectedCategory' => $selectedCategory,
            'eligibleParents' => $eligibleParents,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user('web_user');
        $categories = $this->categoryService->listForUser($user);

        return Inertia::render('Categories/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $user = $request->user('web_user');
        $this->categoryService->create($user, $request->toDTO());

        if ($request->boolean('add_another')) {
            return redirect()->route('categories.create')->with('success', __('Category created.'));
        }

        return redirect()->route('categories.index')->with('success', __('Category created.'));
    }

    public function edit(Request $request, Category $category): Response
    {
        $user = $request->user('web_user');
        $eligibleParents = $this->categoryService->listEligibleParents($user, $category->id);

        return Inertia::render('Categories/Edit', [
            'category' => $category,
            'eligibleParents' => $eligibleParents,
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $this->categoryService->update($category, $request->toDTO());

        return redirect()->route('categories.index', ['category' => $category->id])->with('success', __('Category updated.'));
    }

    public function destroy(Category $category): RedirectResponse
    {
        $this->categoryService->delete($category);

        return redirect()->route('categories.index')->with('success', __('Category deleted.'));
    }
}

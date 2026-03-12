<?php

namespace App\Services;

use App\DTOs\CategoryData;
use App\Models\Category;
use App\Models\User;
use App\Repositories\CategoryRepository;
use Illuminate\Database\Eloquent\Collection;

final class CategoryService
{
    public function __construct(
        private readonly CategoryRepository $categoryRepository
    ) {}

    /**
     * @return Collection<int, Category>
     */
    public function listForUser(User $user): Collection
    {
        return $this->categoryRepository->getByUser($user);
    }

    /**
     * Categories that can be chosen as parent (for create: all; for edit: exclude self and descendants).
     *
     * @return Collection<int, Category>
     */
    public function listEligibleParents(User $user, ?int $excludeCategoryId = null): Collection
    {
        return $this->categoryRepository->getEligibleParents($user, $excludeCategoryId);
    }

    public function findForUser(int $id, User $user): ?Category
    {
        return $this->categoryRepository->findByIdAndUser($id, $user);
    }

    public function findOrFail(int $id, User $user): Category
    {
        $category = $this->findForUser($id, $user);

        if ($category === null) {
            abort(404);
        }

        return $category;
    }

    public function create(User $user, CategoryData $data): Category
    {
        return $this->categoryRepository->create($user, $data);
    }

    public function update(Category $category, CategoryData $data): Category
    {
        return $this->categoryRepository->update($category, $data);
    }

    public function delete(Category $category): void
    {
        $this->categoryRepository->delete($category);
    }

    public function getCountByUser(User $user): int
    {
        return $this->categoryRepository->getByUser($user)->count();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category>
     */
    public function listForUserWithItemStats(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return $this->categoryRepository->getByUserWithItemStats($user);
    }
}

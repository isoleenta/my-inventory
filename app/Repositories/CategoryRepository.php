<?php

namespace App\Repositories;

use App\DTOs\CategoryData;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

final class CategoryRepository
{
    public function getByUser(User $user): Collection
    {
        return Category::query()
            ->where('user_id', $user->id)
            ->orderByRaw('parent_id is null desc')
            ->orderBy('name')
            ->get();
    }

    /**
     * Categories that can be chosen as parent (exclude self and descendants).
     *
     * @return Collection<int, Category>
     */
    public function getEligibleParents(User $user, ?int $excludeCategoryId = null): Collection
    {
        $query = Category::query()
            ->where('user_id', $user->id)
            ->orderByRaw('parent_id is null desc')
            ->orderBy('name');

        if ($excludeCategoryId !== null) {
            $category = $this->findByIdAndUser($excludeCategoryId, $user);
            if ($category !== null) {
                $ids = $category->getDescendantAndSelfIds();
                $query->whereNotIn('id', $ids);
            }
        }

        return $query->get();
    }

    /**
     * @return Collection<int, Category>
     */
    public function getByUserWithItemStats(User $user): Collection
    {
        return Category::query()
            ->where('user_id', $user->id)
            ->withCount('items')
            ->withSum('items', 'price')
            ->orderBy('name')
            ->get();
    }

    public function findByIdAndUser(int $id, User $user): ?Category
    {
        return Category::query()
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();
    }

    public function create(User $user, CategoryData $data): Category
    {
        return $user->categories()->create($data->getFillable());
    }

    public function update(Category $category, CategoryData $data): Category
    {
        $category->update($data->getFillable());

        return $category->fresh();
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }

    /**
     * @return array<int, int>
     */
    public function getDescendantAndSelfIds(int $categoryId, User $user): array
    {
        $category = $this->findByIdAndUser($categoryId, $user);

        return $category !== null ? $category->getDescendantAndSelfIds() : [];
    }
}

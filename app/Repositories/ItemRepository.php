<?php

namespace App\Repositories;

use App\DTOs\ItemData;
use App\Models\Item;
use App\Models\ItemPhoto;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

final class ItemRepository
{
    public function __construct(
        private readonly CategoryRepository $categoryRepository
    ) {}

    /**
     * @return Collection<int, Item>
     */
    public function getByUserWithQueryBuilder(User $user, Request $request): Collection
    {
        $baseQuery = Item::query()->where('user_id', $user->id);
        $categoryRepository = $this->categoryRepository;

        return QueryBuilder::for($baseQuery, $request)
            ->allowedFilters([
                AllowedFilter::callback('category_id', function ($query, $value) use ($user, $categoryRepository) {
                    $ids = $categoryRepository->getDescendantAndSelfIds((int) $value, $user);
                    if ($ids !== []) {
                        $query->whereIn('category_id', $ids);
                    } else {
                        $query->where('category_id', $value);
                    }
                }),
                AllowedFilter::exact('place'),
                AllowedFilter::callback('name', function ($query, $value) {
                    $term = trim((string) $value);
                    if ($term === '') {
                        return;
                    }
                    $query->where(function ($q) use ($term) {
                        $q->where('title', 'like', '%'.$term.'%')
                            ->orWhere('description', 'like', '%'.$term.'%');
                    });
                }),
                AllowedFilter::callback('price_min', function ($query, $value) {
                    if ($value !== null && $value !== '') {
                        $query->where('price', '>=', (float) $value);
                    }
                }),
                AllowedFilter::callback('price_max', function ($query, $value) {
                    if ($value !== null && $value !== '') {
                        $query->where('price', '<=', (float) $value);
                    }
                }),
            ])
            ->allowedSorts(['title', 'price', 'created_at', 'place'])
            ->defaultSort('title')
            ->with(['category', 'photos'])
            ->get();
    }

    public function findByIdAndUser(int $id, User $user): ?Item
    {
        return Item::query()
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->with(['category', 'photos'])
            ->first();
    }

    public function loadDisplayRelations(Item $item): Item
    {
        $item->load(['category', 'photos']);

        return $item;
    }

    public function create(User $user, ItemData $data): Item
    {
        return $user->items()->create($data->getFillable());
    }

    public function update(Item $item, ItemData $data): Item
    {
        $item->update($data->getFillable());

        return $item->fresh(['category', 'photos']);
    }

    public function delete(Item $item): void
    {
        $item->delete();
    }

    public function addPhoto(Item $item, string $path, int $order = 0): ItemPhoto
    {
        return $item->photos()->create([
            'path' => $path,
            'order' => $order,
        ]);
    }

    public function deletePhoto(ItemPhoto $photo): void
    {
        $photo->delete();
    }

    public function reorderPhotos(Item $item, array $photoIdsInOrder): void
    {
        foreach ($photoIdsInOrder as $order => $id) {
            $item->photos()->where('id', $id)->update(['order' => $order]);
        }
    }

    /**
     * @return array<string, int>
     */
    public function getCountByPlace(User $user): array
    {
        return Item::query()
            ->where('user_id', $user->id)
            ->selectRaw('place, count(*) as count')
            ->groupBy('place')
            ->pluck('count', 'place')
            ->all();
    }

    public function getTotalCountByUser(User $user): int
    {
        return Item::query()
            ->where('user_id', $user->id)
            ->count();
    }

    public function getCountWithPhotosByUser(User $user): int
    {
        return Item::query()
            ->where('user_id', $user->id)
            ->whereHas('photos')
            ->count();
    }
}

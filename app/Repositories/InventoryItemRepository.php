<?php

namespace App\Repositories;

use App\DTOs\InventoryItemData;
use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InventoryItemRepository
{
    public function index(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = InventoryItem::query()
            ->forUser($user)
            ->with('photos')
            ->byCategory($filters['category'] ?? null)
            ->byPlace($filters['place'] ?? null)
            ->latest();

        return $query->paginate($perPage);
    }

    public function find(int $id, User $user): ?InventoryItem
    {
        return InventoryItem::query()
            ->forUser($user)
            ->with('photos')
            ->find($id);
    }

    public function create(User $user, InventoryItemData $data): InventoryItem
    {
        $item = new InventoryItem($data->toFillableArray());
        $item->user_id = $user->id;
        $item->save();

        return $item;
    }

    public function update(InventoryItem $item, InventoryItemData $data): InventoryItem
    {
        $item->update($data->toFillableArray());

        return $item->fresh();
    }

    public function delete(InventoryItem $item): bool
    {
        return $item->delete();
    }
}

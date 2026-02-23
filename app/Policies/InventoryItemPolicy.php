<?php

namespace App\Policies;

use App\Models\InventoryItem;
use App\Models\User;

class InventoryItemPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, InventoryItem $inventoryItem): bool
    {
        return $inventoryItem->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, InventoryItem $inventoryItem): bool
    {
        return $inventoryItem->user_id === $user->id;
    }

    public function delete(User $user, InventoryItem $inventoryItem): bool
    {
        return $inventoryItem->user_id === $user->id;
    }
}

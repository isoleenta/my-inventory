<?php

namespace App\Repositories;

use App\DTOs\PlaceData;
use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

final class PlaceRepository
{
    /**
     * @return Collection<int, Place>
     */
    public function getByUser(User $user): Collection
    {
        return Place::query()
            ->where('user_id', $user->id)
            ->orderBy('name')
            ->get();
    }

    /**
     * @return Collection<int, Place>
     */
    public function getByUserWithItemCount(User $user): Collection
    {
        return Place::query()
            ->where('user_id', $user->id)
            ->withCount('items')
            ->orderBy('name')
            ->get();
    }

    public function findByIdAndUser(int $id, User $user): ?Place
    {
        return Place::query()
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();
    }

    public function create(User $user, PlaceData $data): Place
    {
        return $user->places()->create($data->getFillable());
    }

    public function update(Place $place, PlaceData $data): Place
    {
        $place->update($data->getFillable());

        return $place->fresh();
    }

    public function delete(Place $place): void
    {
        $place->delete();
    }
}

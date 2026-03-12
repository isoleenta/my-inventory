<?php

namespace App\Services;

use App\DTOs\PlaceData;
use App\Models\Place;
use App\Models\User;
use App\Repositories\PlaceRepository;
use Illuminate\Database\Eloquent\Collection;

final class PlaceService
{
    public function __construct(
        private readonly PlaceRepository $placeRepository
    ) {}

    /**
     * @return Collection<int, Place>
     */
    public function listForUser(User $user): Collection
    {
        return $this->placeRepository->getByUser($user);
    }

    /**
     * @return Collection<int, Place>
     */
    public function listForUserWithItemCount(User $user): Collection
    {
        return $this->placeRepository->getByUserWithItemCount($user);
    }

    public function findOrFail(int $id, User $user): Place
    {
        $place = $this->placeRepository->findByIdAndUser($id, $user);

        if ($place === null) {
            abort(404);
        }

        return $place;
    }

    public function create(User $user, PlaceData $data): Place
    {
        return $this->placeRepository->create($user, $data);
    }

    public function update(Place $place, PlaceData $data): Place
    {
        return $this->placeRepository->update($place, $data);
    }

    public function delete(Place $place): void
    {
        $this->placeRepository->delete($place);
    }

    /**
     * Options for selects: id => name.
     *
     * @return array<int, string>
     */
    public function getOptionsForUser(User $user): array
    {
        return $this->placeRepository->getByUser($user)
            ->pluck('name', 'id')
            ->all();
    }
}

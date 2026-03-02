<?php

namespace App\Services;

use App\DTOs\ItemData;
use App\Enums\PlaceType;
use App\Models\Item;
use App\Models\ItemPhoto;
use App\Models\User;
use App\Repositories\ItemRepository;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

final class ItemService
{
    public function __construct(
        private readonly ItemRepository $itemRepository,
        private readonly Filesystem $storage
    ) {}

    /**
     * @return Collection<int, Item>
     */
    public function listForUserWithQueryBuilder(User $user, \Illuminate\Http\Request $request): Collection
    {
        return $this->itemRepository->getByUserWithQueryBuilder($user, $request);
    }

    public function findOrFail(int $id, User $user): Item
    {
        $item = $this->itemRepository->findByIdAndUser($id, $user);

        if ($item === null) {
            abort(404);
        }

        return $item;
    }

    public function loadDisplayRelations(Item $item): Item
    {
        return $this->itemRepository->loadDisplayRelations($item);
    }

    /**
     * @param  array<int, UploadedFile>  $photos
     */
    public function create(User $user, ItemData $data, array $photos = []): Item
    {
        $item = $this->itemRepository->create($user, $data);

        foreach ($photos as $index => $file) {
            $path = $this->storePhoto($item, $file, $index);
            $this->itemRepository->addPhoto($item, $path, $index);
        }

        return $item->fresh(['category', 'photos']);
    }

    /**
     * @param  array<int, UploadedFile>  $newPhotos
     */
    public function update(Item $item, ItemData $data, array $newPhotos = []): Item
    {
        $item = $this->itemRepository->update($item, $data);

        $maxOrder = $item->photos->max('order') ?? -1;
        foreach ($newPhotos as $index => $file) {
            $maxOrder++;
            $path = $this->storePhoto($item, $file, $maxOrder);
            $this->itemRepository->addPhoto($item, $path, $maxOrder);
        }

        return $item->fresh(['category', 'photos']);
    }

    public function delete(Item $item): void
    {
        foreach ($item->photos as $photo) {
            $this->storage->delete($photo->path);
        }
        $this->itemRepository->delete($item);
    }

    public function deletePhoto(ItemPhoto $photo): void
    {
        $this->storage->delete($photo->path);
        $this->itemRepository->deletePhoto($photo);
    }

    /**
     * @return array<int, array{value: string, label: string, count: int}>
     */
    public function getPlacesWithCounts(User $user): array
    {
        $counts = $this->itemRepository->getCountByPlace($user);
        $result = [];
        foreach (PlaceType::cases() as $place) {
            $result[] = [
                'value' => $place->value,
                'label' => $place->label(),
                'count' => (int) ($counts[$place->value] ?? 0),
            ];
        }

        return $result;
    }

    public function getTotalCountByUser(User $user): int
    {
        return $this->itemRepository->getTotalCountByUser($user);
    }

    public function getCountWithPhotosByUser(User $user): int
    {
        return $this->itemRepository->getCountWithPhotosByUser($user);
    }

    private function storePhoto(Item $item, UploadedFile $file, int $order): string
    {
        return $this->storage->putFile('items/'.$item->id, $file);
    }
}

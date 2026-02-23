<?php

namespace App\Services;

use App\DTOs\InventoryItemData;
use App\Models\InventoryItem;
use App\Models\User;
use App\Repositories\InventoryItemRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class InventoryItemService
{
    public function __construct(
        private InventoryItemRepository $repository
    ) {}

    public function index(User $user, array $filters = [], int $perPage = 15)
    {
        return $this->repository->index($user, $filters, $perPage);
    }

    public function find(int $id, User $user): ?InventoryItem
    {
        return $this->repository->find($id, $user);
    }

    public function create(User $user, InventoryItemData $data, array $photos = []): InventoryItem
    {
        $item = $this->repository->create($user, $data);
        $this->storePhotos($item, $photos);

        return $item->load('photos');
    }

    public function update(InventoryItem $item, InventoryItemData $data, array $newPhotos = []): InventoryItem
    {
        $this->repository->update($item, $data);
        if (! empty($newPhotos)) {
            $this->storePhotos($item, $newPhotos);
        }

        return $item->fresh(['photos']);
    }

    public function delete(InventoryItem $item): bool
    {
        $this->deleteAllPhotos($item);

        return $this->repository->delete($item);
    }

    private function storePhotos(InventoryItem $item, array $files): void
    {
        $sortOrder = $item->photos()->max('sort_order') ?? 0;
        $dir = 'item-photos/'.$item->id;

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }
            $path = $file->store($dir, 'public');
            $sortOrder++;
            $item->photos()->create([
                'path' => $path,
                'sort_order' => $sortOrder,
            ]);
        }
    }

    private function deleteAllPhotos(InventoryItem $item): void
    {
        foreach ($item->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }
        $item->photos()->delete();
    }
}

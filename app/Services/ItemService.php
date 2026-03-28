<?php

namespace App\Services;

use App\DTOs\ItemData;
use App\Models\Item;
use App\Models\ItemPhoto;
use App\Models\User;
use App\Repositories\ItemRepository;
use Illuminate\Contracts\Filesystem\Factory as FilesystemFactory;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use RuntimeException;

final class ItemService
{
    public function __construct(
        private readonly ItemRepository $itemRepository,
        private readonly PlaceService $placeService,
        private readonly FilesystemFactory $filesystems,
        private readonly CategoryService $categoryService,
        private readonly OllamaProductEnricher $ollamaProductEnricher,
        private readonly CurrencyRateService $currencyRateService
    ) {}

    public function listForUserWithQueryBuilder(User $user, \Illuminate\Http\Request $request): LengthAwarePaginator
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
        $item = $this->itemRepository->create($user, $this->normalizeForStorage($data));
        $this->syncPhotos($item, $photos, $data->photo_order);

        return $item->fresh(['category', 'place', 'photos']);
    }

    public function createForImport(User $user, ItemData $data): Item
    {
        return $this->itemRepository->create($user, $this->normalizeForStorage($data));
    }

    /**
     * @param  array<int, UploadedFile>  $newPhotos
     */
    public function update(Item $item, ItemData $data, array $newPhotos = []): Item
    {
        $item = $this->itemRepository->update($item, $this->normalizeForStorage($data));
        $item->loadMissing('photos');

        foreach ($item->photos->whereIn('id', $data->removed_photo_ids) as $photo) {
            $this->deletePhoto($photo);
        }

        $item = $item->fresh(['category', 'place', 'photos']);
        $this->syncPhotos($item, $newPhotos, $data->photo_order);

        return $item->fresh(['category', 'place', 'photos']);
    }

    public function regenerateTitleAndCategory(User $user, Item $item): Item
    {
        $enrichment = $this->ollamaProductEnricher->enrich(
            $item->title,
            $this->categoryService->listForUser($user)
        );

        return $this->itemRepository->update($item, new ItemData(
            title: $enrichment['title'],
            place_id: $item->place_id,
            description: $item->description,
            category_id: $enrichment['category_id'] ?? $item->category_id,
            price: $item->price !== null ? (string) $item->price : null,
            price_currency: CurrencyRateService::USD,
            purchased_on: $item->purchased_on?->format('Y-m-d'),
            details: $item->details ?? []
        ));
    }

    public function delete(Item $item): void
    {
        foreach ($item->photos as $photo) {
            $this->photoStorage()->delete($photo->path);
        }
        $this->itemRepository->delete($item);
    }

    public function deletePhoto(ItemPhoto $photo): void
    {
        $this->photoStorage()->delete($photo->path);
        $this->itemRepository->deletePhoto($photo);
    }

    public function addPhotoFromContents(Item $item, string $contents, string $extension = 'jpg', int $order = 0): ItemPhoto
    {
        $extension = trim(strtolower($extension), '.');
        if ($extension === '') {
            $extension = 'jpg';
        }

        $path = sprintf('items/%d/%s.%s', $item->id, str()->uuid(), $extension);
        $this->photoStorage()->put($path, $contents);

        return $this->itemRepository->addPhoto($item, $path, $order);
    }

    /**
     * @return array<int, array{value: int, label: string, count: int}>
     */
    public function getPlacesWithCounts(User $user): array
    {
        $places = $this->placeService->listForUserWithItemCount($user);

        return $places->map(fn ($place) => [
            'value' => $place->id,
            'label' => $place->name,
            'count' => (int) $place->items_count,
        ])->all();
    }

    public function getTotalCountByUser(User $user): int
    {
        return $this->itemRepository->getTotalCountByUser($user);
    }

    public function getCountWithPhotosByUser(User $user): int
    {
        return $this->itemRepository->getCountWithPhotosByUser($user);
    }

    private function normalizeForStorage(ItemData $data): ItemData
    {
        try {
            $price = $this->currencyRateService->convertToStoredUsd($data->price, $data->price_currency);
        } catch (RuntimeException $e) {
            throw ValidationException::withMessages([
                'price' => $e->getMessage(),
            ]);
        }

        return new ItemData(
            title: $data->title,
            place_id: $data->place_id,
            description: $data->description,
            category_id: $data->category_id,
            price: $price,
            price_currency: CurrencyRateService::USD,
            purchased_on: $data->purchased_on,
            details: $data->details,
            photo_order: $data->photo_order,
            removed_photo_ids: $data->removed_photo_ids
        );
    }

    /**
     * @param  array<int, UploadedFile>  $newPhotos
     * @param  array<int, string>  $photoOrder
     */
    private function syncPhotos(Item $item, array $newPhotos, array $photoOrder): void
    {
        $item->loadMissing('photos');

        if ($photoOrder === []) {
            $maxOrder = $item->photos->max('order') ?? -1;

            foreach ($newPhotos as $file) {
                $maxOrder++;
                $path = $this->storePhoto($item, $file, $maxOrder);
                $this->itemRepository->addPhoto($item, $path, $maxOrder);
            }

            return;
        }

        $existingPhotos = $item->photos->keyBy('id');
        $usedExistingIds = [];
        $usedNewIndexes = [];
        $order = 0;

        foreach ($photoOrder as $token) {
            [$type, $rawValue] = explode(':', $token, 2);
            $value = (int) $rawValue;

            if ($type === 'existing') {
                $photo = $existingPhotos->get($value);
                if ($photo === null) {
                    continue;
                }

                $photo->update(['order' => $order]);
                $usedExistingIds[$photo->id] = true;
                $order++;

                continue;
            }

            if (! isset($newPhotos[$value])) {
                continue;
            }

            $path = $this->storePhoto($item, $newPhotos[$value], $order);
            $this->itemRepository->addPhoto($item, $path, $order);
            $usedNewIndexes[$value] = true;
            $order++;
        }

        foreach ($existingPhotos as $photo) {
            if (($usedExistingIds[$photo->id] ?? false) === true) {
                continue;
            }

            $photo->update(['order' => $order]);
            $order++;
        }

        foreach ($newPhotos as $index => $file) {
            if (($usedNewIndexes[$index] ?? false) === true) {
                continue;
            }

            $path = $this->storePhoto($item, $file, $order);
            $this->itemRepository->addPhoto($item, $path, $order);
            $order++;
        }
    }

    private function storePhoto(Item $item, UploadedFile $file, int $order): string
    {
        return $this->photoStorage()->putFile('items/'.$item->id, $file);
    }

    private function photoStorage(): Filesystem
    {
        return $this->filesystems->disk('public');
    }
}

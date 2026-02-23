<?php

namespace App\DTOs;

use App\Enums\InventoryCategory;
use Spatie\DataTransferObject\DataTransferObject;

class InventoryItemData extends DataTransferObject
{
    public string $title;

    public ?string $description = null;

    public ?string $category = null;

    public ?string $place = null;

    /**
     * Keys used for create/update on InventoryItem model (no photos; handled in service).
     *
     * @return array<int, string>
     */
    public static function getFillable(): array
    {
        return ['title', 'description', 'category', 'place'];
    }

    /**
     * Create from validated request array (e.g. StoreInventoryItemRequest::validated()).
     *
     * @param  array<string, mixed>  $data
     */
    public static function fromRequest(array $data): self
    {
        $filtered = array_intersect_key($data, array_flip(self::getFillable()));

        return new self([
            'title' => $filtered['title'] ?? '',
            'description' => $filtered['description'] ?? null,
            'category' => isset($filtered['category']) && $filtered['category'] !== ''
                ? (InventoryCategory::tryFrom($filtered['category'])?->value ?? $filtered['category'])
                : null,
            'place' => isset($filtered['place']) && $filtered['place'] !== ''
                ? $filtered['place']
                : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function toFillableArray(): array
    {
        $all = $this->all();

        return array_intersect_key($all, array_flip(self::getFillable()));
    }
}

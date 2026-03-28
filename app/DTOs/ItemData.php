<?php

namespace App\DTOs;

/**
 * @phpstan-type FillableArray array{category_id?: int|null, place_id: int, title: string, description?: string|null, price?: string|null, purchased_on?: string|null, details?: array<string, string|null>}
 */
final class ItemData
{
    /**
     * @param  array<string, string|null>  $details
     * @param  array<int, string>  $photo_order
     * @param  array<int, int>  $removed_photo_ids
     */
    public function __construct(
        public readonly string $title,
        public readonly int $place_id,
        public readonly ?string $description = null,
        public readonly ?int $category_id = null,
        public readonly ?string $price = null,
        public readonly string $price_currency = 'USD',
        public readonly ?string $purchased_on = null,
        public readonly array $details = [],
        public readonly array $photo_order = [],
        public readonly array $removed_photo_ids = [],
    ) {}

    /**
     * @return FillableArray
     */
    public function getFillable(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'place_id' => $this->place_id,
            'price' => $this->price,
            'purchased_on' => $this->purchased_on,
            'details' => $this->details,
        ];
    }
}

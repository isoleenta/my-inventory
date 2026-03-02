<?php

namespace App\DTOs;

/**
 * @phpstan-type FillableArray array{category_id?: int|null, place: string, custom_place?: string|null, title: string, description?: string|null, price?: string|null, details?: array<string, string|null>}
 */
final class ItemData
{
    /**
     * @param  array<string, string|null>  $details
     */
    public function __construct(
        public readonly string $title,
        public readonly string $place,
        public readonly ?string $description = null,
        public readonly ?int $category_id = null,
        public readonly ?string $custom_place = null,
        public readonly ?string $price = null,
        public readonly array $details = []
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
            'place' => $this->place,
            'custom_place' => $this->custom_place,
            'price' => $this->price,
            'details' => $this->details,
        ];
    }
}

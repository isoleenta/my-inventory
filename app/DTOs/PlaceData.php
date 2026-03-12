<?php

namespace App\DTOs;

/**
 * @phpstan-type FillableArray array{name: string}
 */
final class PlaceData
{
    public function __construct(
        public readonly string $name
    ) {}

    /**
     * @return FillableArray
     */
    public function getFillable(): array
    {
        return [
            'name' => $this->name,
        ];
    }
}

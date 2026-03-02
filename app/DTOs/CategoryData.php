<?php

namespace App\DTOs;

/**
 * @phpstan-type FieldDefinition array{key: string, label: string, type: string}
 * @phpstan-type FillableArray array{name: string, fields: array<int, FieldDefinition>}
 */
final class CategoryData
{
    /**
     * @param  array<int, array{key: string, label: string, type: string}>  $fields
     */
    public function __construct(
        public readonly string $name,
        public readonly array $fields = []
    ) {}

    /**
     * @return FillableArray
     */
    public function getFillable(): array
    {
        return [
            'name' => $this->name,
            'fields' => $this->fields,
        ];
    }
}

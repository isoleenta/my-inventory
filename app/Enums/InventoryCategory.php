<?php

namespace App\Enums;

enum InventoryCategory: string
{
    case Electronics = 'electronics';
    case Tools = 'tools';
    case Food = 'food';
    case Clothing = 'clothing';
    case Documents = 'documents';
    case Media = 'media';
    case Sports = 'sports';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Electronics => 'Electronics',
            self::Tools => 'Tools',
            self::Food => 'Food',
            self::Clothing => 'Clothing',
            self::Documents => 'Documents',
            self::Media => 'Media',
            self::Sports => 'Sports',
            self::Other => 'Other',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[] = ['value' => $case->value, 'label' => $case->label()];
        }

        return $options;
    }
}

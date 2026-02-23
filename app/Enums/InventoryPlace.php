<?php

namespace App\Enums;

enum InventoryPlace: string
{
    case Garage = 'garage';
    case Bedroom = 'bedroom';
    case Kitchen = 'kitchen';
    case Fridge = 'fridge';
    case Drawers = 'drawers';
    case Bathroom = 'bathroom';
    case Office = 'office';
    case LivingRoom = 'living_room';
    case Storage = 'storage';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Garage => 'Garage',
            self::Bedroom => 'Bedroom',
            self::Kitchen => 'Kitchen',
            self::Fridge => 'Fridge',
            self::Drawers => 'Drawers',
            self::Bathroom => 'Bathroom',
            self::Office => 'Office',
            self::LivingRoom => 'Living room',
            self::Storage => 'Storage',
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

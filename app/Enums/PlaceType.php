<?php

namespace App\Enums;

enum PlaceType: string
{
    case Garage = 'garage';
    case Bedroom = 'bedroom';
    case Kitchen = 'kitchen';
    case Fridge = 'fridge';
    case Drawer = 'drawer';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Garage => 'Garage',
            self::Bedroom => 'Bedroom',
            self::Kitchen => 'Kitchen',
            self::Fridge => 'Fridge',
            self::Drawer => 'Drawer',
            self::Other => 'Other',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[$case->value] = $case->label();
        }

        return $options;
    }
}

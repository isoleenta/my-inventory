<?php

namespace App\Http\Requests\Inventory;

use App\Enums\InventoryCategory;
use App\Models\Place;
use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $categoryValues = array_column(InventoryCategory::cases(), 'value');
        $placeOptions = Place::optionsForUser($this->user());
        $placeValues = array_column($placeOptions, 'value');

        $placeRule = ['nullable', 'string'];
        if (count($placeValues) > 0) {
            $placeRule[] = 'in:'.implode(',', $placeValues);
        }

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'category' => ['nullable', 'string', 'in:'.implode(',', $categoryValues)],
            'place' => $placeRule,
            'photos' => ['nullable', 'array', 'max:10'],
            'photos.*' => ['image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ];
    }
}

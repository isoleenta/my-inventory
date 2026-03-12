<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'filter' => ['nullable', 'array'],
            'filter.category_id' => [
                'nullable',
                'integer',
                'min:1',
                Rule::exists('categories', 'id')->where('user_id', $this->user('web_user')->id),
            ],
            'filter.place_id' => [
                'nullable',
                'integer',
                'min:1',
                Rule::exists('places', 'id')->where('user_id', $this->user('web_user')->id),
            ],
            'filter.name' => ['nullable', 'string', 'max:255'],
            'filter.price_min' => ['nullable', 'numeric', 'min:0'],
            'filter.price_max' => ['nullable', 'numeric', 'min:0'],
            'sort' => [
                'nullable',
                'string',
                Rule::in([
                    'title', '-title',
                    'price', '-price',
                    'created_at', '-created_at',
                    'place', '-place',
                ]),
            ],
        ];
    }

    /**
     * @return array{category_id: int|null, place_id: int|null, name: string|null, price_min: string|float|null, price_max: string|float|null}
     */
    public function getFilters(): array
    {
        $filter = $this->validated('filter', []);
        $filter = is_array($filter) ? $filter : [];

        $categoryId = $filter['category_id'] ?? null;
        $categoryId = $categoryId !== null && $categoryId !== '' && (int) $categoryId > 0 ? (int) $categoryId : null;

        $placeId = isset($filter['place_id']) && (int) $filter['place_id'] > 0 ? (int) $filter['place_id'] : null;
        $name = isset($filter['name']) && trim((string) $filter['name']) !== '' ? trim((string) $filter['name']) : null;
        $priceMin = isset($filter['price_min']) && $filter['price_min'] !== null && $filter['price_min'] !== '' ? $filter['price_min'] : null;
        $priceMax = isset($filter['price_max']) && $filter['price_max'] !== null && $filter['price_max'] !== '' ? $filter['price_max'] : null;

        return [
            'category_id' => $categoryId,
            'place_id' => $placeId,
            'name' => $name,
            'price_min' => $priceMin,
            'price_max' => $priceMax,
        ];
    }

    public function getSort(): string
    {
        $sort = $this->validated('sort');

        return is_string($sort) && $sort !== '' ? $sort : 'title';
    }
}

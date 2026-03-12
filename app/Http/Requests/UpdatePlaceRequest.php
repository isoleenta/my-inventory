<?php

namespace App\Http\Requests;

use App\DTOs\PlaceData;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePlaceRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
        ];
    }

    public function toDTO(): PlaceData
    {
        return new PlaceData(
            name: $this->validated('name')
        );
    }
}

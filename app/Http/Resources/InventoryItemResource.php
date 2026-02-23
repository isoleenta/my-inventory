<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class InventoryItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category?->value,
            'place' => $this->place,
            'photos' => $this->whenLoaded('photos', fn () => $this->photos->map(function ($photo) {
                return [
                    'id' => $photo->id,
                    'path' => $photo->path,
                    'url' => Storage::url($photo->path),
                    'sort_order' => $photo->sort_order,
                ];
            })->values()->all()),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

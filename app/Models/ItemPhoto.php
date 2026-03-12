<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ItemPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'path',
        'order',
    ];

    protected $appends = ['url'];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function url(): string
    {
        return Storage::disk('public')->url($this->path);
    }

    public function getUrlAttribute(): string
    {
        return $this->url();
    }
}

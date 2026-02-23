<?php

namespace App\Models;

use App\Enums\InventoryCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'place',
    ];

    protected function casts(): array
    {
        return [
            'category' => InventoryCategory::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(InventoryItemPhoto::class)->orderBy('sort_order');
    }

    public function scopeForUser($query, User $user)
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeByCategory($query, ?string $category)
    {
        if ($category === null || $category === '') {
            return $query;
        }

        return $query->where('category', $category);
    }

    public function scopeByPlace($query, ?string $place)
    {
        if ($place === null || $place === '') {
            return $query;
        }

        return $query->where('place', $place);
    }
}

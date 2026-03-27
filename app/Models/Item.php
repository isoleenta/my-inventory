<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'place_id',
        'title',
        'description',
        'price',
        'details',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array',
            'price' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ItemPhoto::class)->orderBy('order');
    }

    public function resolveRouteBinding($value, $field = null): ?static
    {
        $user = auth('web_user')->user();

        return $user
            ? static::query()->where('user_id', $user->id)->where($field ?? $this->getRouteKeyName(), $value)->first()
            : null;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Place extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    public function resolveRouteBinding($value, $field = null): ?static
    {
        $user = auth('web_user')->user();

        return $user
            ? static::query()->where('user_id', $user->id)->where($field ?? $this->getRouteKeyName(), $value)->first()
            : null;
    }
}

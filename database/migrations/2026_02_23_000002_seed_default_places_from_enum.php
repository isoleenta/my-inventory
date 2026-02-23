<?php

use App\Enums\InventoryPlace;
use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('places')) {
            return;
        }

        foreach (User::query()->pluck('id') as $userId) {
            foreach (InventoryPlace::cases() as $case) {
                Place::query()->firstOrCreate(
                    [
                        'user_id' => $userId,
                        'value' => $case->value,
                    ],
                    [
                        'name' => $case->label(),
                        'sort_order' => 0,
                    ]
                );
            }
        }
    }

    public function down(): void
    {
        // Optional: delete default places. Leave as no-op to avoid data loss.
    }
};

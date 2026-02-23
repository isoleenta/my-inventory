<?php

namespace App\Providers;

use App\Models\InventoryItem;
use App\Models\Place;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Resolve 'inventory' route parameter to InventoryItem (resource name ≠ model name)
        Route::bind('inventory', fn (string $value) => InventoryItem::findOrFail($value));
        Route::bind('place', fn (string $value) => Place::findOrFail($value));
    }
}

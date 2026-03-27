<?php

use App\Http\Controllers\AliExpressImportController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\ProfileController;
use App\Models\Category;
use App\Models\Item;
use App\Models\Place;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth:web_user', 'verified'])
    ->name('dashboard');

Route::middleware('auth:web_user')->group(function () {
    Route::prefix('profile')->name('profile.')->controller(ProfileController::class)->group(function () {
        Route::get('/', 'edit')->name('edit');
        Route::patch('/', 'update')->name('update');
        Route::delete('/', 'destroy')->name('destroy');
    });

    Route::prefix('inventory')->name('inventory.')->controller(InventoryController::class)->group(function () {
        Route::get('/', 'index')
            ->can('viewAny', Item::class)
            ->name('index');
        Route::get('/place/{place}', 'place')
            ->can('viewAny', Item::class)
            ->name('show');
    });

    Route::prefix('places')->name('places.')->controller(PlaceController::class)->group(function () {
        Route::get('/', 'index')->can('viewAny', Place::class)->name('index');
        Route::get('/create', 'create')->can('create', Place::class)->name('create');
        Route::post('/', 'store')->can('create', Place::class)->name('store');
        Route::prefix('{place}')->group(function () {
            Route::get('/edit', 'edit')->can('update', 'place')->name('edit');
            Route::put('/', 'update')->can('update', 'place')->name('update');
            Route::patch('/', 'update')->can('update', 'place')->name('patch');
            Route::delete('/', 'destroy')->can('delete', 'place')->name('destroy');
        });
    });

    Route::prefix('items')->name('items.')->controller(ItemController::class)->group(function () {
        Route::prefix('imports/aliexpress')
            ->name('imports.aliexpress.')
            ->controller(AliExpressImportController::class)
            ->group(function () {
                Route::get('/', 'create')->can('create', Item::class)->name('create');
                Route::post('/preview', 'preview')->can('create', Item::class)->name('preview');
                Route::post('/', 'store')->can('create', Item::class)->name('store');
            });
        Route::get('/create', 'create')->can('create', Item::class)->name('create');
        Route::post('/', 'store')->can('create', Item::class)->name('store');
        Route::prefix('{item}')->group(function () {
            Route::get('/', 'show')->can('view', 'item')->name('show');
            Route::get('/edit', 'edit')->can('update', 'item')->name('edit');
            Route::post('/regenerate', 'regenerate')->can('update', 'item')->name('regenerate');
            Route::put('/', 'update')->can('update', 'item')->name('update');
            Route::patch('/', 'update')->can('update', 'item')->name('patch');
            Route::delete('/', 'destroy')->can('delete', 'item')->name('destroy');
        });
    });

    Route::prefix('categories')->name('categories.')->controller(CategoryController::class)->group(function () {
        Route::get('/', 'index')->can('viewAny', Category::class)->name('index');
        Route::get('/create', 'create')->can('create', Category::class)->name('create');
        Route::post('/', 'store')->can('create', Category::class)->name('store');
        Route::prefix('{category}')->group(function () {
            Route::get('/edit', 'edit')->can('update', 'category')->name('edit');
            Route::put('/', 'update')->can('update', 'category')->name('update');
            Route::patch('/', 'update')->can('update', 'category')->name('patch');
            Route::delete('/', 'destroy')->can('delete', 'category')->name('destroy');
        });
    });
});

require __DIR__.'/auth.php';

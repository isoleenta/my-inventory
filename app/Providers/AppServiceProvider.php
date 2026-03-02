<?php

namespace App\Providers;

use App\Services\ItemService;
use App\Services\ProfileService;
use App\Services\RegistrationService;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->when([RegistrationService::class, ProfileService::class])
            ->needs(StatefulGuard::class)
            ->give(fn () => $this->app['auth']->guard('web_user'));

        $this->app->when(ItemService::class)
            ->needs(Filesystem::class)
            ->give(fn () => Storage::disk('public'));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}

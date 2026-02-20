<?php

use Illuminate\Console\Command;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    return tap(app(Command::class), function (Command $command) {
        $command->comment(Inspiring::quote());
    });
})->purpose('Display an inspiring quote')->hourly();

Schedule::command('telescope:prune')->daily();

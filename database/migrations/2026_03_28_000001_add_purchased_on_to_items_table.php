<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->date('purchased_on')->nullable()->after('price');
        });

        DB::table('items')
            ->select(['id', 'details'])
            ->whereNotNull('details')
            ->orderBy('id')
            ->chunkById(100, function ($items): void {
                foreach ($items as $item) {
                    $details = is_array($item->details)
                        ? $item->details
                        : json_decode((string) $item->details, true);

                    if (! is_array($details) || ! isset($details['_purchased_on'])) {
                        continue;
                    }

                    $purchasedOn = $details['_purchased_on'];
                    unset($details['_purchased_on']);

                    DB::table('items')
                        ->where('id', $item->id)
                        ->update([
                            'purchased_on' => $this->normalizeDate($purchasedOn),
                            'details' => $details === [] ? null : json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        ]);
                }
            });
    }

    public function down(): void
    {
        DB::table('items')
            ->select(['id', 'details', 'purchased_on'])
            ->whereNotNull('purchased_on')
            ->orderBy('id')
            ->chunkById(100, function ($items): void {
                foreach ($items as $item) {
                    $details = is_array($item->details)
                        ? $item->details
                        : json_decode((string) $item->details, true);

                    if (! is_array($details)) {
                        $details = [];
                    }

                    $details['_purchased_on'] = $item->purchased_on;

                    DB::table('items')
                        ->where('id', $item->id)
                        ->update([
                            'details' => json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        ]);
                }
            });

        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn('purchased_on');
        });
    }

    private function normalizeDate(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
};

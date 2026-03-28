<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class CurrencyRateService
{
    public const USD = 'USD';

    public const UAH = 'UAH';

    private const CACHE_KEY = 'currency.nbu.usd_uah_rate';

    /**
     * @return array{usd_to_uah_rate: float, exchangedate: string|null, calcdate: string|null, source: string}|null
     */
    public function getUsdToUahRatePayload(): ?array
    {
        $cached = Cache::get(self::CACHE_KEY);

        if (is_array($cached) && $this->isFresh($cached)) {
            return $this->normalizePayload($cached);
        }

        if (app()->runningUnitTests()) {
            return $this->fallbackPayload() ?? $this->normalizePayload($cached);
        }

        try {
            $today = now()->format('Ymd');
            $endpoint = sprintf(
                '%s?start=%s&end=%s&valcode=usd&sort=exchangedate&order=desc&json',
                rtrim((string) config('services.nbu.endpoint'), '?'),
                $today,
                $today
            );

            $response = Http::timeout((int) config('services.nbu.timeout', 10))
                ->acceptJson()
                ->get($endpoint)
                ->throw();

            $items = $response->json();
            $first = is_array($items) ? ($items[0] ?? null) : null;

            if (! is_array($first) || ! isset($first['rate']) || ! is_numeric($first['rate'])) {
                throw new RuntimeException('Unexpected NBU response payload.');
            }

            $payload = [
                'usd_to_uah_rate' => round((float) $first['rate'], 6),
                'exchangedate' => isset($first['exchangedate']) ? (string) $first['exchangedate'] : null,
                'calcdate' => isset($first['calcdate']) ? (string) $first['calcdate'] : null,
                'source' => 'NBU',
                'fetched_at' => now()->timestamp,
            ];

            Cache::put(self::CACHE_KEY, $payload, now()->addSeconds((int) config('services.nbu.cache_ttl_seconds', 21600)));

            return $this->normalizePayload($payload);
        } catch (\Throwable) {
            return $this->normalizePayload($cached)
                ?? $this->fallbackPayload();
        }
    }

    public function convertToStoredUsd(?string $amount, string $sourceCurrency = self::USD): ?string
    {
        if ($amount === null || trim($amount) === '') {
            return null;
        }

        $normalizedAmount = $this->normalizeAmount($amount);

        if ($sourceCurrency === self::USD) {
            return $normalizedAmount;
        }

        $ratePayload = $this->getUsdToUahRatePayload();
        $usdToUahRate = $ratePayload['usd_to_uah_rate'] ?? null;

        if (! is_numeric($usdToUahRate) || (float) $usdToUahRate <= 0) {
            throw new RuntimeException('Unable to resolve the NBU USD rate for UAH conversion.');
        }

        return number_format((float) $normalizedAmount / (float) $usdToUahRate, 2, '.', '');
    }

    private function normalizeAmount(string $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }

    /**
     * @param  mixed  $payload
     * @return array{usd_to_uah_rate: float, exchangedate: string|null, calcdate: string|null, source: string}|null
     */
    private function normalizePayload(mixed $payload): ?array
    {
        if (! is_array($payload) || ! isset($payload['usd_to_uah_rate']) || ! is_numeric($payload['usd_to_uah_rate'])) {
            return null;
        }

        return [
            'usd_to_uah_rate' => round((float) $payload['usd_to_uah_rate'], 6),
            'exchangedate' => isset($payload['exchangedate']) ? (string) $payload['exchangedate'] : null,
            'calcdate' => isset($payload['calcdate']) ? (string) $payload['calcdate'] : null,
            'source' => isset($payload['source']) ? (string) $payload['source'] : 'NBU',
        ];
    }

    /**
     * @param  mixed  $payload
     */
    private function isFresh(mixed $payload): bool
    {
        if (! is_array($payload) || ! isset($payload['fetched_at']) || ! is_numeric($payload['fetched_at'])) {
            return false;
        }

        return (now()->timestamp - (int) $payload['fetched_at']) < (int) config('services.nbu.cache_ttl_seconds', 21600);
    }

    /**
     * @return array{usd_to_uah_rate: float, exchangedate: string|null, calcdate: string|null, source: string}|null
     */
    private function fallbackPayload(): ?array
    {
        $fallbackRate = config('services.nbu.fallback_usd_to_uah_rate');

        if (! is_numeric($fallbackRate) || (float) $fallbackRate <= 0) {
            return null;
        }

        return [
            'usd_to_uah_rate' => round((float) $fallbackRate, 6),
            'exchangedate' => null,
            'calcdate' => null,
            'source' => 'fallback',
        ];
    }
}

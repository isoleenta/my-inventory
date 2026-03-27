<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Http;

final class OllamaProductEnricher
{
    /**
     * @param  Collection<int, Category>  $categories
     * @return array{title: string, category_id: int|null, category_name: string|null}
     */
    public function enrich(string $title, Collection $categories): array
    {
        $originalTitle = $this->normalizeTitle($title);
        $categoryMap = $this->buildCategoryMap($categories);
        $response = $this->requestEnrichment($originalTitle, $categoryMap);

        $cleanedTitle = $this->normalizeTitle((string) ($response['cleaned_title'] ?? ''));
        if ($cleanedTitle === '') {
            $cleanedTitle = $originalTitle;
        }

        $categoryId = $this->resolveCategoryId(
            $response['category_id'] ?? null,
            $categoryMap,
            $cleanedTitle !== '' ? $cleanedTitle : $originalTitle
        );

        return [
            'title' => $cleanedTitle !== '' ? $cleanedTitle : $originalTitle,
            'category_id' => $categoryId,
            'category_name' => $categoryId !== null ? $categoryMap[$categoryId]['path'] : null,
        ];
    }

    /**
     * @param  array<int, array{name: string, path: string}>  $categoryMap
     * @return array<string, mixed>
     */
    private function requestEnrichment(string $title, array $categoryMap): array
    {
        $baseUrl = rtrim((string) config('services.ollama.base_url'), '/');
        $model = trim((string) config('services.ollama.model'));
        $timeout = max((int) config('services.ollama.timeout', 120), 1);

        if ($title === '' || $baseUrl === '' || $model === '') {
            return [];
        }

        try {
            $response = Http::connectTimeout(min($timeout, 10))
                ->timeout($timeout)
                ->acceptJson()
                ->post($baseUrl.'/api/generate', [
                    'model' => $model,
                    'prompt' => $this->buildPrompt($title, $categoryMap),
                    'stream' => false,
                    'format' => 'json',
                    'options' => [
                        'temperature' => 0.1,
                    ],
                ]);

            if (! $response->successful()) {
                return [];
            }

            $content = (string) $response->json('response');
            $decoded = json_decode($content, true);

            return is_array($decoded) ? $decoded : [];
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * @param  array<int, array{name: string, path: string}>  $categoryMap
     */
    private function buildPrompt(string $title, array $categoryMap): string
    {
        $categories = array_map(
            fn (int $id, array $category): array => [
                'id' => $id,
                'name' => $category['name'],
                'path' => $category['path'],
            ],
            array_keys($categoryMap),
            array_values($categoryMap)
        );

        return implode("\n\n", [
            'You clean imported ecommerce product titles and pick the best matching inventory category.',
            'Return strict JSON with exactly these keys: cleaned_title, category_id.',
            'Rules:',
            '- Keep the cleaned title concise and natural.',
            '- Remove keyword stuffing, duplicate adjectives, sexual/marketing spam, shipping text, and store noise.',
            '- Preserve the actual product identity, important size/material terms, and the source language when useful.',
            '- category_id must be one of the provided IDs or null if nothing fits.',
            'Product title:',
            $title,
            'Available categories:',
            json_encode($categories, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '[]',
        ]);
    }

    /**
     * @param  Collection<int, Category>  $categories
     * @return array<int, array{name: string, path: string}>
     */
    private function buildCategoryMap(Collection $categories): array
    {
        /** @var Collection<int, Category> $categoriesById */
        $categoriesById = $categories->keyBy('id');
        $map = [];

        foreach ($categories as $category) {
            $map[$category->id] = [
                'name' => $category->name,
                'path' => $this->buildCategoryPath($category, $categoriesById),
            ];
        }

        return $map;
    }

    /**
     * @param  Collection<int, Category>  $categoriesById
     */
    private function buildCategoryPath(Category $category, Collection $categoriesById): string
    {
        $segments = [$category->name];
        $parentId = $category->parent_id;

        while ($parentId !== null) {
            /** @var Category|null $parent */
            $parent = $categoriesById->get($parentId);
            if ($parent === null) {
                break;
            }

            array_unshift($segments, $parent->name);
            $parentId = $parent->parent_id;
        }

        return implode(' > ', $segments);
    }

    /**
     * @param  array<int, array{name: string, path: string}>  $categoryMap
     */
    private function resolveCategoryId(mixed $rawCategoryId, array $categoryMap, string $title): ?int
    {
        if (is_numeric($rawCategoryId)) {
            $categoryId = (int) $rawCategoryId;

            if (isset($categoryMap[$categoryId])) {
                return $categoryId;
            }
        }

        return $this->guessCategoryId($title, $categoryMap);
    }

    /**
     * @param  array<int, array{name: string, path: string}>  $categoryMap
     */
    private function guessCategoryId(string $title, array $categoryMap): ?int
    {
        $titleTokens = $this->tokenize($title);
        if ($titleTokens === []) {
            return null;
        }

        $bestCategoryId = null;
        $bestScore = 0.0;

        foreach ($categoryMap as $categoryId => $category) {
            $categoryTokens = $this->tokenize($category['path'].' '.$category['name']);
            if ($categoryTokens === []) {
                continue;
            }

            $score = 0.0;
            $sharedTokens = array_intersect($titleTokens, $categoryTokens);
            $score += count($sharedTokens) * 2;

            foreach ($titleTokens as $token) {
                foreach ($categoryTokens as $categoryToken) {
                    if ($token === $categoryToken) {
                        continue;
                    }

                    if (str_contains($token, $categoryToken) || str_contains($categoryToken, $token)) {
                        $score += 0.5;
                    }
                }
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestCategoryId = $categoryId;
            }
        }

        return $bestScore > 0 ? $bestCategoryId : null;
    }

    private function normalizeTitle(string $title): string
    {
        $title = html_entity_decode($title, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $title = preg_replace('/\s+/u', ' ', $title);

        return trim((string) $title);
    }

    /**
     * @return array<int, string>
     */
    private function tokenize(string $value): array
    {
        $value = mb_strtolower($value, 'UTF-8');
        $value = preg_replace('/[^\pL\pN]+/u', ' ', $value);
        $tokens = preg_split('/\s+/', trim((string) $value)) ?: [];
        $tokens = array_values(array_filter($tokens, fn (string $token): bool => strlen($token) >= 3));

        return array_values(array_unique($tokens));
    }
}

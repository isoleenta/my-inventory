<?php

namespace App\Services;

use App\DTOs\ItemData;
use App\Models\User;
use DOMDocument;
use DOMElement;
use DOMNode;
use DOMNodeList;
use DOMXPath;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

final class AliExpressImportService
{
    private const PRICE_PATTERN = '/(?:(?:US\s*)?[$€£₴]|USD|EUR|GBP|UAH|грн\.?)\s*[0-9][0-9.,\s]*|[0-9][0-9.,\s]*\s*(?:USD|EUR|GBP|UAH|грн\.?)/iu';

    /**
     * @var array<int, string>
     */
    private const IMAGE_ATTRIBUTES = [
        'src',
        'data-src',
        'data-lazy-src',
        'data-image',
        'data-img',
        'data-origin',
        'data-original',
        'srcset',
    ];

    public function __construct(
        private readonly ItemService $itemService
    ) {}

    /**
     * @return array<int, array{title: string, price: string|null, price_currency: string|null, raw_price: string|null, image_url: string|null, bought_on: string|null}>
     */
    public function preview(string $html): array
    {
        $html = trim($html);
        if ($html === '') {
            return [];
        }

        $dom = new DOMDocument('1.0', 'UTF-8');
        $previousState = libxml_use_internal_errors(true);

        $dom->loadHTML(
            '<?xml encoding="utf-8" ?>'.$html,
            LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_COMPACT
        );

        libxml_clear_errors();
        libxml_use_internal_errors($previousState);

        $xpath = new DOMXPath($dom);
        $structuredProducts = $this->extractStructuredProducts($xpath);

        if ($structuredProducts !== []) {
            return $structuredProducts;
        }

        $products = [];
        $seenContainers = [];

        /** @var DOMNodeList<DOMNode> $images */
        $images = $xpath->query('//img');

        foreach ($images as $node) {
            if (! $node instanceof DOMElement) {
                continue;
            }

            $container = $this->resolveProductContainer($node, $xpath, $seenContainers);
            if ($container === null) {
                continue;
            }

            $title = $this->extractTitle($container, $xpath);
            if ($title === null) {
                continue;
            }

            $imageUrl = $this->extractBestImageUrl($container, $xpath) ?? $this->extractImageUrl($node);
            $rawPrice = $this->extractPriceText($container, $xpath);
            $products[] = [
                'title' => $title,
                'price' => $this->normalizePrice($rawPrice),
                'price_currency' => $this->detectPriceCurrency($rawPrice),
                'raw_price' => $rawPrice,
                'image_url' => $this->normalizeImageUrl($imageUrl),
                'bought_on' => $this->extractStructuredBoughtOn($container),
            ];
        }

        return $products;
    }

    /**
     * @return array{count: int, place_id: int}
     */
    public function import(User $user, int $placeId, ?int $categoryId, string $html): array
    {
        $products = $this->preview($html);

        if ($products === []) {
            throw ValidationException::withMessages([
                'html' => __('No products were found in the provided AliExpress history HTML.'),
            ]);
        }

        $count = 0;

        foreach ($products as $product) {
            $details = [];
            if ($product['bought_on'] !== null) {
                $details['_purchased_on'] = $product['bought_on'];
            }

            $item = $this->itemService->createForImport($user, new ItemData(
                title: $product['title'],
                place_id: $placeId,
                category_id: $categoryId,
                price: $product['price'],
                price_currency: $product['price_currency'] ?? CurrencyRateService::USD,
                details: $details
            ));

            if ($product['image_url'] !== null) {
                $this->attachPhoto($item, $product['image_url']);
            }

            $count++;
        }

        return [
            'count' => $count,
            'place_id' => $placeId,
        ];
    }

    /**
     * @param  array<string, bool>  $seenContainers
     */
    private function resolveProductContainer(DOMElement $image, DOMXPath $xpath, array &$seenContainers): ?DOMElement
    {
        $current = $image;

        for ($depth = 0; $depth < 7 && $current instanceof DOMElement; $depth++) {
            $path = $current->getNodePath();

            if (($seenContainers[$path] ?? false) === true) {
                return null;
            }

            $title = $this->extractTitle($current, $xpath);
            $price = $this->extractPriceText($current, $xpath);

            if ($title !== null && ($price !== null || $this->extractBestImageUrl($current, $xpath) !== null)) {
                $seenContainers[$path] = true;

                return $current;
            }

            $parent = $current->parentNode;
            $current = $parent instanceof DOMElement ? $parent : null;
        }

        return null;
    }

    private function extractTitle(DOMElement $container, DOMXPath $xpath): ?string
    {
        $bestTitle = null;
        $bestScore = 0.0;

        foreach ($this->candidateTextElements($container, $xpath) as $element) {
            $text = $this->normalizeText($element->textContent);

            if ($text === '' || strlen($text) < 6 || strlen($text) > 260) {
                continue;
            }

            if ($this->looksLikePrice($text)) {
                continue;
            }

            $score = 0.0;
            $tagName = strtolower($element->tagName);
            $hintSource = strtolower(
                ($element->getAttribute('class') ?: '').
                ' '.
                ($element->getAttribute('id') ?: '').
                ' '.
                ($element->getAttribute('data-name') ?: '')
            );

            if (in_array($tagName, ['a', 'h1', 'h2', 'h3'], true)) {
                $score += 2;
            }

            if ($this->containsAny($hintSource, ['title', 'name', 'subject', 'product', 'goods'])) {
                $score += 4;
            }

            if ($this->containsAny(strtolower($text), ['order', 'tracking', 'refund', 'seller', 'store', 'buy again'])) {
                $score -= 2;
            }

            $digitCount = preg_match_all('/\d/', $text);
            if ($digitCount !== false && $digitCount > 8) {
                $score -= 1;
            }

            $score += min(strlen($text), 160) / 80;

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestTitle = $text;
            }
        }

        return $bestScore >= 3 ? $bestTitle : null;
    }

    private function extractPriceText(DOMElement $container, DOMXPath $xpath): ?string
    {
        $preferred = [];
        $fallback = [];

        foreach ($this->candidateTextElements($container, $xpath) as $element) {
            $text = $this->normalizeText($element->textContent);

            if ($text === '') {
                continue;
            }

            $match = $this->matchPrice($text);
            if ($match === null) {
                continue;
            }

            $hintSource = strtolower(($element->getAttribute('class') ?: '').' '.($element->getAttribute('id') ?: ''));
            if ($this->containsAny($hintSource, ['price', 'amount', 'total', 'cost'])) {
                $preferred[] = $match;
            } else {
                $fallback[] = $match;
            }
        }

        if ($preferred !== []) {
            return $preferred[0];
        }

        if ($fallback !== []) {
            return $fallback[0];
        }

        return $this->matchPrice($this->normalizeText($container->textContent));
    }

    private function extractBestImageUrl(DOMElement $container, DOMXPath $xpath): ?string
    {
        foreach ($xpath->query('.//*[contains(@style, "background-image")]', $container) as $node) {
            if (! $node instanceof DOMElement) {
                continue;
            }

            $url = $this->extractBackgroundImageUrl($node);
            if ($url !== null) {
                return $url;
            }
        }

        $bestUrl = null;
        $bestScore = -1000;

        foreach ($xpath->query('.//img', $container) as $node) {
            if (! $node instanceof DOMElement) {
                continue;
            }

            $url = $this->extractImageUrl($node);
            if ($url === null) {
                continue;
            }

            $score = 0;
            $hintSource = strtolower(
                ($node->getAttribute('class') ?: '').
                ' '.
                ($node->getAttribute('alt') ?: '')
            );

            if ($this->containsAny($hintSource, ['product', 'item', 'goods', 'image', 'photo', 'main'])) {
                $score += 4;
            }

            if ($this->containsAny($hintSource.' '.$url, ['avatar', 'logo', 'icon', 'store'])) {
                $score -= 6;
            }

            $score += min(strlen($url), 200) / 40;

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestUrl = $url;
            }
        }

        return $bestUrl;
    }

    private function extractImageUrl(DOMElement $image): ?string
    {
        foreach (self::IMAGE_ATTRIBUTES as $attribute) {
            $value = trim((string) $image->getAttribute($attribute));
            if ($value === '') {
                continue;
            }

            if ($attribute === 'srcset') {
                $value = trim(explode(',', $value)[0] ?? '');
                $value = trim(explode(' ', $value)[0] ?? '');
            }

            if ($value === '') {
                continue;
            }

            return $this->normalizeImageUrl($value);
        }

        return null;
    }

    /**
     * @return array<int, DOMElement>
     */
    private function candidateTextElements(DOMElement $container, DOMXPath $xpath): array
    {
        $elements = [];

        foreach ($xpath->query('.//*[self::a or self::span or self::div or self::p or self::strong or self::h1 or self::h2 or self::h3]', $container) as $node) {
            if ($node instanceof DOMElement) {
                $elements[] = $node;
            }
        }

        return $elements;
    }

    private function matchPrice(string $text): ?string
    {
        if (! preg_match(self::PRICE_PATTERN, $text, $matches)) {
            return null;
        }

        return $this->normalizeText($matches[0]);
    }

    private function looksLikePrice(string $text): bool
    {
        return $this->matchPrice($text) !== null;
    }

    private function normalizePrice(?string $rawPrice): ?string
    {
        if ($rawPrice === null) {
            return null;
        }

        $value = preg_replace('/[^\d.,]/', '', $rawPrice);
        if ($value === null || $value === '') {
            return null;
        }

        $lastDot = strrpos($value, '.');
        $lastComma = strrpos($value, ',');

        if ($lastDot !== false && $lastComma !== false) {
            if ($lastComma > $lastDot) {
                $value = str_replace('.', '', $value);
                $value = str_replace(',', '.', $value);
            } else {
                $value = str_replace(',', '', $value);
            }
        } elseif ($lastComma !== false) {
            $value = preg_match('/,\d{1,2}$/', $value) === 1
                ? str_replace(',', '.', $value)
                : str_replace(',', '', $value);
        } else {
            $parts = explode('.', $value);
            if (count($parts) > 2) {
                $decimal = array_pop($parts);
                $value = implode('', $parts).'.'.$decimal;
            }
        }

        if (! is_numeric($value)) {
            return null;
        }

        return number_format((float) $value, 2, '.', '');
    }

    private function detectPriceCurrency(?string $rawPrice): ?string
    {
        if ($rawPrice === null) {
            return null;
        }

        $normalized = mb_strtolower($rawPrice);

        if (preg_match('/(грн\.?|₴|\buah\b)/iu', $normalized) === 1) {
            return CurrencyRateService::UAH;
        }

        return CurrencyRateService::USD;
    }

    private function normalizeText(?string $text): string
    {
        $text = html_entity_decode((string) $text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text);

        return trim((string) $text);
    }

    /**
     * @param  array<int, string>  $needles
     */
    private function containsAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if ($needle !== '' && str_contains($haystack, $needle)) {
                return true;
            }
        }

        return false;
    }

    private function attachPhoto(\App\Models\Item $item, string $imageUrl): void
    {
        if (! $this->isDownloadableImageUrl($imageUrl)) {
            return;
        }

        if (str_starts_with($imageUrl, 'data:image/')) {
            $this->attachDataUrlPhoto($item, $imageUrl);

            return;
        }

        $response = Http::timeout(15)
            ->retry(1, 200)
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (compatible; AliExpressImportBot/1.0)',
            ])
            ->get($imageUrl);

        if (! $response->successful()) {
            return;
        }

        $this->itemService->addPhotoFromContents(
            $item,
            $response->body(),
            $this->guessExtension($response->header('Content-Type'), $imageUrl)
        );
    }

    private function attachDataUrlPhoto(\App\Models\Item $item, string $imageUrl): void
    {
        if (! preg_match('/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/', $imageUrl, $matches)) {
            return;
        }

        $contents = base64_decode($matches[2], true);
        if ($contents === false) {
            return;
        }

        $this->itemService->addPhotoFromContents($item, $contents, strtolower($matches[1]));
    }

    private function guessExtension(?string $contentType, string $imageUrl): string
    {
        $contentType = strtolower((string) $contentType);

        return match (true) {
            str_contains($contentType, 'png') => 'png',
            str_contains($contentType, 'webp') => 'webp',
            str_contains($contentType, 'gif') => 'gif',
            str_contains($contentType, 'bmp') => 'bmp',
            str_contains($contentType, 'svg') => 'svg',
            str_contains($contentType, 'jpeg'),
            str_contains($contentType, 'jpg') => 'jpg',
            default => strtolower(pathinfo(parse_url($imageUrl, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: 'jpg'),
        };
    }

    /**
     * @return array<int, array{title: string, price: string|null, price_currency: string|null, raw_price: string|null, image_url: string|null, bought_on: string|null}>
     */
    private function extractStructuredProducts(DOMXPath $xpath): array
    {
        $products = [];
        $seen = [];

        foreach ($xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " order-item-content ")]') as $node) {
            if (! $node instanceof DOMElement) {
                continue;
            }

            $title = $this->extractStructuredTitle($node, $xpath);
            if ($title === null) {
                continue;
            }

            $rawPrice = $this->extractStructuredPrice($node, $xpath);
            $imageUrl = $this->extractStructuredImageUrl($node, $xpath);
            $signature = md5($title.'|'.($rawPrice ?? '').'|'.($imageUrl ?? ''));

            if (isset($seen[$signature])) {
                continue;
            }

            $seen[$signature] = true;
            $products[] = [
                'title' => $title,
                'price' => $this->normalizePrice($rawPrice),
                'price_currency' => $this->detectPriceCurrency($rawPrice),
                'raw_price' => $rawPrice,
                'image_url' => $imageUrl,
                'bought_on' => $this->extractStructuredBoughtOn($node),
            ];
        }

        return $products;
    }

    private function extractStructuredTitle(DOMElement $container, DOMXPath $xpath): ?string
    {
        $titleNode = $xpath->query(
            './/*[contains(concat(" ", normalize-space(@class), " "), " order-item-content-info-name ")]//*[@title] | .//*[contains(concat(" ", normalize-space(@class), " "), " order-item-content-info-name ")]//*[self::span or self::a]',
            $container
        )?->item(0);

        if (! $titleNode instanceof DOMNode) {
            return null;
        }

        $title = $this->normalizeText($titleNode->textContent);

        return $title !== '' ? $title : null;
    }

    private function extractStructuredPrice(DOMElement $container, DOMXPath $xpath): ?string
    {
        $preferredNodes = $xpath->query(
            './/*[contains(concat(" ", normalize-space(@class), " "), " order-item-content-opt-price-total ")] | .//*[contains(concat(" ", normalize-space(@class), " "), " order-item-content-info-number ")]',
            $container
        );

        foreach ($preferredNodes as $node) {
            if (! $node instanceof DOMNode) {
                continue;
            }

            $price = $this->matchPrice($this->normalizeText($node->textContent));
            if ($price !== null) {
                return $price;
            }
        }

        return $this->extractPriceText($container, $xpath);
    }

    private function extractStructuredImageUrl(DOMElement $container, DOMXPath $xpath): ?string
    {
        foreach ($xpath->query('.//*[contains(concat(" ", normalize-space(@class), " "), " order-item-content-img ")]', $container) as $node) {
            if (! $node instanceof DOMElement) {
                continue;
            }

            $imageUrl = $this->extractBackgroundImageUrl($node) ?? $this->extractImageUrl($node);

            if ($imageUrl !== null) {
                return $imageUrl;
            }
        }

        return $this->extractBestImageUrl($container, $xpath);
    }

    private function extractStructuredBoughtOn(DOMElement $container): ?string
    {
        $current = $container;

        while ($current instanceof DOMElement) {
            $className = strtolower($current->getAttribute('class') ?: '');
            if (str_contains($className, 'order-item')) {
                $text = $this->normalizeText($current->textContent);

                if (preg_match('/Order date:\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})/i', $text, $matches)) {
                    return $this->normalizeBoughtOn($matches[1]);
                }
            }

            $parent = $current->parentNode;
            $current = $parent instanceof DOMElement ? $parent : null;
        }

        return null;
    }

    private function extractBackgroundImageUrl(DOMElement $element): ?string
    {
        $style = trim((string) $element->getAttribute('style'));
        if ($style === '') {
            return null;
        }

        if (! preg_match('/background-image\s*:\s*url\((["\']?)(.*?)\1\)/i', $style, $matches)) {
            return null;
        }

        return $this->normalizeImageUrl($matches[2] ?? null);
    }

    private function normalizeImageUrl(?string $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        if (str_starts_with($value, '//')) {
            return 'https:'.$value;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        if (str_starts_with($value, 'data:image/')) {
            return $value;
        }

        return null;
    }

    private function isDownloadableImageUrl(string $imageUrl): bool
    {
        return str_starts_with($imageUrl, 'http://')
            || str_starts_with($imageUrl, 'https://')
            || str_starts_with($imageUrl, 'data:image/');
    }

    private function normalizeBoughtOn(string $value): ?string
    {
        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
}

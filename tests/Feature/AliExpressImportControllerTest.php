<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AliExpressImportControllerTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(): User
    {
        return User::create([
            'name' => 'Test User',
            'email' => 'importer@example.com',
            'password' => 'password',
        ]);
    }

    private function sampleHtml(): string
    {
        return <<<'HTML'
<!doctype html>
<html lang="en">
    <body>
        <section class="orders">
            <article class="order-item-card">
                <div class="order-item-header-right-info">Order date: Feb 22, 2026</div>
                <img class="product-image" src="https://cdn.example.com/item-1.jpg" alt="Wireless earbuds" />
                <a class="product-title">Wireless Earbuds Bluetooth 5.3</a>
                <div class="product-price-current">US $12.34</div>
            </article>

            <article class="order-item-card">
                <div class="order-item-header-right-info">Order date: Feb 23, 2026</div>
                <img class="product-image" data-src="https://cdn.example.com/item-2.png" alt="Desk lamp" />
                <div class="meta">
                    <span class="item-name">USB Desk Lamp With Clamp</span>
                    <span class="total-price">US $45.60</span>
                </div>
            </article>
        </section>
    </body>
</html>
HTML;
    }

    private function savedPageLikeHtml(): string
    {
        return <<<'HTML'
<!doctype html>
<html>
    <body>
        <div id="mobile-download">
            <a href="http://sale.aliexpress.com/download_app_guide.htm" target="_blank">
                <img src="./Orders_files/120x120.png" alt="" border="0">
            </a>
        </div>

        <div class="order-item-content">
            <div class="order-item-content-body">
                <a href="https://www.aliexpress.com/item/1005011711462546.html" target="_blank">
                    <div
                        class="order-item-content-img"
                        style="background-image: url(&quot;https://ae01.alicdn.com/kf/S6fcaba47541b4be5bca960b166167e59E.png_220x220.png&quot;);"
                    ></div>
                </a>
                <div class="order-item-content-info">
                    <div class="order-item-content-info-name">
                        <a href="https://www.aliexpress.com/item/1005011711462546.html" target="_blank">
                            <span title="Fisting butt plug smooth butt plug oversized xl butt beads silicone butt plug dilator anal prostate adult sex toy gay men">
                                Fisting butt plug smooth butt plug oversized xl butt beads silicone butt plug dilator anal prostate adult sex toy gay men
                            </span>
                        </a>
                    </div>
                </div>
            </div>
            <div class="order-item-content-opt">
                <div class="order-item-content-opt-price">
                    <span class="order-item-content-opt-price-total">
                        Total:
                        <div class="es--wrap--1Hlfkoj notranslate">грн. 222.80</div>
                    </span>
                </div>
            </div>
        </div>
    </body>
</html>
HTML;
    }

    public function test_authenticated_user_can_view_aliexpress_import_page(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'web_user')
            ->get(route('items.imports.aliexpress.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Items/AliExpressImport')
            ->has('categories')
            ->has('placeOptions')
        );
    }

    public function test_preview_route_parses_products_from_uploaded_html(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'web_user')
            ->post(route('items.imports.aliexpress.preview'), [
                'html_file' => UploadedFile::fake()->createWithContent('orders.html', $this->sampleHtml()),
            ]);

        $response->assertOk();
        $response->assertJsonCount(2, 'items');
        $response->assertJsonPath('items.0.title', 'Wireless Earbuds Bluetooth 5.3');
        $response->assertJsonPath('items.0.price', '12.34');
        $response->assertJsonPath('items.0.price_currency', 'USD');
        $response->assertJsonPath('items.0.bought_on', '2026-02-22');
        $response->assertJsonPath('items.1.title', 'USB Desk Lamp With Clamp');
        $response->assertJsonPath('items.1.price', '45.60');
        $response->assertJsonPath('items.1.price_currency', 'USD');
        $response->assertJsonPath('items.1.bought_on', '2026-02-23');
    }

    public function test_store_route_imports_items_and_downloads_photos(): void
    {
        Storage::fake('public');

        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Office']);
        $category = Category::create(['user_id' => $user->id, 'name' => 'Imported', 'fields' => []]);

        Http::fake([
            'https://cdn.example.com/item-1.jpg' => Http::response('image-1', 200, ['Content-Type' => 'image/jpeg']),
            'https://cdn.example.com/item-2.png' => Http::response('image-2', 200, ['Content-Type' => 'image/png']),
        ]);

        $response = $this->actingAs($user, 'web_user')
            ->post(route('items.imports.aliexpress.store'), [
                'place_id' => $place->id,
                'category_id' => $category->id,
                'html' => $this->sampleHtml(),
            ]);

        $response->assertRedirect(route('inventory.show', ['place' => $place->id]));

        $this->assertDatabaseCount('items', 2);
        $this->assertDatabaseHas('items', [
            'user_id' => $user->id,
            'place_id' => $place->id,
            'category_id' => $category->id,
            'title' => 'Wireless Earbuds Bluetooth 5.3',
            'price' => '12.34',
        ]);
        $this->assertDatabaseHas('items', [
            'user_id' => $user->id,
            'place_id' => $place->id,
            'category_id' => $category->id,
            'title' => 'USB Desk Lamp With Clamp',
            'price' => '45.60',
        ]);
        $this->assertDatabaseCount('item_photos', 2);

        $firstItem = \App\Models\Item::query()->where('title', 'Wireless Earbuds Bluetooth 5.3')->firstOrFail();
        $secondItem = \App\Models\Item::query()->where('title', 'USB Desk Lamp With Clamp')->firstOrFail();

        $this->assertSame(
            '2026-02-22',
            $firstItem->details['_purchased_on'] ?? null
        );
        $this->assertSame(
            '2026-02-23',
            $secondItem->details['_purchased_on'] ?? null
        );

        foreach (\App\Models\ItemPhoto::query()->get() as $photo) {
            Storage::disk('public')->assertExists($photo->path);
        }
    }

    public function test_preview_route_prefers_order_card_background_images_and_ignores_local_saved_assets(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'web_user')
            ->post(route('items.imports.aliexpress.preview'), [
                'html' => $this->savedPageLikeHtml(),
            ]);

        $response->assertOk();
        $response->assertJsonCount(1, 'items');
        $response->assertJsonPath('items.0.title', 'Fisting butt plug smooth butt plug oversized xl butt beads silicone butt plug dilator anal prostate adult sex toy gay men');
        $response->assertJsonPath('items.0.price', '222.80');
        $response->assertJsonPath('items.0.price_currency', 'UAH');
        $response->assertJsonPath('items.0.image_url', 'https://ae01.alicdn.com/kf/S6fcaba47541b4be5bca960b166167e59E.png_220x220.png');
    }

    public function test_store_route_converts_uah_prices_to_usd_before_persisting(): void
    {
        Storage::fake('public');
        config()->set('services.nbu.fallback_usd_to_uah_rate', 40.0);

        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Bedroom']);

        Http::fake([
            'https://ae01.alicdn.com/*' => Http::response('image-data', 200, ['Content-Type' => 'image/png']),
        ]);

        $response = $this->actingAs($user, 'web_user')
            ->post(route('items.imports.aliexpress.store'), [
                'place_id' => $place->id,
                'html' => $this->savedPageLikeHtml(),
            ]);

        $response->assertRedirect(route('inventory.show', ['place' => $place->id]));

        $this->assertDatabaseHas('items', [
            'user_id' => $user->id,
            'place_id' => $place->id,
            'title' => 'Fisting butt plug smooth butt plug oversized xl butt beads silicone butt plug dilator anal prostate adult sex toy gay men',
            'price' => '5.57',
        ]);
    }
}

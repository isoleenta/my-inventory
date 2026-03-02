<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryControllerTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(): User
    {
        return User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
        ]);
    }

    public function test_authenticated_user_can_view_inventory_index(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'web_user')
            ->get(route('inventory.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Inventory/Index')
            ->has('items')
            ->has('categories')
            ->has('placeOptions')
            ->has('filters')
            ->where('sort', 'title')
        );
    }

    public function test_inventory_index_accepts_valid_filter_and_sort_query_params(): void
    {
        $user = $this->createUser();
        $category = Category::create(['user_id' => $user->id, 'name' => 'Test', 'fields' => []]);

        $response = $this->actingAs($user, 'web_user')
            ->get(route('inventory.index', [
                'filter' => [
                    'category_id' => $category->id,
                    'place' => 'garage',
                    'name' => 'test',
                ],
                'sort' => '-created_at',
            ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('filters.category_id', $category->id)
            ->where('filters.place', 'garage')
            ->where('filters.name', 'test')
            ->where('sort', '-created_at')
        );
    }

    public function test_place_route_redirects_to_inventory_index_with_place_filter(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user, 'web_user')
            ->get(route('inventory.show', ['place' => 'kitchen']));

        $response->assertRedirect(route('inventory.index', ['filter' => ['place' => 'kitchen']]));
    }

    public function test_guest_cannot_view_inventory_index(): void
    {
        $response = $this->get(route('inventory.index'));

        $response->assertRedirect();
    }
}

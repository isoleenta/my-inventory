<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Item;
use App\Models\Place;
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
            ->has('items.data')
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
        $place = Place::create(['user_id' => $user->id, 'name' => 'Garage']);

        $response = $this->actingAs($user, 'web_user')
            ->get(route('inventory.index', [
                'filter' => [
                    'category_id' => $category->id,
                    'place_id' => $place->id,
                    'name' => 'test',
                ],
                'sort' => '-created_at',
            ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('filters.category_id', $category->id)
            ->where('filters.place_id', $place->id)
            ->where('filters.name', 'test')
            ->where('sort', '-created_at')
        );
    }

    public function test_filtering_by_category_includes_items_in_child_categories(): void
    {
        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Other']);
        $parent = Category::create(['user_id' => $user->id, 'name' => 'Parent', 'fields' => []]);
        $child = Category::create(['user_id' => $user->id, 'parent_id' => $parent->id, 'name' => 'Child', 'fields' => []]);
        $itemInChild = Item::create([
            'user_id' => $user->id,
            'category_id' => $child->id,
            'place_id' => $place->id,
            'title' => 'Item in child',
        ]);

        $response = $this->actingAs($user, 'web_user')
            ->get(route('inventory.index', ['filter' => ['category_id' => $parent->id]]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('items.data')
            ->where('items.data.0.id', $itemInChild->id)
            ->where('items.data.0.title', 'Item in child')
        );
    }

    public function test_inventory_index_is_paginated(): void
    {
        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Warehouse']);

        foreach (range(1, 40) as $number) {
            Item::create([
                'user_id' => $user->id,
                'place_id' => $place->id,
                'title' => sprintf('Item %02d', $number),
                'details' => [],
            ]);
        }

        $response = $this->actingAs($user, 'web_user')
            ->get(route('inventory.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('items.data', 36)
            ->where('items.current_page', 1)
            ->where('items.last_page', 2)
            ->where('items.total', 40)
        );
    }

    public function test_place_route_redirects_to_inventory_index_with_place_filter(): void
    {
        $user = $this->createUser();
        $place = Place::create(['user_id' => $user->id, 'name' => 'Kitchen']);

        $response = $this->actingAs($user, 'web_user')
            ->get(route('inventory.show', ['place' => $place->id]));

        $response->assertRedirect(route('inventory.index', ['filter' => ['place_id' => $place->id]]));
    }

    public function test_guest_cannot_view_inventory_index(): void
    {
        $response = $this->get(route('inventory.index'));

        $response->assertRedirect();
    }
}

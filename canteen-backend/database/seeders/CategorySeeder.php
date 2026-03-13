<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Meals',      'description' => 'Full meals and rice dishes',      'icon' => '🍽️'],
            ['name' => 'Snacks',     'description' => 'Light snacks and finger foods',    'icon' => '🍿'],
            ['name' => 'Beverages',  'description' => 'Hot and cold drinks',              'icon' => '🥤'],
            ['name' => 'Desserts',   'description' => 'Sweet treats and pastries',        'icon' => '🍰'],
            ['name' => 'Combos',     'description' => 'Value combo meals',                'icon' => '🎁'],
            ['name' => 'Breakfast',  'description' => 'Morning breakfast items',          'icon' => '🌅'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }
    }
}
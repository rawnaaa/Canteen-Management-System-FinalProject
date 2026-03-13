<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\MenuItem;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::pluck('id', 'name');

        $items = [
            // ── MEALS ──────────────────────────────────────────────────────────
            ['category' => 'Meals', 'name' => 'Chicken Adobo with Rice',   'description' => 'Classic Filipino chicken adobo served with steamed white rice.',           'price' => 75.00,  'stock' => 50],
            ['category' => 'Meals', 'name' => 'Pork Sinigang',             'description' => 'Sour tamarind-based pork soup with vegetables.',                           'price' => 85.00,  'stock' => 40],
            ['category' => 'Meals', 'name' => 'Beef Caldereta',            'description' => 'Rich tomato-based beef stew with potatoes and carrots.',                   'price' => 95.00,  'stock' => 35],
            ['category' => 'Meals', 'name' => 'Fried Tilapia with Rice',   'description' => 'Crispy fried tilapia served with steamed rice and sawsawan.',              'price' => 70.00,  'stock' => 45],
            ['category' => 'Meals', 'name' => 'Pancit Canton',             'description' => 'Stir-fried egg noodles with vegetables and meat.',                         'price' => 65.00,  'stock' => 55],
            ['category' => 'Meals', 'name' => 'Bicol Express',             'description' => 'Spicy pork with coconut milk and chili.',                                  'price' => 80.00,  'stock' => 30],
            ['category' => 'Meals', 'name' => 'Kare-Kare',                 'description' => 'Oxtail in peanut sauce with fermented shrimp paste.',                     'price' => 110.00, 'stock' => 25],

            // ── SNACKS ─────────────────────────────────────────────────────────
            ['category' => 'Snacks', 'name' => 'Lumpia Shanghai',          'description' => 'Crispy Filipino spring rolls with sweet and sour sauce.',                  'price' => 35.00,  'stock' => 80],
            ['category' => 'Snacks', 'name' => 'Cheese Sticks',            'description' => 'Golden fried mozzarella sticks with dipping sauce.',                      'price' => 30.00,  'stock' => 70],
            ['category' => 'Snacks', 'name' => 'Tokwa\'t Baboy',           'description' => 'Fried tofu and pork ears with vinegar-soy dipping sauce.',                'price' => 45.00,  'stock' => 40],
            ['category' => 'Snacks', 'name' => 'Fishball (10 pcs)',        'description' => 'Deep-fried fishballs served with sweet and spicy sauce.',                  'price' => 20.00,  'stock' => 100],
            ['category' => 'Snacks', 'name' => 'Kikiam',                   'description' => 'Mixed meat and vegetables wrapped in tofu skin, deep-fried.',              'price' => 25.00,  'stock' => 90],
            ['category' => 'Snacks', 'name' => 'French Fries',             'description' => 'Crispy golden fries with ketchup or cheese dip.',                         'price' => 40.00,  'stock' => 60],

            // ── BEVERAGES ──────────────────────────────────────────────────────
            ['category' => 'Beverages', 'name' => 'Bottled Water 500ml',   'description' => 'Purified drinking water.',                                                 'price' => 15.00,  'stock' => 200],
            ['category' => 'Beverages', 'name' => 'Softdrinks (Regular)',  'description' => 'Coke, Sprite, or Royal in can.',                                           'price' => 25.00,  'stock' => 150],
            ['category' => 'Beverages', 'name' => 'Iced Coffee',           'description' => 'Freshly brewed coffee with ice and your choice of milk.',                  'price' => 45.00,  'stock' => 60],
            ['category' => 'Beverages', 'name' => 'Fresh Buko Juice',      'description' => 'Natural coconut water straight from the buko.',                            'price' => 35.00,  'stock' => 50],
            ['category' => 'Beverages', 'name' => 'Mango Shake',           'description' => 'Blended fresh mangoes with milk and sugar.',                               'price' => 50.00,  'stock' => 40],
            ['category' => 'Beverages', 'name' => 'Hot Chocolate',         'description' => 'Rich creamy hot tsokolate.',                                               'price' => 30.00,  'stock' => 55],
            ['category' => 'Beverages', 'name' => 'Calamansi Juice',       'description' => 'Refreshing local lime juice, sweetened or unsweetened.',                   'price' => 20.00,  'stock' => 75],

            // ── DESSERTS ───────────────────────────────────────────────────────
            ['category' => 'Desserts', 'name' => 'Halo-Halo',              'description' => 'Mixed shaved ice dessert with fruits, beans, and leche flan.',             'price' => 55.00,  'stock' => 30],
            ['category' => 'Desserts', 'name' => 'Maja Blanca',            'description' => 'Creamy coconut pudding topped with latik.',                                'price' => 25.00,  'stock' => 40],
            ['category' => 'Desserts', 'name' => 'Buko Pandan',            'description' => 'Chilled coconut and pandan gelatin salad.',                                'price' => 30.00,  'stock' => 35],
            ['category' => 'Desserts', 'name' => 'Turon',                  'description' => 'Banana and jackfruit wrapped in lumpia wrapper, fried with sugar.',        'price' => 20.00,  'stock' => 50],
            ['category' => 'Desserts', 'name' => 'Leche Flan',             'description' => 'Classic Filipino caramel custard.',                                        'price' => 35.00,  'stock' => 30],

            // ── COMBOS ─────────────────────────────────────────────────────────
            ['category' => 'Combos', 'name' => 'Student Meal A',           'description' => 'Rice + Chicken Adobo + Softdrinks.',                                       'price' => 85.00,  'stock' => 40],
            ['category' => 'Combos', 'name' => 'Student Meal B',           'description' => 'Rice + Pork Sinigang + Buko Juice.',                                      'price' => 95.00,  'stock' => 35],
            ['category' => 'Combos', 'name' => 'Snack Pack',               'description' => 'Lumpia + Fishball + Softdrinks.',                                          'price' => 65.00,  'stock' => 45],
            ['category' => 'Combos', 'name' => 'Budget Meal',              'description' => 'Rice + Fried Tilapia + Water.',                                            'price' => 75.00,  'stock' => 50],

            // ── BREAKFAST ──────────────────────────────────────────────────────
            ['category' => 'Breakfast', 'name' => 'Tapsilog',              'description' => 'Tapa, sinangag (garlic rice), and itlog (fried egg).',                     'price' => 80.00,  'stock' => 45],
            ['category' => 'Breakfast', 'name' => 'Longsilog',             'description' => 'Longganisa, sinangag, and fried egg.',                                     'price' => 75.00,  'stock' => 40],
            ['category' => 'Breakfast', 'name' => 'Champorado',            'description' => 'Sweet chocolate rice porridge served with dried fish.',                    'price' => 45.00,  'stock' => 35],
            ['category' => 'Breakfast', 'name' => 'Pan de Sal',            'description' => 'Soft Filipino bread rolls, 3 pieces per serving.',                         'price' => 15.00,  'stock' => 100],
        ];

        foreach ($items as $item) {
            $categoryId = $categories[$item['category']] ?? null;
            if (! $categoryId) continue;

            MenuItem::firstOrCreate(
                ['name' => $item['name']],
                [
                    'category_id'         => $categoryId,
                    'description'         => $item['description'],
                    'price'               => $item['price'],
                    'stock_quantity'      => $item['stock'],
                    'low_stock_threshold' => 10,
                    'is_available'        => true,
                ]
            );
        }
    }
}
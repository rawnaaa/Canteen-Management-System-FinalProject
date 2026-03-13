<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\Category;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    public function run()
    {
        $categories = Category::all()->keyBy('name');
        
        $menuItems = [
            // Meals
            ['Chicken Rice Bowl', 'Grilled chicken with rice and vegetables', 8.99, 'Meals', 50, 10],
            ['Beef Noodle Soup', 'Savory beef broth with noodles and vegetables', 9.99, 'Meals', 40, 8],
            ['Vegetable Fried Rice', 'Fried rice with mixed vegetables', 6.99, 'Meals', 60, 10],
            ['Fish and Chips', 'Battered fish with french fries', 10.99, 'Meals', 35, 5],
            ['Spaghetti Bolognese', 'Pasta with meat sauce', 8.99, 'Meals', 45, 8],
            ['Chicken Curry', 'Spicy chicken curry with rice', 9.99, 'Meals', 40, 8],
            ['Beef Steak', 'Grilled beef steak with mashed potatoes', 14.99, 'Meals', 30, 5],
            ['Vegetable Stir Fry', 'Mixed vegetables stir-fried in oyster sauce', 7.99, 'Meals', 45, 8],
            
            // Snacks
            ['French Fries', 'Crispy golden french fries', 3.99, 'Snacks', 100, 15],
            ['Onion Rings', 'Crispy battered onion rings', 4.99, 'Snacks', 80, 12],
            ['Chicken Wings', 'Spicy chicken wings (6 pcs)', 7.99, 'Snacks', 60, 10],
            ['Spring Rolls', 'Vegetable spring rolls (4 pcs)', 4.99, 'Snacks', 70, 10],
            ['Garlic Bread', 'Toasted bread with garlic butter', 3.99, 'Snacks', 90, 15],
            ['Nachos', 'Tortilla chips with cheese sauce', 5.99, 'Snacks', 65, 10],
            ['Samosa', 'Spiced vegetable samosa (3 pcs)', 4.99, 'Snacks', 55, 8],
            ['Mozzarella Sticks', 'Fried mozzarella sticks (6 pcs)', 6.99, 'Snacks', 50, 8],
            
            // Beverages
            ['Coca Cola', 'Regular cola drink (330ml)', 1.99, 'Beverages', 200, 30],
            ['Mineral Water', 'Bottled water (500ml)', 1.00, 'Beverages', 300, 40],
            ['Orange Juice', 'Fresh orange juice', 3.99, 'Beverages', 80, 15],
            ['Iced Coffee', 'Cold brewed coffee with milk', 3.99, 'Beverages', 70, 12],
            ['Hot Tea', 'Assorted hot tea bags', 2.50, 'Beverages', 150, 20],
            ['Milkshake', 'Vanilla/chocolate/strawberry milkshake', 4.99, 'Beverages', 60, 10],
            ['Lemonade', 'Fresh squeezed lemonade', 3.50, 'Beverages', 85, 15],
            ['Smoothie', 'Mixed fruit smoothie', 5.99, 'Beverages', 50, 8],
            
            // Desserts
            ['Chocolate Cake', 'Rich chocolate cake slice', 4.99, 'Desserts', 40, 8],
            ['Ice Cream', 'Vanilla/chocolate/strawberry scoop', 2.99, 'Desserts', 100, 15],
            ['Apple Pie', 'Traditional apple pie slice', 3.99, 'Desserts', 45, 8],
            ['Brownie', 'Chocolate brownie with nuts', 3.50, 'Desserts', 55, 10],
            ['Cheesecake', 'New York style cheesecake', 5.99, 'Desserts', 35, 6],
            ['Fruit Salad', 'Fresh mixed fruit salad', 4.99, 'Desserts', 40, 7],
            ['Pudding', 'Vanilla/chocolate pudding', 3.50, 'Desserts', 60, 10],
            ['Donuts', 'Glazed donuts (3 pcs)', 3.99, 'Desserts', 75, 12],
            
            // Combos
            ['Chicken Rice Combo', 'Chicken rice bowl with drink and fries', 14.99, 'Combos', 30, 5],
            ['Burger Combo', 'Beef burger with fries and drink', 12.99, 'Combos', 35, 6],
            ['Pizza Combo', 'Personal pizza with drink', 11.99, 'Combos', 30, 5],
            ['Student Meal', 'Small meal with drink and snack', 9.99, 'Combos', 45, 8],
            ['Family Meal', '4 rice meals with 2 drinks', 39.99, 'Combos', 15, 3],
            
            // Breakfast
            ['Breakfast Set', 'Eggs, bacon, toast, coffee', 8.99, 'Breakfast', 40, 8],
            ['Pancakes', '3 pancakes with syrup and butter', 6.99, 'Breakfast', 45, 8],
            ['Omelette', '3-egg omelette with toast', 7.99, 'Breakfast', 35, 6],
            ['Cereal Bowl', 'Assorted cereal with milk', 4.99, 'Breakfast', 50, 10],
            
            // Vegetarian
            ['Veggie Burger', 'Plant-based patty burger', 8.99, 'Vegetarian', 35, 6],
            ['Tofu Salad', 'Fresh salad with grilled tofu', 7.99, 'Vegetarian', 30, 5],
            ['Veggie Wrap', 'Vegetable wrap with hummus', 6.99, 'Vegetarian', 40, 7],
            ['Quinoa Bowl', 'Quinoa with roasted vegetables', 8.99, 'Vegetarian', 30, 5],
        ];

        foreach ($menuItems as [$name, $description, $price, $categoryName, $stock, $threshold]) {
            $category = $categories[$categoryName] ?? $categories['Meals'];
            
            MenuItem::create([
                'name' => $name,
                'description' => $description,
                'price' => $price,
                'category_id' => $category->id,
                'stock_quantity' => $stock,
                'low_stock_threshold' => $threshold,
                'is_available' => true,
                'image' => null
            ]);
        }
    }
}
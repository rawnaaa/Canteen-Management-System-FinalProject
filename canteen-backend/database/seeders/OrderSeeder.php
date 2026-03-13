<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run()
    {
        $customers = User::where('role', 'customer')->get();
        $menuItems = MenuItem::all();
        $statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
        
        // Create 200 orders over the past 30 days
        for ($i = 1; $i <= 200; $i++) {
            $customer = $customers->random();
            $orderDate = now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
            $status = $this->getWeightedStatus($orderDate);
            
            // Create order
            $order = Order::create([
                'order_number' => 'ORD-' . date('Ymd', strtotime($orderDate)) . '-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'user_id' => $customer->id,
                'total_amount' => 0, // Will update after adding items
                'status' => $status,
                'notes' => rand(0, 1) ? 'Special instructions: ' . $this->getRandomNote() : null,
                'created_at' => $orderDate,
                'updated_at' => $orderDate
            ]);
            
            // Add random items to order
            $itemCount = rand(1, 5);
            $totalAmount = 0;
            
            for ($j = 0; $j < $itemCount; $j++) {
                $menuItem = $menuItems->random();
                $quantity = rand(1, 3);
                $subtotal = $menuItem->price * $quantity;
                $totalAmount += $subtotal;
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $quantity,
                    'price' => $menuItem->price,
                    'subtotal' => $subtotal,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate
                ]);
                
                // Update stock for completed orders
                if ($status === 'completed') {
                    $menuItem->decrement('stock_quantity', $quantity);
                }
            }
            
            // Update order total
            $order->update(['total_amount' => $totalAmount]);
        }
    }
    
    private function getWeightedStatus($orderDate)
    {
        $daysAgo = now()->diffInDays($orderDate);
        
        // Older orders are more likely to be completed
        if ($daysAgo > 7) {
            $status = 'completed';
        } elseif ($daysAgo > 3) {
            $statuses = ['completed' => 80, 'cancelled' => 20];
            $status = $this->getRandomWeightedElement($statuses);
        } else {
            $statuses = ['pending' => 10, 'preparing' => 20, 'ready' => 20, 'completed' => 40, 'cancelled' => 10];
            $status = $this->getRandomWeightedElement($statuses);
        }
        
        return $status;
    }
    
    private function getRandomWeightedElement($array)
    {
        $total = array_sum($array);
        $rand = rand(1, $total);
        $sum = 0;
        
        foreach ($array as $key => $value) {
            $sum += $value;
            if ($rand <= $sum) {
                return $key;
            }
        }
        
        return array_key_first($array);
    }
    
    private function getRandomNote()
    {
        $notes = [
            'No onions please',
            'Extra spicy',
            'Less oil',
            'With extra sauce',
            'Make it mild',
            'Allergic to nuts',
            'Need utensils',
            'Take away',
            'Dine in',
            'Call upon arrival'
        ];
        
        return $notes[array_rand($notes)];
    }
}
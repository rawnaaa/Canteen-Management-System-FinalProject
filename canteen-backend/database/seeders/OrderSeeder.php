<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\User;
use App\Models\InventoryLog;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $menuItems = MenuItem::all();
        $customers = User::where('role', 'customer')->get();
        $cashiers  = User::whereIn('role', ['cashier', 'admin'])->get();
        $statuses  = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

        // Generate 200 orders spread over the past 60 days
        for ($i = 0; $i < 200; $i++) {
            $createdAt = Carbon::now()->subDays(rand(0, 59))->subHours(rand(0, 8))->subMinutes(rand(0, 59));

            // 80% completed, 10% cancelled, 10% other statuses
            $rand = rand(1, 100);
            if ($rand <= 80) {
                $status = 'completed';
            } elseif ($rand <= 90) {
                $status = 'cancelled';
            } else {
                $status = $statuses[array_rand(['pending', 'preparing', 'ready'])];
            }

            $completedAt = null;
            if ($status === 'completed') {
                $completedAt = (clone $createdAt)->addMinutes(rand(10, 45));
            }

            $customer = $customers->random();
            $cashier  = $cashiers->random();

            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'user_id'      => $customer->id,
                'cashier_id'   => $cashier->id,
                'total_amount' => 0, // will recalculate
                'status'       => $status,
                'notes'        => rand(0, 1) ? 'No chili please.' : null,
                'completed_at' => $completedAt,
                'created_at'   => $createdAt,
                'updated_at'   => $createdAt,
            ]);

            // Add 1–4 random items per order
            $selectedItems = $menuItems->random(rand(1, 4));
            $totalAmount   = 0;

            foreach ($selectedItems as $menuItem) {
                $quantity = rand(1, 3);
                $unitPrice = $menuItem->price;
                $subtotal  = $unitPrice * $quantity;
                $totalAmount += $subtotal;

                OrderItem::create([
                    'order_id'     => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'quantity'     => $quantity,
                    'unit_price'   => $unitPrice,
                    'subtotal'     => $subtotal,
                    'created_at'   => $createdAt,
                    'updated_at'   => $createdAt,
                ]);

                // Log inventory deduction for completed orders only
                if ($status === 'completed') {
                    InventoryLog::create([
                        'menu_item_id'    => $menuItem->id,
                        'user_id'         => $cashier->id,
                        'quantity_change' => -$quantity,
                        'quantity_before' => $menuItem->stock_quantity + $quantity,
                        'quantity_after'  => $menuItem->stock_quantity,
                        'type'            => 'order',
                        'reason'          => 'Seeded order #' . $order->order_number,
                        'order_id'        => $order->id,
                        'created_at'      => $createdAt,
                        'updated_at'      => $createdAt,
                    ]);
                }
            }

            // Update total
            $order->update(['total_amount' => $totalAmount]);
        }
    }
}
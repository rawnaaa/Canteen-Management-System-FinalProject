<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.menuItem']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            // Generate order number
            $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(uniqid());

            // Calculate total and check stock
            $totalAmount = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $menuItem = MenuItem::findOrFail($item['menu_item_id']);
                
                if (!$menuItem->is_available) {
                    throw new \Exception("Item {$menuItem->name} is not available");
                }

                if ($menuItem->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for {$menuItem->name}");
                }

                $subtotal = $menuItem->price * $item['quantity'];
                $totalAmount += $subtotal;

                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $item['quantity'],
                    'price' => $menuItem->price,
                    'subtotal' => $subtotal
                ];
            }

            // Create order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => Auth::id(),
                'total_amount' => $totalAmount,
                'notes' => $request->notes,
                'status' => 'pending'
            ]);

            // Create order items and update stock
            foreach ($orderItems as $item) {
                $order->items()->create($item);
                
                $menuItem = MenuItem::find($item['menu_item_id']);
                $oldQuantity = $menuItem->stock_quantity;
                $menuItem->decrement('stock_quantity', $item['quantity']);

                // Log inventory change
                InventoryLog::create([
                    'menu_item_id' => $menuItem->id,
                    'previous_quantity' => $oldQuantity,
                    'new_quantity' => $menuItem->stock_quantity,
                    'quantity_change' => -$item['quantity'],
                    'reason' => "Order #{$order->order_number}",
                    'user_id' => Auth::id()
                ]);
            }

            DB::commit();

            return response()->json($order->load(['user', 'items.menuItem']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function show(Order $order)
    {
        return response()->json($order->load(['user', 'items.menuItem']));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed,cancelled'
        ]);

        $oldStatus = $order->status;
        $order->update(['status' => $request->status]);

        // If order is cancelled, restore stock
        if ($request->status === 'cancelled' && $oldStatus !== 'cancelled') {
            foreach ($order->items as $item) {
                $menuItem = $item->menuItem;
                $oldQuantity = $menuItem->stock_quantity;
                $menuItem->increment('stock_quantity', $item['quantity']);

                InventoryLog::create([
                    'menu_item_id' => $menuItem->id,
                    'previous_quantity' => $oldQuantity,
                    'new_quantity' => $menuItem->stock_quantity,
                    'quantity_change' => $item['quantity'],
                    'reason' => "Order #{$order->order_number} cancelled",
                    'user_id' => Auth::id()
                ]);
            }
        }

        return response()->json($order);
    }

    public function getUserOrders(Request $request)
    {
        $orders = Order::where('user_id', Auth::id())
                       ->with('items.menuItem')
                       ->orderBy('created_at', 'desc')
                       ->get();
        
        return response()->json($orders);
    }

    public function queue()
    {
        $orders = Order::whereIn('status', ['pending', 'preparing', 'ready'])
                       ->with(['user', 'items.menuItem'])
                       ->orderBy('created_at', 'asc')
                       ->get();
        
        return response()->json($orders);
    }
}
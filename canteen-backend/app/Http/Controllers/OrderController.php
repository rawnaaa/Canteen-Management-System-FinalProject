<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\MenuItem;
use App\Models\OrderItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * GET /api/orders
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'cashier', 'orderItems.menuItem'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date . ' 23:59:59');
        }

        // Customer sees only their orders
        $user = $request->user();
        if ($user->isCustomer()) {
            $query->where('user_id', $user->id);
        }

        $orders = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => $orders,
        ]);
    }

    /**
     * POST /api/orders
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items'          => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity'     => 'required|integer|min:1',
            'notes'          => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            $orderItemsData = [];

            // Validate stock and calculate total
            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::findOrFail($item['menu_item_id']);

                if (! $menuItem->is_available) {
                    return response()->json([
                        'success' => false,
                        'message' => "Menu item '{$menuItem->name}' is not available.",
                    ], 422);
                }

                if ($menuItem->stock_quantity < $item['quantity']) {
                    return response()->json([
                        'success' => false,
                        'message' => "Insufficient stock for '{$menuItem->name}'. Available: {$menuItem->stock_quantity}",
                    ], 422);
                }

                $subtotal = $menuItem->price * $item['quantity'];
                $totalAmount += $subtotal;
                $orderItemsData[] = [
                    'menu_item'  => $menuItem,
                    'quantity'   => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'subtotal'   => $subtotal,
                ];
            }

            $user = $request->user();

            // Create order
            $order = Order::create([
                'user_id'      => $user->isCustomer() ? $user->id : null,
                'cashier_id'   => ($user->isCashier() || $user->isAdmin()) ? $user->id : null,
                'total_amount' => $totalAmount,
                'status'       => 'pending',
                'notes'        => $validated['notes'] ?? null,
            ]);

            // Create order items and deduct inventory
            foreach ($orderItemsData as $itemData) {
                $menuItem = $itemData['menu_item'];
                $quantityBefore = $menuItem->stock_quantity;

                OrderItem::create([
                    'order_id'     => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'quantity'     => $itemData['quantity'],
                    'unit_price'   => $itemData['unit_price'],
                    'subtotal'     => $itemData['subtotal'],
                ]);

                // Deduct stock
                $menuItem->decrement('stock_quantity', $itemData['quantity']);
                $menuItem->refresh();

                // Log inventory change
                InventoryLog::create([
                    'menu_item_id'    => $menuItem->id,
                    'user_id'         => $user->id,
                    'quantity_change' => -$itemData['quantity'],
                    'quantity_before' => $quantityBefore,
                    'quantity_after'  => $menuItem->stock_quantity,
                    'type'            => 'order',
                    'reason'          => 'Order #' . $order->order_number,
                    'order_id'        => $order->id,
                ]);

                // Auto mark unavailable if out of stock
                if ($menuItem->stock_quantity <= 0) {
                    $menuItem->update(['is_available' => false]);
                }
            }

            $order->load(['user', 'cashier', 'orderItems.menuItem']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully.',
                'data'    => $order,
            ], 201);
        });
    }

    /**
     * GET /api/orders/{id}
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        // Customers can only view their own orders
        if ($request->user()->isCustomer() && $order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $order->load(['user', 'cashier', 'orderItems.menuItem.category']);

        return response()->json([
            'success' => true,
            'data'    => $order,
        ]);
    }

    /**
     * PATCH /api/orders/{id}/status
     * Status flow: pending → preparing → ready → completed / cancelled
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed,cancelled',
        ]);

        $allowedTransitions = [
            'pending'   => ['preparing', 'cancelled'],
            'preparing' => ['ready', 'cancelled'],
            'ready'     => ['completed', 'cancelled'],
            'completed' => [],
            'cancelled' => [],
        ];

        if (! in_array($validated['status'], $allowedTransitions[$order->status])) {
            return response()->json([
                'success' => false,
                'message' => "Cannot transition from '{$order->status}' to '{$validated['status']}'.",
            ], 422);
        }

        $updates = ['status' => $validated['status']];

        if ($validated['status'] === 'completed') {
            $updates['completed_at'] = now();
        }

        $order->update($updates);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated.',
            'data'    => $order->load(['user', 'cashier', 'orderItems.menuItem']),
        ]);
    }

    /**
     * DELETE /api/orders/{id}  (Admin only)
     */
    public function destroy(Order $order): JsonResponse
    {
        if (in_array($order->status, ['completed', 'cancelled'])) {
            $order->delete();
            return response()->json(['success' => true, 'message' => 'Order deleted.']);
        }

        return response()->json([
            'success' => false,
            'message' => 'Only completed or cancelled orders can be deleted.',
        ], 422);
    }
}

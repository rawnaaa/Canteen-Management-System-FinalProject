<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * GET /api/inventory
     * List all menu items with stock info
     */
    public function index(Request $request): JsonResponse
    {
        $query = MenuItem::with('category');

        if ($request->has('low_stock') && $request->low_stock === 'true') {
            $query->lowStock();
        }

        $items = $query->orderBy('name')->get()->map(function ($item) {
            $item->append('is_low_stock');
            return $item;
        });

        return response()->json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    /**
     * PATCH /api/inventory/{menuItem}/adjust
     * Manually adjust stock for a single item
     */
    public function adjust(Request $request, MenuItem $menuItem): JsonResponse
    {
        $validated = $request->validate([
            'quantity_change' => 'required|integer|not_in:0',
            'reason'          => 'required|string|max:255',
        ]);

        $quantityBefore = $menuItem->stock_quantity;
        $newQuantity = $quantityBefore + $validated['quantity_change'];

        if ($newQuantity < 0) {
            return response()->json([
                'success' => false,
                'message' => 'Stock cannot go below zero.',
            ], 422);
        }

        $menuItem->update(['stock_quantity' => $newQuantity]);

        // Auto-update availability
        if ($newQuantity > 0 && ! $menuItem->is_available) {
            $menuItem->update(['is_available' => true]);
        } elseif ($newQuantity <= 0) {
            $menuItem->update(['is_available' => false]);
        }

        InventoryLog::create([
            'menu_item_id'    => $menuItem->id,
            'user_id'         => $request->user()->id,
            'quantity_change' => $validated['quantity_change'],
            'quantity_before' => $quantityBefore,
            'quantity_after'  => $newQuantity,
            'type'            => $validated['quantity_change'] > 0 ? 'restock' : 'adjustment',
            'reason'          => $validated['reason'],
        ]);

        $menuItem->refresh()->append('is_low_stock');

        return response()->json([
            'success' => true,
            'message' => 'Inventory adjusted successfully.',
            'data'    => $menuItem,
        ]);
    }

    /**
     * POST /api/inventory/bulk-restock
     * Restock multiple items at once
     */
    public function bulkRestock(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items'                    => 'required|array|min:1',
            'items.*.menu_item_id'     => 'required|exists:menu_items,id',
            'items.*.quantity_to_add'  => 'required|integer|min:1',
            'reason'                   => 'nullable|string|max:255',
        ]);

        $reason = $validated['reason'] ?? 'Bulk restock';
        $results = [];

        DB::transaction(function () use ($validated, $request, $reason, &$results) {
            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::findOrFail($item['menu_item_id']);
                $quantityBefore = $menuItem->stock_quantity;
                $newQuantity = $quantityBefore + $item['quantity_to_add'];

                $menuItem->update([
                    'stock_quantity' => $newQuantity,
                    'is_available'   => true,
                ]);

                InventoryLog::create([
                    'menu_item_id'    => $menuItem->id,
                    'user_id'         => $request->user()->id,
                    'quantity_change' => $item['quantity_to_add'],
                    'quantity_before' => $quantityBefore,
                    'quantity_after'  => $newQuantity,
                    'type'            => 'restock',
                    'reason'          => $reason,
                ]);

                $results[] = [
                    'menu_item_id'   => $menuItem->id,
                    'name'           => $menuItem->name,
                    'quantity_added' => $item['quantity_to_add'],
                    'new_stock'      => $newQuantity,
                ];
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Bulk restock completed.',
            'data'    => $results,
        ]);
    }

    /**
     * GET /api/inventory/logs
     * View all inventory change history
     */
    public function logs(Request $request): JsonResponse
    {
        $query = InventoryLog::with(['menuItem', 'user', 'order'])
            ->orderBy('created_at', 'desc');

        if ($request->has('menu_item_id')) {
            $query->where('menu_item_id', $request->menu_item_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $logs = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => $logs,
        ]);
    }
}

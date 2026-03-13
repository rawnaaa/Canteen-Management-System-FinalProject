<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    public function index()
    {
        $items = MenuItem::with('category')
                        ->orderBy('stock_quantity', 'asc')
                        ->get();
        
        return response()->json($items);
    }

    public function logs(Request $request)
    {
        $query = InventoryLog::with(['menuItem', 'user']);

        if ($request->has('menu_item_id')) {
            $query->where('menu_item_id', $request->menu_item_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(20);
        
        return response()->json($logs);
    }

    public function bulkRestock(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'reason' => 'required|string'
        ]);

        $results = [];

        foreach ($request->items as $item) {
            $menuItem = MenuItem::find($item['menu_item_id']);
            $oldQuantity = $menuItem->stock_quantity;
            
            $menuItem->increment('stock_quantity', $item['quantity']);

            $log = InventoryLog::create([
                'menu_item_id' => $menuItem->id,
                'previous_quantity' => $oldQuantity,
                'new_quantity' => $menuItem->stock_quantity,
                'quantity_change' => $item['quantity'],
                'reason' => $request->reason,
                'user_id' => Auth::id()
            ]);

            $results[] = [
                'menu_item' => $menuItem->name,
                'previous_quantity' => $oldQuantity,
                'new_quantity' => $menuItem->stock_quantity,
                'log' => $log
            ];
        }

        return response()->json([
            'message' => 'Bulk restock completed',
            'results' => $results
        ]);
    }
}
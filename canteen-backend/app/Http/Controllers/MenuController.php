<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $query = MenuItem::with('category');

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('available')) {
            $query->where('is_available', $request->available);
        }

        $menuItems = $query->get();
        return response()->json($menuItems);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:1',
            'image' => 'nullable|image|max:2048'
        ]);

        $data = $request->except('image');
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menu-items', 'public');
            $data['image'] = $path;
        }

        $menuItem = MenuItem::create($data);

        // Create inventory log
        InventoryLog::create([
            'menu_item_id' => $menuItem->id,
            'previous_quantity' => 0,
            'new_quantity' => $menuItem->stock_quantity,
            'quantity_change' => $menuItem->stock_quantity,
            'reason' => 'Initial stock',
            'user_id' => Auth::id()
        ]);

        return response()->json($menuItem->load('category'), 201);
    }

    public function show(MenuItem $menuItem)
    {
        return response()->json($menuItem->load('category'));
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:1',
            'image' => 'nullable|image|max:2048'
        ]);

        $data = $request->except('image');
        $oldQuantity = $menuItem->stock_quantity;

        if ($request->hasFile('image')) {
            // Delete old image
            if ($menuItem->image) {
                Storage::disk('public')->delete($menuItem->image);
            }
            $path = $request->file('image')->store('menu-items', 'public');
            $data['image'] = $path;
        }

        $menuItem->update($data);

        // Log inventory change if quantity changed
        if ($oldQuantity != $menuItem->stock_quantity) {
            InventoryLog::create([
                'menu_item_id' => $menuItem->id,
                'previous_quantity' => $oldQuantity,
                'new_quantity' => $menuItem->stock_quantity,
                'quantity_change' => $menuItem->stock_quantity - $oldQuantity,
                'reason' => 'Manual update',
                'user_id' => Auth::id()
            ]);
        }

        return response()->json($menuItem->load('category'));
    }

    public function destroy(MenuItem $menuItem)
    {
        if ($menuItem->image) {
            Storage::disk('public')->delete($menuItem->image);
        }
        
        $menuItem->delete();
        return response()->json(['message' => 'Menu item deleted successfully']);
    }

    public function toggleAvailability(MenuItem $menuItem)
    {
        $menuItem->update([
            'is_available' => !$menuItem->is_available
        ]);

        return response()->json($menuItem);
    }

    public function updateStock(Request $request, MenuItem $menuItem)
    {
        $request->validate([
            'quantity' => 'required|integer',
            'reason' => 'required|string'
        ]);

        $oldQuantity = $menuItem->stock_quantity;
        $newQuantity = $oldQuantity + $request->quantity;

        if ($newQuantity < 0) {
            return response()->json(['message' => 'Insufficient stock'], 400);
        }

        $menuItem->update(['stock_quantity' => $newQuantity]);

        InventoryLog::create([
            'menu_item_id' => $menuItem->id,
            'previous_quantity' => $oldQuantity,
            'new_quantity' => $newQuantity,
            'quantity_change' => $request->quantity,
            'reason' => $request->reason,
            'user_id' => Auth::id()
        ]);

        return response()->json($menuItem);
    }

    public function lowStock()
    {
        $items = MenuItem::whereRaw('stock_quantity <= low_stock_threshold')
                        ->with('category')
                        ->get();
        
        return response()->json($items);
    }
}
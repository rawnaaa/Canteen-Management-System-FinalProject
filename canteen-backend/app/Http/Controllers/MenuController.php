<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    /**
     * GET /api/menu
     */
    public function index(Request $request): JsonResponse
    {
        $query = MenuItem::with('category');

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by availability
        if ($request->has('available') && $request->available === 'true') {
            $query->available();
        }

        // Search by name
        if ($request->has('search') && $request->search !== '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Low stock filter
        if ($request->has('low_stock') && $request->low_stock === 'true') {
            $query->lowStock();
        }

        $menuItems = $query->orderBy('name')->get();

        // Append is_low_stock computed attribute
        $menuItems->each(function ($item) {
            $item->append('is_low_stock');
        });

        return response()->json([
            'success' => true,
            'data'    => $menuItems,
        ]);
    }

    /**
     * POST /api/menu
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id'         => 'required|exists:categories,id',
            'name'                => 'required|string|max:255',
            'description'         => 'nullable|string',
            'price'               => 'required|numeric|min:0',
            'stock_quantity'      => 'required|integer|min:0',
            'low_stock_threshold' => 'sometimes|integer|min:0',
            'is_available'        => 'boolean',
            'image'               => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('menu-images', 'public');
        }

        $menuItem = MenuItem::create($validated);
        $menuItem->load('category');
        $menuItem->append('is_low_stock');

        return response()->json([
            'success' => true,
            'message' => 'Menu item created successfully.',
            'data'    => $menuItem,
        ], 201);
    }

    /**
     * GET /api/menu/{id}
     */
    public function show(MenuItem $menuItem): JsonResponse
    {
        $menuItem->load('category');
        $menuItem->append('is_low_stock');

        return response()->json([
            'success' => true,
            'data'    => $menuItem,
        ]);
    }

    /**
     * PUT /api/menu/{id}
     */
    public function update(Request $request, MenuItem $menuItem): JsonResponse
    {
        $validated = $request->validate([
            'category_id'         => 'sometimes|exists:categories,id',
            'name'                => 'sometimes|string|max:255',
            'description'         => 'nullable|string',
            'price'               => 'sometimes|numeric|min:0',
            'stock_quantity'      => 'sometimes|integer|min:0',
            'low_stock_threshold' => 'sometimes|integer|min:0',
            'is_available'        => 'boolean',
            'image'               => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($menuItem->image) {
                Storage::disk('public')->delete($menuItem->image);
            }
            $validated['image'] = $request->file('image')->store('menu-images', 'public');
        }

        $menuItem->update($validated);
        $menuItem->load('category');
        $menuItem->append('is_low_stock');

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated successfully.',
            'data'    => $menuItem,
        ]);
    }

    /**
     * DELETE /api/menu/{id}
     */
    public function destroy(MenuItem $menuItem): JsonResponse
    {
        if ($menuItem->image) {
            Storage::disk('public')->delete($menuItem->image);
        }

        $menuItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted successfully.',
        ]);
    }

    /**
     * PATCH /api/menu/{id}/toggle-availability
     */
    public function toggleAvailability(MenuItem $menuItem): JsonResponse
    {
        $menuItem->update(['is_available' => ! $menuItem->is_available]);
        $menuItem->append('is_low_stock');

        return response()->json([
            'success' => true,
            'message' => 'Availability updated.',
            'data'    => $menuItem,
        ]);
    }
}

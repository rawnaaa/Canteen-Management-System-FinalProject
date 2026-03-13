<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('menuItems')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $categories,
        ]);
    }

    /**
     * POST /api/categories
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|max:100',
            'is_active'   => 'boolean',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data'    => $category,
        ], 201);
    }

    /**
     * GET /api/categories/{id}
     */
    public function show(Category $category): JsonResponse
    {
        $category->load('menuItems');

        return response()->json([
            'success' => true,
            'data'    => $category,
        ]);
    }

    /**
     * PUT /api/categories/{id}
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|max:100',
            'is_active'   => 'boolean',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data'    => $category,
        ]);
    }

    /**
     * DELETE /api/categories/{id}
     */
    public function destroy(Category $category): JsonResponse
    {
        if ($category->menuItems()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with existing menu items.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }
}

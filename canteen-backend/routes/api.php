<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ReportController;

// Public routes (no CSRF token needed for API)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Categories
    Route::apiResource('categories', CategoryController::class);
    
    // Menu
    Route::get('/menu', [MenuController::class, 'index']);
    Route::get('/menu/{menuItem}', [MenuController::class, 'show']);
    
    // Customer routes
    Route::get('/my-orders', [OrderController::class, 'getUserOrders']);
    
    // Cashier and Admin routes
    Route::middleware('role:cashier,admin')->group(function () {
        Route::post('/menu', [MenuController::class, 'store']);
        Route::put('/menu/{menuItem}', [MenuController::class, 'update']);
        Route::delete('/menu/{menuItem}', [MenuController::class, 'destroy']);
        Route::patch('/menu/{menuItem}/toggle', [MenuController::class, 'toggleAvailability']);
        Route::patch('/menu/{menuItem}/stock', [MenuController::class, 'updateStock']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::get('/queue/orders', [OrderController::class, 'queue']);
        Route::get('/inventory', [InventoryController::class, 'index']);
        Route::get('/inventory/logs', [InventoryController::class, 'logs']);
        Route::post('/inventory/bulk-restock', [InventoryController::class, 'bulkRestock']);
        Route::get('/inventory/low-stock', [MenuController::class, 'lowStock']);
    });
    
    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/reports/sales', [ReportController::class, 'sales']);
        Route::get('/reports/best-selling', [ReportController::class, 'bestSelling']);
        Route::get('/reports/category-breakdown', [ReportController::class, 'categoryBreakdown']);
        Route::get('/reports/order-trends', [ReportController::class, 'orderTrends']);
        Route::get('/reports/summary', [ReportController::class, 'summary']);
    });
});
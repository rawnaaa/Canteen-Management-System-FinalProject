<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes — Canteen Management System
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api automatically by Laravel 11.
| Auth routes are public; everything else requires Sanctum token.
|
*/

// ── Public Auth Routes ────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ── Protected Routes (require valid Sanctum token) ────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/auth/me',     [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // ── Categories (Admin only for write operations) ──────────────────────
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/categories',              [CategoryController::class, 'store']);
        Route::put('/categories/{category}',    [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });

    // ── Menu Items ────────────────────────────────────────────────────────
    Route::get('/menu',              [MenuController::class, 'index']);
    Route::get('/menu/{menuItem}',   [MenuController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/menu',                              [MenuController::class, 'store']);
        Route::post('/menu/{menuItem}',                   [MenuController::class, 'update']); // POST for multipart/form-data
        Route::delete('/menu/{menuItem}',                 [MenuController::class, 'destroy']);
        Route::patch('/menu/{menuItem}/toggle-availability', [MenuController::class, 'toggleAvailability']);
    });

    // ── Orders ────────────────────────────────────────────────────────────
    Route::get('/orders',          [OrderController::class, 'index']);
    Route::get('/orders/{order}',  [OrderController::class, 'show']);
    Route::post('/orders',         [OrderController::class, 'store']); // all authenticated users can place orders
    Route::middleware('role:admin,cashier')->group(function () {
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
    });

    // ── Inventory ─────────────────────────────────────────────────────────
    Route::middleware('role:admin,cashier')->group(function () {
        Route::get('/inventory',                         [InventoryController::class, 'index']);
        Route::get('/inventory/logs',                    [InventoryController::class, 'logs']);
        Route::patch('/inventory/{menuItem}/adjust',     [InventoryController::class, 'adjust']);
        Route::post('/inventory/bulk-restock',           [InventoryController::class, 'bulkRestock']);
    });

    // ── Reports (Admin only) ──────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('reports')->group(function () {
        Route::get('/sales-summary',  [ReportController::class, 'salesSummary']);
        Route::get('/sales',          [ReportController::class, 'dailySales']); // alias
        Route::get('/daily-sales',    [ReportController::class, 'dailySales']);
        Route::get('/best-sellers',   [ReportController::class, 'bestSellers']);
        Route::get('/order-trends',   [ReportController::class, 'orderTrends']);
        Route::get('/category-sales', [ReportController::class, 'categorySales']);
        Route::get('/custom',         [ReportController::class, 'custom']);
    });

    // ── Users (Admin only) ────────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::get('/users',              [UserController::class, 'index']);
        Route::get('/users/{user}',       [UserController::class, 'show']);
        Route::post('/users',             [UserController::class, 'store']);
        Route::put('/users/{user}',       [UserController::class, 'update']);
        Route::delete('/users/{user}',    [UserController::class, 'destroy']);
        Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    });
});
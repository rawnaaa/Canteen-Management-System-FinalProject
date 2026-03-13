<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\MenuItem;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date'
        ]);

        $sales = Order::whereBetween('created_at', [$request->start_date, $request->end_date])
                      ->where('status', 'completed')
                      ->select(
                          DB::raw('DATE(created_at) as date'),
                          DB::raw('COUNT(*) as total_orders'),
                          DB::raw('SUM(total_amount) as total_sales'),
                          DB::raw('AVG(total_amount) as average_order_value')
                      )
                      ->groupBy('date')
                      ->orderBy('date', 'asc')
                      ->get();

        return response()->json($sales);
    }

    public function bestSelling(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'limit' => 'nullable|integer|min:1|max:100'
        ]);

        $limit = $request->limit ?? 10;

        $items = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('menu_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->join('categories', 'categories.id', '=', 'menu_items.category_id')
            ->whereBetween('orders.created_at', [$request->start_date, $request->end_date])
            ->where('orders.status', 'completed')
            ->select(
                'menu_items.id',
                'menu_items.name',
                'categories.name as category',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('menu_items.id', 'menu_items.name', 'categories.name')
            ->orderBy('total_quantity', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($items);
    }

    public function categoryBreakdown(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date'
        ]);

        $categories = DB::table('categories')
            ->join('menu_items', 'menu_items.category_id', '=', 'categories.id')
            ->join('order_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$request->start_date, $request->end_date])
            ->where('orders.status', 'completed')
            ->select(
                'categories.id',
                'categories.name',
                DB::raw('COUNT(DISTINCT orders.id) as order_count'),
                DB::raw('SUM(order_items.quantity) as items_sold'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('categories.id', 'categories.name')
            ->get();

        return response()->json($categories);
    }

    public function orderTrends(Request $request)
    {
        $request->validate([
            'days' => 'nullable|integer|min:1|max:90'
        ]);

        $days = $request->days ?? 30;
        $startDate = now()->subDays($days)->startOfDay();
        $endDate = now()->endOfDay();

        $trends = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_sales'),
                DB::raw('AVG(total_amount) as average_order')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json($trends);
    }

    public function summary(Request $request)
{
    $request->validate([
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date'
    ]);

    $summary = [
        'overall' => [
            'total_orders' => Order::whereBetween('created_at', [$request->start_date, $request->end_date])
                ->where('status', 'completed')
                ->count(),
                
            'total_revenue' => Order::whereBetween('created_at', [$request->start_date, $request->end_date])
                ->where('status', 'completed')
                ->sum('total_amount') ?? 0,
                
            'average_order_value' => Order::whereBetween('created_at', [$request->start_date, $request->end_date])
                ->where('status', 'completed')
                ->avg('total_amount') ?? 0,
        ],
        
        'low_stock' => MenuItem::whereRaw('stock_quantity <= low_stock_threshold')
            ->count(),
    ];

    return response()->json($summary);
}
}
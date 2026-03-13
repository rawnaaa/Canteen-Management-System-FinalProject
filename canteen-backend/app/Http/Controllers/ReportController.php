<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * GET /api/reports/sales-summary
     * Returns daily, weekly, and monthly totals
     */
    public function salesSummary(Request $request): JsonResponse
    {
        $now = now();

        $daily = Order::completed()
            ->whereDate('completed_at', $now->toDateString())
            ->sum('total_amount');

        $weekly = Order::completed()
            ->whereBetween('completed_at', [$now->startOfWeek(), $now->copy()->endOfWeek()])
            ->sum('total_amount');

        $monthly = Order::completed()
            ->whereMonth('completed_at', $now->month)
            ->whereYear('completed_at', $now->year)
            ->sum('total_amount');

        $totalOrders = Order::completed()->count();
        $avgOrderValue = $totalOrders > 0
            ? Order::completed()->avg('total_amount')
            : 0;

        return response()->json([
            'success' => true,
            'data'    => [
                'daily_sales'       => round($daily, 2),
                'weekly_sales'      => round($weekly, 2),
                'monthly_sales'     => round($monthly, 2),
                'total_orders'      => $totalOrders,
                'avg_order_value'   => round($avgOrderValue, 2),
            ],
        ]);
    }

    /**
     * GET /api/reports/daily-sales?days=30
     * Returns per-day sales for bar chart
     */
    public function dailySales(Request $request): JsonResponse
    {
        $days = (int) $request->get('days', 30);
        $startDate = now()->subDays($days - 1)->startOfDay();

        $sales = Order::completed()
            ->where('completed_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(completed_at) as date'),
                DB::raw('SUM(total_amount) as total_sales'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy(DB::raw('DATE(completed_at)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $sales,
        ]);
    }

    /**
     * GET /api/reports/best-sellers?limit=10
     * Returns top selling items by quantity and revenue
     */
    public function bestSellers(Request $request): JsonResponse
    {
        $limit = (int) $request->get('limit', 10);

        $bestSellers = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->where('orders.status', 'completed')
            ->select(
                'menu_items.id',
                'menu_items.name',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderByDesc('total_quantity')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $bestSellers,
        ]);
    }

    /**
     * GET /api/reports/order-trends?days=30
     * Returns order volume trend for line chart
     */
    public function orderTrends(Request $request): JsonResponse
    {
        $days = (int) $request->get('days', 30);
        $startDate = now()->subDays($days - 1)->startOfDay();

        $trends = Order::where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders"),
                DB::raw("SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders")
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $trends,
        ]);
    }

    /**
     * GET /api/reports/category-sales
     * Returns sales breakdown by category for pie chart
     */
    public function categorySales(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate   = $request->get('end_date', now()->toDateString());

        $categorySales = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('categories', 'menu_items.category_id', '=', 'categories.id')
            ->where('orders.status', 'completed')
            ->whereBetween(DB::raw('DATE(orders.completed_at)'), [$startDate, $endDate])
            ->select(
                'categories.id',
                'categories.name as category',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_revenue')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $categorySales,
        ]);
    }

    /**
     * GET /api/reports/custom?start_date=&end_date=
     * Returns sales for a custom date range
     */
    public function custom(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate   = $request->end_date . ' 23:59:59';

        $summary = Order::completed()
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->select(
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as total_revenue'),
                DB::raw('AVG(total_amount) as avg_order_value')
            )
            ->first();

        $dailyBreakdown = Order::completed()
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(completed_at) as date'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy(DB::raw('DATE(completed_at)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'summary'         => $summary,
                'daily_breakdown' => $dailyBreakdown,
            ],
        ]);
    }
}

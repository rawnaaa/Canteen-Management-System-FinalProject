import { AlertTriangle } from 'lucide-react'

export default function LowStockAlert({ items }) {
  if (!items || items.length === 0) return null

  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold text-amber-800 text-sm">
          Low Stock Warning ({items.length} item{items.length !== 1 ? 's' : ''})
        </h3>
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between items-center text-sm">
            <span className="text-amber-900 font-medium">{item.name}</span>
            <span className="text-amber-700 font-bold bg-amber-100 rounded-full px-2 py-0.5 text-xs">
              {item.stock_quantity} left
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
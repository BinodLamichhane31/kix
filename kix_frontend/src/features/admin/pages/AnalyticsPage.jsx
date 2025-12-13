import { BarChart3, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { adminStats } from '../data/dummyData';
import { formatPrice } from '../../../utils/currency';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Business insights and performance metrics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black mb-1">{formatPrice(adminStats.totalRevenue)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              +{adminStats.revenueGrowth}% from last month
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black mb-1">{adminStats.totalOrders}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              +{adminStats.orderGrowth}% from last month
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black mb-1">{formatPrice(adminStats.totalRevenue / adminStats.totalOrders)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Order Value</p>
          </div>
        </div>

        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black mb-1">{adminStats.userGrowth}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">User Growth</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              +{adminStats.userGrowth}% new users this month
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <h2 className="text-lg font-bold mb-4">Revenue Trends</h2>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <p>Chart placeholder - Integrate with charting library (e.g., Chart.js, Recharts)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <h2 className="text-lg font-bold mb-4">Order Trends</h2>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <p>Chart placeholder - Integrate with charting library (e.g., Chart.js, Recharts)</p>
          </div>
        </div>
      </div>
    </div>
  );
}


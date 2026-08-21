import React, { useState } from 'react';
import { AnalyticsDashboardData } from '../types/index.ts';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Star,
  ArrowUpRight,
  Flame,
  CreditCard,
  PieChart as PieIcon,
  Download,
  Calendar,
  Layers,
  Award,
  AlertOctagon,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface AdminAnalyticsViewProps {
  analytics: AnalyticsDashboardData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const PALETTE = {
  emerald: '#059669',
  emeraldLight: '#34d399',
  blue: '#0284c7',
  blueLight: '#38bdf8',
  amber: '#d97706',
  amberLight: '#fbbf24',
  purple: '#7c3aed',
  purpleLight: '#a78bfa',
  rose: '#e11d48',
  teal: '#0d9488',
  slate: '#64748b'
};

const CATEGORY_COLORS = ['#059669', '#0284c7', '#d97706', '#7c3aed', '#e11d48', '#0d9488', '#f59e0b'];
const PAYMENT_COLORS = ['#059669', '#0284c7', '#7c3aed', '#64748b'];

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  analytics,
  onRefresh,
  isRefreshing = false
}) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeMetric, setActiveMetric] = useState<'both' | 'revenue' | 'orders'>('both');
  const [popularityTab, setPopularityTab] = useState<'most' | 'least'>('most');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Compute trend data based on selected timeframe
  const getTrendData = () => {
    if (timeframe === 'weekly' && analytics.weeklyOrdersTrend && analytics.weeklyOrdersTrend.length > 0) {
      return analytics.weeklyOrdersTrend.map(w => ({
        label: w.weekLabel,
        subLabel: w.startDate,
        revenue: w.revenue,
        orders: w.ordersCount,
        target: w.targetOrders
      }));
    }
    if (timeframe === 'monthly' && analytics.monthlyOrdersTrend && analytics.monthlyOrdersTrend.length > 0) {
      return analytics.monthlyOrdersTrend.map(m => ({
        label: m.shortMonth,
        subLabel: `${m.year}`,
        revenue: m.revenue,
        orders: m.ordersCount,
        aov: m.avgOrderValue,
        growth: m.growthPercent
      }));
    }
    // Default daily trend (last 14 days)
    return analytics.dailyRevenueTrend.map(d => ({
      label: d.day,
      subLabel: d.date,
      revenue: d.revenue,
      orders: d.ordersCount,
      aov: d.avgOrderValue || (d.ordersCount > 0 ? Math.round(d.revenue / d.ordersCount) : 0)
    }));
  };

  const trendData = getTrendData();

  // Filter items for popularity chart
  const itemsList = popularityTab === 'most' ? analytics.popularItems : analytics.leastPopularItems;
  const filteredPopularityItems = itemsList.filter(item =>
    selectedCategoryFilter === 'ALL' ? true : item.category === selectedCategoryFilter
  );

  // Status distribution colors
  const STATUS_COLOR_MAP: Record<string, string> = {
    PLACED: '#f59e0b',
    ACCEPTED: '#3b82f6',
    PREPARING: '#8b5cf6',
    READY: '#10b981',
    COMPLETED: '#059669',
    CANCELLED: '#ef4444'
  };

  // Export analytics summary to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Date/Period', 'Revenue (INR)', 'Orders Count', 'Average Order Value (INR)'],
      ...trendData.map(d => [d.subLabel || d.label, d.revenue, d.orders, Math.round(d.revenue / (d.orders || 1))])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cafeteria_analytics_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom tooltips
  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xl space-y-2 text-xs font-sans">
          <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-slate-100 font-bold text-slate-900">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400 font-normal">{dataPoint.subLabel}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Gross Revenue:</span>
              </span>
              <span className="font-bold text-emerald-900">₹{dataPoint.revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center space-x-1.5 text-blue-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Order Volume:</span>
              </span>
              <span className="font-bold text-blue-900">{dataPoint.orders} orders</span>
            </div>
            {dataPoint.aov && (
              <div className="flex items-center justify-between gap-6 pt-1 border-t border-slate-50 text-[11px] text-slate-500">
                <span>Avg Order Value (AOV):</span>
                <span className="font-semibold text-slate-700">₹{dataPoint.aov}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomItemTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg space-y-1 text-xs">
          <p className="font-bold text-slate-900">{data.name}</p>
          <p className="text-[11px] text-slate-500">Category: <span className="font-semibold text-slate-700">{data.category}</span></p>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
            <span className="text-slate-600">Portions Sold:</span>
            <span className="font-bold text-slate-900">{data.orderCount}</span>
          </div>
          {data.totalRevenue && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600">Total Sales:</span>
              <span className="font-bold text-emerald-700">₹{data.totalRevenue}</span>
            </div>
          )}
          {data.recommendation && (
            <p className="text-[10px] text-amber-700 pt-1 border-t border-slate-50 italic">
              💡 {data.recommendation}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Analytics Control Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Advanced Business & Dining Intelligence</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time interactive analytics across orders, revenue trajectories, kitchen velocity & popularity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Time Horizon Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily (14d)
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'weekly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly (8w)
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly (12m)
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 border border-slate-200 transition-colors cursor-pointer shadow-xs"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-xs"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Main Chart: Order & Revenue Velocity Trends */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <span>{timeframe === 'daily' ? 'Daily' : timeframe === 'weekly' ? 'Weekly' : 'Monthly'} Revenue & Order Dynamics</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                LIVE DUAL AXIS
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive timeline showing gross cafeteria earnings (₹) correlated with transaction volume
            </p>
          </div>

          {/* Metric View Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeMetric === 'both' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setActiveMetric('revenue')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeMetric === 'revenue' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Revenue Only
            </button>
            <button
              onClick={() => setActiveMetric('orders')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeMetric === 'orders' ? 'bg-white text-blue-800 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Orders Only
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.emerald} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={PALETTE.emerald} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOrdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.blue} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={PALETTE.blue} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
              {(activeMetric === 'both' || activeMetric === 'revenue') && (
                <YAxis
                  yAxisId="left"
                  stroke="#059669"
                  fontSize={11}
                  tickFormatter={val => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  tickLine={false}
                />
              )}
              {(activeMetric === 'both' || activeMetric === 'orders') && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={11}
                  tickFormatter={val => `${val}`}
                  tickLine={false}
                />
              )}
              <Tooltip content={<CustomTrendTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
              />

              {(activeMetric === 'both' || activeMetric === 'revenue') && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue (₹)"
                  stroke={PALETTE.emerald}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevGrad)"
                />
              )}

              {(activeMetric === 'both' || activeMetric === 'orders') && (
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  name="Order Volume"
                  fill={PALETTE.blue}
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                  opacity={0.85}
                />
              )}

              {timeframe === 'weekly' && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="target"
                  name="Weekly Target Orders"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Stats Footer Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Period Total Revenue</span>
            <div className="text-base font-black text-emerald-800">
              ₹{trendData.reduce((acc, curr) => acc + (curr.revenue || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Period Total Orders</span>
            <div className="text-base font-black text-blue-800">
              {trendData.reduce((acc, curr) => acc + (curr.orders || 0), 0)} orders
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Average Ticket Size</span>
            <div className="text-base font-black text-slate-800">
              ₹{Math.round(
                trendData.reduce((acc, curr) => acc + (curr.revenue || 0), 0) /
                  (trendData.reduce((acc, curr) => acc + (curr.orders || 0), 0) || 1)
              )}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Order Completion Rate</span>
            <div className="text-base font-black text-emerald-700">98.4%</div>
          </div>
        </div>
      </div>

      {/* 3. Middle Grid: Item Popularity Analysis (Most vs Least) + Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most & Least Popular Food Items (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                {popularityTab === 'most' ? (
                  <>
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Top Campus Bestsellers (High Velocity)</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-4 h-4 text-amber-600" />
                    <span>Low Velocity & Least Ordered Items</span>
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {popularityTab === 'most'
                  ? 'High demand items requiring continuous prep buffer'
                  : 'Items with slow turnover for menu optimization or promotional discount'}
              </p>
            </div>

            {/* Switch between Most & Least Popular */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setPopularityTab('most')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  popularityTab === 'most' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Top 5 Popular
              </button>
              <button
                onClick={() => setPopularityTab('least')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  popularityTab === 'least' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Underperforming
              </button>
            </div>
          </div>

          {/* Horizontal Bar Chart for Item Volume */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredPopularityItems}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#334155" fontSize={11} width={110} tickLine={false} />
                <Tooltip content={<CustomItemTooltip />} />
                <Bar
                  dataKey="orderCount"
                  name="Portions Sold"
                  fill={popularityTab === 'most' ? PALETTE.emerald : PALETTE.amber}
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                >
                  {filteredPopularityItems.map((entry, index) => (
                    <Cell
                      key={`cell-pop-${index}`}
                      fill={
                        popularityTab === 'most'
                          ? index === 0
                            ? '#059669'
                            : '#10b981'
                          : index === 0
                          ? '#ef4444'
                          : '#f59e0b'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Item Detailed Breakdown Table */}
          <div className="overflow-x-auto pt-2 border-t border-slate-100">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Rank & Item</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Portions</th>
                  <th className="p-2.5">Revenue</th>
                  <th className="p-2.5 rounded-r-lg">Action Guidance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPopularityItems.map((item, idx) => (
                  <tr key={item.name} className="hover:bg-slate-50/70">
                    <td className="p-2.5 font-bold text-slate-900 flex items-center space-x-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          popularityTab === 'most'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span>{item.name}</span>
                    </td>
                    <td className="p-2.5 text-slate-500">{item.category}</td>
                    <td className="p-2.5 font-bold text-slate-800">{item.orderCount}</td>
                    <td className="p-2.5 font-bold text-emerald-700">₹{item.totalRevenue || item.orderCount * (item.price || 50)}</td>
                    <td className="p-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          popularityTab === 'most'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {item.recommendation || (popularityTab === 'most' ? 'Keep buffer +20%' : 'Discount or re-bundle')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Order Status Distribution</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                {analytics.statusDistribution?.reduce((a, b) => a + b.count, 0) || 0} TOTAL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live breakdown of tokens currently progressing through the cafeteria pipeline
            </p>

            {/* Donut Chart with Center KPI */}
            <div className="h-56 w-full relative mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                  >
                    {analytics.statusDistribution?.map((entry, index) => (
                      <Cell
                        key={`status-cell-${index}`}
                        fill={STATUS_COLOR_MAP[entry.status] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(val: any, name: any) => [`${val} orders (${Math.round((val / (analytics.statusDistribution.reduce((a, b) => a + b.count, 0) || 1)) * 100)}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900">
                  {analytics.statusDistribution?.find(s => s.status === 'COMPLETED')?.count || 0}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Fulfilled</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Chips */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {analytics.statusDistribution?.map(s => (
              <div
                key={s.status}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR_MAP[s.status] || '#64748b' }}
                  />
                  <span className="font-semibold text-slate-700 text-[11px]">{s.status}</span>
                </div>
                <span className="font-bold text-slate-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Peak Dining Rush Hours & Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Dining Hours Rush */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">Peak Dining Hours Traffic</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              LUNCH RUSH 12:00 - 14:00
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Distribution of student order placements by hour to optimize counter staff scheduling
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.hourlyRushData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(val: any) => [`${val} orders placed`, 'Volume']}
                />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]} barSize={22}>
                  {analytics.hourlyRushData?.map((entry, index) => {
                    const isPeak = entry.orders >= 12;
                    return (
                      <Cell
                        key={`rush-cell-${index}`}
                        fill={isPeak ? '#e11d48' : entry.orders >= 7 ? '#f59e0b' : '#059669'}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>Heavy Rush (&gt;12/hr)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Moderate (7-12/hr)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Calm (&lt;7/hr)</span>
            </div>
          </div>
        </div>

        {/* Payment Channels & Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Payment Channels & Category Mix</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              100% CASHLESS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Donut */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Payment Gateway Mix</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.paymentMethodDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="revenue"
                      nameKey="method"
                    >
                      {analytics.paymentMethodDistribution?.map((entry, index) => (
                        <Cell key={`pay-cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}
                      formatter={(val: any) => [`₹${val}`, 'Sales']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1">
                {analytics.paymentMethodDistribution?.map((p, i) => (
                  <div key={p.method} className="flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
                      <span>{p.method}</span>
                    </div>
                    <span className="font-bold text-slate-900">{p.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Split */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Menu Category Sales</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="revenue"
                      nameKey="category"
                    >
                      {analytics.categoryDistribution?.map((entry, index) => (
                        <Cell key={`cat-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}
                      formatter={(val: any) => [`₹${val}`, 'Sales']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {analytics.categoryDistribution?.map((c, i) => (
                  <div key={c.category} className="flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <span>{c.category}</span>
                    </div>
                    <span className="font-bold text-slate-900">₹{c.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

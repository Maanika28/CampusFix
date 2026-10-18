import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building,
  UserCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { analyticsService } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        Generating analytics charts...
      </div>
    );
  }

  const summary = data?.summary || {};
  const categories = data?.categories || [];
  const statuses = data?.statuses || [];
  const trends = data?.trends || [];
  const buildings = data?.buildings || [];
  const topStaff = data?.top_staff || [];

  // Category Bar Chart Data
  const categoryChartData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        label: 'Issues Reported',
        data: categories.map((c) => c.count),
        backgroundColor: 'rgba(37, 99, 235, 0.85)',
        borderRadius: 8,
      },
    ],
  };

  // Status Doughnut Chart Data
  const statusChartData = {
    labels: statuses.map((s) => s.status),
    datasets: [
      {
        data: statuses.map((s) => s.count),
        backgroundColor: [
          '#F59E0B', // Pending
          '#3B82F6', // Assigned
          '#8B5CF6', // In Progress
          '#10B981', // Resolved
          '#64748B', // Closed
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Trend Line Chart Data (7 Days)
  const trendChartData = {
    labels: trends.map((t) => t.date),
    datasets: [
      {
        label: 'New Complaints Reported',
        data: trends.map((t) => t.reported),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Complaints Resolved',
        data: trends.map((t) => t.resolved),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, font: { size: 11 } },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.6)' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Campus Infrastructure Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Comprehensive operational metrics, category trends, and resolution turnaround times.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Resolution Rate</span>
          <p className="text-3xl font-extrabold text-blue-600">{summary.resolution_rate || 0}%</p>
          <span className="text-[11px] text-slate-400">Total tickets successfully closed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Avg. Turnaround</span>
          <p className="text-3xl font-extrabold text-emerald-600">{summary.avg_resolution_hours || 0} hrs</p>
          <span className="text-[11px] text-slate-400">Time from report to repair</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Urgent Priority</span>
          <p className="text-3xl font-extrabold text-rose-600">{summary.urgent_count || 0}</p>
          <span className="text-[11px] text-slate-400">High safety impact issues</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Active Workload</span>
          <p className="text-3xl font-extrabold text-indigo-600">
            {(summary.in_progress || 0) + (summary.assigned || 0)}
          </p>
          <span className="text-[11px] text-slate-400">Technicians currently on-site</span>
        </div>
      </div>

      {/* Primary Charts (2 Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Complaint Velocity</h3>
              <p className="text-xs text-slate-500">Daily tickets reported vs repairs completed</p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="h-64">
            <Line data={trendChartData} options={chartOptions} />
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Status Distribution</h3>
              <p className="text-xs text-slate-500">Current state of all campus maintenance tickets</p>
            </div>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown & Building Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Issues by Category</h3>
              <p className="text-xs text-slate-500">Volume breakdown by infrastructure domain</p>
            </div>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="h-64">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Building Heatmap Frequency */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Building Hotspot Ranking</h3>
              <p className="text-xs text-slate-500">Campus buildings with most frequent complaints</p>
            </div>
            <Building className="w-4 h-4 text-slate-600" />
          </div>

          <div className="space-y-3 pt-2">
            {buildings.map((bldg, idx) => {
              const maxCount = buildings[0]?.count || 1;
              const pct = Math.round((bldg.count / maxCount) * 100);

              return (
                <div key={bldg.id || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {bldg.name} ({bldg.code})
                    </span>
                    <span className="font-bold text-blue-700">{bldg.count} issues</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Staff Resolution Leaderboard */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Staff Resolution Leaderboard</h3>
            <p className="text-xs text-slate-500">Technicians with highest number of verified fixes</p>
          </div>
          <UserCheck className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Technician</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3 text-right">Resolved Complaints</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topStaff.map((staff, idx) => (
                <tr key={staff.id || idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-bold text-slate-700">#{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{staff.name}</td>
                  <td className="py-3 px-3 text-slate-500">{staff.email}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600">
                    {staff.resolved_count} fixes
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminAnalyticsPage;

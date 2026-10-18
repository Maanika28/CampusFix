import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  FileSpreadsheet,
  QrCode,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { analyticsService, issueService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import QuickAssignModal from '../components/QuickAssignModal';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Assign
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, issuesData] = await Promise.all([
        analyticsService.getAnalytics(),
        issueService.getIssues({ limit: 6 }),
      ]);
      setData(analyticsData);
      setRecentIssues(issuesData.results || issuesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (issue) => {
    setSelectedIssue(issue);
    setIsAssignModalOpen(true);
  };

  const handleAssigned = (updated) => {
    setRecentIssues((prev) =>
      prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))
    );
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        Loading facility dashboard...
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
            Campus Operations Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            CampusFix Executive Dashboard
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Real-time infrastructure health, assignment workloads, resolution metrics, and dispatch logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Full Analytics</span>
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition-all text-white flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Reports</span>
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Issues</span>
          <p className="text-2xl font-bold text-slate-900">{summary.total_issues || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide">Pending</span>
          <p className="text-2xl font-bold text-amber-700">{summary.pending || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">Assigned</span>
          <p className="text-2xl font-bold text-blue-700">{summary.assigned || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">In Progress</span>
          <p className="text-2xl font-bold text-indigo-700">{summary.in_progress || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Resolved</span>
          <p className="text-2xl font-bold text-emerald-700">{summary.resolved || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Turnaround</span>
          <p className="text-2xl font-bold text-slate-900">{summary.avg_resolution_hours || 0}h</p>
        </div>
      </div>

      {/* Unassigned / Urgent Issues Alert Box */}
      {recentIssues.filter((i) => i.status === 'Pending').length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">
                Action Required: Unassigned Complaints
              </h3>
            </div>
            <span className="text-xs text-amber-700 font-medium">Assign to maintenance staff</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentIssues
              .filter((i) => i.status === 'Pending')
              .slice(0, 4)
              .map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      #{issue.id} {issue.title}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {issue.building_name} – Room {issue.classroom_number || 'General'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenAssign(issue)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs"
                  >
                    Assign Now
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Issues Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Campus Tickets</h3>
            <p className="text-xs text-slate-500">Latest issues submitted across all campus departments</p>
          </div>
          <Link
            to="/admin/reports"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Ticket</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Technician</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3 font-medium text-slate-900">
                    <Link to={`/student/complaints/${issue.id}`} className="hover:text-blue-600 font-semibold">
                      #{issue.id} {issue.title}
                    </Link>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{issue.category}</td>
                  <td className="py-3.5 px-3 text-slate-600">
                    {issue.building_name} ({issue.classroom_number || 'Room'})
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={issue.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-3">
                    <PriorityBadge priority={issue.priority} score={issue.priority_score} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    {issue.assigned_to_name ? (
                      <span className="font-medium text-slate-800">{issue.assigned_to_name}</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenAssign(issue)}
                      className="px-2.5 py-1 text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      Assign
                    </button>
                    <Link
                      to={`/student/complaints/${issue.id}`}
                      className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium transition-colors inline-block"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIssue && (
        <QuickAssignModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          issue={selectedIssue}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
};
export default AdminDashboard;

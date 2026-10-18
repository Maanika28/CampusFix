import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  QrCode,
  Clock,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import QRScannerModal from '../components/QRScannerModal';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, upvotes: 0 });
  const [loading, setLoading] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      const data = await issueService.getIssues({ my_issues: 'true' });
      const items = data.results || data || [];
      setIssues(items);

      const total = items.length;
      const pending = items.filter((i) => i.status === 'Pending').length;
      const inProgress = items.filter((i) => ['Assigned', 'In Progress'].includes(i.status)).length;
      const resolved = items.filter((i) => ['Resolved', 'Closed'].includes(i.status)).length;
      const upvotes = items.reduce((acc, curr) => acc + (curr.upvotes_count || 0), 0);

      setStats({ total, pending, inProgress, resolved, upvotes });
    } catch (err) {
      console.error('Failed to load my issues', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-lg shadow-blue-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
              Student Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Report campus infrastructure issues, track ongoing maintenance, and scan classroom QR codes for instant dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Room QR</span>
            </button>
            <Link
              to="/student/report"
              className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Report New Issue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Reported</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <span className="text-[11px] text-slate-400">All submitted tickets</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600 text-xs font-medium">
            <span>Pending Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          <span className="text-[11px] text-amber-600/80">Awaiting assignment</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600 text-xs font-medium">
            <span>In Progress</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-indigo-700">{stats.inProgress}</p>
          <span className="text-[11px] text-indigo-600/80">Technician dispatched</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.resolved}</p>
          <span className="text-[11px] text-emerald-600/80">Verified & closed</span>
        </div>
      </div>

      {/* Recent Issues Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Recent Complaints</h2>
            <p className="text-xs text-slate-500">Track resolution progress in real time</p>
          </div>
          <Link
            to="/student/complaints"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all complaints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Loading your complaints...
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No issues reported yet!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Notice a broken bench, flickering light, or Wi-Fi blackout? Submit a report in seconds.
            </p>
            <Link
              to="/student/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report an Issue</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.slice(0, 4).map((issue) => (
              <Link
                key={issue.id}
                to={`/student/complaints/${issue.id}`}
                className="group block p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon category={issue.category} size="md" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">#{issue.id}</span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {issue.title}
                      </h4>
                    </div>
                  </div>
                  <StatusBadge status={issue.status} size="sm" />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="line-clamp-1">
                    {issue.building_name} – Room {issue.classroom_number || 'General'}
                    {issue.location_detail ? ` (${issue.location_detail})` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={issue.priority} score={issue.priority_score} size="sm" />
                    <span className="text-[11px] text-slate-400">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium group-hover:text-blue-600">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{issue.upvotes_count || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <QRScannerModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </div>
  );
};
export default StudentDashboard;

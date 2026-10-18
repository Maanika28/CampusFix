import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  UploadCloud,
  ExternalLink,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import StatusUpdateModal from '../components/StatusUpdateModal';
import ImageComparisonModal from '../components/ImageComparisonModal';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Filter
  const [filterTab, setFilterTab] = useState('All');

  // Modals
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    fetchAssignedIssues();
  }, []);

  const fetchAssignedIssues = async () => {
    try {
      setLoading(true);
      const data = await issueService.getIssues({ assigned_to_me: 'true' });
      const items = data.results || data || [];
      setIssues(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (e, issue) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIssue(issue);
    setIsStatusModalOpen(true);
  };

  const handleOpenCompare = (e, issue) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIssue(issue);
    setIsCompareOpen(true);
  };

  const handleUpdated = (updated) => {
    setIssues((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
    );
  };

  const filteredIssues = issues.filter((i) => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Pending Acceptance') return i.status === 'Assigned';
    if (filterTab === 'In Progress') return i.status === 'In Progress';
    if (filterTab === 'Resolved') return ['Resolved', 'Closed'].includes(i.status);
    return true;
  });

  const pendingCount = issues.filter((i) => i.status === 'Assigned').length;
  const inProgressCount = issues.filter((i) => i.status === 'In Progress').length;
  const resolvedCount = issues.filter((i) => ['Resolved', 'Closed'].includes(i.status)).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
            Staff & Technician Console
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            Assigned Work Orders
          </h1>
          <p className="text-xs text-slate-300">
            Welcome, {user?.first_name || user?.username}. You have {pendingCount + inProgressCount} active campus tasks pending.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student/complaints"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition-all text-white"
          >
            Browse All Campus Issues
          </Link>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-medium text-blue-600">Pending Start</span>
          <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-medium text-indigo-600">In Progress</span>
          <p className="text-2xl font-bold text-slate-900">{inProgressCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-medium text-emerald-600">Resolved by Me</span>
          <p className="text-2xl font-bold text-slate-900">{resolvedCount}</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['All', 'Pending Acceptance', 'In Progress', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTab === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Work Orders List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          Loading assigned work orders...
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
          <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active work orders</h3>
          <p className="text-xs text-slate-400">All caught up! Check back when new complaints are assigned.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    #{issue.id}
                  </span>
                  <StatusBadge status={issue.status} size="sm" />
                  <PriorityBadge priority={issue.priority} score={issue.priority_score} size="sm" />
                  <span className="text-[11px] text-slate-400">
                    Reported {new Date(issue.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {issue.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {issue.building_name} – Room {issue.classroom_number || 'General'}
                      {issue.location_detail ? ` (${issue.location_detail})` : ''}
                    </span>
                  </div>
                  <div>•</div>
                  <span>Reporter: {issue.student_name}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {(issue.image || issue.repair_image) && (
                  <button
                    type="button"
                    onClick={(e) => handleOpenCompare(e, issue)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                  >
                    Compare Photos
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => handleOpenStatusModal(e, issue)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Update & Proof</span>
                </button>

                <Link
                  to={`/student/complaints/${issue.id}`}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors"
                  title="View full details"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedIssue && (
        <>
          <StatusUpdateModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            issue={selectedIssue}
            onUpdated={handleUpdated}
          />
          <ImageComparisonModal
            isOpen={isCompareOpen}
            onClose={() => setIsCompareOpen(false)}
            beforeImage={selectedIssue.image}
            afterImage={selectedIssue.repair_image}
            title={selectedIssue.title}
            repairNotes={selectedIssue.repair_notes}
            resolvedAt={selectedIssue.resolved_at}
          />
        </>
      )}
    </div>
  );
};
export default StaffDashboard;

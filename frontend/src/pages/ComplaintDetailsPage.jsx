import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ThumbsUp,
  SlidersHorizontal,
  Clock,
  User,
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle2,
  Wrench,
  AlertCircle,
  Loader2,
  Check,
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import ImageComparisonModal from '../components/ImageComparisonModal';
import StatusUpdateModal from '../components/StatusUpdateModal';
import QuickAssignModal from '../components/QuickAssignModal';

const STATUS_STEPS = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStaff, isAdmin } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const data = await issueService.getIssueById(id);
      setIssue(data);
    } catch (err) {
      setError('Complaint not found or unable to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!issue) return;
    try {
      const res = await issueService.upvoteIssue(issue.id);
      setIssue((prev) => ({
        ...prev,
        is_upvoted: res.upvoted,
        upvotes_count: res.upvotes_count,
        priority: res.priority,
        priority_score: res.priority_score,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommenting(true);
    try {
      const newComment = await issueService.addComment(issue.id, commentText.trim());
      setIssue((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        Loading complaint details...
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Issue Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This ticket may have been deleted.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(issue.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to complaints</span>
      </button>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CategoryIcon category={issue.category} size="lg" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  #{issue.id}
                </span>
                <StatusBadge status={issue.status} size="sm" />
                <PriorityBadge priority={issue.priority} score={issue.priority_score} size="sm" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {issue.title}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Upvote Button */}
            <button
              type="button"
              onClick={handleUpvote}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
                issue.is_upvoted
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700'
              }`}
            >
              {issue.is_upvoted ? <Check className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
              <span>{issue.upvotes_count || 0} Upvotes</span>
            </button>

            {/* Before / After Photo Comparison Button */}
            {(issue.image || issue.repair_image) && (
              <button
                type="button"
                onClick={() => setIsCompareOpen(true)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                title="View before & after image proof"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Compare Fix</span>
              </button>
            )}

            {/* Staff / Admin Status Update Action */}
            {(isStaff || isAdmin) && (
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4" />
                <span>Update Status</span>
              </button>
            )}

            {/* Admin Assign Button */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Assign
              </button>
            )}
          </div>
        </div>

        {/* 5-Step Workflow Tracker */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Resolution Lifecycle
          </span>
          <div className="grid grid-cols-5 gap-2 text-center">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isPast
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-blue-600 ring-4 ring-blue-500/20'
                        : 'bg-slate-200'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-semibold block leading-tight ${
                      isCurrent
                        ? 'text-blue-700 font-bold'
                        : isPast
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description Body */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Issue Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {issue.description}
          </p>
        </div>

        {/* Photo Evidence (Before & After Preview) */}
        {(issue.image || issue.repair_image) && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Visual Evidence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {issue.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-900 relative group">
                  <img src={issue.image} alt="Reported issue" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    BEFORE (Initial Report)
                  </div>
                </div>
              )}
              {issue.repair_image && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-900 relative group">
                  <img src={issue.repair_image} alt="Repair proof" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    AFTER (Resolved Proof)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location & Assignment Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Campus Location</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{issue.building?.name || 'Main Campus'}</span>
            </div>
            <p className="text-slate-500">
              Room {issue.classroom?.room_number || 'General'}
              {issue.location_detail ? ` • ${issue.location_detail}` : ''}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Technician</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Wrench className="w-3.5 h-3.5 text-indigo-600" />
              <span>{issue.assigned_to ? (issue.assigned_to.full_name || issue.assigned_to.email) : 'Pending Assignment'}</span>
            </div>
            <p className="text-slate-500">
              {issue.department?.name || 'Campus Maintenance'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Reported Timeline</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <span>{new Date(issue.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-slate-500">
              Reported by {issue.student?.full_name || issue.student?.email}
            </p>
          </div>
        </div>

        {/* Maintenance Notes (if present) */}
        {issue.repair_notes && (
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
              Technician Maintenance Log:
            </span>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              {issue.repair_notes}
            </p>
          </div>
        )}
      </div>

      {/* Discussion & Audit Trail Tabs / Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comment Thread (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Discussion & Updates</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {issue.comments?.length || 0} messages
            </span>
          </div>

          {/* Comment list */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {(!issue.comments || issue.comments.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No comments yet. Have more details or an update? Post below.
              </p>
            ) : (
              issue.comments.map((comm) => (
                <div
                  key={comm.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    comm.author_role === 'staff' || comm.author_role === 'admin'
                      ? 'bg-blue-50/50 border-blue-200/80'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <span>{comm.author_name}</span>
                      <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {comm.author_role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{comm.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Post Comment Input */}
          <form onSubmit={handlePostComment} className="pt-2 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Write a message or maintenance update..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={commenting || !commentText.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              {commenting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send
            </button>
          </form>
        </div>

        {/* Audit Status History (1 column) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Audit History</h3>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {issue.status_history?.map((hist, idx) => (
              <div key={hist.id || idx} className="relative flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <span className="font-bold text-slate-800">{hist.status}</span>
                  <p className="text-slate-500 text-[11px] leading-tight">
                    {hist.notes || 'Status changed'}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(hist.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Before / After Comparison Modal */}
      <ImageComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        beforeImage={issue.image}
        afterImage={issue.repair_image}
        title={issue.title}
        repairNotes={issue.repair_notes}
        resolvedAt={issue.resolved_at}
      />

      {/* Staff Status Update Modal */}
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        issue={issue}
        onUpdated={(updated) => setIssue(updated)}
      />

      {/* Admin Assign Modal */}
      <QuickAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        issue={issue}
        onAssigned={(updated) => setIssue(updated)}
      />
    </div>
  );
};
export default ComplaintDetailsPage;

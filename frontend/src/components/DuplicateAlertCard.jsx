import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ThumbsUp, Check, ExternalLink, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { issueService } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export const DuplicateAlertCard = ({ duplicates, onUpvotedExisting }) => {
  const [upvotedMap, setUpvotedMap] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  if (!duplicates || duplicates.length === 0) return null;

  const handleUpvote = async (issueId) => {
    try {
      setLoadingId(issueId);
      const res = await issueService.upvoteIssue(issueId);
      setUpvotedMap((prev) => ({
        ...prev,
        [issueId]: { upvoted: res.upvoted, count: res.upvotes_count },
      }));
      if (onUpvotedExisting) {
        onUpvotedExisting(issueId);
      }
    } catch (err) {
      console.error('Failed to upvote duplicate', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-2xl border border-amber-300/80 bg-amber-50/70 p-4 shadow-sm space-y-3"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900">
              Potential Duplicate Complaints Detected ({duplicates.length})
            </h4>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Similar issues are already open for this location. You can upvote an existing report to increase its priority instead of creating a duplicate.
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-2">
          {duplicates.map((dup) => {
            const hasUpvoted = upvotedMap[dup.id]?.upvoted ?? dup.is_upvoted;
            const upvotesCount = upvotedMap[dup.id]?.count ?? dup.upvotes_count;

            return (
              <div
                key={dup.id}
                className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900">
                      #{dup.id} {dup.title}
                    </span>
                    <StatusBadge status={dup.status} size="sm" />
                    <PriorityBadge priority={dup.priority} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {dup.location_detail || `${dup.building_name} - Room ${dup.classroom_number}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/student/complaints/${dup.id}`}
                    target="_blank"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleUpvote(dup.id)}
                    disabled={loadingId === dup.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs ${
                      hasUpvoted
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    {hasUpvoted ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Upvoted ({upvotesCount})</span>
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Upvote ({upvotesCount})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
export default DuplicateAlertCard;

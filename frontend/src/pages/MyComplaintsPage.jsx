import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ThumbsUp,
  MapPin,
  Clock,
  PlusCircle,
  ExternalLink,
  Loader2,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { issueService, departmentService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon } from '../components/CategoryIcon';

export const MyComplaintsPage = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buildings, setBuildings] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'priority', 'upvotes'

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, categoryFilter, buildingFilter, search]);

  const fetchBuildings = async () => {
    try {
      const data = await departmentService.getBuildings();
      setBuildings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (user?.role === 'student') {
        params.my_issues = 'true';
      }
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (buildingFilter) params.building = buildingFilter;
      if (search.trim()) params.search = search.trim();

      const data = await issueService.getIssues(params);
      const items = data.results || data || [];
      setIssues(items);
    } catch (err) {
      console.error('Failed to load issues', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (e, issueId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await issueService.upvoteIssue(issueId);
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId
            ? { ...i, is_upvoted: res.upvoted, upvotes_count: res.upvotes_count, priority_score: res.priority_score, priority: res.priority }
            : i
        )
      );
    } catch (err) {
      console.error('Failed to upvote', err);
    }
  };

  // Client sort
  const sortedIssues = [...issues].sort((a, b) => {
    if (sortBy === 'priority') return b.priority_score - a.priority_score;
    if (sortBy === 'upvotes') return b.upvotes_count - a.upvotes_count;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const statusTabs = ['All', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {user?.role === 'student' ? 'My Reported Complaints' : 'Campus Infrastructure Complaints'}
          </h1>
          <p className="text-xs text-slate-500">
            Search, filter, and inspect campus maintenance tickets
          </p>
        </div>
        <Link
          to="/student/report"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, classroom, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {['Electrical', 'Plumbing', 'Wi-Fi', 'Furniture', 'Cleanliness', 'Laboratory', 'Safety', 'Others'].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="upvotes">Sort: Most Upvotes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          Loading complaints...
        </div>
      ) : sortedIssues.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
          <p className="text-sm font-semibold text-slate-700">No matching complaints found</p>
          <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedIssues.map((issue) => (
            <Link
              key={issue.id}
              to={`/student/complaints/${issue.id}`}
              className="group block p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all space-y-3 relative"
            >
              {/* Category & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CategoryIcon category={issue.category} size="sm" />
                  <span className="text-[11px] font-mono text-slate-400">#{issue.id}</span>
                </div>
                <StatusBadge status={issue.status} size="sm" />
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {issue.title}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="line-clamp-1">
                  {issue.building_name} – Room {issue.classroom_number || 'General'}
                  {issue.location_detail ? ` (${issue.location_detail})` : ''}
                </span>
              </div>

              {/* Priority & Upvote Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <PriorityBadge priority={issue.priority} score={issue.priority_score} size="sm" />

                <button
                  type="button"
                  onClick={(e) => handleUpvote(e, issue.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                    issue.is_upvoted
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700'
                  }`}
                  title={issue.is_upvoted ? 'Remove upvote' : 'Upvote this issue'}
                >
                  {issue.is_upvoted ? <Check className="w-3.5 h-3.5" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                  <span>{issue.upvotes_count || 0}</span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyComplaintsPage;

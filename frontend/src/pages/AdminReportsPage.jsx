import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, Search, Filter, Loader2, Calendar, MapPin } from 'lucide-react';
import { issueService, departmentService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import { Link } from 'react-router-dom';

export const AdminReportsPage = () => {
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadIssues();
  }, [status, category, department, search]);

  const loadFilters = async () => {
    try {
      const depts = await departmentService.getDepartments();
      setDepartments(depts);
    } catch (err) {
      console.error(err);
    }
  };

  const loadIssues = async () => {
    try {
      setLoading(true);
      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;
      if (department) params.department = department;
      if (search.trim()) params.search = search.trim();

      const data = await issueService.getIssues(params);
      setIssues(data.results || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;
    if (department) params.department = department;
    const url = issueService.exportReportUrl(params);
    window.open(url, '_blank');
  };

  const handleExportJSON = async () => {
    try {
      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;
      if (department) params.department = department;
      const data = await issueService.getExportReportJson(params);
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campusfix_export_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (err) {
      console.error('Failed to export JSON', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Complaints Reports & Data Export
          </h1>
          <p className="text-xs text-slate-500">
            Generate audit logs, review compliance records, and export institutional datasets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="">All Statuses</option>
            {['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="">All Categories</option>
            {['Electrical', 'Plumbing', 'Wi-Fi', 'Furniture', 'Cleanliness', 'Laboratory', 'Safety', 'Others'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Keyword Search
          </label>
          <input
            type="text"
            placeholder="Search keywords, rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Loading filtered report records...
          </div>
        ) : issues.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No complaints match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <Link to={`/student/complaints/${i.id}`} className="hover:text-blue-600">
                        #{i.id} {i.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{i.category}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {i.building_name} ({i.classroom_number || 'Room'})
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={i.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={i.priority} score={i.priority_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{i.student_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {i.assigned_to_name ? (
                        <span className="font-medium text-slate-800">{i.assigned_to_name}</span>
                      ) : (
                        <span className="text-amber-600 font-semibold">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(i.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminReportsPage;

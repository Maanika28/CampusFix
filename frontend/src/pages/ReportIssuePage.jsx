import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  UploadCloud,
  MapPin,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { departmentService, issueService } from '../services/api';
import CategoryIcon from '../components/CategoryIcon';
import DuplicateAlertCard from '../components/DuplicateAlertCard';

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Wi-Fi',
  'Furniture',
  'Cleanliness',
  'Laboratory',
  'Safety',
  'Others',
];

export const ReportIssuePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  const [category, setCategory] = useState('Electrical');
  const [departmentId, setDepartmentId] = useState('');
  const [buildingId, setBuildingId] = useState(searchParams.get('building') || '');
  const [classroomId, setClassroomId] = useState(searchParams.get('classroom') || '');
  const [locationDetail, setLocationDetail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [isSearchingDupes, setIsSearchingDupes] = useState(false);

  const debounceTimer = useRef(null);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (buildingId) {
      loadClassrooms(buildingId);
    } else {
      setClassrooms([]);
    }
  }, [buildingId]);

  // Trigger duplicate check when title, category, or classroom changes
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (title.trim().length > 3 || classroomId) {
      debounceTimer.current = setTimeout(async () => {
        setIsSearchingDupes(true);
        try {
          const res = await issueService.checkDuplicates({
            title: title.trim(),
            category,
            classroom: classroomId || undefined,
            building: buildingId || undefined,
          });
          setDuplicates(res.duplicates || []);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingDupes(false);
        }
      }, 500);
    } else {
      setDuplicates([]);
    }

    return () => clearTimeout(debounceTimer.current);
  }, [title, category, classroomId, buildingId]);

  const loadDropdownData = async () => {
    try {
      const [depts, bldgs] = await Promise.all([
        departmentService.getDepartments(),
        departmentService.getBuildings(),
      ]);
      setDepartments(depts);
      setBuildings(bldgs);

      if (searchParams.get('building')) {
        loadClassrooms(searchParams.get('building'));
      }
    } catch (err) {
      console.error('Failed to load form options', err);
    }
  };

  const loadClassrooms = async (bId) => {
    try {
      const rooms = await departmentService.getClassrooms(bId);
      setClassrooms(rooms);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both a title and description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      if (departmentId) formData.append('department', departmentId);
      if (buildingId) formData.append('building', buildingId);
      if (classroomId) formData.append('classroom', classroomId);
      if (locationDetail.trim()) formData.append('location_detail', locationDetail.trim());
      if (image) formData.append('image', image);

      const created = await issueService.createIssue(formData);

      // Trigger celebration confetti
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (c) {}

      navigate(`/student/complaints/${created.id}?success=true`);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.title?.[0] || 'Failed to submit complaint. Please verify inputs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const qrNotice = searchParams.get('room') && searchParams.get('bldg');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
            <PlusCircle className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Report Campus Issue
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Submit details and photos of any broken facility or hazard for prompt resolution.
        </p>
      </div>

      {/* QR Prefill Notification Banner */}
      {qrNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>
              QR Location Pre-filled: <strong>{searchParams.get('bldg')} – Room {searchParams.get('room')}</strong>
            </span>
          </div>
          <span className="font-semibold text-emerald-700">Verified Location</span>
        </div>
      )}

      {/* Duplicate Alert Card if matches exist */}
      <DuplicateAlertCard
        duplicates={duplicates}
        onUpvotedExisting={(id) => {
          navigate(`/student/complaints/${id}`);
        }}
      />

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            1. Select Issue Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <CategoryIcon category={cat} size="sm" />
                  <span className="text-xs font-semibold">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Campus Location */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Campus Location Details
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Building</label>
              <select
                value={buildingId}
                onChange={(e) => {
                  setBuildingId(e.target.value);
                  setClassroomId('');
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Select Building</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Classroom / Lab</label>
              <select
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                disabled={!buildingId}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {buildingId ? 'Select Room' : 'Select a building first'}
                </option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    Room {c.room_number} (Floor {c.floor})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Specific Location Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 2nd row near window, bench #4, or faculty lectern"
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 3. Issue Summary & Description */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            3. Issue Details
          </label>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Issue Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Projector HDMI port damaged and sparking"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe the issue, how long it has been present, and whether it poses an immediate hazard..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 4. Photo Evidence (Before Image) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            4. Photo Evidence (Before Image)
          </label>

          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-900 group">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreviewUrl(null);
                  }}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Remove Photo
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-colors">
              <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Click to upload photo of the issue</span>
              <span className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, WEBP (helps technicians prepare parts)</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Complaint...</span>
              </div>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default ReportIssuePage;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, UploadCloud, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { issueService } from '../services/api';

export const StatusUpdateModal = ({ isOpen, onClose, issue, onUpdated }) => {
  const [status, setStatus] = useState(issue?.status || 'In Progress');
  const [notes, setNotes] = useState('');
  const [repairImage, setRepairImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !issue) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRepairImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('status', status);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
        formData.append('repair_notes', notes.trim());
      }
      if (repairImage) {
        formData.append('repair_image', repairImage);
      }

      const updated = await issueService.updateIssueStatus(issue.id, formData);
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Update Complaint Status</h3>
              <p className="text-xs text-slate-500">#{issue.id} – {issue.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Status Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                New Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Assigned', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      status === s
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Maintenance Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Maintenance / Progress Notes
              </label>
              <textarea
                rows={3}
                placeholder="Describe actions taken, replaced components, or cause of issue..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400"
              />
            </div>

            {/* Upload Repair Proof (After Image) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Repair Proof Photo (After Image)
              </label>

              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-900 group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRepairImage(null);
                        setPreviewUrl(null);
                      }}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-colors">
                  <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-700">Click to upload completion proof photo</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WEBP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm Update
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default StatusUpdateModal;

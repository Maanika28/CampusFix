import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Columns, CheckCircle2, Clock } from 'lucide-react';

export const ImageComparisonModal = ({ isOpen, onClose, beforeImage, afterImage, title, repairNotes, resolvedAt }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] = useState('slider'); // 'slider' or 'side-by-side'

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Resolution
                </span>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Before & After repair proof verification
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center text-xs">
                <button
                  onClick={() => setViewMode('slider')}
                  className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                    viewMode === 'slider' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Slider
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                    viewMode === 'side-by-side' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" /> Side by Side
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="p-6 bg-slate-900">
            {viewMode === 'slider' ? (
              <div className="relative w-full h-[420px] rounded-xl overflow-hidden select-none bg-black">
                {/* After Image (Background) */}
                <img
                  src={afterImage || beforeImage}
                  alt="After repair"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-emerald-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm">
                  AFTER (Resolved)
                </div>

                {/* Before Image (Foreground with Clip Path) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={beforeImage}
                    alt="Before repair"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', minWidth: '850px' }}
                  />
                  <div className="absolute top-4 left-4 bg-rose-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm">
                    BEFORE (Issue)
                  </div>
                </div>

                {/* Vertical Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl z-10"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-700 text-xs">
                    ↔
                  </div>
                </div>

                {/* Interactive Slider Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative h-[380px] rounded-xl overflow-hidden bg-black border border-slate-700">
                  <img src={beforeImage} alt="Before repair" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow">
                    BEFORE (Initial Report)
                  </div>
                </div>
                <div className="relative h-[380px] rounded-xl overflow-hidden bg-black border border-slate-700">
                  <img src={afterImage || beforeImage} alt="After repair" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow">
                    AFTER (Repair Proof)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer details */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance Notes:</span>
              <p className="text-slate-800 text-sm font-medium">
                {repairNotes || "Work completed according to campus safety standards."}
              </p>
            </div>
            {resolvedAt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>Resolved: {new Date(resolvedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default ImageComparisonModal;

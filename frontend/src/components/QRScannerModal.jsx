import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Search, CheckCircle, AlertCircle, Building2, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { departmentService } from '../services/api';

export const QRScannerModal = ({ isOpen, onClose }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannedRoom, setScannedRoom] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLookup = async (tokenToTest) => {
    const rawToken = tokenToTest || tokenInput;
    if (!rawToken.trim()) return;

    setLoading(true);
    setError(null);
    setScannedRoom(null);

    try {
      const data = await departmentService.lookupQR(rawToken);
      if (data.found) {
        setScannedRoom(data);
      } else {
        setError('Classroom not found for this QR Code.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const proceedToReport = () => {
    if (!scannedRoom) return;
    onClose();
    navigate(`/student/report?building=${scannedRoom.building.id}&classroom=${scannedRoom.classroom.id}&room=${encodeURIComponent(scannedRoom.classroom.room_number)}&bldg=${encodeURIComponent(scannedRoom.building.name)}`);
  };

  const sampleTokens = [
    { label: 'Room 101 (Academic Block)', code: 'CF-AAB-101' },
    { label: 'CS Lab 301 (Turing Center)', code: 'CF-TCC-CS-Lab-301' },
    { label: 'Chem Lab 1 (Science Wing)', code: 'CF-RSW-Chem-Lab-1' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Scan Classroom QR</h3>
                <p className="text-xs text-slate-500">Instant issue reporting for campus rooms</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Camera / QR Viewport Simulation */}
            <div className="relative border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/30 p-6 text-center overflow-hidden">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 animate-pulse shadow-sm" />
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white shadow-md border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
                <QrCode className="w-10 h-10" />
              </div>
              <p className="text-xs font-medium text-slate-700">Point phone camera at classroom door sticker</p>
              <p className="text-[11px] text-slate-400 mt-1">Or paste / select a QR code token below</p>
            </div>

            {/* Quick Sample Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Quick Test Rooms:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {sampleTokens.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTokenInput(item.code);
                      handleLookup(item.code);
                    }}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium text-slate-700"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter QR token (e.g. CF-AAB-101)..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={loading || !tokenInput.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                Verify
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Verified Room Card */}
            {scannedRoom && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Classroom Identified</span>
                  </div>
                  <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Floor {scannedRoom.classroom.floor}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-sm">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Room {scannedRoom.classroom.room_number}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{scannedRoom.building.name} ({scannedRoom.building.code})</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={proceedToReport}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Report Issue for this Room</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default QRScannerModal;

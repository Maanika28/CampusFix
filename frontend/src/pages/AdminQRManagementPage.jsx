import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Printer, Building2, MapPin, Download, Loader2, Sparkles } from 'lucide-react';
import { departmentService } from '../services/api';

export const AdminQRManagementPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBuilding, setFilterBuilding] = useState('');

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getClassrooms();
      setClassrooms(data.results || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = filterBuilding
    ? classrooms.filter((c) => c.building_code === filterBuilding || String(c.building) === filterBuilding)
    : classrooms;

  // Unique building codes
  const buildingCodes = Array.from(new Set(classrooms.map((c) => c.building_code))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Classroom QR Stickers & Locations
          </h1>
          <p className="text-xs text-slate-500">
            Printable high-resolution QR codes to affix to classroom doors and laboratory stations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="">All Buildings</option>
            {buildingCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print All Door Stickers</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          Loading classroom QR registry...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No classrooms registered yet.
        </div>
      ) : (
        /* Printable Grid of QR Door Stickers */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
          {filtered.map((room) => {
            // Fallback qr generator url if image not populated
            const qrImageUrl =
              room.qr_code_image ||
              `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CAMPUSFIX_QR:${room.qr_code_token}&color=25-99-235`;

            return (
              <div
                key={room.id}
                className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 flex flex-col items-center text-center space-y-4 print:break-inside-avoid print:shadow-none print:border-black"
              >
                {/* Brand / Header */}
                <div className="w-full border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>CampusFix</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Official Issue QR
                  </span>
                </div>

                {/* QR Image */}
                <div className="w-44 h-44 p-2 rounded-2xl bg-white border border-slate-200 shadow-inner flex items-center justify-center">
                  <img
                    src={qrImageUrl}
                    alt={`QR Code for Room ${room.room_number}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Location Info */}
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Room {room.room_number}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room.building_name} ({room.building_code})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Floor {room.floor}
                  </span>
                </div>

                {/* Token string */}
                <div className="w-full pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">
                    Scan with camera or enter code:
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg block select-all">
                    {room.qr_code_token}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default AdminQRManagementPage;

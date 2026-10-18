import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  QrCode,
  Zap,
  ShieldCheck,
  BarChart3,
  ThumbsUp,
  SlidersHorizontal,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Building,
  Clock,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

export const LandingPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password, role) => {
    try {
      await login(email, password);
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'staff') navigate('/staff/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  return (
    <div className="space-y-24 py-12 md:py-20 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Campus Infrastructure Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.15]"
        >
          Report, assign, and resolve campus issues{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            with zero friction.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal"
        >
          From flickering projectors and broken lab chairs to leaking washrooms. CampusFix empowers students with QR scanning, prevents duplicate spam with smart upvoting, and gives campus technicians a seamless workflow.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Create Student Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-semibold text-sm shadow-xs transition-colors"
          >
            Sign In with Email
          </Link>
        </motion.div>

        {/* Quick Demo Test Accounts Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-6"
        >
          <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm max-w-2xl mx-auto text-left">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                One-Click Demo Switcher
              </span>
              <span className="text-[11px] text-slate-400">Click any role to test instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@campusfix.edu', 'student123', 'student')}
                className="p-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200/80 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Student</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-blue-700 mt-1">Report, QR scan & upvote complaints</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('electrician@campusfix.edu', 'staff123', 'staff')}
                className="p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-200/80 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">Staff Technician</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-indigo-700 mt-1">Accept tasks & upload repair proof</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@campusfix.edu', 'admin123', 'admin')}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-left transition-colors group cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Administrator</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-300 mt-1">Analytics, assignment & QR printouts</p>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Interactive Mock Preview Card */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 p-3 sm:p-5 shadow-2xl border border-slate-800">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-slate-400 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-500">campusfix.internal/portal</span>
            </div>
            <span className="text-[11px] text-blue-400 font-medium">Live System Demo</span>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 mt-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    #CF-104
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    High-Definition Ceiling Projector HDMI Port Damaged
                  </h3>
                  <StatusBadge status="In Progress" size="sm" />
                  <PriorityBadge priority="Urgent" score={75} size="sm" />
                </div>
                <p className="text-xs text-slate-500">
                  Alan Turing Computer Center • Room CS-Lab-301 (Floor 3) • Reported by Aarav Gupta
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>14 Upvotes</span>
                </div>
              </div>
            </div>

            {/* Workflow Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <span className="text-blue-600">1. Pending</span>
                <span className="text-blue-600">2. Assigned</span>
                <span className="text-blue-600">3. In Progress</span>
                <span className="text-slate-400">4. Resolved</span>
                <span className="text-slate-400">5. Closed</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-[60%] rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Technician</span>
                <p className="font-semibold text-slate-800">Rajesh Kumar (Electrical Dept)</p>
                <p className="text-slate-500">Technician working on replacement HDMI wall faceplate</p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Smart Priority Score</span>
                <p className="font-semibold text-emerald-900">75 / 100 (Urgent Priority)</p>
                <p className="text-emerald-700">Calculated from 14 student upvotes + Electrical category base</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Smart Features */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Engineered for High-Density Campus Life
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Traditional paper complaint registers or email inboxes lose track of work. CampusFix connects every room to an automated resolution pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">QR Code Classroom Reporting</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every lecture hall and lab has a unique printable QR code. Students point their phone camera to prefill building, room number, and floor instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Duplicate Check & Upvoting</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time duplicate detection alerts students if a classmate already reported the broken AC, letting them upvote instead of flooding technicians.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Before & After Repair Proof</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Staff technicians upload high-resolution repair proof photos. Students and administrators can verify fixes side-by-side using an interactive slider.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Priority Score Algorithm</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamically weights category danger, student upvotes, and days unresolved into an objective score so safety hazards are resolved first.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Email & In-App Status Alerts</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated notifications keep reporters informed whenever their ticket is assigned, in progress, or resolved, complete with technician comments.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Executive Analytics</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive Chart.js heatmaps for building issues, category breakdowns, average resolution times, and staff productivity leaderboards.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-4 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-10 sm:p-14 shadow-xl space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ready to Modernize Your Campus Maintenance?
        </h2>
        <p className="text-blue-100 max-w-xl mx-auto text-sm leading-relaxed">
          Sign up today or test the demo environments to see how easy facility management can be.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-bold text-sm shadow-md transition-colors"
          >
            Get Started Now
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-700/60 hover:bg-blue-700 border border-blue-400/40 text-white rounded-2xl font-semibold text-sm transition-colors"
          >
            Sign In with Test Account
          </Link>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;

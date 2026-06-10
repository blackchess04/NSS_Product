'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../components/LanguageProvider';
import { reportsStore, Report, getSlaDays } from '../../lib/reportsStore';
import { WardsData } from '../../components/MapboxPicker';
import { CloudinaryUpload } from '../../components/CloudinaryUpload';
import { 
  ShieldCheck, AlertOctagon, Eye, CheckCircle, Clock, 
  MapPin, Loader2, ArrowRight, UploadCloud, LogIn, Lock, Info 
} from 'lucide-react';

export default function AdminPortal() {
  const { t, language } = useLanguage();
  
  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // App state
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Selected report for editing
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<'Pending' | 'In Progress' | 'Resolved' | 'Escalated'>('Pending');
  const [resolutionProof, setResolutionProof] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportsStore.getAllReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin]);

  // Demo Admin quick login
  const handleQuickLogin = () => {
    setIsAdmin(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@nagarseva.gov.in' && adminPassword === 'admin123') {
      setIsAdmin(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Use admin@nagarseva.gov.in / admin123');
    }
  };

  // Filter complaints
  const filteredReports = reports.filter(r => {
    const wardMatch = selectedWard === 'All' || r.ward === selectedWard;
    const catMatch = selectedCategory === 'All' || r.category === selectedCategory;
    const statusMatch = selectedStatus === 'All' || r.status === selectedStatus;
    return wardMatch && catMatch && statusMatch;
  });

  // SLA Time Calculator
  const getSlaTimeRemaining = (deadline: string, status: string, created: string) => {
    if (status === 'Resolved') return { type: 'resolved', text: 'Resolved' };
    const now = new Date();
    const target = new Date(deadline);
    const diffMs = target.getTime() - now.getTime();
    
    if (diffMs < 0) {
      // Overdue
      const overdueMs = Math.abs(diffMs);
      const days = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((overdueMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return { 
        type: 'breached', 
        text: days > 0 ? `${days}d ${hours}h overdue` : `${hours}h overdue`
      };
    } else {
      // Time left
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return {
        type: 'pending',
        text: days > 0 ? `${days}d ${hours}h left` : `${hours}h left`
      };
    }
  };

  // Open complaint editor
  const handleEditClick = (report: Report) => {
    setEditingReport(report);
    setStatusUpdate(report.status);
    setResolutionProof(report.resolution_proof_url || '');
    setResolutionNotes(report.resolution_notes || '');
    setFormError('');
  };

  // Save status update
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    // SLA Closure Proof requirement validation
    if (statusUpdate === 'Resolved') {
      if (!resolutionProof) {
        setFormError('Resolution proof photo is required to close this complaint.');
        return;
      }
      if (!resolutionNotes.trim()) {
        setFormError('Resolution details are required.');
        return;
      }
    }

    setUpdating(true);
    setFormError('');

    try {
      const success = await reportsStore.updateReportStatus(
        editingReport.id,
        statusUpdate,
        statusUpdate === 'Resolved' ? resolutionProof : undefined,
        statusUpdate === 'Resolved' ? resolutionNotes : undefined
      );

      if (success) {
        setEditingReport(null);
        await fetchReports();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="glass p-8 rounded-2xl glow-orange text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          
          <div className="w-16 h-16 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-100">{t.navAdmin}</h2>
            <p className="text-xs text-slate-400 mt-1.5">Access restricted to verified municipal officers</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase mb-1.5">{t.email}</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@nagarseva.gov.in"
                className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase mb-1.5">{t.password}</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
              />
            </div>
            
            {authError && <p className="text-xs text-rose-500">{authError}</p>}
            
            <button
              type="submit"
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 font-bold text-sm text-slate-950 rounded-xl transition duration-200"
            >
              {t.login}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest">Demo Evaluation Bypass</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            onClick={handleQuickLogin}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-orange-400 hover:text-white font-semibold text-xs rounded-xl transition"
          >
            Bypass & Login as Admin Instantaneously →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-900">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 text-slate-100">
            <ShieldCheck size={28} className="text-orange-500" />
            {t.adminTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-1">{t.adminSubtitle}</p>
        </div>
        <button
          onClick={() => setIsAdmin(false)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
        >
          {t.logout}
        </button>
      </section>

      {/* FILTER & GRID MANAGEMENT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: Complaints List */}
        <section className="lg:col-span-8 space-y-4">
          
          {/* Controls filter bar */}
          <div className="glass p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Ward */}
            <div>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none"
              >
                <option value="All">{t.allWards}</option>
                {WardsData.map(w => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
            
            {/* Category */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none"
              >
                <option value="All">{t.allCategories}</option>
                <option value="Sanitation">{t.categorySanitation}</option>
                <option value="Pothole">{t.categoryPothole}</option>
                <option value="Encroachment">{t.categoryEncroachment}</option>
                <option value="Safety">{t.categorySafety}</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">{t.statusPending}</option>
                <option value="In Progress">{t.statusInProgress}</option>
                <option value="Resolved">{t.statusResolved}</option>
                <option value="Escalated">{t.statusEscalated}</option>
              </select>
            </div>
          </div>

          {/* Complaints Grid List */}
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="animate-spin text-orange-500 mx-auto" size={32} />
              <p className="text-xs text-slate-500 mt-2">Fetching active ward reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="glass p-8 text-center text-slate-500 text-xs">
              No matching civic complaints found for this selection.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map(report => {
                const sla = getSlaTimeRemaining(report.sla_deadline, report.status, report.created_at);

                return (
                  <div 
                    key={report.id}
                    onClick={() => handleEditClick(report)}
                    className={`glass p-5 rounded-2xl border-l-4 hover:border-r hover:border-slate-700 cursor-pointer transition flex flex-col justify-between min-h-[200px] ${
                      report.status === 'Pending' ? 'border-l-amber-500 bg-amber-500/5' :
                      report.status === 'In Progress' ? 'border-l-blue-500 bg-blue-500/5' :
                      report.status === 'Resolved' ? 'border-l-emerald-500 bg-emerald-500/5' :
                      'border-l-rose-500 bg-rose-500/5 glow-orange'
                    }`}
                  >
                    <div>
                      {/* Badge / ID line */}
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span className="font-mono font-bold text-orange-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{report.tracking_id}</span>
                        {report.is_anonymous ? (
                          <span className="text-emerald-400 font-semibold uppercase tracking-wider">ANONYMOUS (DPDP)</span>
                        ) : (
                          <span className="text-slate-400">Citizen Logged</span>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <h3 className="text-sm font-bold text-slate-200 mt-3 line-clamp-1 leading-normal">{report.title}</h3>
                      <p className="text-xs text-slate-450 mt-1.5 line-clamp-2 leading-relaxed italic">"{report.description}"</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      {/* Location */}
                      <div className="flex items-center gap-1 text-slate-500 truncate max-w-[50%]">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{report.ward}</span>
                      </div>

                      {/* SLA remaining indicator */}
                      <div>
                        {sla.type === 'resolved' ? (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide font-bold">Resolved</span>
                        ) : sla.type === 'breached' ? (
                          <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 uppercase tracking-wide font-bold flex items-center gap-1">
                            <AlertOctagon size={10} /> {t.slaOverdue}
                          </span>
                        ) : (
                          <span className="text-slate-400 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-full font-medium">
                            SLA: {sla.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </section>

        {/* RIGHT COMPONENT: Status Updates Panel */}
        <aside className="lg:col-span-4">
          {editingReport ? (
            <form onSubmit={handleStatusSubmit} className="glass p-6 rounded-2xl space-y-6 shadow-xl relative overflow-hidden animate-slideIn border border-orange-500/20">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Update Complaint</span>
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="text-xs text-slate-500 hover:text-slate-350"
                >
                  Cancel
                </button>
              </div>

              {/* Summary Details */}
              <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-xl text-xs border border-slate-900">
                <p className="font-bold text-slate-200">{editingReport.title}</p>
                <p className="text-slate-450 leading-relaxed italic">"{editingReport.description}"</p>
                <p className="text-slate-500 flex items-center gap-1"><MapPin size={12} /> {editingReport.address}</p>
                
                {editingReport.photo_url && (
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase mb-1">Citizen Uploaded Photo</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editingReport.photo_url} alt="Issue" className="rounded border border-slate-850 max-h-32 w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Status Update selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase mb-2">Complaint Status</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none"
                >
                  <option value="Pending">{t.statusPending}</option>
                  <option value="In Progress">{t.statusInProgress}</option>
                  <option value="Resolved">{t.statusResolved}</option>
                  <option value="Escalated">{t.statusEscalated}</option>
                </select>
              </div>

              {/* Resolution Form - ONLY displays if Resolved is selected */}
              {statusUpdate === 'Resolved' && (
                <div className="space-y-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 animate-fadeIn">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                    <CheckCircle size={14} /> Resolution closure fields
                  </h4>
                  
                  {/* Photo Proof Upload */}
                  <CloudinaryUpload
                    imageUrl={resolutionProof}
                    onUploadSuccess={(url) => setResolutionProof(url)}
                    onClear={() => setResolutionProof('')}
                  />

                  {/* Resolution Notes */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">
                      {t.resolutionNotesLabel}
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none resize-none"
                      placeholder="Explain action taken to resolve this problem."
                    />
                  </div>
                </div>
              )}

              {formError && <p className="text-xs text-rose-500">{formError}</p>}

              {/* Submit update action button */}
              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2"
              >
                {updating ? 'Updating...' : 'Save Updates'}
              </button>

            </form>
          ) : (
            <div className="glass p-6 rounded-2xl text-center space-y-4 text-slate-500 text-xs">
              <Info className="mx-auto text-slate-600" size={24} />
              <p>Select any complaint from the active list to review complaint details, track SLA compliance, update resolution status, and submit closure proof photos.</p>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}

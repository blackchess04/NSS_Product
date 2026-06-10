'use strict';
'use client';

import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import { CloudinaryUpload } from '../components/CloudinaryUpload';
import { MapboxPicker } from '../components/MapboxPicker';
import { reportsStore, Report, getSlaDays } from '../lib/reportsStore';
import { 
  FileText, MapPin, Shield, CheckCircle, Search, Trash2, 
  AlertTriangle, Clock, Info, Check, RefreshCw 
} from 'lucide-react';

export default function CitizenHome() {
  const { t, language } = useLanguage();

  // Report Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Sanitation' | 'Pothole' | 'Encroachment' | 'Safety' | ''>('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string; ward: string } | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  
  // Submit actions
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<Report | null>(null);

  // Tracking State
  const [trackingId, setTrackingId] = useState('');
  const [trackedReport, setTrackedReport] = useState<Report | null>(null);
  const [trackSearchAttempted, setTrackSearchAttempted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleLocationSelect = (lat: number, lng: number, address: string, ward: string) => {
    setLocation({ lat, lng, address, ward });
    if (errors.location) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.location;
        return copy;
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const formErrors: { [key: string]: string } = {};
    if (!title.trim()) formErrors.title = 'Title is required';
    if (!description.trim()) formErrors.description = 'Description is required';
    if (!category) formErrors.category = 'Please select a category';
    if (!location) formErrors.location = 'Please select a location on the map';
    if (!consentGiven) formErrors.consent = 'Consent is required under DPDP Act';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // Scroll to error
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const slaDays = getSlaDays(category);
      const sla_deadline = new Date(Date.now() + slaDays * 24 * 60 * 60 * 1000).toISOString();

      const created = await reportsStore.createReport({
        title,
        description,
        category: category as any,
        latitude: location!.lat,
        longitude: location!.lng,
        address: location!.address,
        ward: location!.ward,
        city: "Nagar City",
        photo_url: photoUrl || undefined,
        sla_deadline,
        is_anonymous: isAnonymous,
        consent_given: consentGiven,
      });

      setSubmissionSuccess(created);
      
      // Reset Form State
      setTitle('');
      setDescription('');
      setCategory('');
      setPhotoUrl('');
      setLocation(null);
      setIsAnonymous(false);
      setConsentGiven(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setTrackSearchAttempted(true);
    setDeletionSuccess(false);
    const report = await reportsStore.getReportByTrackingId(trackingId.trim());
    setTrackedReport(report);
  };

  const handleWithdrawConsent = async () => {
    if (!trackedReport) return;
    
    const confirmMsg = "Under DPDP Act 2023, you can request total deletion of your personal data. Are you sure you want to withdraw consent and delete this report?";

    if (window.confirm(confirmMsg)) {
      setDeleting(true);
      try {
        const success = await reportsStore.deleteReportByTrackingId(trackedReport.tracking_id);
        if (success) {
          setDeletionSuccess(true);
          setTrackedReport(null);
          setTrackingId('');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-12">
      {/* Banner / Welcome */}
      <section className="text-center py-6 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-slate-100 to-emerald-400 bg-clip-text text-transparent">
          {t.reportTitle}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          {t.reportSubtitle}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Report Issue Form */}
        <section className="lg:col-span-8">
          {submissionSuccess ? (
            <div className="glass p-8 rounded-2xl glow-green border-emerald-500/20 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={36} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-emerald-400">{t.successTitle}</h3>
                <p className="text-slate-400 text-sm">{t.saveTrackingIdMsg}</p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-xs mx-auto">
                <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">{t.successTrackingId}</span>
                <span className="text-2xl font-mono font-bold text-orange-400">{submissionSuccess.tracking_id}</span>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>Category: <span className="text-slate-300 font-semibold">{submissionSuccess.category}</span></p>
                <p>Ward: <span className="text-slate-300 font-semibold">{submissionSuccess.ward}</span></p>
                <p>SLA Resolution Target: <span className="text-slate-300 font-semibold">{new Date(submissionSuccess.sla_deadline).toLocaleDateString()}</span></p>
              </div>

              <button
                onClick={() => setSubmissionSuccess(null)}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 font-semibold text-slate-950 rounded-xl transition shadow-md shadow-orange-500/20"
              >
                {t.reportAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="glass p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl relative overflow-hidden">
              
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500"></div>

              <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                <FileText className="text-orange-400" size={22} />
                <h2 className="text-xl font-bold text-slate-100">Complaint Details</h2>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t.issueTitleLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.issueTitlePlaceholder}
                  className="w-full bg-slate-900/80 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-100 transition focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {errors.title && <p className="text-xs text-rose-500 mt-1.5">{errors.title}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t.categoryLabel} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-200 transition focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">{t.selectCategory}</option>
                  <option value="Sanitation">{t.categorySanitation} (SLA: 2 Days)</option>
                  <option value="Pothole">{t.categoryPothole} (SLA: 7 Days)</option>
                  <option value="Encroachment">{t.categoryEncroachment} (SLA: 5 Days)</option>
                  <option value="Safety">{t.categorySafety} (SLA: 1 Day)</option>
                </select>
                {errors.category && <p className="text-xs text-rose-500 mt-1.5">{errors.category}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t.issueDescLabel} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.issueDescPlaceholder}
                  rows={4}
                  className="w-full bg-slate-900/80 border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-100 transition focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
                {errors.description && <p className="text-xs text-rose-500 mt-1.5">{errors.description}</p>}
              </div>

              {/* Mapbox Location Selector */}
              <div>
                <MapboxPicker onLocationSelect={handleLocationSelect} />
                {errors.location && <p className="text-xs text-rose-500 mt-1.5">{errors.location}</p>}
                {location && (
                  <div className="mt-3 flex gap-2 items-start bg-slate-900/70 p-3 rounded-lg border border-slate-800 text-xs">
                    <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-slate-400">
                      <p className="font-semibold text-slate-300">{location.ward}</p>
                      <p className="leading-relaxed">{location.address}</p>
                      <p className="font-mono text-[10px]">Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cloudinary Image Selector */}
              <div>
                <CloudinaryUpload
                  imageUrl={photoUrl}
                  onUploadSuccess={(url) => setPhotoUrl(url)}
                  onClear={() => setPhotoUrl('')}
                />
              </div>

              {/* DPDP Anonymous submission toggle */}
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500 focus:ring-opacity-20 transition"
                  />
                  <span className="text-sm font-semibold text-slate-200">{t.anonymousLabel}</span>
                </label>
                <p className="text-xs text-slate-400 pl-7 leading-relaxed">
                  {t.anonymousHelp}
                </p>
              </div>

              {/* DPDP Act 2023 Consent Agreement */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 space-y-4">
                <div className="flex gap-2.5 items-start">
                  <Shield size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">{t.consentNoticeTitle}</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {t.consentNoticeBody}
                    </p>
                  </div>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-750 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-20 transition shrink-0"
                  />
                  <span className="text-xs font-medium text-slate-300 leading-normal">{t.consentCheckbox}</span>
                </label>
                {errors.consent && <p className="text-xs text-rose-500 mt-1">{errors.consent}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-sm tracking-wide rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-500/15"
              >
                {submitting ? t.submitting : t.submitReport}
              </button>

            </form>
          )}
        </section>

        {/* RIGHT COLUMN: Track Complaint & DPDP Info */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Track Complaint form */}
          <div className="glass p-6 rounded-2xl space-y-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>

            <div className="flex items-center gap-2">
              <Search className="text-orange-400" size={20} />
              <h2 className="text-lg font-bold text-slate-100">{t.trackHeading}</h2>
            </div>

            <form onSubmit={handleTrackComplaint} className="flex gap-2">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder={t.trackPlaceholder}
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-sm font-semibold text-orange-400 border border-orange-500/20 hover:border-orange-500/40 rounded-lg transition"
              >
                {t.trackBtn}
              </button>
            </form>

            {/* Display Tracked Report info */}
            {trackedReport && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4 text-sm animate-fadeIn">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                  <span className="font-mono text-orange-400 font-bold">{trackedReport.tracking_id}</span>
                  
                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                    trackedReport.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    trackedReport.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    trackedReport.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {trackedReport.status === 'Pending' ? t.statusPending :
                     trackedReport.status === 'In Progress' ? t.statusInProgress :
                     trackedReport.status === 'Resolved' ? t.statusResolved : t.statusEscalated}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-400">
                  <p className="font-semibold text-slate-200 text-sm leading-normal">{trackedReport.title}</p>
                  <p className="leading-relaxed italic">"{trackedReport.description}"</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div>
                      <span className="block text-slate-500">CATEGORY</span>
                      <span className="text-slate-300 font-medium">{trackedReport.category}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">WARD</span>
                      <span className="text-slate-300 font-medium">{trackedReport.ward}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">REPORTED ON</span>
                      <span className="text-slate-300 font-medium">{new Date(trackedReport.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">SLA TARGET</span>
                      <span className={`font-medium ${trackedReport.status === 'Escalated' ? 'text-rose-400' : 'text-slate-350'}`}>
                        {new Date(trackedReport.sla_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Show details if resolved */}
                {trackedReport.status === 'Resolved' && (
                  <div className="bg-emerald-950/20 border border-emerald-500/10 p-3 rounded-lg space-y-2 text-xs">
                    <p className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Check size={14} /> Complaint Resolved
                    </p>
                    {trackedReport.resolution_notes && (
                      <p className="text-slate-400 leading-normal">"{trackedReport.resolution_notes}"</p>
                    )}
                    {trackedReport.resolution_proof_url && (
                      <div>
                        <span className="block text-[9px] text-slate-500 mb-1 uppercase">Closure Proof</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={trackedReport.resolution_proof_url} alt="Resolution proof" className="rounded border border-slate-800 max-h-24 w-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {/* SLA Breach indicator */}
                {trackedReport.status === 'Escalated' && (
                  <div className="bg-rose-950/20 border border-rose-500/10 p-3 rounded-lg flex items-start gap-2 text-xs">
                    <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-slate-400 leading-normal">
                      <p className="font-semibold text-rose-400">SLA breached. Escalated to Ward Commissioner.</p>
                      <p>This complaint has exceeded its resolution time window.</p>
                    </div>
                  </div>
                )}

                {/* DPDP Erase Complaint button */}
                <button
                  type="button"
                  onClick={handleWithdrawConsent}
                  disabled={deleting}
                  className="w-full py-2 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 rounded-lg text-xs font-semibold text-rose-400 hover:text-slate-950 transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} />
                  {deleting ? 'Erasing...' : t.requestDataDeletion}
                </button>

              </div>
            )}

            {trackSearchAttempted && !trackedReport && (
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-center space-y-2 animate-fadeIn">
                <AlertTriangle size={24} className="text-amber-500 mx-auto" />
                <p className="text-xs text-slate-400">{t.notFound}</p>
              </div>
            )}

            {deletionSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center text-xs text-emerald-400 animate-fadeIn flex items-center gap-2 justify-center">
                <Check size={14} className="stroke-[3]" />
                <span>{t.dataDeletedSuccess}</span>
              </div>
            )}

          </div>

          {/* Privacy Center Widget */}
          <div className="glass p-6 rounded-2xl space-y-4 shadow-xl border border-slate-800/60 bg-gradient-to-br from-slate-900/50 to-slate-950/30">
            <div className="flex items-center gap-2">
              <Shield className="text-emerald-400" size={20} />
              <h2 className="text-lg font-bold text-slate-100">DPDP Act Privacy Guard</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our service is built under the principles of **Data Minimization** and **Purpose Limitation** compliant with India's DPDP Act 2023.
            </p>
            <div className="space-y-2 text-[11px] text-slate-400">
              <p className="flex items-center gap-2"><Check size={12} className="text-emerald-400" /> Right to consent withdrawal</p>
              <p className="flex items-center gap-2"><Check size={12} className="text-emerald-400" /> Complete data erasure on demand</p>
              <p className="flex items-center gap-2"><Check size={12} className="text-emerald-400" /> 100% PII-free anonymous reports</p>
            </div>
            <a 
              href="/privacy" 
              className="block text-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline pt-2 border-t border-slate-800/80"
            >
              Learn more about your data rights →
            </a>
          </div>

        </aside>

      </div>
    </div>
  );
}

'use strict';
'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../components/LanguageProvider';
import { reportsStore } from '../../lib/reportsStore';
import { Shield, CheckCircle, Info, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';

export default function PrivacyCenter() {
  const { t, language } = useLanguage();
  const [trackingId, setTrackingId] = useState('');
  const [deletionSuccess, setDeletionSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEraseData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setErrorMsg('');
    setDeletionSuccess(false);

    const report = await reportsStore.getReportByTrackingId(trackingId.trim());
    if (!report) {
      setErrorMsg('Complaint tracking ID not found.');
      return;
    }

    const confirmMsg = `Under Section 6 of DPDP Act 2023, you have the right to withdraw consent at any time. Are you sure you want to permanently delete complaint ${trackingId.trim()} and all associated personal data from our database?`;

    if (window.confirm(confirmMsg)) {
      setDeleting(true);
      try {
        const success = await reportsStore.deleteReportByTrackingId(trackingId.trim());
        if (success) {
          setDeletionSuccess(true);
          setTrackingId('');
        } else {
          setErrorMsg('Failed to delete records.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('System error during deletion request.');
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      
      {/* Header */}
      <section className="text-center py-4">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={32} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-slate-100 to-emerald-400 bg-clip-text text-transparent">
          {t.privacyHeading}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t.privacyText}
        </p>
      </section>

      {/* DPDP Act 2023 details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Principles panel */}
        <div className="glass p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-400" />
            {t.privacyPrinciplesTitle}
          </h3>
          <div className="space-y-3.5 text-xs text-slate-450 leading-relaxed">
            <p className="border-l-2 border-emerald-500/30 pl-3">
              <span className="block font-bold text-slate-250">{t.privacyPrinciple1}</span>
            </p>
            <p className="border-l-2 border-emerald-500/30 pl-3">
              <span className="block font-bold text-slate-250">{t.privacyPrinciple2}</span>
            </p>
            <p className="border-l-2 border-emerald-500/30 pl-3">
              <span className="block font-bold text-slate-250">{t.privacyPrinciple3}</span>
            </p>
            <p className="border-l-2 border-emerald-500/30 pl-3">
              <span className="block font-bold text-slate-250">{t.privacyPrinciple4}</span>
            </p>
          </div>
        </div>

        {/* Data processing workflow information */}
        <div className="glass p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Info size={18} className="text-orange-400" />
              Information Flow & Transparency
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you log a complaint, NagarSeva records the details, photo, and coordinates. This data is only accessible to ward administrators in charge of civic works.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              No personally identifiable details (like name, email, or citizen ID) are ever shared on the public performance maps or dashboard. All public statistics are fully anonymized.
            </p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-500 leading-relaxed mt-4">
            The Digital Personal Data Protection Act, 2023 (DPDP Act) was notified by the Ministry of Law and Justice, Government of India on August 11, 2023, establishing a strict framework for digital privacy.
          </div>
        </div>

      </section>

      {/* Erasure form / withdraw consent */}
      <section className="glass p-8 rounded-2xl border border-rose-500/10 glow-orange">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Trash2 className="text-rose-450" size={20} />
            <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wide">Withdraw Consent & Erase Complaint Records</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            If you wish to retract your consent for processing your complaint, enter your complaint **Tracking ID** below. This will completely delete the description, coordinates, and photo of the issue from our active database.
          </p>

          <form onSubmit={handleEraseData} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g., NS-184920"
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-mono focus:outline-none"
            />
            <button
              type="submit"
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-3.5 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Trash2 size={13} />
              {deleting ? 'Erasing Data...' : 'Permanently Delete My Data'}
            </button>
          </form>

          {deletionSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center text-xs text-emerald-400 animate-fadeIn flex items-center gap-2 justify-center">
              <CheckCircle size={14} />
              <span>{t.dataDeletedSuccess}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center text-xs text-rose-400 animate-fadeIn flex items-center gap-2 justify-center">
              <AlertTriangle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

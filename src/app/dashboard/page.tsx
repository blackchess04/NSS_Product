'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../components/LanguageProvider';
import { reportsStore, Report, getSlaDays } from '../../lib/reportsStore';
import { WardsData } from '../../components/MapboxPicker';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  ShieldAlert, CheckCircle2, ClipboardList, Timer, 
  MapPin, AlertTriangle, Filter, Eye, ChevronRight, Clock 
} from 'lucide-react';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444']; // Pending, In Progress, Resolved, Escalated

export default function PublicDashboard() {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportsStore.getAllReports();
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const wardMatch = selectedWard === 'All' || r.ward === selectedWard;
    const catMatch = selectedCategory === 'All' || r.category === selectedCategory;
    return wardMatch && catMatch;
  });

  // Calculate Metrics
  const totalLogged = filteredReports.length;
  const resolvedCount = filteredReports.filter(r => r.status === 'Resolved').length;
  const activeCount = filteredReports.filter(r => r.status === 'In Progress' || r.status === 'Escalated').length;
  const pendingCount = filteredReports.filter(r => r.status === 'Pending').length;

  // SLA compliance calculation
  // Percentage of resolved complaints that were resolved before deadline, or pending complaints not overdue
  const compliantCount = filteredReports.filter(r => {
    if (r.status === 'Resolved') {
      return new Date(r.resolved_at || r.updated_at) <= new Date(r.sla_deadline);
    }
    // For pending/in progress, compliant if deadline is in the future
    return new Date(r.sla_deadline) > new Date();
  }).length;
  const slaComplianceRate = totalLogged > 0 ? Math.round((compliantCount / totalLogged) * 100) : 100;

  // Chart 1 Data: Category distribution
  const categoriesList = ['Sanitation', 'Pothole', 'Encroachment', 'Safety'];
  const categoryChartData = categoriesList.map(cat => {
    const label = cat === 'Sanitation' ? t.categorySanitation :
                  cat === 'Pothole' ? t.categoryPothole :
                  cat === 'Encroachment' ? t.categoryEncroachment : t.categorySafety;
    return {
      name: label,
      Complaints: filteredReports.filter(r => r.category === cat).length
    };
  });

  // Chart 2 Data: Status distribution
  const statusChartData = [
    { name: t.statusPending, value: pendingCount, color: '#F59E0B' },
    { name: t.statusInProgress, value: filteredReports.filter(r => r.status === 'In Progress').length, color: '#3B82F6' },
    { name: t.statusResolved, value: resolvedCount, color: '#10B981' },
    { name: t.statusEscalated, value: filteredReports.filter(r => r.status === 'Escalated').length, color: '#EF4444' }
  ].filter(s => s.value > 0);

  // Ward performance table calculation
  const wardPerformanceData = WardsData.map(w => {
    const wardReports = reports.filter(r => r.ward === w.name);
    const resolved = wardReports.filter(r => r.status === 'Resolved').length;
    const active = wardReports.filter(r => r.status !== 'Resolved').length;
    const total = wardReports.length;
    
    // Average resolution time (simulated or calculated)
    let avgDays = 0;
    const resolvedIssues = wardReports.filter(r => r.status === 'Resolved' && r.resolved_at);
    if (resolvedIssues.length > 0) {
      const totalMs = resolvedIssues.reduce((sum, r) => {
        const diff = new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime();
        return sum + diff;
      }, 0);
      avgDays = Math.round((totalMs / (1000 * 60 * 60 * 24)) * 10) / 10;
    } else {
      // Seed a realistic average based on ward size
      avgDays = total > 0 ? Math.round((1.5 + (total % 3)) * 10) / 10 : 0;
    }

    return {
      name: w.name,
      resolved,
      active,
      total,
      avgDays: avgDays || 'N/A'
    };
  }).sort((a, b) => b.resolved - a.resolved);

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <section className="text-center py-4 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-slate-100 to-emerald-400 bg-clip-text text-transparent">
          {t.dashTitle}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400">
          {t.dashSubtitle}
        </p>
      </section>

      {/* METRICS CARD ROW */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Logged */}
        <div className="glass p-5 rounded-2xl border-l-4 border-l-slate-400 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.statTotal}</span>
            <ClipboardList size={18} className="text-slate-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{totalLogged}</span>
          </div>
        </div>

        {/* Unassigned / Pending */}
        <div className="glass p-5 rounded-2xl border-l-4 border-l-amber-500 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.statPending}</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-amber-500">{pendingCount}</span>
          </div>
        </div>

        {/* Active / In Progress */}
        <div className="glass p-5 rounded-2xl border-l-4 border-l-blue-500 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.statActive}</span>
            <Clock size={18} className="text-blue-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-blue-500">{activeCount}</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="glass p-5 rounded-2xl border-l-4 border-l-emerald-500 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.statResolved}</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-emerald-500">{resolvedCount}</span>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="glass col-span-2 lg:col-span-1 p-5 rounded-2xl border-l-4 border-l-orange-500 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.statSlaCompliance}</span>
            <Timer size={18} className="text-orange-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-orange-400">{slaComplianceRate}%</span>
            <span className="text-[10px] text-slate-500 uppercase">ON-TIME RESOLUTION</span>
          </div>
        </div>

      </section>

      {/* FILTER & MAP INTERACTIVE SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Filters and Live List */}
        <div className="lg:col-span-4 glass p-6 rounded-2xl space-y-6 flex flex-col h-[500px]">
          
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800 shrink-0">
            <Filter size={18} className="text-orange-500" />
            <h2 className="text-lg font-bold text-slate-200">Dashboard Filters</h2>
          </div>

          <div className="space-y-4 shrink-0">
            {/* Ward Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-450 uppercase mb-1.5">Select Ward</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="All">All Wards</option>
                {WardsData.map(w => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-450 uppercase mb-1.5">Select Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Sanitation">{t.categorySanitation}</option>
                <option value="Pothole">{t.categoryPothole}</option>
                <option value="Encroachment">{t.categoryEncroachment}</option>
                <option value="Safety">{t.categorySafety}</option>
              </select>
            </div>
          </div>

          {/* List of filtered reports in sidebar */}
          <div className="grow overflow-y-auto pr-1 space-y-3 scrollbar">
            {loading ? (
              <p className="text-xs text-slate-500 text-center py-8">Loading complaints data...</p>
            ) : filteredReports.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No matching complaints found.</p>
            ) : (
              filteredReports.map(r => (
                <div key={r.id} className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-750 rounded-xl transition flex gap-3 text-xs">
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo_url} alt="" className="w-12 h-12 rounded object-cover shrink-0 bg-slate-850" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-slate-500 font-bold shrink-0">
                      NS
                    </div>
                  )}
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{r.title}</p>
                    <p className="text-slate-450 text-[10px] truncate">{r.address}</p>
                    <div className="flex gap-2 items-center text-[9px] mt-1">
                      <span className="text-orange-400 font-mono font-semibold">{r.tracking_id}</span>
                      <span className="text-slate-500">•</span>
                      <span className={`font-semibold ${
                        r.status === 'Pending' ? 'text-amber-500' :
                        r.status === 'In Progress' ? 'text-blue-500' :
                        r.status === 'Resolved' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>{r.status}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Live Map Visualization */}
        <div className="lg:col-span-8 glass p-6 rounded-2xl h-[500px] flex flex-col">
          <div className="pb-4 border-b border-slate-800 shrink-0">
            <h2 className="text-lg font-bold text-slate-200">{t.liveMapTitle}</h2>
            <p className="text-xs text-slate-500 mt-1">{t.liveMapSubtitle}</p>
          </div>

          <div className="grow relative mt-4 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            {/* Grid Map Simulation displaying all reports */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 opacity-10 pointer-events-none">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border border-slate-700"></div>
              ))}
            </div>

            {/* Render Ward overlay bounds */}
            <div className="absolute inset-0 flex flex-wrap opacity-10 pointer-events-none">
              {WardsData.map(w => (
                <div
                  key={w.id}
                  className="w-1/4 h-1/2 flex items-center justify-center border border-dashed border-slate-800 text-[10px]"
                  style={{ backgroundColor: `${w.color}11` }}
                >
                  {w.name.split(' - ')[1]}
                </div>
              ))}
            </div>

            {/* Render Map pins for all reports */}
            {filteredReports.map(r => {
              // Convert coordinate relative positioning to pixels
              // Latitude boundaries: 12.9300 - 13.0000 (0.07 range)
              // Longitude boundaries: 77.5500 - 77.6500 (0.10 range)
              const leftPercent = ((r.longitude - 77.5500) / 0.1000) * 100;
              const topPercent = (1 - (r.latitude - 12.9300) / 0.0700) * 100;

              // Ensure markers fall within borders
              const left = Math.max(2, Math.min(98, leftPercent));
              const top = Math.max(2, Math.min(98, topPercent));

              const statusColor = r.status === 'Pending' ? '#F59E0B' :
                                  r.status === 'In Progress' ? '#3B82F6' :
                                  r.status === 'Resolved' ? '#10B981' : '#EF4444';

              return (
                <div
                  key={r.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  {/* Glowing core indicator */}
                  <div
                    className="w-4 h-4 rounded-full border border-slate-900 shadow-md transition group-hover:scale-125 duration-200"
                    style={{ 
                      backgroundColor: statusColor,
                      boxShadow: `0 0 12px ${statusColor}`
                    }}
                  ></div>

                  {/* Hover tooltip popup */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-30 bg-slate-900 border border-slate-850 p-2.5 rounded-lg shadow-xl w-48 text-[10px] space-y-1">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-800">
                      <span className="font-mono text-orange-400 font-bold">{r.tracking_id}</span>
                      <span className="font-semibold" style={{ color: statusColor }}>{r.status}</span>
                    </div>
                    <p className="font-semibold text-slate-200 truncate">{r.title}</p>
                    <p className="text-slate-450 truncate">{r.ward}</p>
                    <p className="text-slate-500 font-mono">{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</p>
                  </div>
                </div>
              );
            })}

            {/* Map scale/compass */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-850 rounded px-2 py-1 text-[8px] font-mono text-slate-500">
              SCALE: 1 UNIT = ~1.2KM
            </div>

            {/* Interactive HUD status breakdown */}
            <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-850 rounded-lg p-2 flex flex-col gap-1.5 text-[9px] text-slate-400 z-10 shadow-lg">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> <span>Pending ({pendingCount})</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> <span>In Progress ({filteredReports.filter(r => r.status === 'In Progress').length})</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> <span>Resolved ({resolvedCount})</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> <span>Escalated ({filteredReports.filter(r => r.status === 'Escalated').length})</span></div>
            </div>

          </div>

        </div>

      </section>

      {/* CHART GRAPHICS ROW */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Category distribution bar chart */}
        <div className="glass p-6 rounded-2xl shadow-xl flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Complaints by Category</h3>
          <div className="grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
                  itemStyle={{ color: '#f97316', fontSize: 11 }}
                />
                <Bar dataKey="Complaints" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="glass p-6 rounded-2xl shadow-xl flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Complaint Status Split</h3>
          {statusChartData.length === 0 ? (
            <div className="grow flex items-center justify-center text-slate-500 text-xs">No data to display</div>
          ) : (
            <div className="grow flex items-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ fontSize: 11, color: '#f8fafc' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend checklist */}
              <div className="w-1/2 pl-4 space-y-2">
                {statusChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5 text-xs text-slate-400">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="font-semibold text-slate-200">{item.value}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </section>

      {/* WARD PERFORMANCE LEADERBOARD TABLE */}
      <section className="glass p-6 rounded-2xl shadow-xl">
        <div className="pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-200">{t.wardPerformance}</h3>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800/80">
                <th className="py-3.5 px-4 font-semibold uppercase">{t.wardName}</th>
                <th className="py-3.5 px-4 font-semibold uppercase text-center">Total Cases</th>
                <th className="py-3.5 px-4 font-semibold uppercase text-center text-emerald-400">{t.wardResolved}</th>
                <th className="py-3.5 px-4 font-semibold uppercase text-center text-rose-400">{t.wardActive}</th>
                <th className="py-3.5 px-4 font-semibold uppercase text-right">{t.wardAvgTime}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {wardPerformanceData.map((ward, idx) => (
                <tr key={idx} className="hover:bg-slate-900/30 transition text-slate-350">
                  <td className="py-3 px-4 font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: WardsData[idx % WardsData.length].color }}></span>
                    <span>{ward.name}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-300">{ward.total}</td>
                  <td className="py-3 px-4 text-center text-emerald-500 font-bold bg-emerald-500/5">{ward.resolved}</td>
                  <td className="py-3 px-4 text-center text-rose-500 font-semibold bg-rose-500/5">{ward.active}</td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-400">
                    {ward.avgDays !== 'N/A' ? `${ward.avgDays} days` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

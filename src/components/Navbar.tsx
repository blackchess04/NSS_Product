'use strict';
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { Landmark, Globe, CheckSquare, ShieldCheck, BarChart3 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const isLinkActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const linkClass = (path: string) => {
    const base = "px-4 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center gap-1.5";
    if (isLinkActive(path)) {
      return `${base} bg-orange-500/10 text-orange-400 border border-orange-500/20`;
    }
    return `${base} text-slate-300 hover:text-white hover:bg-slate-800/50`;
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full border-b border-slate-800/80 px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-gradient-to-tr from-orange-500 to-emerald-500 rounded-xl text-slate-950 group-hover:scale-105 transition duration-300">
            <Landmark size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-400 via-slate-100 to-emerald-400 bg-clip-text text-transparent">
              {t.appName}
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium">
              {t.appSlogan}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/" className={linkClass('/')}>
            <CheckSquare size={16} />
            {t.navCitizen}
          </Link>
          <Link href="/dashboard" className={linkClass('/dashboard')}>
            <BarChart3 size={16} />
            {t.navDashboard}
          </Link>
          <Link href="/admin" className={linkClass('/admin')}>
            <ShieldCheck size={16} />
            {t.navAdmin}
          </Link>
          <Link href="/privacy" className={linkClass('/privacy')}>
            <ShieldCheck size={16} />
            {t.navPrivacy}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
        </div>
      </div>
      
      {/* Mobile nav indicator bar */}
      <div className="md:hidden flex justify-around border-t border-slate-800/80 mt-3 pt-3">
        <Link href="/" className={`text-xs ${isLinkActive('/') ? 'text-orange-400' : 'text-slate-400'}`}>
          {t.navCitizen}
        </Link>
        <Link href="/dashboard" className={`text-xs ${isLinkActive('/dashboard') ? 'text-orange-400' : 'text-slate-400'}`}>
          {t.navDashboard}
        </Link>
        <Link href="/admin" className={`text-xs ${isLinkActive('/admin') ? 'text-orange-400' : 'text-slate-400'}`}>
          {t.navAdmin}
        </Link>
        <Link href="/privacy" className={`text-xs ${isLinkActive('/privacy') ? 'text-orange-400' : 'text-slate-400'}`}>
          {t.navPrivacy}
        </Link>
      </div>
    </nav>
  );
};

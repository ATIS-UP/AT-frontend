import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export const Topbar = ({ title, subtitle }: TopbarProps) => {
  return (
    <header className="h-[56px] fixed top-0 right-0 left-[236px] z-40 glass-panel border-b border-white/55 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-brand-primary font-bold text-base font-display flex items-center gap-2">
          {title}
          {subtitle && (
            <>
              <span className="text-slate-400 text-sm font-normal">/</span>
              <span className="text-slate-600 text-sm font-medium">{subtitle}</span>
            </>
          )}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" />
          <input 
            className="w-64 pl-10 pr-4 py-1.5 bg-slate-100/50 border-none rounded-full text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all text-on-surface placeholder:text-slate-400" 
            placeholder="Buscar..." 
            type="text" 
          />
        </div>
        
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-all relative">
            <Bell className="w-[20px] h-[20px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-white"></span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-all">
            <HelpCircle className="w-[20px] h-[20px]" />
          </button>
          <button className="flex items-center gap-2 hover:bg-slate-100 p-1 rounded-full pr-3 transition-all ml-1">
            <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-[10px] font-bold border border-white shadow-sm overflow-hidden">
               <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Admin" />
            </div>
            <span className="font-display text-[11px] font-bold uppercase tracking-wider text-slate-700 hidden sm:block">Admin. General</span>
          </button>
        </div>
      </div>
    </header>
  );
};

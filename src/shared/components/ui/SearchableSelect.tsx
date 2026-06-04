import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({ value, onChange, options, placeholder, disabled, className }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer flex items-center justify-between bg-white disabled:bg-slate-100 disabled:cursor-not-allowed text-left"
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400 truncate'}>
          {value || placeholder || 'Seleccionar...'}
        </span>
        <svg className="w-4 h-4 text-slate-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-0 outline-none text-sm bg-transparent"
              placeholder="Buscar..."
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 text-sm cursor-pointer hover:bg-brand-primary/5 ${
                  opt === value
                    ? 'bg-brand-primary/10 text-brand-primary font-medium'
                    : 'text-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-slate-400 text-center">Sin resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

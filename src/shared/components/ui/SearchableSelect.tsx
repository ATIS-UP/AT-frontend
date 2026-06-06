import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      if (isOutsideContainer && isOutsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recalcPosition = () => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const gap = 4;
    const vh = window.innerHeight;
    const availableBelow = vh - rect.bottom - gap;
    const availableAbove = rect.top - gap;
    const prefersBelow = availableBelow >= availableAbove && availableBelow > 80;
    const maxHeight = Math.min(prefersBelow ? availableBelow : availableAbove, 288);
    let top = prefersBelow ? rect.bottom + gap : rect.top - maxHeight - gap;
    const left = Math.max(gap, Math.min(rect.left, window.innerWidth - rect.width - gap));
    setDropdownStyle({
      position: 'fixed',
      top: `${Math.max(gap, Math.min(top, vh - maxHeight - gap))}px`,
      left: `${left}px`,
      width: `${rect.width}px`,
      maxHeight: `${maxHeight}px`,
      pointerEvents: 'auto',
      zIndex: 10000,
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && buttonRef.current) recalcPosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    recalcPosition();
    const onScroll = () => recalcPosition();
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer flex items-center justify-between bg-white disabled:bg-slate-100 disabled:cursor-not-allowed text-left"
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400 truncate'}>
          {value || placeholder || 'Seleccionar...'}
        </span>
        <svg className="w-4 h-4 text-slate-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && createPortal(
        <div ref={dropdownRef} style={dropdownStyle} onWheel={(e) => e.stopPropagation()} className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm cursor-pointer hover:bg-brand-primary/5 ${
                opt === value
                  ? 'bg-brand-primary/10 text-brand-primary font-medium'
                  : 'text-slate-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

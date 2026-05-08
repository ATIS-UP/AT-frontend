import React from 'react';

export default function ParametrizacionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in">
      <div className="w-20 h-20 bg-brand-primary/5 rounded-sm flex items-center justify-center mb-6">
         <span className="text-4xl text-brand-primary/20">⚙️</span>
      </div>
      <h2 className="font-display text-2xl font-bold text-slate-400">Parametrización</h2>
      <p className="text-slate-400 mt-2 max-w-sm">Configuración de variables del sistema en desarrollo.</p>
    </div>
  );
}
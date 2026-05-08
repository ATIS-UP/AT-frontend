import React from 'react';
import { FileText, Users, Calendar } from 'lucide-react';

export function Encuestas() {
  const encuestas = [
    { id: 1, nombre: 'Satisfacción Estudiantil - Medio Término', tipo: 'ACADEMICA', fechaFin: '2026-05-15', avance: 68, estado: 'ACTIVA' },
    { id: 2, nombre: 'Evaluación Socioeconómica Ingreso', tipo: 'SOCIOECONOMICA', fechaFin: '2026-03-10', avance: 100, estado: 'CERRADA' },
    { id: 3, nombre: 'Percepción Servicios de Bienestar', tipo: 'PSICOSOCIAL', fechaFin: '2026-06-01', avance: 0, estado: 'PROGRAMADA' },
  ];

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between border-b pb-4 border-slate-200">
        <div className="flex gap-6">
          <button className="text-sm font-semibold border-b-2 border-primary text-primary pb-4 -mb-[18px]">Encuestas Activas</button>
          <button className="text-sm font-semibold text-slate-400 hover:text-slate-600 pb-4 -mb-[18px]">Resultados y Tabulaciones</button>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded shadow-sm text-sm font-medium hover:bg-primary-dark transition-colors">
          Nueva Encuesta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {encuestas.map(encuesta => (
          <div key={encuesta.id} className="bg-white border border-slate-200 p-5 shadow-sm rounded flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border ${
                encuesta.estado === 'ACTIVA' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                encuesta.estado === 'CERRADA' ? 'border-slate-200 text-slate-500 bg-slate-50' :
                'border-sky-200 text-sky-700 bg-sky-50'
              }`}>
                {encuesta.estado}
              </span>
              <FileText className="w-4 h-4 text-slate-300" />
            </div>
            
            <h3 className="font-semibold text-slate-800 mb-1 leading-snug">{encuesta.nombre}</h3>
            <p className="text-xs text-slate-500 mb-6">{encuesta.tipo}</p>
            
            <div className="mt-auto">
              <div className="flex justify-between text-xs text-slate-600 mb-2 font-medium">
                <span>Participación</span>
                <span>{encuesta.avance}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 mb-4">
                <div 
                  className={`h-full transition-all ${encuesta.estado === 'CERRADA' ? 'bg-slate-400' : 'bg-primary'}`} 
                  style={{ width: `${encuesta.avance}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Cierra: {encuesta.fechaFin}</div>
                <button className="hover:text-primary underline">Ver detalles</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
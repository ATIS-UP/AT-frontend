import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export function Actividades() {
  const actividades = [
    { id: 1, titulo: 'Taller de Nivelación Álgebra Lineal', tipo: 'TUTORIA', fecha: '2026-05-02', hora: '14:00', lugar: 'Auditorio Principal', estado: 'CREADA' },
    { id: 2, titulo: 'Jornada de Inducción Semestre 2026-1', tipo: 'INDUCCION', fecha: '2026-02-15', hora: '08:00', lugar: 'Teatro', estado: 'CERRADA' },
    { id: 3, titulo: 'Encuentro Deportivo de Facultad', tipo: 'DEPORTE', fecha: '2026-05-20', hora: '09:00', lugar: 'Canchas Múltiples', estado: 'CREADA' }
  ];

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-primary">Actividades Institucionales</h2>
          <p className="text-secondary text-sm">Eventos de bienestar y apoyo académico</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded shadow-sm text-sm font-medium hover:bg-primary-dark transition-colors">
          Nueva Actividad
        </button>
      </div>

      <div className="flex gap-4">
        <input 
          type="text" 
          placeholder="Buscar actividad..." 
          className="flex-1 max-w-sm px-3 py-2 bg-white border border-slate-200 rounded text-sm outline-none focus:border-primary/50 transition-colors"
        />
        <select className="px-3 py-2 bg-white border border-slate-200 rounded text-sm outline-none text-slate-600">
          <option>Todos los tipos</option>
          <option>Tutoría</option>
          <option>Inducción</option>
          <option>Deporte</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-semibold">Actividad</th>
              <th className="px-4 py-3 font-semibold">Programación</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {actividades.map(act => (
              <tr key={act.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-800">{act.titulo}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/> {act.lugar}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-slate-700 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400"/> {act.fecha}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5 text-slate-400"/> {act.hora}</p>
                </td>
                <td className="px-4 py-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                    {act.tipo}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${
                    act.estado === 'CREADA' ? 'border-sky-200 text-sky-700 bg-sky-50' : 'border-slate-200 text-slate-500 bg-slate-50'
                  }`}>
                    {act.estado}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="text-primary hover:underline text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
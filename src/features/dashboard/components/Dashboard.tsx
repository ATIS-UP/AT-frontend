import React from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  FileCheck,
  MoreVertical,
  ChevronRight,
  ClipboardList,
  FileText
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { year: '2018', value: 15 },
  { year: '2019', value: 12 },
  { year: '2020', value: 18 },
  { year: '2021', value: 9 },
  { year: '2022', value: 11 },
  { year: '2026', value: 6 },
];

const needsData = [
  { name: 'Tutorías Matemáticas', value: 342 },
  { name: 'Apoyo Psicológico', value: 215 },
  { name: 'Nivelación Lectura', value: 180 },
  { name: 'Técnicas Estudio', value: 112 },
  { name: 'Orientación Voc.', value: 54 },
];

export const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-card p-5 flex flex-col justify-between h-[120px]">
          <h3 className="text-slate-500 font-display text-[15px] font-semibold">Estudiantes activos</h3>
          <div className="flex items-end justify-between">
            <span className="font-display text-2xl font-bold text-brand-primary tracking-tight">1.065</span>
            <TrendingUp className="text-brand-primary w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel rounded-card p-5 flex flex-col justify-between h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 font-display text-[15px] font-semibold">Encuestas en curso</h3>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex flex-col gap-2">
             <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                  <span>Satisfacción Docente</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-sm overflow-hidden">
                  <div className="bg-brand-primary h-full" style={{ width: '78%' }}></div>
                </div>
             </div>
             <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                  <span>Clima Académico</span>
                  <span>42%</span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-sm overflow-hidden">
                  <div className="bg-brand-secondary h-full" style={{ width: '42%' }}></div>
                </div>
             </div>
          </div>
        </div>

        <div className="glass-panel rounded-card p-5 flex flex-col justify-between h-[120px]">
          <h3 className="text-slate-500 font-display text-[15px] font-semibold">Casos en seguimiento</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900 leading-none">135</span>
              <span className="text-[12px] text-slate-400">Totales</span>
            </div>
            <div className="w-full h-2 rounded-sm overflow-hidden flex shadow-inner">
               <div className="bg-red-500 h-full" style={{ width: '9%' }}></div>
               <div className="bg-amber-400 h-full" style={{ width: '25%' }}></div>
               <div className="bg-blue-300 h-full" style={{ width: '66%' }}></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-medium tracking-tight">
               <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-sm"></span>12 Críticos</span>
               <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-400 rounded-sm"></span>34 Alerta</span>
               <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-300 rounded-sm"></span>89 Normal</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-card p-5 flex flex-col justify-between h-[120px] relative overflow-hidden">
          <h3 className="text-slate-500 font-display text-[15px] font-semibold">Artefactos activos</h3>
          <div className="flex items-end justify-between mt-auto">
             <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-brand-primary">9</span>
                <span className="text-sm text-slate-400">/ 14</span>
             </div>
             <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">64% Completado</span>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-10">
            <FileCheck className="w-20 h-20 text-brand-primary" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-card p-6 h-[340px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-lg font-bold text-slate-900 tracking-tight">Deserción por periodo 2018-2026</h2>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#022448" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#022448" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="value" stroke="#022448" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-card p-6 h-[340px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-lg font-bold text-slate-900 tracking-tight">Necesidades académicas reportadas</h2>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={needsData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#022448" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recents */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          Artefactos Recientes
          <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tight">14 activos</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="glass-panel rounded-lg p-3 hover:translate-y-[-2px] transition-all cursor-pointer border-t-[3px] border-brand-primary">
               <div className="flex justify-between mb-3">
                  <FileText className="w-5 h-5 text-brand-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Activo</span>
               </div>
               <h4 className="text-[12px] font-bold text-slate-800 leading-tight mb-1 line-clamp-1">Plan Acción Tutorías</h4>
               <p className="text-[10px] text-slate-400">Oct 12, 2026</p>
            </div>
          ))}
          {[...Array(7)].map((_, i) => (
            <div key={i+7} className="glass-panel rounded-lg p-3 hover:translate-y-[-2px] transition-all cursor-pointer">
               <div className="flex justify-between mb-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Revisión</span>
               </div>
               <h4 className="text-[12px] font-bold text-slate-800 leading-tight mb-1 line-clamp-1">Reporte Cohorte A</h4>
               <p className="text-[10px] text-slate-400">Oct 10, 2026</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { FileText, Download, Eye, Edit2, FolderArchive, ChevronDown, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Artifact {
  factor: string;
  title: string;
  author: string;
  date: string;
  status: 'completed' | 'review' | 'pending';
  progress: [number, number];
}

const artifacts: Artifact[] = [
  { factor: 'FACTOR 1', title: 'Misión y Proyecto Institucional', author: 'Dr. Carlos Mendoza', date: '12 Oct 2026', status: 'completed', progress: [12, 12] },
  { factor: 'FACTOR 3', title: 'Informe de Retención Estudiantil', author: 'Dra. Elena Gómez', date: 'Hoy, 09:30 AM', status: 'review', progress: [7, 9] },
  { factor: 'FACTOR 4', title: 'Estructura Curricular y Sílabos', author: 'Ing. Marcos Silva', date: 'Pendiente de inicio', status: 'pending', progress: [0, 15] },
  { factor: 'FACTOR 5', title: 'Plan de Desarrollo 2024-2030', author: 'Dra. Martha Lucia', date: '15 Oct 2026', status: 'review', progress: [4, 8] },
  { factor: 'FACTOR 2', title: 'Estatuto Docente Actualizado', author: 'Dr. Julián Andrés', date: '05 Oct 2026', status: 'completed', progress: [10, 10] },
];

const ArtifactCard = ({ artifact }: { artifact: Artifact }) => (
  <div className="glass-panel p-5 rounded-card relative transition-all hover:translate-y-[-4px] overflow-hidden group">
    {/* Sidebar accent indicator */}
    <div className={cn(
      "absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full",
      artifact.status === 'completed' ? 'bg-emerald-500' :
      artifact.status === 'review' ? 'bg-brand-secondary' : 'bg-slate-300'
    )} />

    <div className="flex justify-between items-start mb-4">
      <span className="font-display text-[10px] font-bold text-slate-400 tracking-widest">{artifact.factor}</span>
      <span className={cn(
        "status-pill text-[9px] px-2",
        artifact.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
        artifact.status === 'review' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
      )}>
        {artifact.status === 'completed' ? 'Completado' :
         artifact.status === 'review' ? 'En Revisión' : 'Pendiente'}
      </span>
    </div>

    <h3 className="font-display text-base font-bold text-slate-800 leading-tight mb-4 min-h-[44px]">{artifact.title}</h3>

    <div className="space-y-2 mb-6">
       <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <Eye className="w-3.5 h-3.5 opacity-50" />
          <span>{artifact.author}</span>
       </div>
       <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <FileText className="w-3.5 h-3.5 opacity-50" />
          <span className={cn(artifact.date === 'Pendiente de inicio' ? 'italic opacity-60' : '')}>{artifact.date}</span>
       </div>
    </div>

    <div className="pt-4 border-t border-slate-100/50 flex flex-col gap-3">
       <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-sm overflow-hidden">
             <div 
               className={cn(
                 "h-full rounded-sm transition-all duration-500",
                 artifact.status === 'completed' ? 'bg-emerald-500' :
                 artifact.status === 'review' ? 'bg-brand-secondary' : 'bg-slate-300'
               )} 
               style={{ width: `${(artifact.progress[0] / artifact.progress[1]) * 100}%` }} 
             />
          </div>
          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{artifact.progress[0]} de {artifact.progress[1]} campos</span>
       </div>

       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded transition-all">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded transition-all">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1.5 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary hover:text-white rounded transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
       </div>
    </div>
  </div>
);

export const Artifacts = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-brand-primary tracking-tight">Artefactos</h1>
              <div className="h-4 w-px bg-slate-200" />
              <button className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-sm shadow-sm hover:border-brand-primary transition-all text-xs font-semibold text-slate-600">
                Periodo: 2026-2
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
           </div>
           <p className="text-sm text-slate-500">Gestión y edición de documentos institucionales requeridos para acreditación.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-brand-primary text-brand-primary rounded-btn font-display text-[11px] font-bold uppercase tracking-wider hover:bg-brand-primary/5 transition-all">
           <FolderArchive className="w-4 h-4" />
           Descargar todos (.zip)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artifacts.map((a, i) => <ArtifactCard key={i} artifact={a} />)}
      </div>

      <div className="mt-4 glass-panel rounded-card border-brand-primary/20 overflow-hidden flex flex-col">
         <div className="bg-gradient-to-r from-brand-secondary to-amber-500 h-1" />
         <div className="p-6 flex justify-between items-center bg-white">
            <div className="flex items-center gap-4">
               <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <Edit2 className="w-5 h-5 text-brand-primary" />
               </div>
               <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">Editando: Informe de Retención Estudiantil</h2>
                  <p className="text-xs font-medium text-slate-400">Factor 3 • Última autoguardado hace 2 min</p>
               </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
         </div>
         <div className="flex h-[400px] border-t border-slate-100">
            <div className="w-[240px] bg-slate-50/50 border-r border-slate-100 p-4 space-y-4">
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">Esquema</span>
               {['Introducción', 'Metodología', 'Análisis de Deserción', 'Estrategias'].map((item, i) => (
                 <div key={i} className={cn(
                   "flex items-center gap-2 text-sm p-2 rounded-md transition-all cursor-pointer",
                   i === 2 ? "bg-brand-primary/5 text-brand-primary font-bold border-l-2 border-brand-primary" : "text-slate-500 hover:bg-slate-100"
                 )}>
                   <div className={cn("w-1.5 h-1.5 rounded-sm", i < 2 ? "bg-emerald-500" : i === 2 ? "bg-brand-secondary" : "bg-slate-200")} />
                   {item}
                 </div>
               ))}
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-white topo-bg">
               <h3 className="font-display text-lg font-bold text-slate-800 mb-4 tracking-tight">3.2 Factores de Riesgo Identificados</h3>
               <p className="text-slate-600 text-sm leading-relaxed mb-4">
                 De acuerdo con el análisis cruzado del Sistema de Alertas Tempranas correspondiente al periodo 2026-1, se han consolidado los siguientes factores primarios...
               </p>
               <div className="h-px bg-slate-100 my-6" />
               <p className="text-slate-300 italic text-sm">Redacte aquí el análisis detallado...</p>
            </div>
         </div>
      </div>
    </div>
  );
};

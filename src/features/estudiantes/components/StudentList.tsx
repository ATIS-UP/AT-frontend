import React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  FileUp, 
  ChevronLeft, 
  ChevronRight,
  User,
  HeartPulse,
  Syringe,
  Wallet
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Student {
  id: string;
  name: string;
  semester: number;
  stratum: number;
  origin: string;
  specialCase: 'none' | 'psychology' | 'medical' | 'economic';
  alert: 'stable' | 'warning' | 'critical';
  status: 'enrolled' | 'suspended' | 'withdrawn';
}

const mockStudents: Student[] = [
  { id: '10052341', name: 'María Camila Gómez Restrepo', semester: 4, stratum: 2, origin: 'Pamplona', specialCase: 'none', alert: 'stable', status: 'enrolled' },
  { id: '10052388', name: 'Juan David Silva Rodríguez', semester: 2, stratum: 1, origin: 'Cúcuta', specialCase: 'psychology', alert: 'critical', status: 'enrolled' },
  { id: '10048992', name: 'Andrés Felipe Castro Niño', semester: 5, stratum: 3, origin: 'Bucaramanga', specialCase: 'none', alert: 'critical', status: 'suspended' },
  { id: '10051122', name: 'Valeria Sofía Martínez Cruz', semester: 1, stratum: 2, origin: 'Arauca', specialCase: 'medical', alert: 'warning', status: 'enrolled' },
  { id: '10047551', name: 'Carlos Arturo Mendoza López', semester: 8, stratum: 4, origin: 'Bogotá', specialCase: 'none', alert: 'stable', status: 'enrolled' },
  { id: '10053101', name: 'Daniela Fernanda Rojas', semester: 3, stratum: 1, origin: 'Ocaña', specialCase: 'none', alert: 'warning', status: 'enrolled' },
  { id: '10049883', name: 'Luis Alejandro Torres', semester: 6, stratum: 3, origin: 'Pamplona', specialCase: 'none', alert: 'stable', status: 'enrolled' },
  { id: '10052004', name: 'Laura Valentina Ruiz Pineda', semester: 2, stratum: 2, origin: 'Villa del Rosario', specialCase: 'none', alert: 'stable', status: 'enrolled' },
  { id: '10046555', name: 'Miguel Ángel Vivas', semester: 9, stratum: 1, origin: 'Tibú', specialCase: 'economic', alert: 'warning', status: 'enrolled' },
];

export const StudentList = ({ onSelectStudent }: { onSelectStudent: (student: Student) => void }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-display text-2xl font-bold text-brand-primary">1.065 estudiantes</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-brand-primary text-brand-primary rounded-btn font-display text-[11px] font-bold uppercase tracking-wider hover:bg-brand-primary/5 transition-all">
            <FileUp className="w-4 h-4" />
            Cargar lista
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-btn font-display text-[11px] font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-all shadow-sm">
            <UserPlus className="w-4 h-4" />
            Nuevo estudiante
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
           <input 
             className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2 rounded-lg text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none" 
             placeholder="Filtrar por código o nombre" 
             type="text" 
           />
        </div>
        <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 focus:border-brand-primary outline-none transition-all">
          <option value="">Semestre</option>
          <option value="1">1 al 3</option>
          <option value="2">4 al 6</option>
        </select>
        <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 focus:border-brand-primary outline-none transition-all">
          <option value="">Estrato</option>
          <option value="1">1 y 2</option>
        </select>
        <button className="text-brand-primary font-display text-[11px] font-bold uppercase tracking-wider hover:underline ml-auto">
          Limpiar filtros
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel p-0 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-primary/5 border-b border-slate-100">
                <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest">Código</th>
                <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre</th>
                <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Sem.</th>
                <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Est.</th>
                <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest">Procedencia</th>
                <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">CE</th>
                <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Alerta</th>
                <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-slate-700 font-medium">
              {mockStudents.map((student) => (
                <tr 
                  key={student.id} 
                  onClick={() => onSelectStudent(student)}
                  className={cn(
                    "border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer group",
                    student.alert === 'critical' ? 'bg-red-50/20' : ''
                  )}
                >
                  <td className="py-3 px-6 font-bold text-brand-primary">{student.id}</td>
                  <td className="py-3 px-6 font-semibold">{student.name}</td>
                  <td className="py-3 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-50 text-brand-primary text-xs font-bold">{student.semester}</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className="text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-sm font-bold text-[11px]">{student.stratum}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200/50">{student.origin}</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {student.specialCase === 'psychology' && <HeartPulse className="w-4 h-4 text-purple-500 mx-auto" />}
                    {student.specialCase === 'medical' && <Syringe className="w-4 h-4 text-brand-secondary mx-auto" />}
                    {student.specialCase === 'economic' && <Wallet className="w-4 h-4 text-brand-secondary mx-auto" />}
                    {student.specialCase === 'none' && <span className="text-slate-200">/</span>}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className={cn(
                      "w-2 h-2 rounded-sm mx-auto shadow-sm",
                      student.alert === 'stable' ? 'bg-emerald-500 shadow-emerald-200' :
                      student.alert === 'warning' ? 'bg-amber-400 shadow-amber-200' :
                      'bg-red-500 shadow-red-200'
                    )} />
                  </td>
                  <td className="py-3 px-6">
                    <span className={cn(
                      " inline-block text-[9px]",
                      student.status === 'enrolled' ? 'text-emerald-700 bg-emerald-50' : 
                      student.status === 'suspended' ? 'text-red-700 bg-red-50' : 
                      'text-slate-500 bg-slate-50'
                    )}>
                      {student.status === 'enrolled' ? 'Matriculado' : 
                       student.status === 'suspended' ? 'Suspendido' : 'Retirado'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button className="text-slate-300 hover:text-brand-primary transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
          <span className="text-xs text-slate-500">Mostrando 1 a 9 de 1.065</span>
          <div className="flex items-center gap-1">
             <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
             <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-primary text-white text-xs font-bold">1</button>
             <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 text-xs font-bold transition-colors">2</button>
             <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 text-xs font-bold transition-colors">3</button>
             <span className="px-2 text-slate-300">...</span>
             <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

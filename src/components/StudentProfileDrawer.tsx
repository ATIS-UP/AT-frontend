import React from 'react';
import { X, User, Edit3, Save, AlertTriangle, FileText, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export const StudentProfileDrawer = ({ student, isOpen, onClose }: { student: any, isOpen: boolean, onClose: () => void }) => {
  if (!student) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-primary/20 backdrop-blur-sm z-[60]"
          />
          <motion.aside 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-[480px] bg-brand-background shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <header className="px-6 pt-8 pb-4 border-b border-slate-100 flex items-start gap-4 relative bg-white">
              <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="w-16 h-16 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary text-xl font-display font-bold shrink-0 border border-brand-primary/10 overflow-hidden">
                {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0 pr-10">
                <h1 className="font-display text-2xl font-bold text-slate-900 leading-tight mb-0.5 line-clamp-1">{student.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-400">Cód: {student.id}</span>
                  <span className={cn(
                    "status-pill py-0 px-2 text-[9px] uppercase",
                    student.alert === 'critical' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  )}>
                    {student.alert === 'critical' ? 'Riesgo Alto' : 'Estable'}
                  </span>
                </div>
              </div>
            </header>

            {/* Tabs */}
            <div className="px-6 border-b border-slate-100 flex gap-6 bg-white overflow-hidden">
              <button className="py-4 text-xs font-bold uppercase tracking-widest text-brand-primary border-b-2 border-brand-secondary transition-all">Información personal</button>
              <button className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Historial</button>
              <button className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Alertas</button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 topo-bg">
              {/* Academic Info */}
              <section className="glass-panel p-5 rounded-card space-y-4">
                 <h3 className="font-display text-[15px] font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-primary" />
                    Información Académica
                 </h3>
                 <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {[
                      { label: 'Programa', value: 'Ingeniería de Sistemas' },
                      { label: 'Semestre Actual', value: `${student.semester}to Semestre` },
                      { label: 'Promedio Acumulado', value: '3.2 / 5.0' },
                      { label: 'Créditos Aprobados', value: '64 / 160' }
                    ].map((item, i) => (
                      <div key={i}>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{item.label}</label>
                        <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                      </div>
                    ))}
                 </div>
              </section>

              {/* Socio-demographic */}
              <section className="glass-panel p-5 rounded-card space-y-4">
                 <h3 className="font-display text-[15px] font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-primary" />
                    Perfil Sociodemográfico
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Estrato</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-primary transition-colors">
                        <option>Estrato 1</option>
                        <option selected={student.stratum === 2}>Estrato 2</option>
                        <option>Estrato 3</option>
                        <option>Estrato 4</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Financiación</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-primary transition-colors">
                        <option>ICETEX</option>
                        <option>Recursos Propios</option>
                        <option>Beca Institucional</option>
                      </select>
                    </div>
                 </div>
              </section>

              {/* Active Alarms */}
              {student.alert === 'critical' && (
                <section className="glass-panel p-5 rounded-card border-red-200/50 space-y-4 bg-red-50/30">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-display text-[15px] font-bold">Alerta Principal Activa</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Motivo de Riesgo</label>
                      <div className="bg-white border border-red-100 rounded-md px-3 py-2 text-sm font-semibold text-red-700">
                        Inasistencia recurrente y bajo rendimiento
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Observaciones</label>
                      <textarea 
                        className="w-full bg-white border border-red-100 rounded-md px-3 py-2 text-sm text-slate-700 min-h-[80px] outline-none focus:border-red-400 transition-colors resize-none"
                        defaultValue="El estudiante ha faltado a las últimas 3 sesiones de laboratorio. Se recomienda contacto inmediato."
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <footer className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-btn text-brand-primary border border-brand-primary font-display text-sm font-bold tracking-tight hover:bg-brand-primary/5 transition-all"
              >
                Cancelar
              </button>
              <button className="px-5 py-2.5 rounded-btn bg-brand-primary text-white font-display text-sm font-bold tracking-tight hover:bg-brand-primary/90 transition-all flex items-center gap-2 shadow-md">
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

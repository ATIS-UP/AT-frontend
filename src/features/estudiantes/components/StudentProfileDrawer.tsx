import React from 'react';
import { createPortal } from 'react-dom';
import { X, User, FileText, Mail, Hash, BookOpen, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/components/ui/Badge';

export const StudentProfileDrawer = ({ student, isOpen, onClose }: { student: any; isOpen: boolean; onClose: () => void }) => {
  if (!student) return null;

  const initials = `${(student.nombres || '')[0] || ''}${(student.apellidos || '')[0] || ''}`.toUpperCase();

  const estadoVariant = () => {
    switch (student.estado) {
      case 'ACTIVO': return 'success' as const;
      case 'SUSPENDIDO': return 'error' as const;
      case 'INACTIVO': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  const formatPromedio = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    return val.toFixed(2);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-14 right-0 bottom-0 w-full max-w-[30rem] bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <header className="px-6 pt-8 pb-4 border-b border-slate-100 flex items-start gap-4 relative">
              <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="w-16 h-16 rounded-sm bg-brand-primary/5 flex items-center justify-center text-brand-primary text-xl font-display font-bold shrink-0 border border-brand-primary/10">
                {initials}
              </div>
              <div className="flex-1 min-w-0 pr-10">
                <h1 className="font-display text-2xl font-bold text-slate-900 leading-tight mb-0.5 line-clamp-1">
                  {student.nombres} {student.apellidos}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-400">Doc: {student.documento}</span>
                  <Badge variant={estadoVariant()}>
                    {student.estado}
                  </Badge>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Academic Info */}
              <section className="glass-panel p-5 rounded-card space-y-4">
                <h3 className="font-display text-[0.9375rem] font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  Información Académica
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-slate-400 mb-1">Programa</label>
                    <p className="text-sm font-semibold text-slate-700">{student.programa || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-slate-400 mb-1">Semestre</label>
                    <p className="text-sm font-semibold text-slate-700">{student.semestre ?? '—'}</p>
                  </div>
                  <div>
                    <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-slate-400 mb-1">Estado</label>
                    <p className="text-sm font-semibold text-slate-700">{student.estado || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-slate-400 mb-1">Documento</label>
                    <p className="text-sm font-semibold text-slate-700">{student.documento || '—'}</p>
                  </div>
                </div>
              </section>

              {/* Grades Info */}
              <section className="glass-panel p-5 rounded-card space-y-4">
                <h3 className="font-display text-[0.9375rem] font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-primary" />
                  Rendimiento Académico
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-slate-400 mb-1">Promedio General</label>
                    <p className="text-sm font-semibold text-slate-700">{formatPromedio(student.promedio_general)}</p>
                  </div>
                  <div>
                    <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-slate-400 mb-1">Promedio Acumulado</label>
                    <p className="text-sm font-semibold text-slate-700">{formatPromedio(student.promedio_acumulado)}</p>
                  </div>
                </div>
              </section>

              {/* Contact Info */}
              <section className="glass-panel p-5 rounded-card space-y-4">
                <h3 className="font-display text-[0.9375rem] font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-primary" />
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{student.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{student.telefono || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">Doc: {student.documento || '—'}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className="p-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-btn text-brand-primary border border-brand-primary font-display text-sm font-bold tracking-tight hover:bg-brand-primary/5 transition-all"
              >
                Cerrar
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

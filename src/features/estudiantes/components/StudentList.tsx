import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  UserPlus,
  FileUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useEstudiantes, useCrearEstudiante } from '../hooks/useEstudiantes';
import { Modal } from '@/src/shared/components/ui/Modal';
import { Button } from '@/src/shared/components/ui/Button';
import { CargaMasiva } from './CargaMasiva';
import { useNotificationStore } from '@/src/shared/stores/notification.store';

interface StudentListProps {
  onSelectStudent: (student: any) => void;
}

export const StudentList = ({ onSelectStudent }: StudentListProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [semestre, setSemestre] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCargaModal, setShowCargaModal] = useState(false);
  const limit = 20;

  const { data, isLoading, isError } = useEstudiantes({
    page,
    limit,
    search: search || undefined,
    semestre: semestre ? Number(semestre) : undefined,
  });

  const crearEstudiante = useCrearEstudiante();
  const notify = useNotificationStore.getState().add;

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    codigo: '',
    email: '',
    programa: '',
    semestre: 1,
  });

  const estudiantes = data?.estudiantes ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const clearFilters = () => {
    setSearch('');
    setSemestre('');
    setPage(1);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombres || !form.apellidos || !form.codigo) {
      notify({ type: 'warning', message: 'Complete los campos obligatorios (nombres, apellidos, código)' });
      return;
    }
    crearEstudiante.mutate(form as any, {
      onSuccess: () => {
        setShowCreateModal(false);
        setForm({ nombres: '', apellidos: '', codigo: '', email: '', programa: '', semestre: 1 });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* header actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-display text-2xl font-bold text-brand-primary">
          {total.toLocaleString()} estudiantes
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCargaModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-brand-primary text-brand-primary rounded-btn font-display text-[11px] font-bold uppercase tracking-wider hover:bg-brand-primary/5 transition-all"
          >
            <FileUp className="w-4 h-4" />
            Cargar lista
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-btn font-display text-[11px] font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo estudiante
          </button>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2 rounded-lg text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
            placeholder="Filtrar por código o nombre"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 focus:border-brand-primary outline-none transition-all"
          value={semestre}
          onChange={(e) => {
            setSemestre(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Semestre</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={clearFilters}
          className="text-brand-primary font-display text-[11px] font-bold uppercase tracking-wider hover:underline ml-auto"
        >
          Limpiar filtros
        </button>
      </div>

      {/* table */}
      <div className="glass-panel p-0 rounded-card overflow-hidden">
        {isLoading && (
          <div className="p-12 text-center text-slate-400 text-sm">Cargando estudiantes...</div>
        )}
        {isError && (
          <div className="p-12 text-center text-red-500 text-sm">Error al cargar estudiantes</div>
        )}
        {!isLoading && !isError && estudiantes.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm">No se encontraron estudiantes</div>
        )}
        {!isLoading && !isError && estudiantes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-primary/5 border-b border-slate-100">
                  <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest">Código</th>
                  <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre</th>
                  <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Sem.</th>
                  <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest">Programa</th>
                  <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                  <th className="py-4 px-6 font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-700 font-medium">
                {estudiantes.map((est: any) => (
                  <tr
                    key={est.id}
                    onClick={() => onSelectStudent(est)}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-6 font-bold text-brand-primary">{est.codigo}</td>
                    <td className="py-3 px-6 font-semibold">
                      {est.nombres} {est.apellidos}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-50 text-brand-primary text-xs font-bold">
                        {est.semestre}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200/50">
                        {est.programa}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={cn(
                          'inline-block text-[9px] px-2 py-0.5 rounded uppercase font-bold',
                          est.estado === 'ACTIVO'
                            ? 'text-emerald-700 bg-emerald-50'
                            : est.estado === 'SUSPENDIDO'
                              ? 'text-red-700 bg-red-50'
                              : 'text-slate-500 bg-slate-50',
                        )}
                      >
                        {est.estado}
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
        )}

        {/* pagination */}
        {total > limit && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
            <span className="text-xs text-slate-500">
              Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-primary text-white text-xs font-bold">
                {page}
              </span>
              <span className="text-xs text-slate-400">/ {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* create student modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Nuevo Estudiante"
        description="Registrar un nuevo estudiante en el sistema"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nombres *</label>
              <input
                type="text"
                value={form.nombres}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                placeholder="Nombres"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Apellidos *</label>
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                placeholder="Apellidos"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Código *</label>
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                placeholder="Código estudiantil"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Programa</label>
              <input
                type="text"
                value={form.programa}
                onChange={(e) => setForm({ ...form, programa: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                placeholder="Programa académico"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Semestre</label>
              <select
                value={form.semestre}
                onChange={(e) => setForm({ ...form, semestre: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={crearEstudiante.isPending}>
              Crear Estudiante
            </Button>
          </div>
        </form>
      </Modal>

      {/* bulk upload modal */}
      <Modal
        open={showCargaModal}
        onOpenChange={setShowCargaModal}
        title="Carga Masiva"
        description="Cargar estudiantes desde un archivo CSV o Excel"
        className="max-w-2xl"
      >
        <CargaMasiva onClose={() => setShowCargaModal(false)} />
      </Modal>
    </div>
  );
};

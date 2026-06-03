import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  FileUp,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  AlertTriangle,
  Trash2 as TrashIcon,
  UserX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createCharFilter, CharType } from '@/lib/validation';
import { useEstudiantes, useCrearEstudiante, useActualizarEstudiante, useEliminarEstudiante, useConteoRelaciones, useCambiarEstadoEstudiante } from '../hooks/useEstudiantes';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { CargaMasiva } from './CargaMasiva';
import { useNotificationStore } from '@/shared/stores/notification.store';
import { EMPTY_STUDENT_FORM, validateStudentForm, type StudentForm } from './estudiantes/studentFormUtils';

interface StudentListProps {
  onSelectStudent: (student: any) => void;
}

export const StudentList = ({ onSelectStudent }: StudentListProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [semestre, setSemestre] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCargaModal, setShowCargaModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [actionStudent, setActionStudent] = useState<any>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [showConfirmCreateModal, setShowConfirmCreateModal] = useState(false);
  const [showReactivarModal, setShowReactivarModal] = useState(false);
  const [pendingCreateData, setPendingCreateData] = useState<any>(null);
  const limit = 20;

  const { data, isLoading, isError } = useEstudiantes({
    pagina: page,
    por_pagina: limit,
    buscar: search || undefined,
    semestre: semestre ? Number(semestre) : undefined,
  });

  const crearEstudiante = useCrearEstudiante();
  const actualizarEstudiante = useActualizarEstudiante();
  const eliminarEstudiante = useEliminarEstudiante();
  const cambiarEstado = useCambiarEstadoEstudiante();
  const notify = useNotificationStore.getState().add;

  const [form, setForm] = useState<StudentForm>(EMPTY_STUDENT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const estudiantes = data?.estudiantes ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;
  const isEditing = !!editingStudent;

  const clearFilters = () => {
    setSearch('');
    setSemestre('');
    setPage(1);
  };

  const openCreateModal = () => {
    setForm(EMPTY_STUDENT_FORM);
    setEditingStudent(null);
    setShowCreateModal(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setForm({
      nombres: student.nombres || '',
      apellidos: student.apellidos || '',
      codigo: student.codigo || '',
      email: student.email || '',
      programa: student.programa || '',
      semestre: student.semestre || 1,
      documento: student.documento || '',
      telefono: student.telefono || '',
    });
    setShowCreateModal(true);
  };

  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateStudentForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (isEditing && editingStudent) {
      const payload: Record<string, unknown> = {};
      (Object.keys(form) as (keyof typeof form)[]).forEach((key) => {
        if (form[key] !== editingStudent[key] && form[key] !== '') {
          payload[key] = form[key];
        }
      });
      if (Object.keys(payload).length === 0) {
        notify({ type: 'info', message: 'No hay cambios para guardar' });
        return;
      }
      actualizarEstudiante.mutate(
        { id: editingStudent.id, data: payload },
        {
          onSuccess: () => {
            setShowCreateModal(false);
            setEditingStudent(null);
            setForm(EMPTY_STUDENT_FORM);
          },
        },
      );
    } else {
      setPendingCreateData({ ...form });
      setShowConfirmCreateModal(true);
    }
  };

  const handleConfirmCreate = () => {
    if (!pendingCreateData) return;
    crearEstudiante.mutate(pendingCreateData as any, {
      onSuccess: () => {
        setShowConfirmCreateModal(false);
        setShowCreateModal(false);
        setPendingCreateData(null);
        setForm(EMPTY_STUDENT_FORM);
      },
    });
  };

  const handleReactivar = () => {
    if (!editingStudent) return;
    cambiarEstado.mutate(
      { id: editingStudent.id, estado: 'ACTIVO' },
      {
        onSuccess: () => {
          setShowReactivarModal(false);
          setShowCreateModal(false);
          setEditingStudent(null);
          setForm(EMPTY_STUDENT_FORM);
        },
      },
    );
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
            onClick={openCreateModal}
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
                    <td className="py-3 px-6 text-right relative">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(est); }}
                          className="p-1.5 rounded-lg hover:bg-brand-primary/10 text-slate-400 hover:text-brand-primary transition-colors"
                          title="Editar estudiante"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionStudent(est); setShowOptionsModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Eliminar estudiante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* create/edit student modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={(open) => {
          if (!open) { setEditingStudent(null); setForm(EMPTY_STUDENT_FORM); }
          setShowCreateModal(open);
        }}
        title={isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        description={isEditing ? `Editando: ${editingStudent.nombres} ${editingStudent.apellidos}` : 'Registrar un nuevo estudiante en el sistema'}
      >
        <form onSubmit={handleSubmitStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nombres *</label>
              <input
                type="text"
                value={form.nombres}
                maxLength={100}
                onChange={(e) => { setForm({ ...form, nombres: createCharFilter(CharType.LETTERS)(e.target.value) }); setFormErrors({ ...formErrors, nombres: '' }); }}
                className={cn('w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none transition-all', formErrors.nombres ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary')}
                placeholder="Nombres completos"
              />
              {formErrors.nombres && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.nombres}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Apellidos *</label>
              <input
                type="text"
                value={form.apellidos}
                maxLength={100}
                onChange={(e) => { setForm({ ...form, apellidos: createCharFilter(CharType.LETTERS)(e.target.value) }); setFormErrors({ ...formErrors, apellidos: '' }); }}
                className={cn('w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none transition-all', formErrors.apellidos ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary')}
                placeholder="Apellidos"
              />
              {formErrors.apellidos && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.apellidos}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Código *</label>
              <input
                type="text"
                value={form.codigo}
                maxLength={20}
                onChange={(e) => { setForm({ ...form, codigo: createCharFilter(CharType.DIGITS)(e.target.value) }); setFormErrors({ ...formErrors, codigo: '' }); }}
                className={cn('w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none transition-all', formErrors.codigo ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary')}
                placeholder="Código estudiantil"
                disabled={isEditing}
              />
              {formErrors.codigo && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.codigo}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                maxLength={100}
                onChange={(e) => { setForm({ ...form, email: createCharFilter(CharType.EMAIL)(e.target.value) }); setFormErrors({ ...formErrors, email: '' }); }}
                className={cn('w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none transition-all', formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary')}
                placeholder="correo@ejemplo.com"
              />
              {formErrors.email && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Documento *</label>
              <input
                type="text"
                value={form.documento}
                maxLength={100}
                onChange={(e) => { setForm({ ...form, documento: createCharFilter(CharType.DIGITS)(e.target.value) }); setFormErrors({ ...formErrors, documento: '' }); }}
                className={cn('w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none transition-all', formErrors.documento ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary')}
                placeholder="Número de documento"
              />
              {formErrors.documento && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.documento}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono *</label>
              <input
                type="text"
                value={form.telefono}
                maxLength={100}
                onChange={(e) => { setForm({ ...form, telefono: createCharFilter(CharType.DIGITS)(e.target.value) }); setFormErrors({ ...formErrors, telefono: '' }); }}
                className={cn('w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none transition-all', formErrors.telefono ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary')}
                placeholder="Número de teléfono"
              />
              {formErrors.telefono && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.telefono}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Programa *</label>
              <input
                type="text"
                value={form.programa}
                maxLength={100}
                onChange={(e) => { setForm({ ...form, programa: createCharFilter(CharType.ALPHANUMERIC)(e.target.value) }); setFormErrors({ ...formErrors, programa: '' }); }}
                className={cn('w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none transition-all', formErrors.programa ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary')}
                placeholder="Programa académico"
              />
              {formErrors.programa && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.programa}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Semestre *</label>
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

          {isEditing && editingStudent?.estado === 'INACTIVO' && (
            <div className="border-t border-amber-200 pt-4">
              <button
                type="button"
                onClick={() => setShowReactivarModal(true)}
                className="w-full flex items-center gap-3 p-3 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <UserX className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Reactivar Estudiante</p>
                  <p className="text-xs text-slate-500">Cambia el estado de INACTIVO a ACTIVO</p>
                </div>
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); setEditingStudent(null); setForm(EMPTY_STUDENT_FORM); setFormErrors({}); }}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={crearEstudiante.isPending || actualizarEstudiante.isPending}>
              {isEditing ? 'Guardar Cambios' : 'Crear Estudiante'}
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

      {/* 3-option action modal */}
      <ActionStudentModal
        student={actionStudent}
        open={showOptionsModal}
        onOpenChange={(open) => { if (!open) { setShowOptionsModal(false); setActionStudent(null); } }}
        onEliminarTodo={() => { setShowOptionsModal(false); setShowFinalConfirmModal(true); }}
        onInactivar={() => {
          if (actionStudent) {
            cambiarEstado.mutate({ id: actionStudent.id, estado: 'INACTIVO' }, {
              onSuccess: () => { setShowOptionsModal(false); setActionStudent(null); },
            });
          }
        }}
        isPending={cambiarEstado.isPending}
      />

      {/* final confirmation modal before cascade delete */}
      <Modal
        open={showFinalConfirmModal}
        onOpenChange={(open) => { if (!open) setShowFinalConfirmModal(false); }}
        title="¿Estás completamente seguro?"
        description="Esta acción es irreversible"
        className="max-w-sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">
              Esta acción borrará al estudiante y <strong>todos sus datos asociados</strong> de forma permanente. No se puede deshacer.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowFinalConfirmModal(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (actionStudent) {
                  eliminarEstudiante.mutate(actionStudent.id, {
                    onSuccess: () => { setShowFinalConfirmModal(false); setActionStudent(null); },
                  });
                }
              }}
              isLoading={eliminarEstudiante.isPending}
            >
              Sí, eliminar todo
            </Button>
          </div>
        </div>
      </Modal>

      {/* confirm create student modal */}
      <Modal
        open={showConfirmCreateModal}
        onOpenChange={(open) => { if (!open) { setShowConfirmCreateModal(false); setPendingCreateData(null); } }}
        title="Confirmar registro de estudiante"
        description="Revisa los datos antes de crear. El código no podrá ser modificado después."
        className="max-w-sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Nombres:</span><span className="font-semibold text-slate-800">{pendingCreateData?.nombres}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Apellidos:</span><span className="font-semibold text-slate-800">{pendingCreateData?.apellidos}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Código:</span><span className="font-semibold text-slate-800">{pendingCreateData?.codigo}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Documento:</span><span className="font-semibold text-slate-800">{pendingCreateData?.documento}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Teléfono:</span><span className="font-semibold text-slate-800">{pendingCreateData?.telefono}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="font-semibold text-slate-800">{pendingCreateData?.email || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Programa:</span><span className="font-semibold text-slate-800">{pendingCreateData?.programa}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Semestre:</span><span className="font-semibold text-slate-800">{pendingCreateData?.semestre}</span></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700">
              El código del estudiante no podrá ser modificado después de la creación.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => { setShowConfirmCreateModal(false); setPendingCreateData(null); }}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirmCreate} isLoading={crearEstudiante.isPending}>
              Sí, crear estudiante
            </Button>
          </div>
        </div>
      </Modal>

      {/* confirm reactivar modal */}
      <Modal
        open={showReactivarModal}
        onOpenChange={(open) => { if (!open) setShowReactivarModal(false); }}
        title="Reactivar estudiante"
        description="El estudiante volverá al estado ACTIVO"
        className="max-w-sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">
              El estudiante <strong>{editingStudent?.nombres} {editingStudent?.apellidos}</strong> pasará de <strong>INACTIVO</strong> a <strong>ACTIVO</strong> y podrá tener nuevas alertas, casos especiales, encuestas y artefactos.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowReactivarModal(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleReactivar} isLoading={cambiarEstado.isPending}>
              Sí, reactivar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


// -- Action student modal (3 options) --

interface ActionStudentModalProps {
  student: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEliminarTodo: () => void;
  onInactivar: () => void;
  isPending: boolean;
}

const ActionStudentModal = ({ student, open, onOpenChange, onEliminarTodo, onInactivar, isPending }: ActionStudentModalProps) => {
  const { data: conteo, isLoading: conteoLoading } = useConteoRelaciones(student?.id ?? '');

  if (!student) return null;

  const totalRelaciones = conteo
    ? conteo.alertas + conteo.casos + conteo.inscripciones + conteo.respuestas_encuestas + conteo.artefactos
    : 0;

  return (
    <Modal
      open={open}
      onOpenChange={(val) => {
        if (!val && !isPending) onOpenChange(val);
      }}
      title="Gestión de Estudiante"
      description={`${student.nombres} ${student.apellidos} — Cód: ${student.codigo}`}
      className="max-w-md"
    >
      <div className="space-y-5">
        {/* conteo de relaciones */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          {conteoLoading ? (
            <p className="text-sm text-slate-400">Cargando datos asociados...</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-700 mb-2">Datos asociados:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <span>Alertas: <strong>{conteo?.alertas ?? 0}</strong></span>
                <span>Casos: <strong>{conteo?.casos ?? 0}</strong></span>
                <span>Inscripciones: <strong>{conteo?.inscripciones ?? 0}</strong></span>
                <span>Respuestas: <strong>{conteo?.respuestas_encuestas ?? 0}</strong></span>
                <span className="col-span-2">Artefactos: <strong>{conteo?.artefactos ?? 0}</strong></span>
              </div>
            </>
          )}
        </div>

        <p className="text-sm text-slate-600">
          ¿Qué deseas hacer con este estudiante?
        </p>

        <div className="space-y-3">
          <button
            onClick={onEliminarTodo}
            className="w-full flex items-center gap-3 p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <TrashIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Eliminar Todo</p>
              <p className="text-xs text-slate-500">Borra el estudiante y toda su data asociada en cascada</p>
            </div>
          </button>

          <button
            onClick={onInactivar}
            disabled={isPending}
            className="w-full flex items-center gap-3 p-3 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors text-left group disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <UserX className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Inactivar</p>
              <p className="text-xs text-slate-500">Cambia el estado a INACTIVO, conserva datos históricos</p>
            </div>
          </button>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

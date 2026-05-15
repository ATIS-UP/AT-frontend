import React, { useState } from 'react';
import { useActividadesList, useEliminarActividad } from '../hooks/useActividades';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { Modal } from '@/src/shared/components/ui/Modal';
import { CrearActividadModal } from './CrearActividadModal';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import { Calendar, MapPin, Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { TIPO_OPTIONS, ESTADO_OPTIONS, ESTADO_COLORS, TIPO_COLORS } from '../types/actividades.types';
import type { ActividadInstitucional } from '../types/actividades.types';

export function Actividades() {
  const [pagina, setPagina] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editActividad, setEditActividad] = useState<ActividadInstitucional | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data, isLoading } = useActividadesList({
    pagina,
    por_pagina: 20,
    ...(filtroTipo && { tipo: filtroTipo }),
    ...(filtroEstado && { estado: filtroEstado }),
  });

  const eliminarActividad = useEliminarActividad();
  const notification = useNotificationStore();

  const actividades = data?.actividades ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = Math.ceil(total / 20);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await eliminarActividad.mutateAsync(deleteConfirmId);
      notification.add({ type: 'success', message: 'Actividad eliminada correctamente' });
      setDeleteConfirmId(null);
    } catch {
      notification.add({ type: 'error', message: 'Error al eliminar la actividad' });
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-primary">Actividades Institucionales</h2>
          <p className="text-secondary text-sm">Eventos de bienestar y apoyo académico</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva Actividad
        </Button>
      </div>

      <div className="flex gap-4">
        <select
          value={filtroTipo}
          onChange={(e) => { setFiltroTipo(e.target.value); setPagina(1); }}
          className="px-3 py-2 bg-white border border-slate-200 rounded text-sm outline-none text-slate-600"
        >
          <option value="">Todos los tipos</option>
          {TIPO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }}
          className="px-3 py-2 bg-white border border-slate-200 rounded text-sm outline-none text-slate-600"
        >
          <option value="">Todos los estados</option>
          {ESTADO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {actividades.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No hay actividades registradas</p>
          <p className="text-slate-400 text-sm mt-1">Crea la primera actividad para comenzar</p>
        </Card>
      ) : (
        <>
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">Actividad</th>
                  <th className="px-4 py-3 font-semibold">Programación</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Modalidad</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Creador</th>
                  <th className="px-4 py-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actividades.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{act.descripcion}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {act.lugar_enlace}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {act.encargado}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(act.fecha_inicio)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatTime(act.fecha_inicio)} - {formatTime(act.fecha_fin)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${TIPO_COLORS[act.tipo] || 'border-slate-200 text-slate-600 bg-slate-50'}`}>
                        {TIPO_OPTIONS.find(t => t.value === act.tipo)?.label ?? act.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-600">{act.modalidad}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${ESTADO_COLORS[act.estado] || 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                        {ESTADO_OPTIONS.find(e => e.value === act.estado)?.label ?? act.estado}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-600">{act.creador_nombre}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditActividad(act)}
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(act.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Página {pagina} de {totalPaginas} ({total} actividades)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <CrearActividadModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <CrearActividadModal
        open={!!editActividad}
        onOpenChange={(open) => { if (!open) setEditActividad(null); }}
        actividad={editActividad}
      />

      <Modal
        open={!!deleteConfirmId}
        onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}
        title="Eliminar Actividad"
        description="¿Estás seguro de eliminar esta actividad? Esta acción no se puede deshacer."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={eliminarActividad.isPending}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Se eliminará permanentemente la actividad seleccionada.
        </p>
      </Modal>
    </div>
  );
}

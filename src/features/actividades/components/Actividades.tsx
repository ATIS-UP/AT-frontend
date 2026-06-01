import React, { useState, useMemo } from 'react';
import { useActividadesList, useEliminarActividad } from '../hooks/useActividades';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { Modal } from '@/src/shared/components/ui/Modal';
import { CrearActividadModal } from './CrearActividadModal';
import { DetalleActividadModal } from './DetalleActividadModal';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import {
  Calendar,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Clock,
  FileText,
  Eye,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  TIPO_OPTIONS,
  ESTADO_OPTIONS,
  ESTADO_COLORS,
  TIPO_COLORS,
  TIPO_ACCENT,
} from '../types/actividades.types';
import type { ActividadInstitucional } from '../types/actividades.types';

const ITEMS_PER_PAGE = 20;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export function Actividades() {
  const [pagina, setPagina] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editActividad, setEditActividad] = useState<ActividadInstitucional | null>(null);
  const [detalleActividad, setDetalleActividad] = useState<ActividadInstitucional | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data, isLoading } = useActividadesList({
    pagina,
    por_pagina: ITEMS_PER_PAGE,
    ...(filtroTipo && { tipo: filtroTipo }),
    ...(filtroEstado && { estado: filtroEstado }),
  });

  const eliminarActividad = useEliminarActividad();
  const notification = useNotificationStore();

  const actividades = data?.actividades ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = Math.ceil(total / ITEMS_PER_PAGE);

  const busquedaLower = busqueda.toLowerCase();
  const actividadesFiltradas = useMemo(() => {
    if (!busquedaLower) return actividades;
    return actividades.filter(
      (a) =>
        a.descripcion.toLowerCase().includes(busquedaLower) ||
        a.encargado.toLowerCase().includes(busquedaLower) ||
        a.lugar_enlace.toLowerCase().includes(busquedaLower),
    );
  }, [actividades, busquedaLower]);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await eliminarActividad.mutateAsync(deleteConfirmId);
      notification.add({ type: 'success', message: 'Actividad eliminada correctamente' });
      setDeleteConfirmId(null);
      setDetalleActividad(null);
    } catch {
      notification.add({ type: 'error', message: 'Error al eliminar la actividad' });
    }
  };

  const limpiarFiltros = () => {
    setFiltroTipo('');
    setFiltroEstado('');
    setBusqueda('');
    setPagina(1);
  };

  const hayFiltros = filtroTipo || filtroEstado || busqueda;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-primary">Actividades Institucionales</h2>
          <p className="text-slate-500 text-sm">Eventos de bienestar y apoyo académico</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva Actividad
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="Buscar en descripción, responsable o lugar..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none
                       text-slate-700 placeholder:text-slate-400
                       focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary
                       hover:border-slate-300 transition-colors"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => { setFiltroTipo(e.target.value); setPagina(1); }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none text-slate-600
                     focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary
                     hover:border-slate-300 transition-colors cursor-pointer appearance-none"
        >
          <option value="">Todos los tipos</option>
          {TIPO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none text-slate-600
                     focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary
                     hover:border-slate-300 transition-colors cursor-pointer appearance-none"
        >
          <option value="">Todos los estados</option>
          {ESTADO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Grid de tarjetas */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : actividadesFiltradas.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">
            {hayFiltros ? 'No se encontraron actividades' : 'No hay actividades registradas'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {hayFiltros ? 'Intenta con otros filtros' : 'Crea la primera actividad para comenzar'}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {actividadesFiltradas.map((act) => (
              <div
                key={act.id}
                className={`glass-panel rounded-card flex flex-col min-h-[300px] p-6 border-t-[3px] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group ${
                  TIPO_ACCENT[act.tipo] || 'border-t-slate-300'
                }`}
              >
                {/* Top section */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider shrink-0 ${TIPO_COLORS[act.tipo] || 'border-slate-200 text-slate-600 bg-slate-50'}`}
                  >
                    {TIPO_OPTIONS.find((t) => t.value === act.tipo)?.label ?? act.tipo}
                  </span>
                  <span
                    className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider shrink-0 ${ESTADO_COLORS[act.estado] || 'border-slate-200 text-slate-500 bg-slate-50'}`}
                  >
                    {ESTADO_OPTIONS.find((e) => e.value === act.estado)?.label ?? act.estado}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm font-semibold text-slate-800 leading-relaxed line-clamp-4 mb-3">
                  {act.descripcion}
                </p>

                {/* Meta info */}
                <div className="space-y-1.5 text-sm text-slate-500 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatDate(act.fecha_inicio)}</span>
                    <span className="text-slate-300 mx-0.5">·</span>
                    <span>{formatTime(act.fecha_inicio)}</span>
                    <span className="text-slate-300 mx-0.5">—</span>
                    <span>{formatTime(act.fecha_fin)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{act.lugar_enlace}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{act.encargado}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {act.total_anexos === 0
                        ? 'Sin archivos'
                        : `${act.total_anexos} ${act.total_anexos === 1 ? 'archivo' : 'archivos'}`}
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-auto">
                  <button
                    onClick={() => setDetalleActividad(act)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium
                               text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver más
                  </button>
                  <button
                    onClick={() => setEditActividad(act)}
                    className="p-2 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(act.id)}
                    className="p-2 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Página {pagina} de {totalPaginas} ({total} actividades)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-slate-300">···</span>
                      )}
                      <button
                        onClick={() => setPagina(p)}
                        className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${
                          p === pagina
                            ? 'bg-brand-primary text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      <CrearActividadModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <CrearActividadModal
        open={!!editActividad}
        onOpenChange={(open) => { if (!open) setEditActividad(null); }}
        actividad={editActividad}
      />

      <DetalleActividadModal
        open={!!detalleActividad}
        onOpenChange={(open) => { if (!open) setDetalleActividad(null); }}
        actividad={detalleActividad}
        onEditar={() => {
          setEditActividad(detalleActividad);
          setDetalleActividad(null);
        }}
        onEliminar={() => {
          if (detalleActividad) setDeleteConfirmId(detalleActividad.id);
        }}
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
          Se eliminará permanentemente la actividad seleccionada y todos sus archivos adjuntos.
        </p>
      </Modal>
    </div>
  );
}

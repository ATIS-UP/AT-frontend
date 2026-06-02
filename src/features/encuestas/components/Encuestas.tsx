import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Plus,
  Eye,
  Send,
  Lock,
  Trash2,
  Share2,
  BarChart2,
  Users,
  Pencil,
  RefreshCw,
  X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encuestasService } from '../services/encuestasService';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import { createCharFilter, CharType } from '@/src/lib/validation';
import { Modal } from '@/src/shared/components/ui/Modal';
import { Button } from '@/src/shared/components/ui/Button';
import { Badge } from '@/src/shared/components/ui/Badge';
import { SortableList } from '@/src/shared/components/ui/SortableList';
import { SortableRow, DragHandle } from '@/src/shared/components/ui/SortableItem';
import {
  PREGUNTA_TIPOS,
  PREGUNTA_TIPO_LABELS,
  type Encuesta,
  type PreguntaForm,
  type PreguntaTipo,
} from '@/src/shared/schemas/encuesta.schema';

type TabKey = 'activas' | 'resultados';
type Mode = 'create' | 'edit' | null;

const PREGUNTA_MAX_LENGTH = 500;
const OPCION_MAX_LENGTH = 200;

function generateLocalId(): string {
  return `q_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function toLocalDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDateTimeInput(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function backendPreguntasToForm(preguntas: any[]): PreguntaForm[] {
  if (!Array.isArray(preguntas) || preguntas.length === 0) {
    return [emptyPregunta()];
  }
  return preguntas.map((p: any) => ({
    id: typeof p.id === 'number' ? `b_${p.id}` : generateLocalId(),
    texto: typeof p.texto === 'string' ? p.texto : '',
    tipo: (PREGUNTA_TIPOS as readonly string[]).includes(p.tipo) ? p.tipo : 'texto_libre',
    opciones: Array.isArray(p.opciones) ? p.opciones.map((o: any) => String(o)) : undefined,
    requerida: typeof p.requerida === 'boolean' ? p.requerida : true,
  }));
}

function emptyPregunta(): PreguntaForm {
  return { id: generateLocalId(), texto: '', tipo: 'texto_libre', opciones: undefined, requerida: true };
}

function validatePreguntas(preguntas: PreguntaForm[]): string | null {
  if (preguntas.length === 0) return 'Agregue al menos una pregunta';
  for (let i = 0; i < preguntas.length; i++) {
    const p = preguntas[i];
    if (!p.texto.trim()) return `La pregunta ${i + 1} no puede estar vacía`;
    if (p.tipo === 'opcion_multiple') {
      const opciones = p.opciones ?? [];
      if (opciones.length < 2) return `La pregunta ${i + 1} de opción múltiple requiere al menos 2 opciones`;
      if (opciones.some((o) => !o.trim())) return `La pregunta ${i + 1} tiene opciones vacías`;
    }
  }
  return null;
}

export function Encuestas() {
  const [activeTab, setActiveTab] = useState<TabKey>('activas');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [resultadosEncuestaId, setResultadosEncuestaId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [editingEncuesta, setEditingEncuesta] = useState<Encuesta | null>(null);

  const [form, setForm] = useState<{
    titulo: string;
    descripcion: string;
    preguntas: PreguntaForm[];
    fecha_fin: string;
  }>({ titulo: '', descripcion: '', preguntas: [emptyPregunta()], fecha_fin: '' });

  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['encuestas'],
    queryFn: () => encuestasService.listar(),
  });

  const { data: resultadosData, isLoading: isLoadingResultados } = useQuery({
    queryKey: ['encuesta-resultados', resultadosEncuestaId],
    queryFn: () => encuestasService.resultados(resultadosEncuestaId!),
    enabled: !!resultadosEncuestaId,
  });

  const resetForm = () => {
    setForm({ titulo: '', descripcion: '', preguntas: [emptyPregunta()], fecha_fin: '' });
    setEditingEncuesta(null);
  };

  const openCreate = () => {
    resetForm();
    setMode('create');
  };

  const openEdit = (encuesta: Encuesta) => {
    setForm({
      titulo: encuesta.titulo,
      descripcion: encuesta.descripcion ?? '',
      preguntas: backendPreguntasToForm(encuesta.preguntas),
      fecha_fin: toLocalDateTimeInput(encuesta.fecha_fin),
    });
    setEditingEncuesta(encuesta);
    setMode('edit');
  };

  const closeModal = () => {
    setMode(null);
    setEditingEncuesta(null);
  };

  const addPregunta = () => {
    setForm((prev) => ({ ...prev, preguntas: [...prev.preguntas, emptyPregunta()] }));
  };

  const removePregunta = (id: string) => {
    setForm((prev) => ({
      ...prev,
      preguntas: prev.preguntas.length > 1
        ? prev.preguntas.filter((p) => p.id !== id)
        : prev.preguntas,
    }));
  };

  const updatePregunta = (id: string, patch: Partial<PreguntaForm>) => {
    setForm((prev) => ({
      ...prev,
      preguntas: prev.preguntas.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const setPreguntas = (next: PreguntaForm[]) => {
    setForm((prev) => ({ ...prev, preguntas: next }));
  };

  const addOpcion = (preguntaId: string) => {
    setForm((prev) => ({
      ...prev,
      preguntas: prev.preguntas.map((p) => {
        if (p.id !== preguntaId) return p;
        const opciones = p.opciones ?? [];
        return { ...p, opciones: [...opciones, ''] };
      }),
    }));
  };

  const updateOpcion = (preguntaId: string, index: number, value: string) => {
    const filtered = createCharFilter(CharType.FULL_TEXT)(value).slice(0, OPCION_MAX_LENGTH);
    setForm((prev) => ({
      ...prev,
      preguntas: prev.preguntas.map((p) => {
        if (p.id !== preguntaId) return p;
        const opciones = [...(p.opciones ?? [])];
        opciones[index] = filtered;
        return { ...p, opciones };
      }),
    }));
  };

  const removeOpcion = (preguntaId: string, index: number) => {
    setForm((prev) => ({
      ...prev,
      preguntas: prev.preguntas.map((p) => {
        if (p.id !== preguntaId) return p;
        const opciones = [...(p.opciones ?? [])];
        opciones.splice(index, 1);
        return { ...p, opciones: opciones.length > 0 ? opciones : undefined };
      }),
    }));
  };

  const setOpciones = (preguntaId: string, next: string[]) => {
    setForm((prev) => ({
      ...prev,
      preguntas: prev.preguntas.map((p) =>
        p.id === preguntaId ? { ...p, opciones: next.length > 0 ? next : undefined } : p
      ),
    }));
  };

  const handleChangeTipo = (preguntaId: string, tipo: PreguntaTipo) => {
    setForm((prev) => ({
      ...prev,
      preguntas: prev.preguntas.map((p) => {
        if (p.id !== preguntaId) return p;
        if (tipo === 'opcion_multiple') {
          const opciones = p.opciones && p.opciones.length >= 2 ? p.opciones : ['Opción 1', 'Opción 2'];
          return { ...p, tipo, opciones };
        }
        return { ...p, tipo, opciones: undefined };
      }),
    }));
  };

  const buildPayload = () => {
    const preguntas = form.preguntas.map((p) => {
      const out: Record<string, unknown> = {
        texto: p.texto.trim(),
        tipo: p.tipo,
        requerida: p.requerida,
      };
      if (p.tipo === 'opcion_multiple' && p.opciones) {
        out.opciones = p.opciones.map((o) => o.trim()).filter(Boolean);
      }
      return out;
    });
    return {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || undefined,
      preguntas,
      fecha_fin: fromLocalDateTimeInput(form.fecha_fin),
    };
  };

  const crearMutation = useMutation({
    mutationFn: () => encuestasService.crear(buildPayload() as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      notify({ type: 'success', message: 'Encuesta creada correctamente' });
      closeModal();
    },
    onError: (error: any) => {
      notify({ type: 'error', message: error?.message ?? 'Error al crear la encuesta' });
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: () =>
      encuestasService.actualizar(editingEncuesta!.id, buildPayload() as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      notify({ type: 'success', message: 'Encuesta actualizada' });
      closeModal();
    },
    onError: (error: any) => {
      notify({ type: 'error', message: error?.message ?? 'Error al actualizar la encuesta' });
    },
  });

  const publicarMutation = useMutation({
    mutationFn: (id: string) => encuestasService.publicar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      notify({ type: 'success', message: 'Encuesta publicada' });
    },
    onError: (error: any) => {
      notify({ type: 'error', message: error?.message ?? 'Error al publicar la encuesta' });
    },
  });

  const cerrarMutation = useMutation({
    mutationFn: (id: string) => encuestasService.cerrar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      notify({ type: 'success', message: 'Encuesta cerrada' });
    },
    onError: (error: any) => {
      notify({ type: 'error', message: error?.message ?? 'Error al cerrar la encuesta' });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => encuestasService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      notify({ type: 'success', message: 'Encuesta eliminada' });
      setShowDeleteConfirm(null);
    },
    onError: (error: any) => {
      notify({ type: 'error', message: error?.message ?? 'Error al eliminar la encuesta' });
    },
  });

  const procesarVencimientosMutation = useMutation({
    mutationFn: () => encuestasService.procesarVencimientos(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      if (data.cerradas === 0) {
        notify({ type: 'info', message: 'No hay encuestas vencidas para cerrar' });
      } else {
        notify({
          type: 'success',
          message: `${data.cerradas} encuesta${data.cerradas !== 1 ? 's' : ''} cerrada${data.cerradas !== 1 ? 's' : ''} por vencimiento`,
        });
      }
    },
    onError: (error: any) => {
      notify({ type: 'error', message: error?.message ?? 'Error al verificar estados' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      notify({ type: 'warning', message: 'El título es obligatorio' });
      return;
    }
    const error = validatePreguntas(form.preguntas);
    if (error) {
      notify({ type: 'warning', message: error });
      return;
    }
    if (mode === 'create') crearMutation.mutate();
    else if (mode === 'edit') actualizarMutation.mutate();
  };

  const encuestas: Encuesta[] = data?.encuestas ?? [];
  const activasEncuestas = encuestas.filter(
    (e) => e.estado === 'BORRADOR' || e.estado === 'PUBLICADA'
  );
  const cerradasEncuestas = encuestas.filter((e) => e.estado === 'CERRADA');
  const displayedEncuestas = activeTab === 'activas' ? activasEncuestas : cerradasEncuestas;

  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case 'BORRADOR': return 'outline' as const;
      case 'PUBLICADA': return 'success' as const;
      case 'CERRADA': return 'default' as const;
      default: return 'default' as const;
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'BORRADOR': return 'Borrador';
      case 'PUBLICADA': return 'Publicada';
      case 'CERRADA': return 'Cerrada';
      default: return estado;
    }
  };

  const isSubmitting = crearMutation.isPending || actualizarMutation.isPending;
  const modalTitle = mode === 'edit' ? 'Editar Encuesta' : 'Nueva Encuesta';
  const modalDescription = mode === 'edit'
    ? 'Modifica los datos de la encuesta. Solo se permite editar encuestas en estado BORRADOR.'
    : 'Crea una nueva encuesta para los estudiantes';
  const submitLabel = mode === 'edit' ? 'Guardar cambios' : 'Crear Encuesta';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">Error al cargar las encuestas. Intente nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* tabs and header */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('activas')}
            className={`text-sm font-semibold pb-4 -mb-[18px] transition-colors ${
              activeTab === 'activas'
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Encuestas Activas
          </button>
          <button
            onClick={() => setActiveTab('resultados')}
            className={`text-sm font-semibold pb-4 -mb-[18px] transition-colors ${
              activeTab === 'resultados'
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Resultados y Tabulaciones
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => procesarVencimientosMutation.mutate()}
            isLoading={procesarVencimientosMutation.isPending}
            title="Cerrar encuestas con fecha de cierre ya vencida"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Verificar estados
          </Button>
          <Button onClick={openCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Encuesta
          </Button>
        </div>
      </div>

      {/* empty state */}
      {displayedEncuestas.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
          <FileText className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">
            {activeTab === 'activas'
              ? 'No hay encuestas activas'
              : 'No hay encuestas cerradas con resultados'}
          </p>
        </div>
      )}

      {/* survey cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedEncuestas.map((encuesta) => (
          <div
            key={encuesta.id}
            className="glass-panel border border-slate-200 p-5 rounded-card flex flex-col transition-all hover:translate-y-[-2px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <Badge variant={getEstadoVariant(encuesta.estado)}>
                  {getEstadoLabel(encuesta.estado)}
                </Badge>
                {encuesta.estado === 'PUBLICADA' && encuesta.fecha_fin && (
                  <Badge variant="warning">
                    Cierra: {new Date(encuesta.fecha_fin).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                  </Badge>
                )}
              </div>
              <FileText className="w-4 h-4 text-slate-300" />
            </div>

            <h3 className="font-semibold text-slate-800 mb-1 leading-snug line-clamp-2">
              {encuesta.titulo}
            </h3>
            <p className="text-xs text-slate-500 mb-2">{encuesta.descripcion || '—'}</p>

            {encuesta.periodo && (
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                <Calendar className="w-3.5 h-3.5" />
                <span>Periodo: {encuesta.periodo}</span>
              </div>
            )}

            {encuesta.total_respuestas !== undefined && (
              <p className="text-xs text-slate-500 mb-4">
                {encuesta.total_respuestas} respuesta{encuesta.total_respuestas !== 1 ? 's' : ''}
              </p>
            )}

            {/* actions */}
            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              {encuesta.estado === 'BORRADOR' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(encuesta)}
                    title="Editar encuesta"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => publicarMutation.mutate(encuesta.id)}
                    isLoading={publicarMutation.isPending}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Publicar
                  </Button>
                </>
              )}
              {encuesta.estado === 'PUBLICADA' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/encuestas/${encuesta.id}/responder`;
                      navigator.clipboard.writeText(url).then(() => {
                        notify({ type: 'success', message: 'Enlace copiado al portapapeles' });
                      }).catch(() => {
                        notify({ type: 'warning', message: `Enlace: ${url}` });
                      });
                    }}
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Compartir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cerrarMutation.mutate(encuesta.id)}
                    isLoading={cerrarMutation.isPending}
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Cerrar
                  </Button>
                </>
              )}
              {(encuesta.estado === 'CERRADA' || encuesta.estado === 'PUBLICADA') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResultadosEncuestaId(encuesta.id)}
                >
                  <BarChart2 className="w-3 h-3 mr-1" />
                  Ver resultados
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                onClick={() => setShowDeleteConfirm(encuesta.id)}
                title="Eliminar encuesta"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* create / edit modal */}
      <Modal
        open={mode !== null}
        onOpenChange={(open) => { if (!open) closeModal(); }}
        title={modalTitle}
        description={modalDescription}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: createCharFilter(CharType.ALPHANUMERIC)(e.target.value) })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              placeholder="Título de la encuesta"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: createCharFilter(CharType.FULL_TEXT)(e.target.value) })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[60px] resize-none"
              placeholder="Descripción breve de la encuesta"
            />
          </div>

          {/* fecha de cierre opcional */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Cerrar automáticamente el
              <span className="ml-1 text-[10px] text-slate-400 font-normal">(opcional)</span>
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="datetime-local"
                value={form.fecha_fin}
                onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              />
              {form.fecha_fin && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, fecha_fin: '' })}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Quitar fecha de cierre"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Si defines una fecha, la encuesta se cerrará automáticamente al llegar a esa fecha (botón "Verificar estados").
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Preguntas *</label>
            <p className="text-[10px] text-slate-400 mb-2">
              Arrastra el handle <span className="font-mono">⋮⋮</span> para reordenar.
            </p>
            <SortableList
              items={form.preguntas}
              onReorder={setPreguntas}
              getItemId={(p) => p.id}
              className="space-y-2"
              renderItem={(pregunta, index) => (
                <SortableRow
                  key={pregunta.id}
                  id={pregunta.id}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  {({ listeners, setHandleRef, isDragging }) => (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <DragHandle
                          listeners={listeners}
                          handleRef={setHandleRef}
                          className="mt-2"
                        />
                        <span className="text-xs text-slate-400 font-mono mt-2.5 min-w-[20px]">{index + 1}.</span>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={pregunta.texto}
                            maxLength={PREGUNTA_MAX_LENGTH}
                            onChange={(e) => updatePregunta(pregunta.id, { texto: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                            placeholder={`Escriba la pregunta ${index + 1}`}
                          />
                          <div className="flex justify-end mt-0.5">
                            <span className="text-[10px] text-slate-400">
                              {pregunta.texto.length}/{PREGUNTA_MAX_LENGTH}
                            </span>
                          </div>
                        </div>
                        <select
                          value={pregunta.tipo}
                          onChange={(e) => handleChangeTipo(pregunta.id, e.target.value as PreguntaTipo)}
                          className="mt-1 text-xs border border-slate-200 rounded px-2 py-1.5 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                          title="Tipo de pregunta"
                        >
                          {PREGUNTA_TIPOS.map((t) => (
                            <option key={t} value={t}>
                              {PREGUNTA_TIPO_LABELS[t]}
                            </option>
                          ))}
                        </select>
                        {form.preguntas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePregunta(pregunta.id)}
                            disabled={isDragging}
                            className="mt-2 text-red-400 hover:text-red-600 transition-colors text-xs font-bold disabled:opacity-30"
                            title="Eliminar pregunta"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {pregunta.tipo === 'opcion_multiple' && (
                        <OpcionesEditor
                          preguntaId={pregunta.id}
                          opciones={pregunta.opciones ?? []}
                          onAdd={() => addOpcion(pregunta.id)}
                          onUpdate={(idx, val) => updateOpcion(pregunta.id, idx, val)}
                          onRemove={(idx) => removeOpcion(pregunta.id, idx)}
                          onReorder={(next) => setOpciones(pregunta.id, next)}
                        />
                      )}
                    </div>
                  )}
                </SortableRow>
              )}
            />
            <button
              type="button"
              onClick={addPregunta}
              className="mt-2 text-xs text-brand-primary hover:text-brand-primary/80 font-semibold transition-colors"
            >
              + Añadir pregunta
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </Modal>

      {/* delete confirmation */}
      <Modal
        open={!!showDeleteConfirm}
        onOpenChange={() => setShowDeleteConfirm(null)}
        title="Eliminar encuesta"
        description="¿Está seguro de que desea eliminar esta encuesta? Esta acción no se puede deshacer."
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            isLoading={eliminarMutation.isPending}
            onClick={() => showDeleteConfirm && eliminarMutation.mutate(showDeleteConfirm)}
          >
            Eliminar
          </Button>
        </div>
      </Modal>

      {/* resultados modal */}
      <Modal
        open={!!resultadosEncuestaId}
        onOpenChange={(open) => { if (!open) setResultadosEncuestaId(null); }}
        title={(resultadosData as any)?.titulo ?? 'Resultados de la encuesta'}
        description={`${(resultadosData as any)?.total_respuestas ?? 0} respuesta(s) recibidas`}
        className="max-w-2xl"
      >
        {isLoadingResultados ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
          </div>
        ) : resultadosData ? (
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
            {((resultadosData as any).resultados_por_pregunta?.length ?? 0) === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">No hay respuestas registradas aún.</p>
            )}
            {((resultadosData as any).resultados_por_pregunta ?? []).map((r: any, idx: number) => (
              <div key={r.pregunta_id ?? idx} className="rounded-lg border border-slate-100 bg-slate-50/40 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    <span className="text-slate-400 font-mono mr-1">{idx + 1}.</span>
                    {r.texto}
                  </p>
                  <div className="flex items-center gap-1 shrink-0 text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-2.5 py-0.5">
                    <Users className="w-3 h-3" />
                    {r.total_respuestas}
                  </div>
                </div>

                {r.tipo === 'texto_libre' && r.respuestas_texto?.length > 0 && (
                  <ul className="space-y-1.5">
                    {r.respuestas_texto.map((txt: string, i: number) => (
                      <li key={i} className="text-xs text-slate-600 bg-white border border-slate-200 rounded px-3 py-1.5 italic">
                        "{txt}"
                      </li>
                    ))}
                  </ul>
                )}

                {r.distribucion && Object.keys(r.distribucion).length > 0 && (
                  <div className="space-y-1.5">
                    {Object.entries(r.distribucion as Record<string, number>).map(([opcion, count]) => {
                      const pct = r.total_respuestas > 0 ? Math.round((count / r.total_respuestas) * 100) : 0;
                      return (
                        <div key={opcion} className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 w-24 shrink-0 truncate">{opcion}</span>
                          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-brand-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-14 text-right shrink-0">
                            {count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {r.tipo === 'escala_likert' && r.promedio != null && (
                  <p className="text-xs text-slate-500">
                    Promedio: <span className="font-bold text-brand-primary">{Number(r.promedio).toFixed(2)}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => setResultadosEncuestaId(null)}>Cerrar</Button>
        </div>
      </Modal>
    </div>
  );
}

interface OpcionesEditorProps {
  preguntaId: string;
  opciones: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onReorder: (next: string[]) => void;
}

function OpcionesEditor({
  preguntaId,
  opciones,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}: OpcionesEditorProps) {
  return (
    <div className="ml-8 pl-3 border-l-2 border-slate-100 space-y-1.5">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Opciones</p>
      <SortableList
        items={opciones}
        onReorder={onReorder}
        getItemId={(_o, i) => `op_${preguntaId}_${i}`}
        className="space-y-1.5"
        renderItem={(opcion, idx) => (
          <SortableRow
            key={`op_${preguntaId}_${idx}`}
            id={`op_${preguntaId}_${idx}`}
          >
            {({ listeners, setHandleRef }) => (
              <div className="flex items-center gap-1.5">
                <DragHandle
                  listeners={listeners}
                  handleRef={setHandleRef}
                  className="w-5 h-5"
                />
                <input
                  type="text"
                  value={opcion}
                  maxLength={OPCION_MAX_LENGTH}
                  onChange={(e) => onUpdate(idx, e.target.value)}
                  className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  placeholder={`Opción ${idx + 1}`}
                />
                {opciones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="text-red-400 hover:text-red-600 transition-colors text-xs"
                    title="Eliminar opción"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </SortableRow>
        )}
      />
      <button
        type="button"
        onClick={onAdd}
        className="text-[10px] text-brand-primary hover:text-brand-primary/80 font-semibold transition-colors"
      >
        + Añadir opción
      </button>
    </div>
  );
}

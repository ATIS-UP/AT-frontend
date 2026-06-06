import React, { useState } from 'react';
import {
  FileText, Calendar, Plus, Eye, Send, Lock, Trash2, Share2, BarChart2, Users,
  Pencil, RefreshCw, X, Copy, Download, Database,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encuestasService } from '../services/encuestasService';
import { useNotificationStore } from '@/shared/stores/notification.store';
import { createCharFilter, CharType } from '@/lib/validation';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { SortableList } from '@/shared/components/ui/SortableList';
import { SortableRow, DragHandle } from '@/shared/components/ui/SortableItem';
import {
  PREGUNTA_TIPOS, PREGUNTA_TIPO_LABELS,
  type Encuesta, type PreguntaForm, type PreguntaTipo,
} from '@/shared/schemas/encuesta.schema';
import { downloadCsv, slugify } from '../utils/csv';
import { resultadosToCsv } from '../utils/resultadosToCsv';
import { EncuestaCard } from './encuesta/EncuestaCard';
import { ResultadosModal } from './encuesta/ResultadosModal';
import { OpcionesEditor } from './encuesta/OpcionesEditor';
import {
  PREGUNTA_MAX_LENGTH, generateLocalId, toLocalDateTimeInput, fromLocalDateTimeInput,
  backendPreguntasToForm, emptyPregunta, validatePreguntas,
} from './encuesta/encuestaUtils';

type TabKey = 'activas' | 'resultados';
type Mode = 'create' | 'edit' | null;

export function Encuestas() {
  const [activeTab, setActiveTab] = useState<TabKey>('activas');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [resultadosEncuestaId, setResultadosEncuestaId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [editingEncuesta, setEditingEncuesta] = useState<Encuesta | null>(null);

  const [form, setForm] = useState<{
    titulo: string; descripcion: string; preguntas: PreguntaForm[]; fecha_fin: string;
  }>({ titulo: '', descripcion: '', preguntas: [emptyPregunta()], fecha_fin: '' });

  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['encuestas'],
    queryFn: () => encuestasService.listar(),
    refetchInterval: 30000,
  });

  const { data: resultadosData, isLoading: isLoadingResultados } = useQuery({
    queryKey: ['encuesta-resultados', resultadosEncuestaId],
    queryFn: () => encuestasService.resultados(resultadosEncuestaId!),
    enabled: !!resultadosEncuestaId,
    refetchInterval: resultadosEncuestaId ? 30000 : undefined,
  });

  const resetForm = () => {
    setForm({ titulo: '', descripcion: '', preguntas: [emptyPregunta()], fecha_fin: '' });
    setEditingEncuesta(null);
  };

  const openCreate = () => { resetForm(); setMode('create'); };

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

  const closeModal = () => { setMode(null); setEditingEncuesta(null); };

  const addPregunta = () => setForm((prev) => ({ ...prev, preguntas: [...prev.preguntas, emptyPregunta()] }));
  const removePregunta = (id: string) => setForm((prev) => ({
    ...prev,
    preguntas: prev.preguntas.length > 1 ? prev.preguntas.filter((p) => p.id !== id) : prev.preguntas,
  }));
  const updatePregunta = (id: string, patch: Partial<PreguntaForm>) => setForm((prev) => ({
    ...prev,
    preguntas: prev.preguntas.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }));
  const setPreguntas = (next: PreguntaForm[]) => setForm((prev) => ({ ...prev, preguntas: next }));

  const addOpcion = (preguntaId: string) => setForm((prev) => ({
    ...prev,
    preguntas: prev.preguntas.map((p) => (p.id !== preguntaId ? p : { ...p, opciones: [...(p.opciones ?? []), ''] })),
  }));
  const updateOpcion = (preguntaId: string, index: number, value: string) => {
    const filtered = createCharFilter(CharType.FULL_TEXT)(value).slice(0, 200);
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
  const removeOpcion = (preguntaId: string, index: number) => setForm((prev) => ({
    ...prev,
    preguntas: prev.preguntas.map((p) => {
      if (p.id !== preguntaId) return p;
      const opciones = [...(p.opciones ?? [])];
      opciones.splice(index, 1);
      return { ...p, opciones: opciones.length > 0 ? opciones : undefined };
    }),
  }));
  const setOpciones = (preguntaId: string, next: string[]) => setForm((prev) => ({
    ...prev,
    preguntas: prev.preguntas.map((p) => (p.id === preguntaId ? { ...p, opciones: next.length > 0 ? next : undefined } : p)),
  }));

  const handleChangeTipo = (preguntaId: string, tipo: PreguntaTipo) => setForm((prev) => ({
    ...prev,
    preguntas: prev.preguntas.map((p) => {
      if (p.id !== preguntaId) return p;
      if (tipo === 'opcion_multiple' || tipo === 'opcion_multiple_multi') {
        const opciones = p.opciones && p.opciones.length >= 2 ? p.opciones : ['Opción 1', 'Opción 2'];
        return { ...p, tipo, opciones };
      }
      return { ...p, tipo, opciones: undefined };
    }),
  }));

  const buildPayload = () => {
    const preguntas = form.preguntas.map((p) => {
      const out: Record<string, unknown> = { texto: p.texto.trim(), tipo: p.tipo, requerida: p.requerida };
      if ((p.tipo === 'opcion_multiple' || p.tipo === 'opcion_multiple_multi') && p.opciones) out.opciones = p.opciones.map((o) => o.trim()).filter(Boolean);
      if (p.campo) out.campo = p.campo;
      if (p.editable !== undefined) out.editable = p.editable;
      return out;
    });
    return { titulo: form.titulo.trim(), descripcion: form.descripcion.trim() || undefined, preguntas, fecha_fin: fromLocalDateTimeInput(form.fecha_fin) };
  };

  const crearMutation = useMutation({
    mutationFn: () => encuestasService.crear(buildPayload() as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['encuestas'] }); notify({ type: 'success', message: 'Encuesta creada correctamente' }); closeModal(); },
    onError: (error: any) => { notify({ type: 'error', message: error?.message ?? 'Error al crear la encuesta' }); },
  });
  const actualizarMutation = useMutation({
    mutationFn: () => encuestasService.actualizar(editingEncuesta!.id, buildPayload() as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['encuestas'] }); notify({ type: 'success', message: 'Encuesta actualizada' }); closeModal(); },
    onError: (error: any) => { notify({ type: 'error', message: error?.message ?? 'Error al actualizar la encuesta' }); },
  });
  const publicarMutation = useMutation({
    mutationFn: (id: string) => encuestasService.publicar(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['encuestas'] }); notify({ type: 'success', message: 'Encuesta publicada' }); },
    onError: (error: any) => { notify({ type: 'error', message: error?.message ?? 'Error al publicar la encuesta' }); },
  });
  const cerrarMutation = useMutation({
    mutationFn: (id: string) => encuestasService.cerrar(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['encuestas'] }); notify({ type: 'success', message: 'Encuesta cerrada' }); },
    onError: (error: any) => { notify({ type: 'error', message: error?.message ?? 'Error al cerrar la encuesta' }); },
  });
  const eliminarMutation = useMutation({
    mutationFn: (id: string) => encuestasService.eliminar(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['encuestas'] }); notify({ type: 'success', message: 'Encuesta eliminada' }); setShowDeleteConfirm(null); },
    onError: (error: any) => { notify({ type: 'error', message: error?.message ?? 'Error al eliminar la encuesta' }); },
  });
  const procesarVencimientosMutation = useMutation({
    mutationFn: () => encuestasService.procesarVencimientos(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      if (data.cerradas === 0) notify({ type: 'info', message: 'No hay encuestas vencidas para cerrar' });
      else notify({ type: 'success', message: `${data.cerradas} encuesta${data.cerradas !== 1 ? 's' : ''} cerrada${data.cerradas !== 1 ? 's' : ''} por vencimiento` });
    },
    onError: (error: any) => { notify({ type: 'error', message: error?.message ?? 'Error al verificar estados' }); },
  });
  const duplicarMutation = useMutation({
    mutationFn: (id: string) => encuestasService.duplicar(id),
    onSuccess: (nueva) => { queryClient.invalidateQueries({ queryKey: ['encuestas'] }); notify({ type: 'success', message: 'Encuesta duplicada como borrador' }); openEdit(nueva); },
    onError: (error: any) => { notify({ type: 'error', message: error?.message ?? 'Error al duplicar la encuesta' }); },
  });
  const plantillaDatosMutation = useMutation({
    mutationFn: () => encuestasService.plantillaDatos(),
    onSuccess: (nueva) => { queryClient.invalidateQueries({ queryKey: ['encuestas'] }); notify({ type: 'success', message: 'Plantilla de datos creada. Revísala y publícala.' }); openEdit(nueva); },
    onError: (error: any) => { notify({ type: 'error', message: error?.message ?? 'Error al crear la plantilla' }); },
  });

  const handleExportarCsv = () => {
    if (!resultadosData) return;
    const csv = resultadosToCsv(resultadosData as any);
    const fecha = new Date().toISOString().slice(0, 10);
    const slug = slugify((resultadosData as any).titulo || 'encuesta');
    downloadCsv(`resultados-${slug}-${fecha}.csv`, csv);
    notify({ type: 'success', message: 'CSV exportado' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) { notify({ type: 'warning', message: 'El título es obligatorio' }); return; }
    const error = validatePreguntas(form.preguntas);
    if (error) { notify({ type: 'warning', message: error }); return; }
    if (mode === 'create') crearMutation.mutate();
    else if (mode === 'edit') actualizarMutation.mutate();
  };

  const handleShare = (encuesta: Encuesta) => {
    const url = `${window.location.origin}/encuestas/${encuesta.id}/responder`;
    navigator.clipboard.writeText(url).then(
      () => notify({ type: 'success', message: 'Enlace copiado al portapapeles' }),
      () => notify({ type: 'warning', message: `Enlace: ${url}` })
    );
  };

  const encuestas: Encuesta[] = data?.encuestas ?? [];
  const activasEncuestas = encuestas.filter((e) => e.estado === 'BORRADOR' || e.estado === 'PUBLICADA');
  const cerradasEncuestas = encuestas.filter((e) => e.estado === 'CERRADA');
  const displayedEncuestas = activeTab === 'activas' ? activasEncuestas : cerradasEncuestas;

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
      <div className="flex items-center justify-between border-b pb-4 border-slate-200">
        <div className="flex gap-6">
          <button onClick={() => setActiveTab('activas')} className={`text-sm font-semibold pb-4 -mb-[18px] transition-colors ${activeTab === 'activas' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-400 hover:text-slate-600'}`}>
            Encuestas Activas
          </button>
          <button onClick={() => setActiveTab('resultados')} className={`text-sm font-semibold pb-4 -mb-[18px] transition-colors ${activeTab === 'resultados' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-400 hover:text-slate-600'}`}>
            Resultados y Tabulaciones
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => procesarVencimientosMutation.mutate()} isLoading={procesarVencimientosMutation.isPending} title="Cerrar encuestas con fecha de cierre ya vencida">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Verificar estados
          </Button>
          <Button variant="outline" size="sm" onClick={() => plantillaDatosMutation.mutate()} isLoading={plantillaDatosMutation.isPending} title="Crear encuesta de actualización de datos estudiantiles">
            <Database className="w-3.5 h-3.5 mr-1.5" /> Plantilla datos
          </Button>
          <Button onClick={openCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Nueva Encuesta
          </Button>
        </div>
      </div>

      {displayedEncuestas.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
          <FileText className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">{activeTab === 'activas' ? 'No hay encuestas activas' : 'No hay encuestas cerradas con resultados'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedEncuestas.map((encuesta) => (
          <EncuestaCard
            key={encuesta.id}
            encuesta={encuesta}
            onEdit={openEdit}
            onPublicar={(id) => publicarMutation.mutate(id)}
            onCerrar={(id) => cerrarMutation.mutate(id)}
            onDelete={(id) => setShowDeleteConfirm(id)}
            onShare={handleShare}
            onVerResultados={(id) => setResultadosEncuestaId(id)}
            onDuplicar={(id) => duplicarMutation.mutate(id)}
            isPublicando={publicarMutation.isPending}
            isCerrando={cerrarMutation.isPending}
            isDuplicando={duplicarMutation.isPending}
          />
        ))}
      </div>

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
            <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: createCharFilter(CharType.ALPHANUMERIC)(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none" placeholder="Título de la encuesta" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: createCharFilter(CharType.FULL_TEXT)(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[3.75rem] resize-none" placeholder="Descripción breve de la encuesta" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Cerrar automáticamente el
              <span className="ml-1 text-[0.625rem] text-slate-400 font-normal">(opcional)</span>
            </label>
            <div className="flex gap-2 items-center">
              <input type="datetime-local" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none" />
              {form.fecha_fin && (
                <button type="button" onClick={() => setForm({ ...form, fecha_fin: '' })} className="text-slate-400 hover:text-slate-600 p-2" title="Quitar fecha de cierre">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[0.625rem] text-slate-400 mt-1">Si defines una fecha, la encuesta se cerrará automáticamente al llegar a esa fecha (botón "Verificar estados").</p>
            {form.fecha_fin && mode === null && (
              <p className="text-[0.625rem] text-red-500 mt-1">La fecha de cierre debe ser posterior a la fecha de creación</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Preguntas *</label>
            <p className="text-[0.625rem] text-slate-400 mb-2">Arrastra el handle <span className="font-mono">⋮⋮</span> para reordenar.</p>
            <SortableList
              items={form.preguntas}
              onReorder={setPreguntas}
              getItemId={(p) => p.id}
              className="space-y-2"
              renderItem={(pregunta, index) => (
                <SortableRow key={pregunta.id} id={pregunta.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  {({ listeners, setHandleRef, isDragging }) => (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <DragHandle listeners={listeners} handleRef={setHandleRef} className="mt-2" />
                        <span className="text-xs text-slate-400 font-mono mt-2.5 min-w-[20px]">{index + 1}.</span>
                        <div className="flex-1">
                          <input type="text" value={pregunta.texto} maxLength={PREGUNTA_MAX_LENGTH} onChange={(e) => updatePregunta(pregunta.id, { texto: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none" placeholder={`Escriba la pregunta ${index + 1}`} />
                          <div className="flex justify-end mt-0.5"><span className="text-[0.625rem] text-slate-400">{pregunta.texto.length}/{PREGUNTA_MAX_LENGTH}</span></div>
                        </div>
                        <select value={pregunta.tipo} onChange={(e) => handleChangeTipo(pregunta.id, e.target.value as PreguntaTipo)} className="mt-1 text-xs border border-slate-200 rounded px-2 py-1.5 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none" title="Tipo de pregunta">
                          {PREGUNTA_TIPOS.map((t) => (<option key={t} value={t}>{PREGUNTA_TIPO_LABELS[t]}</option>))}
                        </select>
                        {form.preguntas.length > 1 && (
                          <button type="button" onClick={() => removePregunta(pregunta.id)} disabled={isDragging} className="mt-2 text-red-400 hover:text-red-600 transition-colors text-xs font-bold disabled:opacity-30" title="Eliminar pregunta">✕</button>
                        )}
                      </div>
                      {(pregunta.tipo === 'opcion_multiple' || pregunta.tipo === 'opcion_multiple_multi') && (
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
            <button type="button" onClick={addPregunta} className="mt-2 text-xs text-brand-primary hover:text-brand-primary/80 font-semibold transition-colors">+ Añadir pregunta</button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>{submitLabel}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!showDeleteConfirm}
        onOpenChange={() => setShowDeleteConfirm(null)}
        title="Eliminar encuesta"
        description="¿Está seguro de que desea eliminar esta encuesta? Esta acción no se puede deshacer."
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="danger" isLoading={eliminarMutation.isPending} onClick={() => showDeleteConfirm && eliminarMutation.mutate(showDeleteConfirm)}>Eliminar</Button>
        </div>
      </Modal>

      <ResultadosModal
        open={!!resultadosEncuestaId}
        onClose={() => setResultadosEncuestaId(null)}
        title={(resultadosData as any)?.titulo ?? 'Resultados de la encuesta'}
        totalRespuestas={(resultadosData as any)?.total_respuestas ?? 0}
        resultadosPorPregunta={(resultadosData as any)?.resultados_por_pregunta ?? []}
        isLoading={isLoadingResultados}
        onExportCsv={handleExportarCsv}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { FileText, Calendar, Plus, Eye, Send, Lock, Trash2, Share2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encuestasService } from '../services/encuestasService';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import { Modal } from '@/src/shared/components/ui/Modal';
import { Button } from '@/src/shared/components/ui/Button';
import { Badge } from '@/src/shared/components/ui/Badge';

type TabKey = 'activas' | 'resultados';

export function Encuestas() {
  const [activeTab, setActiveTab] = useState<TabKey>('activas');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['encuestas'],
    queryFn: () => encuestasService.listar(),
  });

  const crearMutation = useMutation({
    mutationFn: (formData: Record<string, unknown>) => encuestasService.crear(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      notify({ type: 'success', message: 'Encuesta creada correctamente' });
      setShowCreateModal(false);
      resetForm();
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al crear la encuesta' });
    },
  });

  const publicarMutation = useMutation({
    mutationFn: (id: string) => encuestasService.publicar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      notify({ type: 'success', message: 'Encuesta publicada' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al publicar la encuesta' });
    },
  });

  const cerrarMutation = useMutation({
    mutationFn: (id: string) => encuestasService.cerrar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      notify({ type: 'success', message: 'Encuesta cerrada' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al cerrar la encuesta' });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => encuestasService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      notify({ type: 'success', message: 'Encuesta eliminada' });
      setShowDeleteConfirm(null);
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al eliminar la encuesta' });
    },
  });

  const PREGUNTA_MAX_LENGTH = 500;

  // form state
  const [form, setForm] = useState({ titulo: '', descripcion: '', preguntasList: [''] });

  const resetForm = () => setForm({ titulo: '', descripcion: '', preguntasList: [''] });

  const addPregunta = () => {
    setForm((prev) => ({ ...prev, preguntasList: [...prev.preguntasList, ''] }));
  };

  const removePregunta = (index: number) => {
    setForm((prev) => ({
      ...prev,
      preguntasList: prev.preguntasList.filter((_, i) => i !== index),
    }));
  };

  const updatePregunta = (index: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.preguntasList];
      updated[index] = value;
      return { ...prev, preguntasList: updated };
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      notify({ type: 'warning', message: 'El título es obligatorio' });
      return;
    }
    const preguntas = form.preguntasList
      .map((t) => t.trim())
      .filter(Boolean)
      .map((texto) => ({ texto, tipo: 'texto_libre' }));

    if (preguntas.length === 0) {
      notify({ type: 'warning', message: 'Agregue al menos una pregunta' });
      return;
    }

    crearMutation.mutate({
      titulo: form.titulo,
      descripcion: form.descripcion,
      preguntas,
    });
  };

  const encuestas = data?.encuestas ?? [];

  // filter by tab
  const activasEncuestas = encuestas.filter(
    (e: any) => e.estado === 'BORRADOR' || e.estado === 'PUBLICADA'
  );
  const cerradasEncuestas = encuestas.filter((e: any) => e.estado === 'CERRADA');

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
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Encuesta
        </Button>
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
        {displayedEncuestas.map((encuesta: any) => (
          <div
            key={encuesta.id}
            className="glass-panel border border-slate-200 p-5 rounded-card flex flex-col transition-all hover:translate-y-[-2px]"
          >
            <div className="flex justify-between items-start mb-4">
              <Badge variant={getEstadoVariant(encuesta.estado)}>
                {getEstadoLabel(encuesta.estado)}
              </Badge>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => publicarMutation.mutate(encuesta.id)}
                  isLoading={publicarMutation.isPending}
                >
                  <Send className="w-3 h-3 mr-1" />
                  Publicar
                </Button>
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
              {encuesta.estado === 'CERRADA' && (
                <Button variant="outline" size="sm">
                  <Eye className="w-3 h-3 mr-1" />
                  Ver resultados
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                onClick={() => setShowDeleteConfirm(encuesta.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* create modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Nueva Encuesta"
        description="Crear una nueva encuesta para los estudiantes"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              placeholder="Título de la encuesta"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[60px] resize-none"
              placeholder="Descripción breve de la encuesta"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Preguntas *</label>
            <div className="space-y-2">
              {form.preguntasList.map((pregunta, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-xs text-slate-400 font-mono mt-3 min-w-[20px]">{index + 1}.</span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={pregunta}
                      maxLength={PREGUNTA_MAX_LENGTH}
                      onChange={(e) => updatePregunta(index, e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                      placeholder={`Escriba la pregunta ${index + 1}`}
                    />
                    <div className="flex justify-end mt-0.5">
                      <span className="text-[10px] text-slate-400">{pregunta.length}/{PREGUNTA_MAX_LENGTH}</span>
                    </div>
                  </div>
                  {form.preguntasList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePregunta(index)}
                      className="mt-2 text-red-400 hover:text-red-600 transition-colors text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPregunta}
              className="mt-2 text-xs text-brand-primary hover:text-brand-primary/80 font-semibold transition-colors"
            >
              + Añadir pregunta
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={crearMutation.isPending}>
              Crear Encuesta
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
    </div>
  );
}

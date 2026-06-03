import React, { useState, useCallback } from 'react';
import { Upload, FileText, Download, Trash2, File, Image, FileSpreadsheet } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService, ArtefactoListParams } from '../services/artefactosService';
import { useNotificationStore } from '@/shared/stores/notification.store';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';

const TIPO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PDF', label: 'PDF' },
  { value: 'IMAGEN', label: 'Imagen' },
  { value: 'DOCUMENTO', label: 'Documento' },
];

export const Artifacts = () => {
  const [filtroTipo, setFiltroTipo] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  const handleDownload = async (id: string, nombre?: string) => {
    setDownloadingId(id);
    try {
      const { blob, filename } = await artefactosService.descargar(id);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nombre || filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    } catch {
      notify({ type: 'error', message: 'Error al descargar el archivo' });
    } finally {
      setDownloadingId(null);
    }
  };

  const params: ArtefactoListParams = filtroTipo ? { tipo: filtroTipo } : {};

  const { data, isLoading, isError } = useQuery({
    queryKey: ['artefactos', params],
    queryFn: () => artefactosService.listar(params),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => artefactosService.subir(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artefactos'] });
      notify({ type: 'success', message: 'Archivo subido correctamente' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al subir el archivo' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => artefactosService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artefactos'] });
      notify({ type: 'success', message: 'Archivo eliminado' });
      setShowDeleteConfirm(null);
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al eliminar el archivo' });
    },
  });

  const artefactos = data?.artefactos ?? [];

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      uploadMutation.mutate(file);
    });
  }, [uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const getFileIcon = (tipo: string) => {
    switch (tipo?.toUpperCase()) {
      case 'PDF': return <FileText className="w-5 h-5 text-red-500" />;
      case 'IMAGEN': return <Image className="w-5 h-5 text-blue-500" />;
      case 'DOCUMENTO': return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      default: return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-6 fade-in">
      {/* header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-primary tracking-tight">
          Documentos y Evidencias
        </h1>
        <p className="text-sm text-slate-500">
          Archivos adjuntos asociados a alertas y estudiantes
        </p>
      </div>

      {/* upload zone */}
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-card p-8 cursor-pointer transition-all ${
          dragOver
            ? 'border-brand-primary bg-brand-primary/5'
            : 'border-slate-300 hover:border-brand-primary hover:bg-brand-primary/5'
        }`}
      >
        <Upload className={`w-8 h-8 ${dragOver ? 'text-brand-primary' : 'text-slate-400'}`} />
        <span className="text-sm text-slate-600 font-medium">
          {uploadMutation.isPending ? 'Subiendo...' : 'Arrastre archivos aquí o haga clic para seleccionar'}
        </span>
        <span className="text-xs text-slate-400">PDF, imágenes o documentos</span>
        <input
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
        />
      </label>

      {/* filter */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por tipo:</span>
        {TIPO_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFiltroTipo(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filtroTipo === opt.value
                ? 'bg-brand-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* file list */}
      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center h-40">
          <p className="text-red-500 text-sm">Error al cargar los archivos</p>
        </div>
      )}

      {!isLoading && !isError && artefactos.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
          <File className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">No hay archivos cargados</p>
        </div>
      )}

      {!isLoading && !isError && artefactos.length > 0 && (
        <div className="glass-panel rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="pb-3 pt-4 px-6 font-semibold">Archivo</th>
                  <th className="pb-3 pt-4 px-6 font-semibold">Tipo</th>
                  <th className="pb-3 pt-4 px-6 font-semibold">Fecha de carga</th>
                  <th className="pb-3 pt-4 px-6 font-semibold">Subido por</th>
                  <th className="pb-3 pt-4 px-6 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {artefactos.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {getFileIcon(item.tipo)}
                        <span className="font-medium text-slate-800 truncate max-w-[200px]">
                          {item.nombre || item.nombre_archivo || 'Sin nombre'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="default">{item.tipo || 'OTRO'}</Badge>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {formatDate(item.fecha_carga || item.created_at)}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {item.subido_por || item.usuario_nombre || '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownload(item.id, item.nombre)}
                          disabled={downloadingId === item.id}
                          className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded transition-all disabled:opacity-50 disabled:cursor-wait"
                          title="Descargar"
                        >
                          <Download className={`w-4 h-4 ${downloadingId === item.id ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Eliminar"
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
        </div>
      )}

      {/* delete confirmation modal */}
      <Modal
        open={!!showDeleteConfirm}
        onOpenChange={() => setShowDeleteConfirm(null)}
        title="Confirmar eliminación"
        description="¿Está seguro de que desea eliminar este archivo? Esta acción no se puede deshacer."
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => showDeleteConfirm && deleteMutation.mutate(showDeleteConfirm)}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

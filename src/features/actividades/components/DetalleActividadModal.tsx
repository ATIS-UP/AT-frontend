import React, { useEffect, useState } from 'react';
import { Modal } from '@/src/shared/components/ui/Modal';
import { Button } from '@/src/shared/components/ui/Button';
import { useAnexosActividad } from '../hooks/useAnexosActividades';
import { anexosActividadesService } from '../services/anexosActividadesService';
import { apiClient } from '@/src/lib/api-client';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Download,
  File,
  FileSpreadsheet,
  Image as ImageIcon,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  TIPO_OPTIONS,
  ESTADO_OPTIONS,
  ESTADO_COLORS,
  TIPO_COLORS,
  MODALIDAD_OPTIONS,
} from '../types/actividades.types';
import type { ActividadInstitucional } from '../types/actividades.types';
import type { AnexoActividad } from '../types/anexosActividades.types';

interface DetalleActividadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actividad: ActividadInstitucional | null;
  onEditar: () => void;
  onEliminar: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'];

function isImage(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext ? IMAGE_EXTS.includes(`.${ext}`) : false;
}

function docExt(name: string) {
  return name.split('.').pop()?.toUpperCase() ?? 'FILE';
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText className="w-4 h-4 text-red-500" />;
  if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
  if (ext === 'doc' || ext === 'docx') return <FileText className="w-4 h-4 text-blue-500" />;
  return <File className="w-4 h-4 text-slate-400" />;
}

function useAuthBlobUrl(url: string) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    apiClient.downloadBlob(url).then(({ blob }) => {
      if (alive) setBlobUrl(URL.createObjectURL(blob));
    }).catch(() => {});
    return () => {
      alive = false;
      setBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    };
  }, [url]);
  return blobUrl;
}

function triggerDownload(url: string, nombre: string) {
  apiClient.downloadBlob(url).then(({ blob, filename }) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre || filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  });
}

function DocChip({ anexo }: { anexo: AnexoActividad }) {
  const downloadUrl = anexosActividadesService.descargarUrl(anexo.id);

  return (
    <button
      type="button"
      onClick={() => triggerDownload(downloadUrl, anexo.nombre)}
      className="inline-flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5
                 hover:border-brand-primary/30 hover:bg-slate-50 transition-colors group min-w-0"
    >
      {fileIcon(anexo.nombre)}
      <span className="text-sm text-slate-700 truncate max-w-[200px] group-hover:text-brand-primary transition-colors">
        {anexo.nombre}
      </span>
      <span className="text-[10px] font-bold uppercase text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
        {docExt(anexo.nombre)}
      </span>
      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-primary transition-colors shrink-0" />
    </button>
  );
}

function ImagePreview({ anexo }: { anexo: AnexoActividad }) {
  const downloadUrl = anexosActividadesService.descargarUrl(anexo.id);
  const blobUrl = useAuthBlobUrl(downloadUrl);

  return (
    <button
      type="button"
      onClick={() => triggerDownload(downloadUrl, anexo.nombre)}
      className="group relative aspect-[4/3] rounded-lg border border-slate-200 overflow-hidden bg-slate-50
                 hover:border-brand-primary/40 hover:shadow-md transition-all w-full"
    >
      {blobUrl ? (
        <img
          src={blobUrl}
          alt={anexo.nombre}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
        </div>
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5"
      >
        <div className="flex items-center gap-1.5 text-xs text-white truncate">
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate font-medium">{anexo.nombre}</span>
        </div>
      </div>
    </button>
  );
}

export function DetalleActividadModal({
  open,
  onOpenChange,
  actividad,
  onEditar,
  onEliminar,
}: DetalleActividadModalProps) {
  const { data: anexosData, isLoading: anexosLoading } = useAnexosActividad(
    actividad?.id ?? '',
    open && !!actividad,
  );

  if (!actividad) return null;

  const tipoLabel = TIPO_OPTIONS.find((t) => t.value === actividad.tipo)?.label ?? actividad.tipo;
  const estadoLabel = ESTADO_OPTIONS.find((e) => e.value === actividad.estado)?.label ?? actividad.estado;
  const modalidadLabel =
    MODALIDAD_OPTIONS.find((m) => m.value === actividad.modalidad)?.label ?? actividad.modalidad;

  const imagenes =
    anexosData?.anexos?.filter((a) => isImage(a.nombre)) ?? [];
  const documentos =
    anexosData?.anexos?.filter((a) => !isImage(a.nombre)) ?? [];

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title=""
      description=""
      className="max-w-5xl"
      bodyClassName=""
      footer={
        <div className="flex items-center gap-2 w-full">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={onEditar}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Editar
          </Button>
          <Button variant="danger" onClick={onEliminar}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Eliminar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold font-display text-slate-900 mb-3">
            {actividad.descripcion}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 border text-[11px] font-bold uppercase tracking-wider ${TIPO_COLORS[actividad.tipo] || 'border-slate-200 text-slate-600 bg-slate-50'}`}
            >
              {tipoLabel}
            </span>
            <span
              className={`px-2.5 py-1 border text-[11px] font-bold uppercase tracking-wider ${ESTADO_COLORS[actividad.estado] || 'border-slate-200 text-slate-500 bg-slate-50'}`}
            >
              {estadoLabel}
            </span>
            <span className="px-2.5 py-1 border text-[11px] font-bold uppercase tracking-wider border-slate-200 text-slate-600 bg-slate-50">
              {modalidadLabel}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-2.5 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700 text-xs uppercase tracking-wider mb-0.5">Inicio</p>
              <p className="text-slate-800">{formatDate(actividad.fecha_inicio)}</p>
              <p className="text-xs text-slate-500">{formatTime(actividad.fecha_inicio)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700 text-xs uppercase tracking-wider mb-0.5">Fin</p>
              <p className="text-slate-800">{formatDate(actividad.fecha_fin)}</p>
              <p className="text-xs text-slate-500">{formatTime(actividad.fecha_fin)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700 text-xs uppercase tracking-wider mb-0.5">Lugar / Enlace</p>
              <p className="text-slate-800">{actividad.lugar_enlace}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-slate-600">
            <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700 text-xs uppercase tracking-wider mb-0.5">Responsable</p>
              <p className="text-slate-800">{actividad.encargado}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-slate-600">
            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700 text-xs uppercase tracking-wider mb-0.5">Creado por</p>
              <p className="text-slate-800">{actividad.creador_nombre}</p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Descripción</p>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {actividad.descripcion}
          </p>
        </div>

        {/* Observaciones */}
        {actividad.observaciones && (
          <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Observaciones</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {actividad.observaciones}
            </p>
          </div>
        )}

        {/* Anexos - estilo email */}
        <div>
          {anexosLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
            </div>
          ) : anexosData?.anexos && anexosData.anexos.length > 0 ? (
            <div className="space-y-4">
              {imagenes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Imágenes ({imagenes.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagenes.map((anexo) => (
                      <ImagePreview key={anexo.id} anexo={anexo} />
                    ))}
                  </div>
                </div>
              )}
              {documentos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Documentos ({documentos.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {documentos.map((anexo) => (
                      <DocChip key={anexo.id} anexo={anexo} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Sin archivos adjuntos</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

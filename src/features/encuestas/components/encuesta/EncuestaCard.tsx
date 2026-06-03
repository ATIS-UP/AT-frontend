import {
  FileText, Calendar, Pencil, Send, Lock, Trash2, Share2, BarChart2, Copy,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import type { Encuesta } from '@/shared/schemas/encuesta.schema';

interface EncuestaCardProps {
  encuesta: Encuesta;
  onEdit: (encuesta: Encuesta) => void;
  onPublicar: (id: string) => void;
  onCerrar: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (encuesta: Encuesta) => void;
  onVerResultados: (id: string) => void;
  onDuplicar: (id: string) => void;
  isPublicando: boolean;
  isCerrando: boolean;
  isDuplicando: boolean;
}

function getEstadoVariant(estado: string) {
  switch (estado) {
    case 'BORRADOR': return 'outline' as const;
    case 'PUBLICADA': return 'success' as const;
    case 'CERRADA': return 'default' as const;
    default: return 'default' as const;
  }
}

function getEstadoLabel(estado: string) {
  switch (estado) {
    case 'BORRADOR': return 'Borrador';
    case 'PUBLICADA': return 'Publicada';
    case 'CERRADA': return 'Cerrada';
    default: return estado;
  }
}

export function EncuestaCard({
  encuesta, onEdit, onPublicar, onCerrar, onDelete, onShare, onVerResultados, onDuplicar,
  isPublicando, isCerrando, isDuplicando,
}: EncuestaCardProps) {
  return (
    <div className="glass-panel border border-slate-200 p-5 rounded-card flex flex-col transition-all hover:translate-y-[-2px]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <Badge variant={getEstadoVariant(encuesta.estado)}>
            {getEstadoLabel(encuesta.estado)}
          </Badge>
          {encuesta.estado === 'PUBLICADA' && encuesta.fecha_inicio && (
            <Badge variant="info">
              Publicada: {new Date(encuesta.fecha_inicio).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
            </Badge>
          )}
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

      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
        {encuesta.estado === 'BORRADOR' && (
          <>
            <Button variant="outline" size="sm" onClick={() => onEdit(encuesta)} title="Editar encuesta">
              <Pencil className="w-3 h-3 mr-1" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPublicar(encuesta.id)} isLoading={isPublicando}>
              <Send className="w-3 h-3 mr-1" /> Publicar
            </Button>
          </>
        )}
        {encuesta.estado === 'PUBLICADA' && (
          <>
            <Button variant="outline" size="sm" onClick={() => onShare(encuesta)}>
              <Share2 className="w-3 h-3 mr-1" /> Compartir
            </Button>
            <Button variant="outline" size="sm" onClick={() => onCerrar(encuesta.id)} isLoading={isCerrando}>
              <Lock className="w-3 h-3 mr-1" /> Cerrar
            </Button>
          </>
        )}
        {(encuesta.estado === 'CERRADA' || encuesta.estado === 'PUBLICADA') && (
          <Button variant="outline" size="sm" onClick={() => onVerResultados(encuesta.id)}>
            <BarChart2 className="w-3 h-3 mr-1" /> Ver resultados
          </Button>
        )}
        {(encuesta.estado === 'CERRADA' || encuesta.estado === 'PUBLICADA') && (
          <Button variant="outline" size="sm" onClick={() => onDuplicar(encuesta.id)} isLoading={isDuplicando} title="Duplicar como nuevo borrador">
            <Copy className="w-3 h-3 mr-1" /> Duplicar
          </Button>
        )}
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto" onClick={() => onDelete(encuesta.id)} title="Eliminar encuesta">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

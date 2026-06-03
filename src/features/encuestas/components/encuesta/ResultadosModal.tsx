import { Download, Users } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

interface ResultadosModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  totalRespuestas: number;
  resultadosPorPregunta: any[];
  isLoading: boolean;
  onExportCsv: () => void;
}

export function ResultadosModal({
  open, onClose, title, totalRespuestas, resultadosPorPregunta, isLoading, onExportCsv,
}: ResultadosModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title={title}
      description={`${totalRespuestas} respuesta(s) recibidas`}
      className="max-w-2xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
        </div>
      ) : resultadosPorPregunta.length > 0 ? (
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {resultadosPorPregunta.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-6">No hay respuestas registradas aún.</p>
          )}
          {resultadosPorPregunta.map((r: any, idx: number) => (
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
                          <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-14 text-right shrink-0">{count} ({pct}%)</span>
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
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline" size="sm" onClick={onExportCsv}
          disabled={resultadosPorPregunta.length === 0}
          title="Exportar resultados a CSV"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
        </Button>
        <Button variant="outline" onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  );
}

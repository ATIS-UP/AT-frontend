import React, { useState } from 'react';
import { useObtenerHistorial, useAgregarHistorial } from '../hooks/useCasosEspeciales';
import { Button } from '@/shared/components/ui/Button';
import { useNotificationStore } from '@/shared/stores/notification.store';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { ACCIONES_HISTORIAL } from '../types/casosEspeciales.types';

const ACCION_STYLES: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  APERTURA: { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Apertura' },
  SEGUIMIENTO: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Seguimiento' },
  CIERRE: { bg: 'bg-slate-100', border: 'border-slate-300', dot: 'bg-slate-500', label: 'Cierre' },
  REAPERTURA: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Reapertura' },
};

export function HistorialRegistro({ registroId, estadoActual }: { registroId: string; estadoActual?: string }) {
  const { data, isLoading } = useObtenerHistorial(registroId, true);
  const agregarHistorial = useAgregarHistorial();
  const notification = useNotificationStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [accion, setAccion] = useState('SEGUIMIENTO');
  const [observacionesError, setObservacionesError] = useState(false);
  const [observaciones, setObservaciones] = useState('');

  const handleAddHistorial = (e: React.FormEvent) => {
    e.preventDefault();

    if (!observaciones.trim()) {
      setObservacionesError(true);
      notification.add({ type: 'error', message: 'Debe ingresar una observación' });
      return;
    }
    setObservacionesError(false);

    agregarHistorial.mutate(
      { id: registroId, data: { accion, observaciones } },
      {
        onSuccess: () => {
          setShowAddForm(false);
          setAccion('SEGUIMIENTO');
          setObservaciones('');
          notification.add({ type: 'success', message: `${ACCIONES_HISTORIAL.find(a => a.value === accion)?.label || accion} registrado` });
        },
        onError: (e: any) => {
          const msg = e?.message || e?.detail || 'Error al agregar seguimiento';
          notification.add({ type: 'error', message: msg });
        },
      }
    );
  };

  const historiales = data?.historiales || [];
  const ultimaAccion = historiales.length > 0 ? historiales[historiales.length - 1]?.accion : null;

  const accionesDisponibles = estadoActual === 'CERRADO'
    ? ACCIONES_HISTORIAL.filter(a => a.value === 'REAPERTURA')
    : ACCIONES_HISTORIAL.filter(a => a.value !== 'APERTURA' && a.value !== 'REAPERTURA');

  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-700">Historial del Registro</h4>
        {ultimaAccion && (
          <span className={cn(
            'text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border',
            ACCION_STYLES[ultimaAccion]?.border,
            ACCION_STYLES[ultimaAccion]?.bg?.replace('50', '100')
          )}>
            Última acción: {ACCION_STYLES[ultimaAccion]?.label || ultimaAccion}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse h-20 bg-slate-50 rounded"></div>
      ) : historiales.length === 0 ? (
        <p className="text-sm text-slate-400 py-4">Sin historial registrado</p>
      ) : (
        <div className="relative max-h-[300px] overflow-y-auto pl-7">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />
          {historiales.map((h) => {
            const style = ACCION_STYLES[h.accion] || ACCION_STYLES.SEGUIMIENTO;
            return (
              <div key={h.id} className="relative pb-5 last:pb-0">
                <div className={cn('absolute -left-[23px] top-1.5 w-4 h-4 rounded-full border-2', style.dot, 'border-white shadow-sm')} />
                <div className={cn('border rounded-lg p-3', style.border, style.bg)}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={cn(
                      'text-[10px] uppercase tracking-wider font-bold',
                      h.accion === 'APERTURA' ? 'text-emerald-700' :
                      h.accion === 'CIERRE' ? 'text-slate-600' :
                      h.accion === 'REAPERTURA' ? 'text-amber-700' : 'text-blue-700'
                    )}>
                      {style.label}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(h.created_at).toLocaleString('es-CO')}
                    </span>
                  </div>
                  {h.observaciones && (
                    <p className="text-xs text-slate-600 whitespace-pre-wrap">{h.observaciones}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">por {h.responsable_nombre}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddForm ? (
        <form onSubmit={handleAddHistorial} className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Acción</label>
            <select
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
            >
              {accionesDisponibles.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Observación *</label>
            <textarea
              value={observaciones}
              onChange={(e) => { setObservaciones(e.target.value); setObservacionesError(false); }}
              className={cn(
                "w-full border rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none min-h-[60px] resize-none",
                observacionesError ? "border-red-500 focus:border-red-500" : "border-slate-200"
              )}
              placeholder="Describa..."
            />
            {observacionesError && (
              <p className="text-xs text-red-500 mt-1">Debe ingresar una observación</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={agregarHistorial.isPending}>
              Guardar
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowAddForm(false); setAccion('SEGUIMIENTO'); }}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir seguimiento
        </Button>
      )}
    </div>
  );
}


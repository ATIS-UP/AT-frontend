import React, { useState } from 'react';
import { useObtenerHistorial, useAgregarHistorial } from '../hooks/useCasosEspeciales';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useNotificationStore } from '@/shared/stores/notification.store';
import { ACCIONES_HISTORIAL } from '../types/casosEspeciales.types';
import { cn } from '@/lib/utils';
import { createCharFilter, CharType } from '@/lib/validation';
import { Plus } from 'lucide-react';

export function HistorialRegistro({ registroId }: { registroId: string }) {
  const { data, isLoading } = useObtenerHistorial(registroId, true);
  const agregarHistorial = useAgregarHistorial();
  const notification = useNotificationStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [observacionesError, setObservacionesError] = useState(false);
  const [form, setForm] = useState({
    accion: 'SEGUIMIENTO',
    observaciones: '',
  });

  const handleAddHistorial = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.observaciones.trim()) {
      setObservacionesError(true);
      notification.add({ type: 'error', message: 'Debe ingresar una observación' });
      return;
    }
    setObservacionesError(false);

    agregarHistorial.mutate(
      { id: registroId, data: form },
      {
        onSuccess: () => {
          setShowAddForm(false);
          setForm({ accion: 'SEGUIMIENTO', observaciones: '' });
          notification.add({ type: 'success', message: 'Seguimiento agregado' });
        },
        onError: () => {
          notification.add({ type: 'error', message: 'Error al agregar seguimiento' });
        },
      }
    );
  };

  const historiales = data?.historiales || [];

  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <h4 className="text-sm font-bold text-slate-700 mb-3">Historial del Registro</h4>

      {isLoading ? (
        <div className="animate-pulse h-20 bg-slate-50 rounded"></div>
      ) : historiales.length === 0 ? (
        <p className="text-sm text-slate-400 py-4">Sin historial registrado</p>
      ) : (
        <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="pb-2 pt-2 px-4 font-semibold">Fecha</th>
                <th className="pb-2 pt-2 px-4 font-semibold">Acción</th>
                <th className="pb-2 pt-2 px-4 font-semibold">Observación</th>
                <th className="pb-2 pt-2 px-4 font-semibold">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historiales.map((h) => (
                <tr key={h.id}>
                  <td className="py-2 px-4 text-slate-500 text-xs">
                    {new Date(h.created_at).toLocaleString('es-CO')}
                  </td>
                  <td className="py-2 px-4">
                    <Badge variant={h.accion === 'APERTURA' ? 'success' : h.accion === 'CIERRE' ? 'default' : h.accion === 'SEGUIMIENTO' ? 'info' : 'warning'}>
                      {h.accion}
                    </Badge>
                  </td>
                  <td className="py-2 px-4 text-slate-600 text-xs max-w-[200px] truncate">
                    {h.observaciones || '-'}
                  </td>
                  <td className="py-2 px-4 text-slate-500 text-xs">
                    {h.responsable_nombre}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm ? (
        <form onSubmit={handleAddHistorial} className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de seguimiento</label>
            <select
              value={form.accion}
              onChange={(e) => setForm({ ...form, accion: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
            >
              {ACCIONES_HISTORIAL.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Observación *</label>
            <textarea
              value={form.observaciones}
              onChange={(e) => { setForm({ ...form, observaciones: createCharFilter(CharType.FULL_TEXT)(e.target.value) }); setObservacionesError(false); }}
              className={cn(
                "w-full border rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none min-h-[60px] resize-none",
                observacionesError ? "border-red-500 focus:border-red-500" : "border-slate-200"
              )}
              placeholder="Describa el seguimiento..."
            />
            {observacionesError && (
              <p className="text-xs text-red-500 mt-1">Debe ingresar una observación</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={agregarHistorial.isPending}>
              Guardar
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
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
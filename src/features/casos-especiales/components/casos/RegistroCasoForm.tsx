import React, { useState } from 'react';
import { useNovedadesCasos } from '../../hooks/useNovedadesCasos';
import { useActualizarRegistro } from '../../hooks/useCasosEspeciales';
import { useNotificationStore } from '@/shared/stores/notification.store';
import { createCharFilter, CharType } from '@/lib/validation';
import { Button } from '@/shared/components/ui/Button';
import { TIPOS_REGISTRO, ESTADOS_REGISTRO, type RegistroCaso, type TipoRegistro, type EstadoRegistro } from '../../types/casosEspeciales.types';
import { HistorialRegistro } from '../HistorialRegistro';
import { OBSERVACIONES_MAX_LENGTH } from './casosUtils';

interface RegistroCasoFormProps {
  registro: RegistroCaso;
  onClose: () => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
  showUnsavedAlert?: boolean;
  onDismissAlert?: () => void;
}

export function RegistroCasoForm({
  registro, onClose, onHasChangesChange, showUnsavedAlert, onDismissAlert,
}: RegistroCasoFormProps) {
  const prevRegistroIdRef = React.useRef(registro.id);

  const [form, setForm] = useState({
    tipo: registro.tipo,
    estado: registro.estado,
    novedad_id: registro.novedad_id || '',
    observaciones: registro.observaciones || '',
  });

  const { data: novedades } = useNovedadesCasos(form.tipo);
  const novedadesParaTipo = novedades || [];
  const [originalForm, setOriginalForm] = useState({
    tipo: registro.tipo, estado: registro.estado,
    novedad_id: registro.novedad_id || '', observaciones: registro.observaciones || '',
  });

  React.useEffect(() => {
    if (prevRegistroIdRef.current !== registro.id) {
      prevRegistroIdRef.current = registro.id;
      setForm({ tipo: registro.tipo, estado: registro.estado, novedad_id: registro.novedad_id || '', observaciones: registro.observaciones || '' });
      setOriginalForm({ tipo: registro.tipo, estado: registro.estado, novedad_id: registro.novedad_id || '', observaciones: registro.observaciones || '' });
    }
  }, [registro.id, registro.tipo, registro.estado, registro.novedad_id, registro.observaciones]);

  const notification = useNotificationStore();
  const actualizarRegistro = useActualizarRegistro();

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  React.useEffect(() => {
    onHasChangesChange?.(hasChanges);
  }, [hasChanges, onHasChangesChange]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = { tipo: form.tipo, observaciones: form.observaciones };
    if (form.estado !== registro.estado) payload.estado = form.estado;
    if (form.novedad_id) payload.novedad_id = form.novedad_id;
    actualizarRegistro.mutate(
      { id: registro.id, data: payload },
      {
        onSuccess: () => { notification.add({ type: 'success', message: 'Registro actualizado' }); onClose(); },
        onError: (error: any) => {
          const msg = error?.response?.data?.detail || 'Error al actualizar';
          notification.add({ type: 'error', message: msg });
        },
      }
    );
  };

  const handleBack = () => {
    if (hasChanges) onDismissAlert?.();
    else onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-start mb-4">
        <Button variant="ghost" onClick={handleBack}>← Volver</Button>
      </div>

      {showUnsavedAlert && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          Advertencia: Hay cambios sin guardar. ¿Está seguro de que desea salir?
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => onDismissAlert?.()}>Continuar editando</Button>
            <Button size="sm" variant="danger" onClick={() => { onDismissAlert?.(); onClose(); }}>Salir sin guardar</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
        <div><p className="text-xs text-slate-500">Código</p><p className="text-sm font-medium">{registro.estudiante.codigo}</p></div>
        <div><p className="text-xs text-slate-500">Nombre</p><p className="text-sm font-medium">{registro.estudiante.nombres}</p></div>
        <div><p className="text-xs text-slate-500">Apellido</p><p className="text-sm font-medium">{registro.estudiante.apellidos}</p></div>
        <div><p className="text-xs text-slate-500">Carrera</p><p className="text-sm font-medium">{registro.estudiante.programa}</p></div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Novedad</label>
        <select value={form.novedad_id} onChange={(e) => setForm({ ...form, novedad_id: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none">
          <option value="">Seleccione una novedad</option>
          {novedadesParaTipo.map((n) => (<option key={n.id} value={n.id}>{n.nombre}</option>))}
        </select>
        {(() => {
          const selected = novedadesParaTipo.find(n => n.id === form.novedad_id);
          return selected?.descripcion ? (<p className="text-xs text-slate-500 mt-1 italic">{selected.descripcion}</p>) : null;
        })()}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoRegistro })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none">
              {TIPOS_REGISTRO.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Estado</label>
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoRegistro })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none">
              {ESTADOS_REGISTRO.map((e) => (<option key={e.value} value={e.value}>{e.label}</option>))}
            </select>
            {form.estado === 'CERRADO' && (
              <p className="text-[11px] text-slate-500 mt-1">Para reabrir el caso, cambia el estado a <strong>Activo</strong> y guarda.</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Responsable</label>
          <input type="text" value={registro.responsable_nombre} readOnly className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-100" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Observaciones</label>
          <textarea value={form.observaciones} maxLength={OBSERVACIONES_MAX_LENGTH} onChange={(e) => setForm({ ...form, observaciones: createCharFilter(CharType.FULL_TEXT)(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[80px] resize-none" />
          <div className="flex justify-end mt-1"><span className="text-[10px] text-slate-400">{form.observaciones.length}/{OBSERVACIONES_MAX_LENGTH}</span></div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" isLoading={actualizarRegistro.isPending}>Guardar Cambios</Button>
        </div>
      </form>

      <HistorialRegistro registroId={registro.id} />
    </div>
  );
}

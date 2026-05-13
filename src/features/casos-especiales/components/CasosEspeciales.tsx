import React, { useState } from 'react';
import { useBuscarEstudiante, useCrearRegistro, useActualizarRegistro, useAgregarHistorial } from '../hooks/useCasosEspeciales';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { Modal } from '@/src/shared/components/ui/Modal';
import { Search, Plus, Eye } from 'lucide-react';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import type { BusquedaEstudiante, EstudianteInfo, RegistroCaso, TipoRegistro, EstadoRegistro } from '../types/casosEspeciales.types';
import { TIPOS_REGISTRO, ESTADOS_REGISTRO } from '../types/casosEspeciales.types';
import { HistorialRegistro } from './HistorialRegistro';

const getEstadoVariant = (estado: string): 'error' | 'warning' | 'success' | 'default' => {
  switch (estado) {
    case 'ACTIVO': return 'error';
    case 'PENDIENTE': return 'warning';
    case 'CERRADO': return 'default';
    default: return 'default';
  }
};

const getTipoLabel = (tipo: string): string => {
  const found = TIPOS_REGISTRO.find(t => t.value === tipo);
  return found ? found.label : tipo;
};

export function CasosEspeciales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pagina, setPagina] = useState(1);

  React.useEffect(() => {
    setPagina(1);
  }, [searchTerm]);
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteInfo | null>(null);
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroCaso | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  const { data: busquedaResults, isLoading, refetch } = useBuscarEstudiante(searchTerm, pagina, searchTerm.length >= 2);
  const crearRegistro = useCrearRegistro();
  const notification = useNotificationStore();

  const results: BusquedaEstudiante[] = busquedaResults?.resultados || [];
  const totalResultados = busquedaResults?.total || 0;
  const porPagina = busquedaResults?.por_pagina || 20;
  const totalPaginas = Math.ceil(totalResultados / porPagina);
  const hasMorePages = pagina < totalPaginas;

  const [form, setForm] = useState({
    tipo: 'SOCIO_ECONOMICO' as TipoRegistro,
    observaciones: '',
  });
  const [observacionesError, setObservacionesError] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.length >= 2) {
      refetch();
    }
  };

  const handleCreateRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstudiante) return;

    if (!form.observaciones.trim()) {
      setObservacionesError(true);
      notification.add({ type: 'error', message: 'Debe ingresar las observaciones del caso' });
      return;
    }
    setObservacionesError(false);

    crearRegistro.mutate(
      {
        estudiante_id: selectedEstudiante.id,
        tipo: form.tipo,
        observaciones: form.observaciones || undefined,
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setForm({ tipo: 'SOCIO_ECONOMICO', observaciones: '' });
          setObservacionesError(false);
          notification.add({ type: 'success', message: 'Registro creado exitosamente' });
          refetch();
        },
        onError: () => {
          notification.add({ type: 'error', message: 'Error al crear el registro' });
        },
      }
    );
  };

  const handleVerRegistro = (registro: RegistroCaso) => {
    setSelectedRegistro(registro);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-brand-primary">Casos Especiales</h2>
          <p className="text-slate-500 text-sm">Gestión de registros de casos especiales por estudiante</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              placeholder="Buscar por cédula, nombre, apellido o código..."
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
        </form>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      )}

      {!isLoading && searchTerm.length >= 2 && results.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-slate-500">Estudiante no está en la base de datos</p>
        </Card>
      )}

      {!isLoading && results.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg">
          <div className="text-sm text-slate-500">
            Mostrando <span className="font-medium text-slate-700">{results.length}</span> de <span className="font-medium text-slate-700">{totalResultados}</span> resultado{totalResultados !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-slate-600 px-2">Página {pagina} de {totalPaginas || 1}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMorePages}
              onClick={() => setPagina(pagina + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {!isLoading && results.map((result) => (
        <Card key={result.estudiante.id} className="space-y-4">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-800">
              {result.estudiante.nombres} {result.estudiante.apellidos}
            </h3>
            <p className="text-sm text-slate-500">
              Código: {result.estudiante.codigo} | Documento: {result.estudiante.documento || 'N/A'} | Programa: {result.estudiante.programa}
            </p>
          </div>

          {result.registros.length === 0 ? (
            <div 
              className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-brand-primary/50 hover:bg-brand-primary/5 cursor-pointer transition-all group"
              onClick={() => {
                setSelectedEstudiante(result.estudiante);
                setShowCreateModal(true);
              }}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 group-hover:bg-brand-primary/10 mb-3 transition-colors">
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
              </div>
              <p className="text-slate-600 font-medium mb-1">Sin registros de casos especiales</p>
              <p className="text-sm text-slate-400">Haz clic para crear el primer registro</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50">
                      <th className="pb-3 pt-4 px-6 font-semibold">#</th>
                      <th className="pb-3 pt-4 px-6 font-semibold">Tipo</th>
                      <th className="pb-3 pt-4 px-6 font-semibold">Estado</th>
                      <th className="pb-3 pt-4 px-6 font-semibold">Fecha Ini</th>
                      <th className="pb-3 pt-4 px-6 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.registros.map((registro, index) => (
                      <tr key={registro.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 text-slate-500">{index + 1}</td>
                        <td className="py-4 px-6">
                          <Badge variant="outline">{getTipoLabel(registro.tipo)}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={getEstadoVariant(registro.estado)}>{registro.estado}</Badge>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs">
                          {new Date(registro.created_at).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-brand-primary hover:text-brand-primary/80"
                            onClick={() => handleVerRegistro(registro)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEstudiante(result.estudiante);
                    setShowCreateModal(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir registro
                </Button>
              </div>
            </>
          )}
        </Card>
      ))}

      <Modal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) {
            setForm({ tipo: 'SOCIO_ECONOMICO', observaciones: '' });
            setObservacionesError(false);
          }
        }}
        title="Nuevo Registro de Caso Especial"
        description={`Crear nuevo registro para ${selectedEstudiante?.nombres} ${selectedEstudiante?.apellidos}`}
      >
        <form onSubmit={handleCreateRegistro} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
            <div>
              <p className="text-xs text-slate-500">Código</p>
              <p className="text-sm font-medium">{selectedEstudiante?.codigo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Programa</p>
              <p className="text-sm font-medium">{selectedEstudiante?.programa}</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Caso *</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoRegistro })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
            >
              {TIPOS_REGISTRO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Observaciones *</label>
            <textarea
              value={form.observaciones}
              onChange={(e) => { setForm({ ...form, observaciones: e.target.value }); setObservacionesError(false); }}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[80px] resize-none ${observacionesError ? 'border-red-500 focus:border-red-500' : 'border-slate-200'}`}
              placeholder="Describa la situación del estudiante"
            />
            {observacionesError && (
              <p className="text-xs text-red-500 mt-1">Debe ingresar las observaciones del caso</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={crearRegistro.isPending}>
              Crear Registro
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={showViewModal}
        onOpenChange={(open) => {
          if (open || !hasUnsavedChanges) {
            setShowViewModal(open);
            if (!open) {
              setSelectedRegistro(null);
              setHasUnsavedChanges(false);
              setShowUnsavedAlert(false);
            }
          }
        }}
        title="Gestionar Registro de Caso Especial"
        description={`Registro #${selectedRegistro?.id?.slice(0, 8)}`}
        shouldClose={() => !hasUnsavedChanges}
        onBlocked={() => setShowUnsavedAlert(true)}
      >
        {selectedRegistro && (
          <RegistroCasoForm
            registro={selectedRegistro}
            onClose={() => setShowViewModal(false)}
            onHasChangesChange={setHasUnsavedChanges}
            showUnsavedAlert={showUnsavedAlert}
            onDismissAlert={() => setShowUnsavedAlert(false)}
          />
        )}
      </Modal>
    </div>
  );
}

function RegistroCasoForm({ 
  registro, 
  onClose, 
  onHasChangesChange,
  showUnsavedAlert,
  onDismissAlert,
}: { 
  registro: RegistroCaso; 
  onClose: () => void; 
  onHasChangesChange?: (hasChanges: boolean) => void;
  showUnsavedAlert?: boolean;
  onDismissAlert?: () => void;
}) {
  const prevRegistroIdRef = React.useRef(registro.id);

  const [form, setForm] = useState({
    tipo: registro.tipo,
    estado: registro.estado,
    observaciones: registro.observaciones || '',
  });
  const [originalForm, setOriginalForm] = useState({ tipo: registro.tipo, estado: registro.estado, observaciones: registro.observaciones || '' });

  React.useEffect(() => {
    if (prevRegistroIdRef.current !== registro.id) {
      prevRegistroIdRef.current = registro.id;
      setForm({ tipo: registro.tipo, estado: registro.estado, observaciones: registro.observaciones || '' });
      setOriginalForm({ tipo: registro.tipo, estado: registro.estado, observaciones: registro.observaciones || '' });
    }
  }, [registro.id, registro.tipo, registro.estado, registro.observaciones]);

  const notification = useNotificationStore();
  const actualizarRegistro = useActualizarRegistro();
  const agregarHistorial = useAgregarHistorial();
  
  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm);
  
  React.useEffect(() => {
    onHasChangesChange?.(hasChanges);
  }, [hasChanges, onHasChangesChange]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarRegistro.mutate(
      { id: registro.id, data: form },
      {
        onSuccess: () => {
          setOriginalForm(form);
          notification.add({ type: 'success', message: 'Registro actualizado' });
        },
        onError: () => {
          notification.add({ type: 'error', message: 'Error al actualizar' });
        },
      }
    );
  };

  const handleBack = () => {
    if (hasChanges) {
      onDismissAlert?.();
    } else {
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-start mb-4">
        <Button variant="ghost" onClick={handleBack}>
          ← Volver
        </Button>
      </div>

      {showUnsavedAlert && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          Advertencia: Hay cambios sin guardar. ¿Está seguro de que desea salir?
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => onDismissAlert?.()}>
              Continuar editando
            </Button>
            <Button size="sm" variant="danger" onClick={() => { onDismissAlert?.(); onClose(); }}>
              Salir sin guardar
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
        <div>
          <p className="text-xs text-slate-500">Código</p>
          <p className="text-sm font-medium">{registro.estudiante.codigo}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Nombre</p>
          <p className="text-sm font-medium">{registro.estudiante.nombres}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Apellido</p>
          <p className="text-sm font-medium">{registro.estudiante.apellidos}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Carrera</p>
          <p className="text-sm font-medium">{registro.estudiante.programa}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoRegistro })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
            >
              {TIPOS_REGISTRO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoRegistro })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
            >
              {ESTADOS_REGISTRO.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Responsable</label>
          <input
            type="text"
            value={registro.responsable_nombre}
            readOnly
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Observaciones</label>
          <textarea
            value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[80px] resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" isLoading={actualizarRegistro.isPending}>
            Guardar Cambios
          </Button>
        </div>
      </form>

      <HistorialRegistro registroId={registro.id} />
    </div>
  );
}
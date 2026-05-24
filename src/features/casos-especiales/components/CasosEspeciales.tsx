import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useListarRegistros, useCrearRegistro, useActualizarRegistro, useAgregarHistorial, useEliminarRegistro } from '../hooks/useCasosEspeciales';
import { useNovedadesCasos } from '../hooks/useNovedadesCasos';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { Modal } from '@/src/shared/components/ui/Modal';
import { Search, Plus, Eye, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import type { BusquedaEstudiante, EstudianteInfo, RegistroCaso, TipoRegistro, EstadoRegistro } from '../types/casosEspeciales.types';
import { TIPOS_REGISTRO, ESTADOS_REGISTRO } from '../types/casosEspeciales.types';
import { HistorialRegistro } from './HistorialRegistro';
import { apiClient } from '@/src/lib/api-client';

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

const OBSERVACIONES_MAX_LENGTH = 500;

export function CasosEspeciales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pagina, setPagina] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('ACTIVO');
  const ITEMS_PER_PAGE = 20;

  React.useEffect(() => {
    setPagina(1);
  }, [searchTerm, filtroTipo, filtroEstado]);
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteInfo | null>(null);
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroCaso | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showNuevoCasoModal, setShowNuevoCasoModal] = useState(false);
  const [buscarNuevoEstudiante, setBuscarNuevoEstudiante] = useState('');
  const [searching, setSearching] = useState(false);
  const [studentResults, setStudentResults] = useState<any[]>([]);

  const handleNuevoCasoSearch = async () => {
    if (buscarNuevoEstudiante.length < 2) return;
    setSearching(true);
    try {
      const res = await apiClient.get<{ estudiantes: any[]; total: number }>('/api/estudiantes', { search: buscarNuevoEstudiante, limit: 10 });
      setStudentResults(res.estudiantes || []);
    } catch {
      setStudentResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectStudentForCaso = (est: any) => {
    setSelectedEstudiante({
      id: est.id,
      codigo: est.codigo,
      documento: est.documento,
      nombres: est.nombres,
      apellidos: est.apellidos,
      programa: est.programa,
      semestre: est.semestre,
      estado: est.estado,
    });
    setShowNuevoCasoModal(false);
    setBuscarNuevoEstudiante('');
    setStudentResults([]);
    setForm({ tipo: 'SOCIO_ECONOMICO', novedad_id: '', observaciones: '' });
    setShowCreateModal(true);
  };

  const { data: registrosData, isLoading, refetch } = useListarRegistros(filtroEstado);
  const crearRegistro = useCrearRegistro();
  const eliminarRegistro = useEliminarRegistro();
  const notification = useNotificationStore();

  const allRegistros: RegistroCaso[] = registrosData?.registros || [];

  const groupAndFilter = useMemo(() => {
    let registros = allRegistros;

    if (filtroTipo) {
      registros = registros.filter(r => r.tipo === filtroTipo);
    }

    if (searchTerm.length >= 2) {
      const q = searchTerm.toLowerCase();
      registros = registros.filter(r => {
        const e = r.estudiante;
        return (
          (e.codigo || '').toLowerCase().includes(q) ||
          (e.nombres || '').toLowerCase().includes(q) ||
          (e.apellidos || '').toLowerCase().includes(q) ||
          (e.documento || '').toLowerCase().includes(q)
        );
      });
    }

    const map = new Map<string, BusquedaEstudiante>();
    for (const reg of registros) {
      const key = reg.estudiante_id;
      if (!map.has(key)) {
        map.set(key, {
          estudiante: reg.estudiante,
          registros: [],
          total_registros: 0,
        });
      }
      map.get(key)!.registros.push(reg);
      map.get(key)!.total_registros++;
    }

    const resultados = Array.from(map.values());
    const total = resultados.length;
    const start = (pagina - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return {
      resultados: resultados.slice(start, end),
      total,
    };
  }, [allRegistros, searchTerm, filtroTipo, pagina]);

  const results: BusquedaEstudiante[] = groupAndFilter.resultados;
  const totalResultados = groupAndFilter.total;
  const porPagina = ITEMS_PER_PAGE;
  const totalPaginas = Math.ceil(totalResultados / porPagina);
  const hasMorePages = pagina < totalPaginas;

  const [form, setForm] = useState({
    tipo: 'SOCIO_ECONOMICO' as TipoRegistro,
    novedad_id: '',
    observaciones: '',
  });
  const [observacionesError, setObservacionesError] = useState(false);
  const [novedadError, setNovedadError] = useState(false);

  const { data: novedades } = useNovedadesCasos(form.tipo);
  const novedadesParaTipo = novedades || [];

  const handleCreateRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstudiante) return;

    if (selectedEstudiante.estado !== 'ACTIVO') {
      notification.add({ type: 'error', message: `No se pueden crear registros para estudiantes en estado ${selectedEstudiante.estado}` });
      return;
    }

    if (!form.observaciones.trim()) {
      setObservacionesError(true);
      notification.add({ type: 'error', message: 'Debe ingresar las observaciones del caso' });
      return;
    }
    setObservacionesError(false);

    if (!form.novedad_id) {
      setNovedadError(true);
      notification.add({ type: 'error', message: 'Debe seleccionar una novedad' });
      return;
    }
    setNovedadError(false);

    crearRegistro.mutate(
      {
        estudiante_id: selectedEstudiante.id,
        tipo: form.tipo,
        novedad_id: form.novedad_id,
        observaciones: form.observaciones || undefined,
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setForm({ tipo: 'SOCIO_ECONOMICO', novedad_id: '', observaciones: '' });
          setObservacionesError(false);
          setNovedadError(false);
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

  const handleDeleteClick = (registro: RegistroCaso) => {
    setDeleteConfirmId(registro.id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    eliminarRegistro.mutate(deleteConfirmId, {
      onSuccess: () => {
        setDeleteConfirmId(null);
        notification.add({ type: 'success', message: 'Registro eliminado exitosamente' });
        refetch();
      },
      onError: () => {
        setDeleteConfirmId(null);
        notification.add({ type: 'error', message: 'Error al eliminar el registro' });
      },
    });
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-brand-primary">Casos Especiales</h2>
          <p className="text-slate-500 text-sm">Gestión de registros de casos especiales por estudiante</p>
        </div>
        <Button onClick={() => setShowNuevoCasoModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Caso
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              placeholder="Buscar por código, cédula, nombre o apellido..."
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full sm:w-48 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
          >
            <option value="">Todos los tipos</option>
            {TIPOS_REGISTRO.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full sm:w-40 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
          >
            <option value="ACTIVO">Activos</option>
            <option value="CERRADO">Cerrados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="TODOS">Todos</option>
          </select>
        </div>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      )}

      {!isLoading && allRegistros.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-slate-500">No hay casos especiales activos registrados</p>
        </Card>
      )}

      {!isLoading && allRegistros.length > 0 && results.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-slate-500">No se encontraron resultados con los filtros aplicados</p>
        </Card>
      )}

      {!isLoading && results.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg">
          <div className="text-sm text-slate-500 text-center sm:text-left">
            Mostrando <span className="font-medium text-slate-700">{results.length}</span> de <span className="font-medium text-slate-700">{totalResultados}</span> resultado{totalResultados !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-slate-600 px-2 whitespace-nowrap">Página {pagina} de {totalPaginas || 1}</span>
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
                setForm({ tipo: 'SOCIO_ECONOMICO', novedad_id: '', observaciones: '' });
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
                      <th className="pb-3 pt-4 px-4 font-semibold">#</th>
                      <th className="pb-3 pt-4 px-4 font-semibold hidden md:table-cell">Tipo</th>
                      <th className="pb-3 pt-4 px-4 font-semibold">Novedad</th>
                      <th className="pb-3 pt-4 px-4 font-semibold">Estado</th>
                      <th className="pb-3 pt-4 px-4 font-semibold hidden sm:table-cell">Fecha</th>
                      <th className="pb-3 pt-4 px-4 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.registros.map((registro, index) => (
                      <tr key={registro.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-slate-500">{index + 1}</td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          <Badge variant="outline">{getTipoLabel(registro.tipo)}</Badge>
                        </td>
                        <td className="py-4 px-4 text-slate-700 text-xs font-medium">
                          {registro.novedad?.nombre || '—'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={getEstadoVariant(registro.estado)}>{registro.estado}</Badge>
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-xs hidden sm:table-cell">
                          {new Date(registro.created_at).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-brand-primary hover:text-brand-primary/80"
                              onClick={() => handleVerRegistro(registro)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteClick(registro)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
                    setForm({ tipo: 'SOCIO_ECONOMICO', novedad_id: '', observaciones: '' });
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
        open={showNuevoCasoModal}
        onOpenChange={(open) => {
          setShowNuevoCasoModal(open);
          if (!open) {
            setBuscarNuevoEstudiante('');
            setStudentResults([]);
          }
        }}
        title="Nuevo Caso Especial"
        description="Busque un estudiante para crearle un caso especial"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={buscarNuevoEstudiante}
              onChange={(e) => setBuscarNuevoEstudiante(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNuevoCasoSearch(); }}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              placeholder="Buscar por código, nombre o apellido..."
            />
            <Button onClick={handleNuevoCasoSearch} disabled={buscarNuevoEstudiante.length < 2 || searching}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>

          {searching && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
            </div>
          )}

          {!searching && studentResults.length === 0 && buscarNuevoEstudiante.length >= 2 && (
            <p className="text-sm text-slate-500 text-center py-4">No se encontraron estudiantes</p>
          )}

          {!searching && studentResults.length > 0 && (
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto border border-slate-200 rounded-lg">
              {studentResults.map((est: any) => (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => handleSelectStudentForCaso(est)}
                  className="w-full text-left px-4 py-3 hover:bg-brand-primary/5 transition-colors"
                >
                  <p className="font-medium text-slate-800 text-sm">
                    {est.nombres} {est.apellidos}
                  </p>
                  <p className="text-xs text-slate-500">
                    Código: {est.codigo} | {est.programa} | {est.semestre}° semestre
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) {
            setForm({ tipo: 'SOCIO_ECONOMICO', novedad_id: '', observaciones: '' });
            setObservacionesError(false);
            setNovedadError(false);
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
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoRegistro, novedad_id: '' })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
            >
              {TIPOS_REGISTRO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Novedad *</label>
            <select
              value={form.novedad_id}
              onChange={(e) => { setForm({ ...form, novedad_id: e.target.value }); setNovedadError(false); }}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${novedadError ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-brand-primary'}`}
            >
              <option value="">Seleccione una novedad</option>
              {novedadesParaTipo.map((n) => (
                <option key={n.id} value={n.id}>{n.nombre}</option>
              ))}
            </select>
            {novedadError && (
              <p className="text-xs text-red-500 mt-1">Debe seleccionar una novedad</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Observaciones *</label>
            <textarea
              value={form.observaciones}
              maxLength={OBSERVACIONES_MAX_LENGTH}
              onChange={(e) => { setForm({ ...form, observaciones: e.target.value }); setObservacionesError(false); }}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[80px] resize-none ${observacionesError ? 'border-red-500 focus:border-red-500' : 'border-slate-200'}`}
              placeholder="Describa la situación del estudiante"
            />
            <div className="flex justify-between items-center mt-1">
              {observacionesError ? (
                <p className="text-xs text-red-500">Debe ingresar las observaciones del caso</p>
              ) : <span />}
              <span className="text-[10px] text-slate-400">{form.observaciones.length}/{OBSERVACIONES_MAX_LENGTH}</span>
            </div>
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

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirmar eliminación</h3>
                <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              ¿Está seguro de que desea eliminar este registro de caso especial?
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancelar
              </Button>
              <Button 
                variant="danger"
                isLoading={eliminarRegistro.isPending}
                onClick={confirmDelete}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
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

      {registro.novedad && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Novedad</p>
          <p className="text-sm font-medium text-blue-800">{registro.novedad.nombre}</p>
        </div>
      )}

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
            maxLength={OBSERVACIONES_MAX_LENGTH}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[80px] resize-none"
          />
          <div className="flex justify-end mt-1">
            <span className="text-[10px] text-slate-400">{form.observaciones.length}/{OBSERVACIONES_MAX_LENGTH}</span>
          </div>
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

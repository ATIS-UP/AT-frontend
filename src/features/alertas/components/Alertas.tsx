import React, { useState, useEffect, useCallback } from 'react';
import { useAlertas, useAlertasStats, useCrearAlerta, useCrearActividad, useCambiarEstadoAlerta, useEliminarAlerta } from '../hooks/useAlertas';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { Modal } from '@/src/shared/components/ui/Modal';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import { createCharFilter, CharType } from '@/src/lib/validation';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { parametrizacionService } from '@/src/features/parametrizacion/services/parametrizacionService';
import { apiClient } from '@/src/lib/api-client';

type NivelRiesgo = 'ROJO' | 'AMARILLO' | 'VERDE';
type EstadoSeguimiento = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';

export function Alertas() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActividadModal, setShowActividadModal] = useState(false);
  const [selectedAlertaId, setSelectedAlertaId] = useState<string | null>(null);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [selectedEstadoAlerta, setSelectedEstadoAlerta] = useState<any | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');

  const params: Record<string, any> = {};
  if (filtroNivel) params.nivel_riesgo = filtroNivel;
  if (filtroEstado) params.estado_seguimiento = filtroEstado;
  if (filtroPeriodo) params.periodo = filtroPeriodo;

  const { data, isLoading, isError } = useAlertas(Object.keys(params).length ? params as any : undefined);

  const { data: stats, isLoading: isLoadingStats } = useAlertasStats();
  const crearAlerta = useCrearAlerta();
  const crearActividad = useCrearActividad();
  const cambiarEstado = useCambiarEstadoAlerta();
  const eliminarAlerta = useEliminarAlerta();

  const alertas = data?.alertas ?? [];

  const [form, setForm] = useState({
    estudiante_id: '',
    tipo: 'ACADEMICA',
    nivel_riesgo: 'AMARILLO',
    descripcion: '',
    periodo: '',
  });
  const [estudianteValido, setEstudianteValido] = useState<'ok' | 'error' | 'checking' | null>(null);
  const [estudianteNombre, setEstudianteNombre] = useState<string | null>(null);
  const [errorEstudiante, setErrorEstudiante] = useState<string | null>(null);

  const { data: paramsData } = useQuery({
    queryKey: ['parametrizacion'],
    queryFn: () => parametrizacionService.listar(),
    enabled: showCreateModal,
  });

  useEffect(() => {
    if (!showCreateModal) return;
    const grupo = paramsData?.find((g: any) => g.grupo === 'PERIODO');
    const periodoActual = grupo?.parametros?.find((p: any) => p.clave === 'PERIODO_ACTUAL');
    if (periodoActual?.valor) {
      setForm((prev) => ({ ...prev, periodo: periodoActual.valor }));
    }
  }, [showCreateModal, paramsData]);

  const verificarEstudiante = useCallback(async (value: string) => {
    if (!value.trim()) {
      setEstudianteValido(null);
      setEstudianteNombre(null);
      setErrorEstudiante(null);
      return;
    }
    // reject pure letters (no digits)
    if (/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) {
      setEstudianteValido('error');
      setEstudianteNombre(null);
      setErrorEstudiante('ID inválido: debe ser un código numérico o UUID');
      return;
    }
    setEstudianteValido('checking');
    setErrorEstudiante(null);
    try {
      let data: any;
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(value)) {
        data = await apiClient.get<any>(`/api/estudiantes/${value}`);
      } else {
        const res = await apiClient.get<{ estudiantes: any[]; total: number }>('/api/estudiantes', { buscar: value, por_pagina: 1 });
        data = res.estudiantes?.[0];
      }
      if (data?.nombres) {
        setEstudianteNombre(`${data.nombres} ${data.apellidos || ''}`.trim());
        setEstudianteValido('ok');
      } else {
        setEstudianteNombre(null);
        setEstudianteValido('error');
        setErrorEstudiante('Estudiante no encontrado');
      }
    } catch {
      setEstudianteNombre(null);
      setEstudianteValido('error');
      setErrorEstudiante('Estudiante no encontrado');
    }
  }, []);

  const handleEstudianteIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, estudiante_id: value }));
    setEstudianteValido(null);
    setEstudianteNombre(null);
    setErrorEstudiante(null);
  };

  const handleBlurEstudianteId = () => {
    if (form.estudiante_id.trim()) {
      verificarEstudiante(form.estudiante_id);
    }
  };

  const [actividadForm, setActividadForm] = useState({
    tipo: 'LLAMADA',
    descripcion: '',
    resultado: '',
  });

  const DESCRIPCION_MAX_LENGTH = 500;

  const getStatusVariant = (nivel: NivelRiesgo) => {
    switch (nivel) {
      case 'ROJO': return 'error' as const;
      case 'AMARILLO': return 'warning' as const;
      case 'VERDE': return 'success' as const;
      default: return 'default' as const;
    }
  };

  const getTrackingVariant = (estado: EstadoSeguimiento) => {
    switch (estado) {
      case 'PENDIENTE': return 'outline' as const;
      case 'EN_PROCESO': return 'info' as const;
      case 'RESUELTO': return 'success' as const;
      default: return 'default' as const;
    }
  };

  const handleCreateAlerta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.estudiante_id || !form.descripcion || !form.periodo) {
      useNotificationStore.getState().add({ type: 'warning', message: 'Complete todos los campos requeridos' });
      return;
    }
    if (estudianteValido !== 'ok') {
      useNotificationStore.getState().add({ type: 'warning', message: 'Verifique que el estudiante existe antes de crear la alerta' });
      return;
    }
    crearAlerta.mutate(form, {
      onSuccess: () => {
        setShowCreateModal(false);
        setForm({ estudiante_id: '', tipo: 'ACADEMICA', nivel_riesgo: 'AMARILLO', descripcion: '', periodo: '' });
        setEstudianteValido(null);
        setEstudianteNombre(null);
        setErrorEstudiante(null);
      },
    });
  };

  const handleCreateActividad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertaId || !actividadForm.descripcion) {
      useNotificationStore.getState().add({ type: 'warning', message: 'Complete la descripción' });
      return;
    }
    crearActividad.mutate(
      { alertaId: selectedAlertaId, data: actividadForm },
      {
        onSuccess: () => {
          setShowActividadModal(false);
          setActividadForm({ tipo: 'LLAMADA', descripcion: '', resultado: '' });
          setSelectedAlertaId(null);
        },
      }
    );
  };

  if (isLoading || isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">Error al cargar las alertas. Intente nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-brand-primary">Alertas y Pérdidas</h2>
          <p className="text-slate-500 text-sm">Monitoreo de riesgo académico por estudiante</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Alerta
        </Button>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center hover:border-red-300 transition-colors group">
          <h3 className="text-4xl font-bold text-red-600 mb-1 group-hover:scale-110 transition-transform">
            {stats?.critico ?? 0}
          </h3>
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Riesgo Crítico</p>
        </Card>
        <Card className="text-center hover:border-amber-300 transition-colors group">
          <h3 className="text-4xl font-bold text-amber-500 mb-1 group-hover:scale-110 transition-transform">
            {stats?.medio ?? 0}
          </h3>
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Riesgo Medio</p>
        </Card>
        <Card className="text-center hover:border-emerald-300 transition-colors group">
          <h3 className="text-4xl font-bold text-emerald-600 mb-1 group-hover:scale-110 transition-transform">
            {stats?.bajo ?? 0}
          </h3>
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Normal</p>
        </Card>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filtroNivel}
          onChange={(e) => setFiltroNivel(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-primary"
        >
          <option value="">Todos los niveles</option>
          <option value="ROJO">Rojo</option>
          <option value="AMARILLO">Amarillo</option>
          <option value="VERDE">Verde</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-primary"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="RESUELTO">Resuelto</option>
          <option value="DESCARTADO">Descartado</option>
        </select>
        <input
          type="text"
          value={filtroPeriodo}
          onChange={(e) => setFiltroPeriodo(e.target.value)}
          placeholder="Periodo (ej: 2025-1)"
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-primary max-w-[160px]"
        />
        {(filtroNivel || filtroEstado || filtroPeriodo) && (
          <button
            onClick={() => { setFiltroNivel(''); setFiltroEstado(''); setFiltroPeriodo(''); }}
            className="text-xs text-red-500 hover:text-red-600 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="pb-3 pt-4 px-6 font-semibold">Estudiante</th>
                <th className="pb-3 pt-4 px-6 font-semibold">Descripción</th>
                <th className="pb-3 pt-4 px-6 font-semibold">Nivel</th>
                <th className="pb-3 pt-4 px-6 font-semibold">Seguimiento</th>
                <th className="pb-3 pt-4 px-6 font-semibold">Periodo</th>
                <th className="pb-3 pt-4 px-6 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alertas.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No hay alertas registradas
                  </td>
                </tr>
              )}
              {alertas.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-800">{item.estudiante_nombre || `ID: ${item.estudiante_id}`}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-slate-600 text-xs line-clamp-2 max-w-[200px]">{item.descripcion}</p>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getStatusVariant(item.nivel_riesgo)}>
                      {item.nivel_riesgo}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getTrackingVariant(item.estado_seguimiento)}>
                      {item.estado_seguimiento?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs text-slate-500">{item.periodo}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-brand-primary hover:text-brand-primary/80 underline underline-offset-4"
                        onClick={() => {
                          setSelectedAlertaId(item.id);
                          setShowActividadModal(true);
                        }}
                      >
                        Registrar actividad
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setSelectedEstadoAlerta(item);
                          setNuevoEstado(item.estado_seguimiento);
                          setShowEstadoModal(true);
                        }}
                      >
                        Estado ▾
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 text-xs"
                        onClick={() => {
                          setSelectedDeleteId(item.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* create alert modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) {
            setEstudianteValido(null);
            setEstudianteNombre(null);
            setErrorEstudiante(null);
          }
        }}
        title="Nueva Alerta"
        description="Registrar una nueva alerta de riesgo académico"
      >
        <form onSubmit={handleCreateAlerta} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">ID Estudiante *</label>
            <input
              type="text"
              value={form.estudiante_id}
              onChange={handleEstudianteIdChange}
              onBlur={handleBlurEstudianteId}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${
                estudianteValido === 'ok'
                  ? 'border-green-400 focus:border-green-500'
                  : estudianteValido === 'error'
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-slate-200 focus:border-brand-primary'
              }`}
              placeholder="Código o ID del estudiante"
            />
            {estudianteValido === 'checking' && (
              <p className="text-xs text-slate-400 mt-1">Verificando estudiante...</p>
            )}
            {estudianteValido === 'ok' && estudianteNombre && (
              <p className="text-xs text-green-600 mt-1 font-medium">✅ {estudianteNombre}</p>
            )}
            {estudianteValido === 'error' && errorEstudiante && (
              <p className="text-xs text-red-500 mt-1">❌ {errorEstudiante}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
              >
                <option value="ACADEMICA">Académica</option>
                <option value="ASISTENCIA">Asistencia</option>
                <option value="PSICOSOCIAL">Psicosocial</option>
                <option value="FINANCIERA">Financiera</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nivel de riesgo</label>
              <select
                value={form.nivel_riesgo}
                onChange={(e) => setForm({ ...form, nivel_riesgo: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
              >
                <option value="VERDE">Verde</option>
                <option value="AMARILLO">Amarillo</option>
                <option value="ROJO">Rojo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Periodo *</label>
            <input
              type="text"
              value={form.periodo}
              onChange={(e) => setForm({ ...form, periodo: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              placeholder="Ej: 2025-1"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Descripción *</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: createCharFilter(CharType.FULL_TEXT)(e.target.value) })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[80px]"
              maxLength={DESCRIPCION_MAX_LENGTH}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={crearAlerta.isPending}>
              Crear Alerta
            </Button>
          </div>
        </form>
      </Modal>

      {/* register activity modal */}
      <Modal
        open={showActividadModal}
        onOpenChange={setShowActividadModal}
        title="Registrar Actividad"
        description="Registrar una acción de seguimiento sobre esta alerta"
      >
        <form onSubmit={handleCreateActividad} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de actividad</label>
            <select
              value={actividadForm.tipo}
              onChange={(e) => setActividadForm({ ...actividadForm, tipo: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
            >
              <option value="LLAMADA">Llamada telefónica</option>
              <option value="VISITA">Visita domiciliaria</option>
              <option value="REUNION">Reunión presencial</option>
              <option value="CORREO">Correo electrónico</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Descripción *</label>
            <textarea
              value={actividadForm.descripcion}
              maxLength={DESCRIPCION_MAX_LENGTH}
              onChange={(e) => setActividadForm({ ...actividadForm, descripcion: createCharFilter(CharType.FULL_TEXT)(e.target.value) })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[80px] resize-none"
              placeholder="Describa la actividad realizada"
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-slate-400">{actividadForm.descripcion.length}/{DESCRIPCION_MAX_LENGTH}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Resultado</label>
            <input
              type="text"
              value={actividadForm.resultado}
              onChange={(e) => setActividadForm({ ...actividadForm, resultado: createCharFilter(CharType.FULL_TEXT)(e.target.value) })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              placeholder="Resultado o conclusión de la actividad"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowActividadModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={crearActividad.isPending}>
              Registrar
            </Button>
          </div>
        </form>
      </Modal>

      {/* estado change modal */}
      <Modal
        open={showEstadoModal}
        onOpenChange={(open) => {
          setShowEstadoModal(open);
          if (!open) setSelectedEstadoAlerta(null);
        }}
        title="Cambiar estado de alerta"
        description={selectedEstadoAlerta ? `Alerta #${selectedEstadoAlerta.id.slice(0, 8)} - ${selectedEstadoAlerta.estudiante_nombre || selectedEstadoAlerta.estudiante_id}` : ''}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg">
            <div>
              <p className="text-xs text-slate-500">Estado actual</p>
              <Badge variant={getTrackingVariant(selectedEstadoAlerta?.estado_seguimiento)}>
                {selectedEstadoAlerta?.estado_seguimiento?.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">Nivel de riesgo</p>
              <Badge variant={getStatusVariant(selectedEstadoAlerta?.nivel_riesgo)}>
                {selectedEstadoAlerta?.nivel_riesgo}
              </Badge>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nuevo estado</label>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none"
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="DESCARTADO">Descartado</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowEstadoModal(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (selectedEstadoAlerta) {
                  cambiarEstado.mutate(
                    { id: selectedEstadoAlerta.id, estado: nuevoEstado },
                    {
                      onSuccess: () => setShowEstadoModal(false),
                    }
                  );
                }
              }}
              isLoading={cambiarEstado.isPending}
              disabled={nuevoEstado === selectedEstadoAlerta?.estado_seguimiento}
            >
              Guardar cambio
            </Button>
          </div>
        </div>
      </Modal>

      {/* delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onOpenChange={(open) => {
          setShowDeleteModal(open);
          if (!open) setSelectedDeleteId(null);
        }}
        title="Eliminar Alerta"
        description="¿Está seguro de eliminar esta alerta? Esta acción no se puede deshacer."
      >
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={() => {
              if (selectedDeleteId) {
                eliminarAlerta.mutate(selectedDeleteId, {
                  onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedDeleteId(null);
                  },
                });
              }
            }}
            isLoading={eliminarAlerta.isPending}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

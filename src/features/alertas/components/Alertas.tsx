import React, { useState } from 'react';
import { useAlertas, useAlertasStats, useCrearAlerta, useCrearActividad } from '../hooks/useAlertas';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { Modal } from '@/src/shared/components/ui/Modal';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import { Plus } from 'lucide-react';

type NivelRiesgo = 'ROJO' | 'AMARILLO' | 'VERDE';
type EstadoSeguimiento = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';

export function Alertas() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActividadModal, setShowActividadModal] = useState(false);
  const [selectedAlertaId, setSelectedAlertaId] = useState<string | null>(null);

  const { data, isLoading, isError } = useAlertas();
  const { data: stats, isLoading: isLoadingStats } = useAlertasStats();
  const crearAlerta = useCrearAlerta();
  const crearActividad = useCrearActividad();

  const alertas = data?.alertas ?? [];

  const [form, setForm] = useState({
    estudiante_id: '',
    tipo: 'ACADEMICA',
    nivel_riesgo: 'AMARILLO',
    descripcion: '',
    periodo: '',
  });

  const [actividadForm, setActividadForm] = useState({
    tipo: 'LLAMADA',
    descripcion: '',
    resultado: '',
  });

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
    crearAlerta.mutate(form, {
      onSuccess: () => {
        setShowCreateModal(false);
        setForm({ estudiante_id: '', tipo: 'ACADEMICA', nivel_riesgo: 'AMARILLO', descripcion: '', periodo: '' });
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
          <div className="text-4xl font-bold text-red-600 mb-1 group-hover:scale-110 transition-transform">
            {stats?.por_nivel?.ROJO ?? 0}
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Riesgo Crítico</div>
        </Card>
        <Card className="text-center hover:border-amber-300 transition-colors group">
          <div className="text-4xl font-bold text-amber-500 mb-1 group-hover:scale-110 transition-transform">
            {stats?.por_nivel?.AMARILLO ?? 0}
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Riesgo Medio</div>
        </Card>
        <Card className="text-center hover:border-emerald-300 transition-colors group">
          <div className="text-4xl font-bold text-emerald-600 mb-1 group-hover:scale-110 transition-transform">
            {stats?.por_nivel?.VERDE ?? 0}
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Normal</div>
        </Card>
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
        onOpenChange={setShowCreateModal}
        title="Nueva Alerta"
        description="Registrar una nueva alerta de riesgo académico"
      >
        <form onSubmit={handleCreateAlerta} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">ID Estudiante *</label>
            <input
              type="text"
              value={form.estudiante_id}
              onChange={(e) => setForm({ ...form, estudiante_id: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
              placeholder="Código o ID del estudiante"
            />
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
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[80px] resize-none"
              placeholder="Describa la situación del estudiante"
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
              onChange={(e) => setActividadForm({ ...actividadForm, descripcion: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[80px] resize-none"
              placeholder="Describa la actividad realizada"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Resultado</label>
            <input
              type="text"
              value={actividadForm.resultado}
              onChange={(e) => setActividadForm({ ...actividadForm, resultado: e.target.value })}
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
    </div>
  );
}

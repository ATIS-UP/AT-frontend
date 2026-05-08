import React from 'react';
import { motion } from 'motion/react';
import { useAlertas, useAlertasStats } from '../hooks/useAlertas';
import { Button } from '@/src/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { NivelRiesgo, EstadoSeguimiento } from '../types/alertas.types';

export function Alertas() {
  const { data: alertas, isLoading: isLoadingAlertas } = useAlertas();
  const { data: stats, isLoading: isLoadingStats } = useAlertasStats();

  const getStatusVariant = (nivel: NivelRiesgo) => {
    switch (nivel) {
      case 'ROJO': return 'error';
      case 'AMARILLO': return 'warning';
      case 'VERDE': return 'success';
      default: return 'default';
    }
  };

  const getTrackingVariant = (estado: EstadoSeguimiento) => {
    switch (estado) {
      case 'PENDIENTE': return 'outline';
      case 'EN_PROCESO': return 'info';
      case 'RESUELTO': return 'success';
      default: return 'default';
    }
  };

  if (isLoadingAlertas || isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-primary">Alertas y Pérdidas</h2>
          <p className="text-secondary text-sm">Monitoreo de riesgo académico por estudiante</p>
        </div>
        <Button>
          Cargar Reporte de Notas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center hover:border-red-300 transition-colors cursor-pointer group">
          <div className="text-4xl font-bold text-red-600 mb-1 group-hover:scale-110 transition-transform">
            {stats?.critico || 0}
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Riesgo Crítico</div>
        </Card>
        <Card className="text-center hover:border-amber-300 transition-colors cursor-pointer group">
          <div className="text-4xl font-bold text-amber-500 mb-1 group-hover:scale-110 transition-transform">
            {stats?.medio || 0}
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Riesgo Medio</div>
        </Card>
        <Card className="text-center hover:border-emerald-300 transition-colors cursor-pointer group">
          <div className="text-4xl font-bold text-emerald-600 mb-1 group-hover:scale-110 transition-transform">
            {stats?.bajo || 0}
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Normal</div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="font-semibold text-slate-600 mr-2 flex items-center">Materias Filtro:</span>
        <Button variant="outline" size="sm" className="rounded-full">Álgebra Lineal (40%)</Button>
        <Button variant="outline" size="sm" className="rounded-full">Cálculo Diferencial (29%)</Button>
        <Button variant="outline" size="sm" className="rounded-full">Física (22%)</Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="pb-3 pt-4 px-6 font-semibold">Estudiante</th>
                <th className="pb-3 pt-4 px-6 font-semibold">Materia Crítica</th>
                <th className="pb-3 pt-4 px-6 font-semibold">Nivel</th>
                <th className="pb-3 pt-4 px-6 font-semibold">Seguimiento</th>
                <th className="pb-3 pt-4 px-6 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alertas?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-800">{item.estudiante}</p>
                    <p className="text-[10px] text-slate-500">Semestre {item.semestre}</p>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant="outline" className="bg-slate-50">
                      {item.materia} <span className="ml-1 text-slate-400">({item.repeticiones}x)</span>
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getStatusVariant(item.nivel)}>
                      {item.nivel}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getTrackingVariant(item.estado)}>
                      {item.estado.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark p-0 h-auto underline underline-offset-4">
                        Registrar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-800 p-0 h-auto underline underline-offset-4">
                        Mensaje
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
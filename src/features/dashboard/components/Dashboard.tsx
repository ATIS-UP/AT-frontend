import React from 'react';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  MoreVertical,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { Badge } from '@/shared/components/ui/Badge';

export const Dashboard = () => {
  const { data: resumen, isLoading: loadingResumen } = useQuery({
    queryKey: ['dashboard', 'resumen'],
    queryFn: () => dashboardService.resumen(),
    staleTime: 30000,
  });

  const { data: estados, isLoading: loadingEstados } = useQuery({
    queryKey: ['dashboard', 'estados'],
    queryFn: () => dashboardService.estados(),
    staleTime: 30000,
  });

  const { data: recientes, isLoading: loadingRecientes } = useQuery({
    queryKey: ['dashboard', 'recientes'],
    queryFn: () => dashboardService.recientes(10),
    staleTime: 30000,
  });

  const { data: actividadesData, isLoading: loadingActividades } = useQuery({
    queryKey: ['dashboard', 'actividades'],
    queryFn: () => dashboardService.actividadesRecientes(5),
    staleTime: 30000,
  });

  const isLoading = loadingResumen || loadingEstados || loadingRecientes || loadingActividades;

  // extract real values
  const estudiantesActivos = resumen?.estudiantes?.activos ?? 0;
  const totalAlertas = resumen?.alertas?.total ?? 0;
  const pendientes = resumen?.alertas?.pendientes ?? 0;
  const enProceso = resumen?.alertas?.en_proceso ?? 0;
  const resueltas = resumen?.alertas?.resueltas ?? 0;
  const criticas = resumen?.alertas?.criticas ?? 0;
  const casosTotal = pendientes + enProceso + resueltas || totalAlertas;

  // build trend data from resumen.tendencias (mostrar antiguo → reciente)
  const tendencias = resumen?.tendencias ?? [];
  const trendData = tendencias.length > 0
    ? [...tendencias].reverse().map((t) => ({ year: t.periodo, value: t.total }))
    : [{ year: 'Sin datos', value: 0 }];

  // build chart data from estados
  const nivelData = estados?.niveles_riesgo
    ? estados.niveles_riesgo.map((n) => ({ name: n.nivel, value: n.total }))
    : [];

  // risk breakdown for the bar
  const totalRojo = nivelData.find((d) => d.name === 'ROJO')?.value ?? criticas;
  const totalAmarillo = nivelData.find((d) => d.name === 'AMARILLO')?.value ?? 0;
  const totalVerde = nivelData.find((d) => d.name === 'VERDE')?.value ?? 0;
  const totalNiveles = totalRojo + totalAmarillo + totalVerde || 1;

  // recent alerts
  const alertasRecientes = recientes?.alertas_recientes ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel rounded-card p-5 h-[120px] animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-panel rounded-card p-6 h-[340px] animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/2 mb-6"></div>
              <div className="h-[250px] bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-card p-5 flex flex-col justify-between min-h-[120px]">
          <h3 className="text-slate-500 font-display text-[15px] font-semibold">Estudiantes activos</h3>
          <div className="flex items-end justify-between">
            <span className="font-display text-2xl font-bold text-brand-primary tracking-tight">
              {estudiantesActivos.toLocaleString()}
            </span>
            <TrendingUp className="text-brand-primary w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel rounded-card p-5 flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 font-display text-[15px] font-semibold">Encuestas</h3>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                <span>Pendientes</span>
                <span>{pendientes}</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-sm overflow-hidden">
                <div className="bg-brand-primary h-full" style={{ width: `${casosTotal ? (pendientes / casosTotal) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                <span>En proceso</span>
                <span>{enProceso}</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-sm overflow-hidden">
                <div className="bg-brand-secondary h-full" style={{ width: `${casosTotal ? (enProceso / casosTotal) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-card p-5 flex flex-col justify-between min-h-[120px]">
          <h3 className="text-slate-500 font-display text-[15px] font-semibold">Casos en seguimiento</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900 leading-none">{casosTotal}</span>
              <span className="text-[12px] text-slate-400">Totales</span>
            </div>
            <div className="w-full h-2 rounded-sm overflow-hidden flex shadow-inner">
              <div className="bg-red-500 h-full" style={{ width: `${(totalRojo / totalNiveles) * 100}%` }}></div>
              <div className="bg-amber-400 h-full" style={{ width: `${(totalAmarillo / totalNiveles) * 100}%` }}></div>
              <div className="bg-blue-300 h-full" style={{ width: `${(totalVerde / totalNiveles) * 100}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-medium tracking-tight">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-sm"></span>{totalRojo} Críticos</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-400 rounded-sm"></span>{totalAmarillo} Alerta</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-300 rounded-sm"></span>{totalVerde} Normal</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-card p-5 flex flex-col justify-between min-h-[120px] relative overflow-hidden">
          <h3 className="text-slate-500 font-display text-[15px] font-semibold">Alertas resueltas</h3>
          <div className="flex items-end justify-between mt-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-brand-primary">{resueltas}</span>
              <span className="text-sm text-slate-400">/ {casosTotal}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {casosTotal ? Math.round((resueltas / casosTotal) * 100) : 0}% Resuelto
            </span>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-10">
            <AlertTriangle className="w-20 h-20 text-brand-primary" />
          </div>
        </div>
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-card p-6 min-h-[340px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-lg font-bold text-slate-900 tracking-tight">Tendencia de alertas por período</h2>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#022448" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#022448" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#022448" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-card p-6 min-h-[340px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-lg font-bold text-slate-900 tracking-tight">Distribución por nivel de riesgo</h2>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full min-h-0">
            {nivelData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={nivelData} layout="vertical" margin={{ left: 60, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#022448" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Sin datos de alertas disponibles
              </div>
            )}
          </div>
        </div>
      </div>

      {/* alertas recientes */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          Alertas Recientes
          {alertasRecientes.length > 0 && (
            <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tight">
              {alertasRecientes.length} recientes
            </span>
          )}
        </h2>

        {alertasRecientes.length === 0 && (
          <p className="text-sm text-slate-400">No hay alertas recientes registradas.</p>
        )}

        {alertasRecientes.length > 0 && (
          <div className="glass-panel rounded-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50">
                    <th className="pb-3 pt-4 px-6 font-semibold">Estudiante</th>
                    <th className="pb-3 pt-4 px-6 font-semibold">Nivel</th>
                    <th className="pb-3 pt-4 px-6 font-semibold">Estado</th>
                    <th className="pb-3 pt-4 px-6 font-semibold">Período</th>
                    <th className="pb-3 pt-4 px-6 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alertasRecientes.map((alerta, idx) => (
                    <tr key={alerta.id ?? idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6 font-medium text-slate-800">
                        {alerta.estudiante_nombre || `ID: ${alerta.estudiante_id?.slice(0, 8)}...`}
                      </td>
                      <td className="py-3 px-6">
                        <Badge
                          variant={
                            alerta.nivel_riesgo === 'ROJO' ? 'error' :
                            alerta.nivel_riesgo === 'AMARILLO' ? 'warning' : 'success'
                          }
                        >
                          {alerta.nivel_riesgo}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        <Badge variant="outline">
                          {alerta.estado_seguimiento?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-6 text-xs text-slate-500">{alerta.periodo}</td>
                      <td className="py-3 px-6 text-xs text-slate-400">
                        {alerta.created_at ? new Date(alerta.created_at).toLocaleDateString('es-CO') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* actividades recientes */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          Actividades Recientes
          {actividadesData && actividadesData.actividades.length > 0 && (
            <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tight">
              {actividadesData.actividades.length} recientes
            </span>
          )}
        </h2>

        {!actividadesData || actividadesData.actividades.length === 0 ? (
          <p className="text-sm text-slate-400">No hay actividades recientes registradas.</p>
        ) : (
          <div className="glass-panel rounded-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50">
                    <th className="pb-3 pt-4 px-6 font-semibold">Tipo</th>
                    <th className="pb-3 pt-4 px-6 font-semibold">Estado</th>
                    <th className="pb-3 pt-4 px-6 font-semibold">Encargado</th>
                    <th className="pb-3 pt-4 px-6 font-semibold">Modalidad</th>
                    <th className="pb-3 pt-4 px-6 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actividadesData.actividades.map((act, idx) => (
                    <tr key={act.id ?? idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6">
                        <Badge variant="outline">{act.tipo}</Badge>
                      </td>
                      <td className="py-3 px-6">
                        <Badge variant={
                          act.estado === 'EN_CURSO' ? 'warning' :
                          act.estado === 'FINALIZADA' ? 'success' :
                          act.estado === 'CANCELADA' ? 'error' : 'default'
                        }>
                          {act.estado?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-700">{act.encargado}</td>
                      <td className="py-3 px-6 text-xs text-slate-500">{act.modalidad}</td>
                      <td className="py-3 px-6 text-xs text-slate-400">
                        {act.created_at ? new Date(act.created_at).toLocaleDateString('es-CO') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

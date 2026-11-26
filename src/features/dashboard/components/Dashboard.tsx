import { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  MoreVertical,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { Badge } from '@/shared/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { mostrarFechaActividad } from '@/features/actividades/utils/fechaActividad';

export const Dashboard = () => {
  const [paginaCasos, setPaginaCasos] = useState(1);
  const navigate = useNavigate();
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

  const { data: actividadesData, isLoading: loadingActividades } = useQuery({
    queryKey: ['dashboard', 'actividades'],
    queryFn: () => dashboardService.actividadesRecientes(5),
    staleTime: 30000,
  });

  const { data: casosData, isLoading: loadingCasos, isError: errorCasos } = useQuery({
    queryKey: ['dashboard', 'casos-recientes', paginaCasos],
    queryFn: () => dashboardService.casosRecientes(paginaCasos, 6),
    staleTime: 30000,
  });

  const isLoading = loadingResumen || loadingEstados || loadingActividades;

  // extract real values
  const estudiantesActivos = resumen?.estudiantes?.activos ?? 0;
  const totalAlertas = resumen?.alertas?.total ?? 0;
  const pendientes = resumen?.alertas?.pendientes ?? 0;
  const enProceso = resumen?.alertas?.en_proceso ?? 0;
  

  // Indicadores de casos especiales, basados en registros_casos_especiales.
  const casosTotal = resumen?.casos_especiales?.total ?? 0;
  const casosPendientes = resumen?.casos_especiales?.pendientes ?? 0;
  const casosActivos = resumen?.casos_especiales?.en_proceso ?? 0;
  const casosCerrados = resumen?.casos_especiales?.resueltas ?? 0;
  const casosDenominador = casosTotal || 1;
  const casosRecientes = casosData?.casos ?? [];
  const totalPaginasCasos = Math.ceil((casosData?.total ?? 0) / 6);

  // build trend data from resumen.tendencias (mostrar antiguo → reciente)
  const tendencias = resumen?.tendencias ?? [];
  const trendData = tendencias.length > 0
    ? [...tendencias].reverse().map((t) => ({ year: t.periodo, value: t.total }))
    : [{ year: 'Sin datos', value: 0 }];

  // build chart data from estados
  const nivelData = estados?.niveles_riesgo
    ? estados.niveles_riesgo.map((n) => ({ name: n.nivel, value: n.total }))
    : [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel rounded-card p-5 h-[7.5rem] animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-panel rounded-card p-6 h-[21.25rem] animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/2 mb-6"></div>
              <div className="h-[15.625rem] bg-slate-100 rounded"></div>
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
        <div className="glass-panel rounded-card p-5 flex flex-col justify-between min-h-[7.5rem]">
          <h3 className="text-slate-500 font-display text-[0.9375rem] font-semibold">Estudiantes activos</h3>
          <div className="flex items-end justify-between">
            <span className="font-display text-2xl font-bold text-brand-primary tracking-tight">
              {estudiantesActivos.toLocaleString()}
            </span>
            <TrendingUp className="text-brand-primary w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel rounded-card p-5 flex flex-col justify-between min-h-[7.5rem]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 font-display text-[0.9375rem] font-semibold">Alertas académicas</h3>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[0.6875rem] text-slate-600 font-medium">
                <span>Pendientes</span>
                <span>{pendientes}</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-sm overflow-hidden">
                <div className="bg-brand-primary h-full" style={{ width: `${totalAlertas ? (pendientes / totalAlertas) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[0.6875rem] text-slate-600 font-medium">
                <span>En proceso</span>
                <span>{enProceso}</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-sm overflow-hidden">
                <div className="bg-brand-secondary h-full" style={{ width: `${totalAlertas ? (enProceso / totalAlertas) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-card p-5 flex flex-col justify-between min-h-[7.5rem]">
          <h3 className="text-slate-500 font-display text-[0.9375rem] font-semibold">Casos Especiales</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900 leading-none">{casosTotal}</span>
              <span className="text-[0.75rem] text-slate-400">Totales</span>
            </div>
            <div className="w-full h-2 rounded-sm overflow-hidden flex shadow-inner bg-slate-200">
              <div className="bg-amber-400 h-full" style={{ width: `${(casosPendientes / casosDenominador) * 100}%` }} />
              <div className="bg-blue-400 h-full" style={{ width: `${(casosActivos / casosDenominador) * 100}%` }} />
              <div className="bg-emerald-500 h-full" style={{ width: `${(casosCerrados / casosDenominador) * 100}%` }} />            
            </div>
            <div className="flex justify-between text-[0.625rem] text-slate-500 font-medium tracking-tight">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-400 rounded-sm"></span>{casosPendientes} Pendientes</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-400 rounded-sm"></span>{casosActivos} Activos</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-sm"></span>{casosCerrados} Cerrados</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-card p-5 flex flex-col justify-between min-h-[7.5rem] relative overflow-hidden">
          <h3 className="text-slate-500 font-display text-[0.9375rem] font-semibold">Casos cerrados</h3>
          <div className="flex items-end justify-between mt-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-brand-primary">{casosCerrados}</span>
              <span className="text-sm text-slate-400">/ {casosTotal}</span>
            </div>
            <span className="text-[0.625rem] uppercase font-bold text-slate-500 tracking-wider">
              {casosTotal ? Math.round((casosCerrados / casosTotal) * 100) : 0}% Cerrado
            </span>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-10">
            <AlertTriangle className="w-20 h-20 text-brand-primary" />
          </div>
        </div>
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-card p-6 min-h-[21.25rem] flex flex-col">
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

        <div className="glass-panel rounded-card p-6 min-h-[21.25rem] flex flex-col">
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

      {/* Casos especiales recientes: datos reales y paginados */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-slate-900">Casos Especiales Recientes</h2>

        {loadingCasos ? (
          <p className="text-sm text-slate-500">Cargando casos especiales...</p>
        ) : errorCasos ? (
          <p className="text-sm text-red-600">No fue posible cargar los casos especiales.</p>
        ) : casosRecientes.length === 0 ? (
          <p className="text-sm text-slate-400">No hay casos especiales registrados en esta página.</p>
        ) : (
          <>
            <div className="glass-panel rounded-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 bg-slate-50">
                      <th className="py-3 px-4 font-semibold">Estudiante</th>
                      <th className="py-3 px-4 font-semibold">Tipo</th>
                      <th className="py-3 px-4 font-semibold">Estado</th>
                      <th className="py-3 px-4 font-semibold">Responsable</th>
                      <th className="py-3 px-4 font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {casosRecientes.map((caso) => (
                      <tr
                        key={caso.id}
                        tabIndex={0}
                        role="link"
                        className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors focus:outline-none"
                        onClick={() => navigate(`/casos-especiales?caso=${encodeURIComponent(caso.id)}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(`/casos-especiales?caso=${encodeURIComponent(caso.id)}`);
                          }
                        }}
                        title="Ir al módulo Casos Especiales"
                      >
                        <td className="py-3 px-4 font-medium text-slate-800">{caso.estudiante_nombre || 'Sin nombre'}</td>
                        <td className="py-3 px-4 text-slate-600">{caso.tipo.replaceAll('_', ' ')}</td>
                        <td className="py-3 px-4">
                          <Badge variant={caso.estado === 'CERRADO' ? 'success' : caso.estado === 'ACTIVO' ? 'info' : 'warning'}>
                            {caso.estado}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{caso.responsable_nombre}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {caso.created_at ? new Date(caso.created_at).toLocaleDateString('es-CO') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!loadingCasos && !errorCasos && totalPaginasCasos > 1 && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm text-slate-500">
              Página {paginaCasos} de {totalPaginasCasos} · {casosData?.total} casos
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={paginaCasos <= 1}
                onClick={() => setPaginaCasos((p) => Math.max(1, p - 1))}
                className="px-3 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={paginaCasos >= totalPaginasCasos}
                onClick={() => setPaginaCasos((p) => Math.min(totalPaginasCasos, p + 1))}
                className="px-3 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* próximas actividades (el backend ordena próximas primero y luego pasadas) */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          Próximas actividades
          {actividadesData && actividadesData.actividades.length > 0 && (
            <span className="bg-slate-200 text-slate-600 text-[0.625rem] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tight">
              {actividadesData.actividades.length} actividades
            </span>
          )}
        </h2>

        {!actividadesData || actividadesData.actividades.length === 0 ? (
          <p className="text-sm text-slate-400">No hay actividades registradas.</p>
        ) : (
          <div className="glass-panel rounded-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[0.625rem] bg-slate-50/50">
                    <th className="pb-3 pt-4 px-2 sm:px-4 lg:px-6 font-semibold">Tipo</th>
                    <th className="pb-3 pt-4 px-2 sm:px-4 lg:px-6 font-semibold">Estado</th>
                    <th className="pb-3 pt-4 px-2 sm:px-4 lg:px-6 font-semibold">Encargado</th>
                    <th className="pb-3 pt-4 px-2 sm:px-4 lg:px-6 font-semibold">Modalidad</th>
                    <th className="pb-3 pt-4 px-2 sm:px-4 lg:px-6 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {actividadesData.actividades.map((act, idx) => (
                  <tr
                    key={act.id ?? idx}
                    tabIndex={act.id ? 0 : -1}
                    role={act.id ? 'link' : undefined}
                    onClick={() => {
                      if (act.id) {
                        navigate(`/actividades?actividad=${encodeURIComponent(act.id)}`);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (act.id && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        navigate(`/actividades?actividad=${encodeURIComponent(act.id)}`);
                      }
                    }}
                    className={`transition-colors ${
                      act.id
                        ? 'cursor-pointer hover:bg-blue-50 focus:outline-none focus:bg-blue-50'
                        : 'hover:bg-slate-50/50'
                    }`}
                    title={act.id ? 'Ver detalles de la actividad' : undefined}
                  >
                      <td className="py-3 px-2 sm:px-4 lg:px-6">
                        <Badge variant="outline">{act.tipo}</Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4 lg:px-6">
                        <Badge variant={
                          act.estado === 'EN_CURSO' ? 'warning' :
                          act.estado === 'FINALIZADA' ? 'success' :
                          act.estado === 'CANCELADA' ? 'error' : 'default'
                        }>
                          {act.estado?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4 lg:px-6 text-sm text-slate-700">{act.encargado}</td>
                      <td className="py-3 px-2 sm:px-4 lg:px-6 text-xs text-slate-500">{act.modalidad}</td>
                      <td className="py-3 px-2 sm:px-4 lg:px-6 text-xs text-slate-400">
                        {act.fecha_inicio ? mostrarFechaActividad(act.fecha_inicio) : '—'}
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

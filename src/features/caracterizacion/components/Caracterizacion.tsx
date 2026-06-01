import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, MapPin, UserCheck, RefreshCw } from 'lucide-react';
import { useSocioeconomica, useProcedencia, useGenero } from '../hooks/useCaracterizacion';
import { cn } from '@/src/lib/utils';

const COLORS_ESTRATO = ['#022448', '#1a4a7a', '#2d6abf', '#5a95d5', '#88b8e8', '#b8d4f0'];
const COLOR_PROCEDENCIA = ['#022448', '#e2a83a'];
const COLORS_GENERO = ['#022448', '#e07eb3', '#64748b'];

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color?: 'brand' | 'amber' | 'emerald';
}) {
  const colorMap = {
    brand: 'text-brand-primary bg-brand-primary/10',
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
  };
  return (
    <div className="glass-panel rounded-card p-5 flex items-center gap-4">
      <div className={cn('p-3 rounded-xl shrink-0', colorMap[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, isLoading }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <div className="glass-panel rounded-card p-6 flex flex-col">
      <div className="mb-5">
        <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[220px]">
          <div className="w-7 h-7 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 min-h-[220px]">{children}</div>
      )}
    </div>
  );
}

const tooltipStyle = {
  borderRadius: '8px',
  border: 'none',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
};

export function Caracterizacion() {
  const [periodo, setPeriodo] = useState('');

  const { data: socio, isLoading: loadingSocio, refetch: refetchSocio } = useSocioeconomica(periodo || undefined);
  const { data: proc, isLoading: loadingProc, refetch: refetchProc } = useProcedencia(periodo || undefined);
  const { data: gen, isLoading: loadingGen, refetch: refetchGen } = useGenero(periodo || undefined);

  const isLoading = loadingSocio || loadingProc || loadingGen;
  const total = socio?.total_estudiantes ?? 0;

  const handleRefresh = () => { refetchSocio(); refetchProc(); refetchGen(); };

  // Derived stats
  const locales = proc?.datos.find(d => d.codigo === 'LOCAL')?.cantidad ?? 0;
  const foraneos = proc?.datos.find(d => d.codigo === 'FORANEO')?.cantidad ?? 0;
  const hombres = gen?.datos.find(d => d.codigo === 'H')?.cantidad ?? 0;

  return (
    <div className="space-y-8 fade-in">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-brand-primary">Caracterización</h2>
          <p className="text-slate-500 text-sm mt-0.5">Perfil socioeconómico de estudiantes activos</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
            placeholder="Periodo (ej: 2025-1)"
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-primary w-40"
          />
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-brand-primary hover:border-brand-primary transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            Actualizar
          </button>
        </div>
      </div>

      {/* summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Estudiantes activos" value={total} color="brand" />
        <StatCard icon={MapPin} label="Locales / Foráneos" value={`${locales} / ${foraneos}`} sub="procedencia" color="amber" />
        <StatCard icon={UserCheck} label="Hombres" value={hombres} sub={`de ${total} estudiantes`} color="emerald" />
      </div>

      {/* charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1 — Estrato histogram */}
        <ChartCard
          title="Distribución por estrato socioeconómico"
          subtitle="Cantidad de estudiantes por nivel de estrato"
          isLoading={loadingSocio}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={socio?.por_estrato ?? []}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [v, 'Estudiantes']}
              />
              <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                {(socio?.por_estrato ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS_ESTRATO[i % COLORS_ESTRATO.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* grouped summary below the chart */}
          {socio && socio.agrupado.length > 0 && (
            <div className="mt-4 flex gap-3 flex-wrap">
              {socio.agrupado.map(g => (
                <div key={g.grupo} className="flex-1 min-w-[100px] bg-slate-50 rounded-lg px-3 py-2 text-center border border-slate-100">
                  <p className="text-lg font-bold text-slate-800">{g.cantidad}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{g.grupo}</p>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* 2 — Procedencia bar chart */}
        <ChartCard
          title="Procedencia"
          subtitle="Locales vs foráneos"
          isLoading={loadingProc}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={proc?.datos ?? []}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              barCategoryGap="40%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="procedencia" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [v, 'Estudiantes']}
              />
              <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                {(proc?.datos ?? []).map((_, i) => (
                  <Cell key={i} fill={COLOR_PROCEDENCIA[i % COLOR_PROCEDENCIA.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {proc && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {proc.datos.map((d, i) => {
                const pct = proc.total_estudiantes > 0
                  ? Math.round((d.cantidad / proc.total_estudiantes) * 100)
                  : 0;
                return (
                  <div key={d.codigo} className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLOR_PROCEDENCIA[i] }} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{d.cantidad} <span className="text-xs font-normal text-slate-400">({pct}%)</span></p>
                      <p className="text-[10px] text-slate-500">{d.procedencia}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>

        {/* 3 — Género pie chart */}
        <ChartCard
          title="Distribución por género"
          subtitle="Composición de género del cuerpo estudiantil"
          isLoading={loadingGen}
        >
          <div className="flex items-center gap-4 h-[220px]">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={gen?.datos ?? []}
                  dataKey="cantidad"
                  nameKey="genero"
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="80%"
                  paddingAngle={3}
                >
                  {(gen?.datos ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS_GENERO[i % COLORS_GENERO.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [v, 'Estudiantes']}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* legend */}
            <div className="flex-1 flex flex-col gap-2.5">
              {(gen?.datos ?? []).map((d, i) => {
                const pct = (gen?.total_estudiantes ?? 0) > 0
                  ? Math.round((d.cantidad / gen!.total_estudiantes) * 100)
                  : 0;
                return (
                  <div key={d.codigo} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS_GENERO[i] }} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-none">{d.cantidad}</p>
                      <p className="text-[10px] text-slate-500">{d.genero} · {pct}%</p>
                    </div>
                  </div>
                );
              })}
              {gen && (
                <div className="mt-1 pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400">Total: <span className="font-semibold text-slate-600">{gen.total_estudiantes}</span></p>
                </div>
              )}
            </div>
          </div>
        </ChartCard>

        {/* 4 — Estrato grouped summary card */}
        <ChartCard
          title="Estrato agrupado"
          subtitle="Bajo (1-2) · Medio (3-4) · Alto (5-6)"
          isLoading={loadingSocio}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={socio?.agrupado ?? []}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              barCategoryGap="35%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="grupo" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [v, 'Estudiantes']}
              />
              <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                <Cell fill="#022448" />
                <Cell fill="#1a4a7a" />
                <Cell fill="#5a95d5" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}

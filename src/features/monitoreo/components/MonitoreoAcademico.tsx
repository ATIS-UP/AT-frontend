import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { BookOpen, Users, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { useMateriasDificultad } from '../hooks/useMonitoreo';
import { cn } from '@/src/lib/utils';

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color?: 'brand' | 'amber' | 'emerald' | 'purple';
}) {
  const colorMap = {
    brand: 'text-brand-primary bg-brand-primary/10',
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
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

const COLORS_BAR = ['#022448', '#1a4a7a', '#2d6abf', '#e07eb3', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6'];

export function MonitoreoAcademico() {
  const [periodo, setPeriodo] = useState('');
  const { data, isLoading, refetch } = useMateriasDificultad(periodo || undefined);

  const materias = data?.materias ?? [];

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-brand-primary">Monitoreo Académico</h2>
          <p className="text-slate-500 text-sm mt-0.5">Necesidades académicas reportadas por estudiantes de primer semestre</p>
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
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-brand-primary hover:border-brand-primary transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Estudiantes 1er semestre" value={data?.total_estudiantes ?? 0} color="brand" />
        <StatCard icon={DollarSign} label="Ingreso familiar prom." value={data ? `$${(data.ingreso_familiar_promedio / 1000000).toFixed(2)}M` : '—'} color="amber" />
        <StatCard icon={TrendingUp} label="Ciencias exactas" value={data ? `${data.porcentaje_ciencias_exactas}%` : '—'} sub="del total de menciones" color="purple" />
        <StatCard icon={BookOpen} label="Total menciones" value={data?.total_menciones ?? 0} color="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard
          title="Materias con mayor dificultad"
          subtitle="Cantidad de estudiantes que reportaron dificultad por materia"
          isLoading={isLoading}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={materias}
              layout="vertical"
              margin={{ top: 4, right: 40, left: 120, bottom: 4 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <YAxis type="category" dataKey="materia" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} width={140} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [v, 'Estudiantes']}
              />
              <Bar dataKey="cantidad" radius={[0, 4, 4, 0]} barSize={24}>
                {materias.map((_, i) => (
                  <Cell key={i} fill={COLORS_BAR[i % COLORS_BAR.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

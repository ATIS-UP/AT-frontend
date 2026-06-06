import React, { useState, useRef, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import {
  Activity, Upload, Download, FileSpreadsheet,
  CheckCircle, XCircle, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { useTcbu, useCargaTcbu } from '../hooks/useBienestar';
import { bienestarService, type CargaResult } from '../services/bienestarService';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/lib/utils';

// ── colour palette: 10 distinct, accessible colours ──────────────────────────
const SERIES_COLOR: Record<string, string> = {
  'Cultural':        '#6366f1',
  'Inclusión':       '#06b6d4',
  'Act. Física':     '#10b981',
  'Salud':           '#f59e0b',
  'Socioeconómica':  '#ef4444',
  'Espiritual':      '#8b5cf6',
  'Psicológica':     '#ec4899',
  'Odontología':     '#14b8a6',
  'Alimentación':    '#f97316',
  'SIMUP':           '#022448',
};

const DASH_PATTERNS = [undefined, '5 5', '10 3', '5 2 2 2', '3 3', undefined, '5 5', '10 3', '5 2 2 2', '3 3'];

// Period options come from the API — no hardcoded list needed.

// ── custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-bold text-slate-700 mb-2 text-[11px]">{label}</p>
      {sorted.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="text-slate-600">{entry.dataKey}</span>
          </div>
          <span className="font-bold text-slate-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── upload panel (step machine) ───────────────────────────────────────────────
type UploadStep = 'idle' | 'ready' | 'uploading' | 'done';

function UploadPanel() {
  const [step, setStep] = useState<UploadStep>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CargaResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const carga = useCargaTcbu();

  const handleFile = useCallback((f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') return;
    setFile(f);
    setStep('ready');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = () => {
    if (!file) return;
    setStep('uploading');
    carga.mutate(file, {
      onSuccess: (data) => { setResult(data); setStep('done'); },
      onError: () => setStep('ready'),
    });
  };

  const handleReset = () => { setFile(null); setResult(null); setStep('idle'); };

  const handleDownloadTemplate = async () => {
    const { blob, filename } = await apiClient.downloadBlob('/api/bienestar/tcbu/plantilla');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'plantilla_bienestar_tcbu.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  };

  return (
    <div className="glass-panel rounded-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900">Cargar datos TCBU</h3>
          <p className="text-xs text-slate-400 mt-0.5">CSV / XLSX — formato horizontal (una fila por periodo)</p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-1.5 text-xs text-brand-primary hover:underline"
        >
          <Download className="w-3 h-3" />
          Plantilla
        </button>
      </div>

      {/* ── idle / ready: drop zone ── */}
      {(step === 'idle' || step === 'ready') && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center',
            step === 'ready'
              ? 'border-brand-primary/50 bg-brand-primary/5'
              : 'border-slate-300 hover:border-slate-400 bg-white',
          )}
        >
          <input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleChange} />
          <FileSpreadsheet className={cn('w-8 h-8', step === 'ready' ? 'text-brand-primary' : 'text-slate-400')} />
          {step === 'idle' ? (
            <>
              <p className="text-sm font-medium text-slate-600">Arrastra un archivo o haz clic</p>
              <p className="text-xs text-slate-400">CSV o XLSX, formato horizontal</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-brand-primary">{file?.name}</p>
              <p className="text-xs text-slate-400">{((file?.size ?? 0) / 1024).toFixed(1)} KB</p>
            </>
          )}
        </div>
      )}

      {step === 'ready' && (
        <div className="flex gap-2">
          <Button onClick={handleUpload} className="flex-1" isLoading={false}>
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Cargar
          </Button>
          <Button variant="outline" onClick={handleReset}>Cancelar</Button>
        </div>
      )}

      {/* ── uploading ── */}
      {step === 'uploading' && (
        <div className="flex items-center justify-center gap-3 py-4 text-sm text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-primary" />
          Procesando archivo…
        </div>
      )}

      {/* ── result ── */}
      {step === 'done' && result && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              <p className="text-lg font-bold text-emerald-700">{result.insertados}</p>
              <p className="text-[10px] text-emerald-600 font-medium">Insertados</p>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-2">
              <p className="text-lg font-bold text-sky-700">{result.actualizados}</p>
              <p className="text-[10px] text-sky-600 font-medium">Actualizados</p>
            </div>
            <div className={cn('border rounded-lg p-2', result.errores.length ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200')}>
              <p className={cn('text-lg font-bold', result.errores.length ? 'text-red-700' : 'text-slate-500')}>{result.errores.length}</p>
              <p className={cn('text-[10px] font-medium', result.errores.length ? 'text-red-600' : 'text-slate-400')}>Errores</p>
            </div>
          </div>
          {result.errores.length > 0 && (
            <div className="max-h-24 overflow-y-auto space-y-1">
              {result.errores.map((e, i) => (
                <p key={i} className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                  Fila {e.fila}: {e.error}
                </p>
              ))}
            </div>
          )}
          <Button variant="outline" onClick={handleReset} className="w-full">
            Cargar otro archivo
          </Button>
        </div>
      )}
    </div>
  );
}

// ── main view ─────────────────────────────────────────────────────────────────
export function BienestarTCBU() {
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFin, setPeriodoFin] = useState('');
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  // fetch all data without filters to always have the full period list for selectors
  const { data: allData } = useTcbu();
  const { data, isLoading, refetch } = useTcbu({
    periodo_inicio: periodoInicio || undefined,
    periodo_fin: periodoFin || undefined,
  });

  const allPeriodos = allData?.periodos ?? [];
  const servicios = data?.servicios ?? [];
  const series = data?.series ?? [];

  const toggleSerie = (s: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const allVisible = hiddenSeries.size === 0;
  const toggleAll = () => setHiddenSeries(allVisible ? new Set(servicios) : new Set());

  // totals per service for the summary row
  const totals = servicios.map((s) => ({
    servicio: s,
    total: series.reduce((acc, row) => acc + ((row[s] as number) || 0), 0),
    max: Math.max(...series.map((row) => (row[s] as number) || 0)),
  }));

  return (
    <div className="space-y-6 fade-in">
      {/* ── header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-brand-primary">Bienestar TCBU</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Tasa de Cobertura de Bienestar Universitario · 10 servicios · 9 periodos
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={periodoInicio}
            onChange={(e) => setPeriodoInicio(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-primary bg-white"
          >
            <option value="">Desde</option>
            {allPeriodos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <span className="text-slate-400 text-xs">—</span>
          <select
            value={periodoFin}
            onChange={(e) => setPeriodoFin(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-primary bg-white"
          >
            <option value="">Hasta</option>
            {allPeriodos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── series toggle pills ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={toggleAll}
          className={cn(
            'text-[0.6875rem] font-bold px-3 py-1 rounded-full border transition-colors',
            allVisible
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white text-slate-500 border-slate-300 hover:border-slate-500',
          )}
        >
          {allVisible ? 'Ocultar todos' : 'Mostrar todos'}
        </button>
        {servicios.map((s, i) => {
          const active = !hiddenSeries.has(s);
          return (
            <button
              key={s}
              onClick={() => toggleSerie(s)}
              className={cn(
                'text-[0.6875rem] font-semibold px-3 py-1 rounded-full border transition-all',
                active
                  ? 'text-white border-transparent'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400',
              )}
              style={active ? { background: SERIES_COLOR[s] ?? '#6b7280', borderColor: SERIES_COLOR[s] } : undefined}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* ── main chart ── */}
      <div className="glass-panel rounded-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold text-slate-900">
            Evolución por servicio
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Activity className="w-3.5 h-3.5" />
            {series.length} periodos
          </div>
        </div>

        {isLoading ? (
          <div className="h-[26.25rem] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
          </div>
        ) : series.length === 0 ? (
          <div className="h-[26.25rem] flex flex-col items-center justify-center text-slate-400">
            <Activity className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">Sin datos para el rango seleccionado</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={series} margin={{ top: 8, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="periodo"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {servicios.map((s, i) => (
                hiddenSeries.has(s) ? null : (
                  <Line
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke={SERIES_COLOR[s] ?? '#6b7280'}
                    strokeWidth={2}
                    strokeDasharray={DASH_PATTERNS[i]}
                    dot={{ r: 3, fill: SERIES_COLOR[s] ?? '#6b7280', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── totals + upload ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* totals table */}
        <div className="lg:col-span-2 glass-panel rounded-card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resumen acumulado
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[0.625rem] uppercase tracking-wider text-slate-400">
                  <th className="text-left px-5 py-2 font-semibold">Servicio</th>
                  <th className="text-right px-5 py-2 font-semibold">Total</th>
                  <th className="text-right px-5 py-2 font-semibold">Máx. periodo</th>
                  <th className="px-5 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {totals
                  .sort((a, b) => b.total - a.total)
                  .map(({ servicio, total, max }) => (
                    <tr key={servicio} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-2.5 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: SERIES_COLOR[servicio] ?? '#6b7280' }}
                        />
                        <span className="text-slate-700 font-medium">{servicio}</span>
                      </td>
                      <td className="px-5 py-2.5 text-right font-bold text-slate-800">
                        {total.toLocaleString()}
                      </td>
                      <td className="px-5 py-2.5 text-right text-slate-500">{max}</td>
                      <td className="px-5 py-2.5 w-24">
                        <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${totals[0].total > 0 ? (total / totals[0].total) * 100 : 0}%`,
                              background: SERIES_COLOR[servicio] ?? '#6b7280',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* upload panel */}
        <UploadPanel />
      </div>
    </div>
  );
}

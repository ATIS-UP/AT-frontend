import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesService } from '../services/estudiantesService';
import { useNotificationStore } from '@/shared/stores/notification.store';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/lib/utils';
import { PROGRAMAS } from '../constants/programas';

interface UploadResult {
  insertadas: number;
  actualizadas: number;
  errores: number;
  detalle_errores: Array<{ fila: number; campo?: string; error?: string; mensaje?: string }>;
}

type Step = 'select' | 'preview' | 'uploading' | 'result';

// ── column spec used both for the inline table and the doc comment ────────────
const COLUMNS = [
  { key: 'nombres',   label: 'nombres',   req: true,  example: 'María' },
  { key: 'apellidos', label: 'apellidos', req: true,  example: 'González' },
  { key: 'documento', label: 'documento', req: false, example: '1098765432' },
  { key: 'telefono',  label: 'telefono',  req: false, example: '3001234567' },
  { key: 'email',     label: 'email',     req: false, example: 'maria@uni.edu.co' },
  { key: 'programa',  label: 'programa',  req: true,  example: 'Ing. Sistemas' },
  { key: 'semestre',  label: 'semestre',  req: true,  example: '3' },
  { key: 'estado',    label: 'estado',    req: false, example: 'ACTIVO' },
  { key: 'sede',      label: 'sede',      req: false, example: 'PAMPLONA' },
];

// ── horizontal spreadsheet preview of the template ────────────────────────────
function FormatoHorizontal() {
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs whitespace-nowrap">
          {/* header = column names */}
          <thead>
            <tr className="bg-brand-primary/10 border-b border-brand-primary/20">
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-3 py-2 text-left font-bold text-brand-primary font-mono">
                  {c.label}
                  {c.req && <span className="text-red-500 ml-0.5">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          {/* one example data row */}
          <tbody>
            <tr className="bg-slate-50/70">
              {COLUMNS.map((c) => (
                <td key={c.key} className="px-3 py-2 text-slate-500 font-mono">
                  {c.example}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400 px-3 py-1.5 border-t border-slate-100 bg-white">
        <span className="text-red-500 font-bold">*</span> campos obligatorios · La primera fila debe ser exactamente el encabezado mostrado · columnas opcionales pueden omitirse
      </p>
    </div>
  );
}

export const CargaMasiva = ({ onClose }: { onClose?: () => void }) => {
  const [step, setStep] = useState<Step>('select');
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  const uploadMutation = useMutation({
    mutationFn: (f: File) => estudiantesService.cargaMasiva(f),
    onSuccess: (data) => {
      setResult(data);
      setStep('result');
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      notify({
        type: data.detalle_errores.length > 0 ? 'warning' : 'success',
        message: `Carga completada: ${data.insertadas} insertadas, ${data.actualizadas} actualizadas` +
          (data.errores ? `, ${data.errores} con errores` : ''),
      });
    },
    onError: (error: any) => {
      setStep('select');
      notify({
        type: 'error',
        message: error?.message || 'Error al procesar el archivo. Verifica el formato.',
      });
    },
  });

  const processFile = useCallback((selected: File) => {
    const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();
    if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
      notify({ type: 'error', message: 'Solo se aceptan archivos .csv o .xlsx' });
      return;
    }
    setFile(selected);
    if (ext === '.csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        setPreviewRows(lines.slice(0, 6).map((l) => l.split(',').map((c) => c.trim())));
        setStep('preview');
      };
      reader.readAsText(selected);
    } else {
      setPreviewRows([]);
      setStep('preview');
    }
  }, [notify]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleDownloadTemplate = async () => {
    try {
      const { blob, filename } = await estudiantesService.descargarPlantilla();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename || 'plantilla_estudiantes.csv';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    } catch {
      notify({ type: 'error', message: 'No se pudo descargar la plantilla' });
    }
  };

  const handleReset = () => { setFile(null); setPreviewRows([]); setResult(null); setStep('select'); };

  return (
    <div className="space-y-5">

      {/* ── step: select ─────────────────────────────────────── */}
      {step === 'select' && (
        <>
          {/* download + drop zone row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* download template button */}
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-brand-primary/30 bg-brand-primary/5
                         text-brand-primary text-sm font-semibold hover:bg-brand-primary/10 transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              Descargar plantilla CSV
            </button>

            {/* drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex-1 flex items-center justify-center gap-3 rounded-lg border-2 border-dashed p-5 cursor-pointer transition-colors',
                isDragging
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-slate-300 hover:border-brand-primary/50 hover:bg-slate-50',
              )}
            >
              <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
              <Upload className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">Arrastra tu archivo aquí o <span className="text-brand-primary underline underline-offset-2">seleccionar</span></p>
                <p className="text-xs text-slate-400 mt-0.5">.csv o .xlsx · máx. 5 000 registros</p>
              </div>
            </div>
          </div>

          {/* horizontal format preview — always visible */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Formato del archivo (horizontal)
            </p>
            <FormatoHorizontal />
            <details className="mt-2">
              <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-700 font-medium">
                Carreras disponibles ({PROGRAMAS.length}) — haz clic para ver
              </summary>
              <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-1">
                {PROGRAMAS.map((p) => (
                  <span key={p} className="text-[10px] text-slate-500 truncate">{p}</span>
                ))}
              </div>
            </details>
          </div>
        </>
      )}

      {/* ── step: preview ─────────────────────────────────────── */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <FileSpreadsheet className="w-4 h-4 text-brand-primary shrink-0" />
            <span className="font-medium truncate">{file?.name}</span>
            <span className="text-slate-400 shrink-0">({((file?.size ?? 0) / 1024).toFixed(1)} KB)</span>
            <button onClick={handleReset} className="ml-auto text-slate-400 hover:text-slate-600 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {previewRows.length > 0 ? (
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Vista previa (primeras {previewRows.length - 1} filas de datos)</p>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {previewRows[0]?.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left font-bold text-slate-500 uppercase tracking-wide font-mono">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(1).map((row, ri) => (
                      <tr key={ri} className={cn('border-t border-slate-100', ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-1.5 text-slate-600 font-mono">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 bg-slate-50 rounded-lg p-4 text-center">
              Vista previa no disponible para .xlsx — el archivo se procesará en el servidor.
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleReset}>Cambiar archivo</Button>
            <Button onClick={() => { setStep('uploading'); uploadMutation.mutate(file!); }}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Confirmar carga
            </Button>
          </div>
        </div>
      )}

      {/* ── step: uploading ─────────────────────────────────────── */}
      {step === 'uploading' && (
        <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Procesando archivo…</span>
        </div>
      )}

      {/* ── step: result ─────────────────────────────────────── */}
      {step === 'result' && result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-black text-emerald-700">{result.insertadas}</p>
              <p className="text-xs text-emerald-600 font-medium">Insertadas</p>
            </div>
            <div className="text-center p-4 bg-sky-50 border border-sky-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-sky-500 mx-auto mb-1" />
              <p className="text-2xl font-black text-sky-700">{result.actualizadas}</p>
              <p className="text-xs text-sky-600 font-medium">Actualizadas</p>
            </div>
            <div className={cn('text-center p-4 border rounded-lg', result.detalle_errores.length ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100')}>
              <XCircle className={cn('w-5 h-5 mx-auto mb-1', result.detalle_errores.length ? 'text-red-500' : 'text-slate-300')} />
              <p className={cn('text-2xl font-black', result.detalle_errores.length ? 'text-red-700' : 'text-slate-400')}>{result.detalle_errores.length}</p>
              <p className={cn('text-xs font-medium', result.detalle_errores.length ? 'text-red-600' : 'text-slate-400')}>Errores</p>
            </div>
          </div>

          {result.detalle_errores.length > 0 && (
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-xs font-bold text-red-600 border-b border-red-100">
                <AlertTriangle className="w-3.5 h-3.5" />
                {result.detalle_errores.length} error{result.detalle_errores.length !== 1 ? 'es' : ''} encontrado{result.detalle_errores.length !== 1 ? 's' : ''}
              </div>
              <ul className="divide-y divide-red-50 max-h-96 overflow-y-auto">
                {result.detalle_errores.map((err, i) => (
                  <li key={i} className="px-3 py-1.5 text-xs text-red-700 font-mono">
                    Fila {err.fila}{err.campo ? ` · ${err.campo}` : ''}: {err.error ?? err.mensaje ?? 'error desconocido'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleReset}>Cargar otro archivo</Button>
          </div>
        </div>
      )}
    </div>
  );
};

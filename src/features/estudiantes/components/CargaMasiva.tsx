import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesService } from '../services/estudiantesService';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import { Modal } from '@/src/shared/components/ui/Modal';
import { Button } from '@/src/shared/components/ui/Button';

interface UploadResult {
  insertadas: number;
  actualizadas: number;
  errores: Array<{ fila: number; mensaje: string }>;
}

type Step = 'select' | 'preview' | 'uploading' | 'result';

const FORMAT_COLUMNS = [
  { columna: 'codigo', tipo: 'Texto', requerido: true, descripcion: 'Código único del estudiante', ejemplo: '20201001' },
  { columna: 'nombres', tipo: 'Texto', requerido: true, descripcion: 'Nombres del estudiante', ejemplo: 'Carlos' },
  { columna: 'apellidos', tipo: 'Texto', requerido: true, descripcion: 'Apellidos del estudiante', ejemplo: 'Mendoza Torres' },
  { columna: 'documento', tipo: 'Texto', requerido: false, descripcion: 'Número de documento', ejemplo: '1098765432' },
  { columna: 'telefono', tipo: 'Texto', requerido: false, descripcion: 'Número de teléfono', ejemplo: '3001234567' },
  { columna: 'email', tipo: 'Texto', requerido: false, descripcion: 'Correo electrónico', ejemplo: 'carlos@unipamplona.edu.co' },
  { columna: 'programa', tipo: 'Texto', requerido: true, descripcion: 'Programa académico', ejemplo: 'Ingeniería de Sistemas' },
  { columna: 'semestre', tipo: 'Número', requerido: true, descripcion: 'Semestre actual (1-15)', ejemplo: '8' },
  { columna: 'estado', tipo: 'Texto', requerido: false, descripcion: 'Estado (ACTIVO, INACTIVO, GRADUADO, SUSPENDIDO)', ejemplo: 'ACTIVO' },
];

export const CargaMasiva = ({ onClose }: { onClose?: () => void }) => {
  const [step, setStep] = useState<Step>('select');
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [showFormatModal, setShowFormatModal] = useState(false);

  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  const uploadMutation = useMutation({
    mutationFn: (f: File) => estudiantesService.cargaMasiva(f),
    onSuccess: (data) => {
      setResult(data);
      setStep('result');
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      notify({
        type: data.errores.length > 0 ? 'warning' : 'success',
        message: `Carga completada: ${data.insertadas} insertadas, ${data.actualizadas} actualizadas`,
      });
    },
    onError: () => {
      setStep('select');
      notify({ type: 'error', message: 'Error al procesar el archivo' });
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(selected.type) && !validExtensions.includes(ext)) {
      notify({ type: 'error', message: 'Solo se aceptan archivos .csv o .xlsx' });
      return;
    }

    setFile(selected);

    // preview first 10 rows for csv files
    if (ext === '.csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        const rows = lines.slice(0, 11).map((line) => line.split(',').map((c) => c.trim()));
        setPreviewRows(rows);
        setStep('preview');
      };
      reader.readAsText(selected);
    } else {
      // for xlsx we cannot preview client-side without a library; skip to preview step
      setPreviewRows([]);
      setStep('preview');
    }
  }, [notify]);

  const handleUpload = () => {
    if (!file) return;
    setStep('uploading');
    uploadMutation.mutate(file);
  };

  const handleReset = () => {
    setFile(null);
    setPreviewRows([]);
    setResult(null);
    setStep('select');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-slate-800">Carga masiva de estudiantes</h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">
            Cerrar
          </button>
        )}
      </div>

      {/* step: select file */}
      {step === 'select' && (
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 rounded-card p-10 cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all">
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="text-sm text-slate-600 font-medium">
              Seleccionar archivo .csv o .xlsx
            </span>
            <span className="text-xs text-slate-400">Máximo 5000 registros por archivo</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFormatModal(true)}
            >
              <Info className="w-4 h-4 mr-1" />
              Ver formato esperado
            </Button>
          </div>
        </div>
      )}

      {/* step: preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <FileSpreadsheet className="w-4 h-4 text-brand-primary" />
            <span className="font-medium">{file?.name}</span>
            <span className="text-slate-400">({(file!.size / 1024).toFixed(1)} KB)</span>
          </div>

          {previewRows.length > 0 && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    {previewRows[0]?.map((header, i) => (
                      <th key={i} className="px-3 py-2 text-left font-bold text-slate-500 uppercase">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(1, 11).map((row, ri) => (
                    <tr key={ri} className="border-t border-slate-100">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-1.5 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {previewRows.length === 0 && (
            <p className="text-sm text-slate-500">
              Vista previa no disponible para archivos .xlsx. El archivo se procesará en el servidor.
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-btn text-sm font-medium hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-brand-primary text-white rounded-btn text-sm font-bold hover:bg-brand-primary/90 transition-all"
            >
              Confirmar carga
            </button>
          </div>
        </div>
      )}

      {/* step: uploading */}
      {step === 'uploading' && (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Procesando archivo...</span>
        </div>
      )}

      {/* step: result */}
      {step === 'result' && result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-lg font-bold text-emerald-700">{result.insertadas}</p>
                <p className="text-xs text-emerald-600">Insertadas</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold text-blue-700">{result.actualizadas}</p>
                <p className="text-xs text-blue-600">Actualizadas</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-lg font-bold text-red-700">{result.errores.length}</p>
                <p className="text-xs text-red-600">Errores</p>
              </div>
            </div>
          </div>

          {result.errores.length > 0 && (
            <div className="border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="flex items-center gap-1 mb-2 text-xs font-bold text-red-600">
                <AlertTriangle className="w-3 h-3" />
                Errores encontrados
              </div>
              <ul className="space-y-1 text-xs text-red-700">
                {result.errores.map((err, i) => (
                  <li key={i}>
                    Fila {err.fila}: {err.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-brand-primary text-white rounded-btn text-sm font-bold hover:bg-brand-primary/90 transition-all"
            >
              Cargar otro archivo
            </button>
          </div>
        </div>
      )}
      <Modal
        open={showFormatModal}
        onOpenChange={setShowFormatModal}
        title="Formato esperado"
        description="Columnas del archivo CSV/XLSX y tipo de datos esperados"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="pb-2 pr-4 font-bold">Columna</th>
                <th className="pb-2 pr-4 font-bold">Tipo</th>
                <th className="pb-2 pr-4 font-bold">Requerido</th>
                <th className="pb-2 pr-4 font-bold">Descripción</th>
                <th className="pb-2 font-bold">Ejemplo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {FORMAT_COLUMNS.map((col) => (
                <tr key={col.columna} className="text-slate-700">
                  <td className="py-2 pr-4 font-mono text-xs font-bold">{col.columna}</td>
                  <td className="py-2 pr-4 text-xs">{col.tipo}</td>
                  <td className="py-2 pr-4">
                    {col.requerido ? (
                      <span className="text-xs font-bold text-red-500">Sí</span>
                    ) : (
                      <span className="text-xs text-slate-400">No</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-xs">{col.descripcion}</td>
                  <td className="py-2 text-xs font-mono text-slate-500">{col.ejemplo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
          <strong>Nota:</strong> La primera fila del archivo debe contener los nombres de las columnas exactamente como se muestran arriba. Las columnas no requeridas pueden omitirse.
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => setShowFormatModal(false)}>
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

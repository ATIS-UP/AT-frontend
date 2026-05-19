import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import { FileText, Image, File, X, Upload, FileUp } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

const fileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="w-5 h-5 text-emerald-500" />;
  if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-slate-500" />;
};

interface AnexoFile {
  id: string;
  file: File;
  preview?: string;
}

interface AnexosUploadProps {
  files: AnexoFile[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (id: string) => void;
  disabled?: boolean;
}

export function AnexosUpload({ files, onFilesAdd, onFileRemove, disabled }: AnexosUploadProps) {
  const notification = useNotificationStore();

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === 'file-too-large') {
        notification.add({ type: 'error', message: `El archivo excede el tamaño máximo de ${MAX_SIZE_MB}MB` });
      } else if (err.code === 'file-invalid-type') {
        notification.add({ type: 'error', message: 'Tipo de archivo no permitido. Formatos: PDF, PNG, JPG, DOC, DOCX, XLSX' });
      } else {
        notification.add({ type: 'error', message: err.message });
      }
      return;
    }

    if (files.length + accepted.length > MAX_FILES) {
      notification.add({ type: 'error', message: `Máximo ${MAX_FILES} archivos por actividad` });
      return;
    }

    onFilesAdd(accepted);
  }, [files.length, onFilesAdd, notification]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    disabled: files.length >= MAX_FILES || disabled,
    multiple: true,
  });

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700">Anexos / Evidencias (opcional)</label>

      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded border-2 border-dashed p-6 transition-colors cursor-pointer',
          isDragActive
            ? 'border-brand-primary bg-brand-primary/5'
            : 'border-slate-300 hover:border-slate-400 bg-white',
          (files.length >= MAX_FILES || disabled) && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-600">
          {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          PDF, PNG, JPG, DOC, DOCX, XLSX — Max {MAX_SIZE_MB}MB cada uno
        </p>
        <p className="text-xs text-slate-400">
          {files.length}/{MAX_FILES} archivos
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {fileIcon(f.file.type)}
              <span className="flex-1 truncate text-slate-700">{f.file.name}</span>
              <span className="text-xs text-slate-400 shrink-0">
                {(f.file.size / 1024 / 1024).toFixed(1)} MB
              </span>
              {f.preview && (
                <img
                  src={f.preview}
                  alt=""
                  className="w-8 h-8 rounded object-cover border border-slate-200"
                />
              )}
              <button
                type="button"
                onClick={() => onFileRemove(f.id)}
                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                title="Eliminar archivo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

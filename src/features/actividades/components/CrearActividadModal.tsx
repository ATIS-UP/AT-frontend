import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/src/shared/components/ui/Modal';
import { Button } from '@/src/shared/components/ui/Button';
import { Input } from '@/src/shared/components/ui/Input';
import { Select } from '@/src/shared/components/ui/Select';
import { Textarea } from '@/src/shared/components/ui/Textarea';
import { useCrearActividad, useActualizarActividad } from '../hooks/useActividades';
import { useSubirAnexo, useEliminarAnexo } from '../hooks/useAnexosActividades';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import { useAuthStore } from '@/src/features/auth/store/auth.store';
import { AnexosUpload } from './AnexosUpload';
import { cn } from '@/src/lib/utils';
import { CharType } from '@/src/lib/validation';
import { actividadCreateSchema } from '@/src/shared/schemas/actividad.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TIPO_OPTIONS,
  ESTADO_OPTIONS,
  MODALIDAD_OPTIONS,
} from '../types/actividades.types';
import type { ActividadFormData, ActividadInstitucional } from '../types/actividades.types';
import { Clock } from 'lucide-react';

interface CrearActividadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actividad?: ActividadInstitucional | null;
}

interface AnexoFile {
  id: string;
  file: File;
  preview?: string;
}

interface TimePickerProps {
  value: string;
  onChange: (val: string) => void;
}

function parseDateTime(dateStr: string, timeStr?: string): string {
  if (!dateStr) return '';
  if (timeStr) return `${dateStr}T${timeStr}:00`;
  return `${dateStr}T00:00:00`;
}

function TimePicker({ value, onChange }: TimePickerProps) {
  const [hh, mm] = value ? value.split(':') : ['', ''];
  return (
    <div className="flex items-center gap-1.5">
      <select
        value={hh}
        onChange={(e) => {
          const m = mm || '00';
          onChange(e.target.value ? `${e.target.value}:${m}` : '');
        }}
        className="w-16 appearance-none rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-center font-mono
                   focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary
                   hover:border-slate-400 transition-colors cursor-pointer"
      >
        <option value="">HH</option>
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={String(i).padStart(2, '0')}>
            {String(i).padStart(2, '0')}
          </option>
        ))}
      </select>
      <span className="text-slate-400 font-mono text-sm">:</span>
      <select
        value={mm}
        onChange={(e) => {
          const h = hh || '00';
          onChange(e.target.value ? `${h}:${e.target.value}` : '');
        }}
        className="w-16 appearance-none rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-center font-mono
                   focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary
                   hover:border-slate-400 transition-colors cursor-pointer"
      >
        <option value="">MM</option>
        {['00', '15', '30', '45'].map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <span className="text-[10px] text-slate-400 italic ml-0.5">opcional</span>
    </div>
  );
}

export function CrearActividadModal({ open, onOpenChange, actividad }: CrearActividadModalProps) {
  const isEditing = !!actividad;
  const crearActividad = useCrearActividad();
  const actualizarActividad = useActualizarActividad();
  const subirAnexo = useSubirAnexo();
  const eliminarAnexo = useEliminarAnexo();
  const notification = useNotificationStore();
  const user = useAuthStore((s) => s.user);

  const [anexos, setAnexos] = useState<AnexoFile[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [timeError, setTimeError] = useState('');

  const toDateOnly = (iso: string) => iso ? iso.slice(0, 10) : '';

  const defaultValues: ActividadFormData = actividad
    ? {
        tipo: actividad.tipo,
        fecha_inicio: toDateOnly(actividad.fecha_inicio),
        fecha_fin: toDateOnly(actividad.fecha_fin),
        estado: actividad.estado,
        descripcion: actividad.descripcion,
        encargado: actividad.encargado,
        observaciones: actividad.observaciones ?? '',
        anexos: '',
        modalidad: actividad.modalidad,
        lugar_enlace: actividad.lugar_enlace,
      }
    : {
        tipo: 'TALLER',
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
        encargado: '',
        observaciones: '',
        anexos: '',
        modalidad: 'PRESENCIAL',
        lugar_enlace: '',
      };

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<ActividadFormData>({
    defaultValues,
    resolver: zodResolver(actividadCreateSchema) as any,
  });

  React.useEffect(() => {
    if (open) {
      setAnexos([]);
      setHoraInicio('');
      setHoraFin('');
      setTimeError('');
      reset(defaultValues);
    }
  }, [open, actividad]);

  const handleFilesAdd = useCallback((files: File[]) => {
    const newFiles: AnexoFile[] = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));
    setAnexos((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileRemove = useCallback((id: string) => {
    setAnexos((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const onSubmit = async (data: ActividadFormData) => {
    try {
      const startDateTime = new Date(parseDateTime(data.fecha_inicio, horaInicio));
      const endDateTime = new Date(parseDateTime(data.fecha_fin, horaFin));

      if (endDateTime < startDateTime) {
        setTimeError('La fecha/hora de fin debe ser posterior a la de inicio');
        return;
      }
      setTimeError('');

      data.fecha_inicio = startDateTime.toISOString();
      data.fecha_fin = endDateTime.toISOString();

      if (isEditing && actividad) {
        await actualizarActividad.mutateAsync({ id: actividad.id, data });
        notification.add({ type: 'success', message: 'Actividad actualizada correctamente' });
      } else {
        const nuevaActividad = await crearActividad.mutateAsync(data);
        if (anexos.length > 0) {
          for (const af of anexos) {
            await subirAnexo.mutateAsync({ actividadId: nuevaActividad.id, file: af.file });
          }
        }
        notification.add({ type: 'success', message: 'Actividad creada correctamente' });
      }
      onOpenChange(false);
    } catch {
      notification.add({ type: 'error', message: 'Error al guardar la actividad' });
    }
  };

  const sectionClass = 'rounded-lg border border-slate-100 bg-slate-50/30 p-4 space-y-4';
  const sectionTitleClass = 'text-xs font-semibold uppercase tracking-wider text-slate-500';

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
      description={isEditing ? 'Modifica los datos de la actividad' : 'Registra una nueva actividad institucional'}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEditing ? 'Guardar Cambios' : 'Crear Actividad'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ── Información general ── */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Información general</p>
          <div className="grid grid-cols-2 gap-5">
            <Select
              name="tipo"
              label="Tipo de actividad"
              options={TIPO_OPTIONS}
              control={control}
              rules={{ required: 'Selecciona un tipo' }}
            />
            <Select
              name="modalidad"
              label="Modalidad"
              options={MODALIDAD_OPTIONS}
              control={control}
              rules={{ required: 'Selecciona una modalidad' }}
            />
          </div>
          <Input
            name="lugar_enlace"
            label="Lugar / Enlace"
            placeholder="Ej: Auditorio Principal, o enlace virtual..."
            control={control}
            rules={{ required: 'Indica el lugar o enlace' }}
            maxLength={500}
            charType={CharType.ALPHANUMERIC}
          />
        </div>

        {/* ── Programación ── */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Programación</p>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <Input
                name="fecha_inicio"
                label="Fecha de inicio"
                type="date"
                control={control}
                rules={{ required: 'Indica la fecha de inicio' }}
              />
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <TimePicker value={horaInicio} onChange={setHoraInicio} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Input
                name="fecha_fin"
                label="Fecha de fin"
                type="date"
                control={control}
                rules={{
                  required: 'Indica la fecha de fin',
                  validate: (val: string) => {
                    const inicio = getValues('fecha_inicio');
                    if (!inicio || !val) return true;
                    return val >= inicio || 'La fecha de fin debe ser igual o posterior a la de inicio';
                  },
                }}
              />
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <TimePicker value={horaFin} onChange={setHoraFin} />
              </div>
            </div>
          </div>
          {timeError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {timeError}
            </p>
          )}
          <Input
            name="encargado"
            label="Responsable"
            placeholder="Nombre de la persona encargada"
            control={control}
            rules={{ required: 'Indica el encargado' }}
            maxLength={255}
            charType={CharType.LETTERS}
          />
          {isEditing && (
            <div className="grid grid-cols-2 gap-5">
              <Select
                name="estado"
                label="Estado"
                options={ESTADO_OPTIONS}
                control={control}
              />
            </div>
          )}
        </div>

        {/* ── Detalles ── */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Detalles</p>
          <Textarea
            name="descripcion"
            label="Descripción"
            placeholder="Describe el objetivo y contenido de la actividad..."
            rows={3}
            control={control}
            rules={{ required: 'La descripción es requerida' }}
            maxLength={500}
            charType={CharType.FULL_TEXT}
          />
          <Textarea
            name="observaciones"
            label="Observaciones (opcional)"
            placeholder="Notas adicionales, requerimientos, etc..."
            rows={2}
            control={control}
            maxLength={1000}
            charType={CharType.FULL_TEXT}
          />
        </div>

        {/* ── Archivos ── */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Archivos adjuntos</p>
          <AnexosUpload
            files={anexos}
            onFilesAdd={handleFilesAdd}
            onFileRemove={handleFileRemove}
            disabled={isEditing}
          />
        </div>

        {/* ── Metadatos ── */}
        <div className={cn(sectionClass, '!bg-slate-100/20 !border-slate-200/50')}>
          <p className={sectionTitleClass}>Metadatos</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Creado por:</span>
            <span className="text-sm font-medium text-slate-700">{user?.nombre ?? '—'}</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}

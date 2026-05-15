import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/src/shared/components/ui/Modal';
import { Button } from '@/src/shared/components/ui/Button';
import { Input } from '@/src/shared/components/ui/Input';
import { Select } from '@/src/shared/components/ui/Select';
import { Textarea } from '@/src/shared/components/ui/Textarea';
import { useCrearActividad, useActualizarActividad } from '../hooks/useActividades';
import { useNotificationStore } from '@/src/shared/stores/notification.store';
import { useAuthStore } from '@/src/features/auth/store/auth.store';
import { TIPO_OPTIONS, ESTADO_OPTIONS, MODALIDAD_OPTIONS } from '../types/actividades.types';
import type { ActividadFormData, ActividadInstitucional } from '../types/actividades.types';

interface CrearActividadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actividad?: ActividadInstitucional | null;
}

export function CrearActividadModal({ open, onOpenChange, actividad }: CrearActividadModalProps) {
  const isEditing = !!actividad;
  const crearActividad = useCrearActividad();
  const actualizarActividad = useActualizarActividad();
  const notification = useNotificationStore();
  const user = useAuthStore((s) => s.user);

  const defaultValues: ActividadFormData = actividad
    ? {
        tipo: actividad.tipo,
        fecha_inicio: actividad.fecha_inicio.slice(0, 16),
        fecha_fin: actividad.fecha_fin.slice(0, 16),
        estado: actividad.estado,
        descripcion: actividad.descripcion,
        encargado: actividad.encargado,
        observaciones: actividad.observaciones ?? '',
        anexos: actividad.anexos ?? '',
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
    formState: { isSubmitting },
  } = useForm<ActividadFormData>({ defaultValues });

  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, actividad]);

  const onSubmit = async (data: ActividadFormData) => {
    try {
      if (isEditing && actividad) {
        await actualizarActividad.mutateAsync({ id: actividad.id, data });
        notification.add({ type: 'success', message: 'Actividad actualizada correctamente' });
      } else {
        await crearActividad.mutateAsync(data);
        notification.add({ type: 'success', message: 'Actividad creada correctamente' });
      }
      onOpenChange(false);
    } catch {
      notification.add({ type: 'error', message: 'Error al guardar la actividad' });
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
      description={isEditing ? 'Modifica los datos de la actividad' : 'Registra una nueva actividad institucional'}
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            name="tipo"
            label="Tipo"
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
          placeholder="Auditorio Principal, o enlace virtual..."
          control={control}
          rules={{ required: 'Indica el lugar o enlace' }}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="fecha_inicio"
            label="Fecha y hora de inicio"
            type="datetime-local"
            control={control}
            rules={{ required: 'Indica la fecha de inicio' }}
          />
          <Input
            name="fecha_fin"
            label="Fecha y hora de fin"
            type="datetime-local"
            control={control}
            rules={{ required: 'Indica la fecha de fin' }}
          />
        </div>

        <Input
          name="encargado"
          label="Encargado"
          placeholder="Nombre del responsable"
          control={control}
          rules={{ required: 'Indica el encargado' }}
        />

        {isEditing && (
          <Select
            name="estado"
            label="Estado"
            options={ESTADO_OPTIONS}
            control={control}
          />
        )}

        <Textarea
          name="descripcion"
          label="Descripción"
          placeholder="Describe la actividad..."
          rows={3}
          control={control}
          rules={{ required: 'La descripción es requerida' }}
        />

        <div className="grid grid-cols-2 gap-4">
          <Textarea
            name="observaciones"
            label="Observaciones (opcional)"
            placeholder="Notas adicionales..."
            rows={2}
            control={control}
          />
          <Textarea
            name="anexos"
            label="Anexos (opcional)"
            placeholder="Campo deshabilitado. Se habilitará próximamente..."
            rows={2}
            control={control}
            disabled
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Creado por</label>
          <div className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            {user?.nombre ?? '—'}
          </div>
        </div>
      </form>
    </Modal>
  );
}

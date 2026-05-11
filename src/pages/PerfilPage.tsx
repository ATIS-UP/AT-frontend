import React from 'react';
import { Mail, Shield, UserCircle, Clock3, Lock } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../features/auth/services/authService';
import { cambiarPasswordSchema, CambiarPasswordInput } from '../shared/schemas/auth.schema';
import { useNotificationStore } from '../shared/stores/notification.store';

export default function PerfilPage() {
  const notify = useNotificationStore((s) => s.add);

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.me(),
  });

  const cambiarPassword = useMutation({
    mutationFn: (data: CambiarPasswordInput) =>
      authService.cambiarPassword({
        password_actual: data.password_actual,
        password_nueva: data.password_nueva,
      }),
    onSuccess: () => {
      notify({ type: 'success', message: 'Contraseña actualizada correctamente' });
      reset();
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al cambiar la contraseña' });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CambiarPasswordInput>({
    resolver: zodResolver(cambiarPasswordSchema),
  });

  const rolLabel = user?.rol ? user.rol.replace('_', ' ') : 'NO DEFINIDO';

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Cargando perfil...</div>;
  }

  return (
    <div className="space-y-6 fade-in">
      {/* user info */}
      <section className="glass-panel rounded-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-16 h-16 rounded-sm bg-brand-primary text-white flex items-center justify-center text-xl font-bold">
            {(user?.nombre ?? 'U')
              .split(' ')
              .map((segment) => segment[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {user?.nombre ?? 'Usuario sin nombre'}
            </h2>
            <p className="text-sm text-slate-500">
              Cuenta institucional del Sistema de Alertas Tempranas
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* account info */}
        <article className="glass-panel rounded-card p-5 space-y-3">
          <h3 className="font-display text-base font-bold text-slate-800">Información de cuenta</h3>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Nombre:</span>
              <span>{user?.nombre ?? 'No disponible'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Correo:</span>
              <span>{user?.email ?? 'No disponible'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Rol:</span>
              <span>{rolLabel}</span>
            </div>
          </div>
        </article>

        {/* session info */}
        <article className="glass-panel rounded-card p-5 space-y-3">
          <h3 className="font-display text-base font-bold text-slate-800">Sesión actual</h3>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Estado:</span>
              <span className="text-emerald-700">Activa</span>
            </div>
          </div>
        </article>
      </section>

      {/* password change form */}
      <section className="glass-panel rounded-card p-6 space-y-4">
        <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-primary" />
          Cambiar contraseña
        </h3>
        <form
          onSubmit={handleSubmit((data) => cambiarPassword.mutate(data))}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
              Contraseña actual
            </label>
            <input
              type="password"
              {...register('password_actual')}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
            />
            {errors.password_actual && (
              <p className="text-xs text-red-500">{errors.password_actual.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
              Nueva contraseña
            </label>
            <input
              type="password"
              {...register('password_nueva')}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
            />
            {errors.password_nueva && (
              <p className="text-xs text-red-500">{errors.password_nueva.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
              Confirmar contraseña
            </label>
            <input
              type="password"
              {...register('confirmar_password')}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
            />
            {errors.confirmar_password && (
              <p className="text-xs text-red-500">{errors.confirmar_password.message}</p>
            )}
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={cambiarPassword.isPending}
              className="px-5 py-2.5 bg-brand-primary text-white rounded-btn font-display text-sm font-bold tracking-tight hover:bg-brand-primary/90 transition-all disabled:opacity-50"
            >
              {cambiarPassword.isPending ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

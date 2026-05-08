import React from 'react';
import { Mail, Shield, UserCircle, Clock3 } from 'lucide-react';
import { useAuthStore } from '../features/auth/store/authStore';

export default function PerfilPage() {
  const user = useAuthStore((state) => state.user);
  const rol = useAuthStore((state) => state.rol);

  const rolLabel = rol ? rol.replace('_', ' ') : 'NO DEFINIDO';

  return (
    <div className="space-y-6 fade-in">
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
            <h2 className="font-display text-2xl font-bold text-slate-900">{user?.nombre ?? 'Usuario sin nombre'}</h2>
            <p className="text-sm text-slate-500">Cuenta institucional del Sistema de Alertas Tempranas</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <article className="glass-panel rounded-card p-5 space-y-3">
          <h3 className="font-display text-base font-bold text-slate-800">Sesión actual</h3>

          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Estado:</span>
              <span className="text-emerald-700">Activa</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Esta sección es base para futuras funciones de actualización de datos de usuario y seguridad de cuenta.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}

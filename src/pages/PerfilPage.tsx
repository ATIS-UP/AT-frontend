import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Shield, UserCircle, Clock3, Lock, Smartphone, Key, Check, X, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../features/auth/services/authService';
import { cambiarPasswordSchema, CambiarPasswordInput } from '../shared/schemas/auth.schema';
import { useNotificationStore } from '../shared/stores/notification.store';
import { apiClient } from '@/lib/api-client';
import { MfaSetupModal } from '@/features/auth/components/MfaSetupModal';
import { Modal } from '@/shared/components/ui/Modal';

export default function PerfilPage() {
  const notify = useNotificationStore((s) => s.add);
  const queryClient = useQueryClient();
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showMfaSettings, setShowMfaSettings] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);
  const [codesSaved, setCodesSaved] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.me(),
  });

  const { data: mfaStatus } = useQuery({
    queryKey: ['auth', 'mfa', 'status'],
    queryFn: () => apiClient.get<{ mfa_enabled: boolean; mfa_methods: string[] }>('/api/auth/mfa/status'),
  });

  const { data: backupCodesLeft, refetch: refetchBackupLeft } = useQuery({
    queryKey: ['auth', 'mfa', 'backup-codes-left'],
    queryFn: () => apiClient.get<{ remaining: number }>('/api/auth/mfa/backup-codes'),
    enabled: !!mfaStatus?.mfa_methods?.includes('backup_codes'),
  });

  const refreshMfaStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'mfa', 'status'] });
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    refetchBackupLeft();
  };

  const disableMfa = useMutation({
    mutationFn: (password: string) =>
      apiClient.post('/api/auth/mfa/disable', { password }),
    onSuccess: () => {
      notify({ type: 'success', message: 'MFA desactivado correctamente' });
      refreshMfaStatus();
    },
    onError: (err: any) => {
      notify({ type: 'error', message: err?.detail || 'Error al desactivar MFA' });
    },
  });

  const regenerateBackupCodes = useMutation({
    mutationFn: () => apiClient.post<{ codes: string[]; remaining: number }>('/api/auth/mfa/generate-backup-codes'),
    onSuccess: (data) => {
      setNewBackupCodes(data.codes);
      setCodesSaved(false);
      refetchBackupLeft();
    },
    onError: (err: any) => {
      notify({ type: 'error', message: err?.detail || 'Error al generar códigos' });
    },
  });

  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disablePasswordInput, setDisablePasswordInput] = useState('');

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

  const methodLabels: Record<string, { label: string; icon: React.ElementType }> = {
    totp: { label: 'Authenticator (TOTP)', icon: Smartphone },
    email: { label: 'Código por correo', icon: Mail },
    backup_codes: { label: 'Códigos de respaldo', icon: Key },
  };

  const handleDownloadCodes = () => {
    if (!newBackupCodes) return;
    const text = newBackupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'satisup-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerateConfirm = () => {
    regenerateBackupCodes.mutate();
    setShowRegenerateConfirm(false);
  };

  const handleCloseNewCodes = () => {
    setNewBackupCodes(null);
    notify({ type: 'success', message: 'Códigos de respaldo regenerados' });
    refreshMfaStatus();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Cargando perfil...</div>;
  }

  return (
    <>
      <Helmet>
        <title>SATISUP - Mi Perfil</title>
        <meta name="description" content="Datos de cuenta y sesión del Sistema de Alertas Tempranas - Universidad de Pamplona." />
      </Helmet>
    <div className="space-y-6 fade-in">
      <section className="glass-panel rounded-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-16 h-16 rounded-sm bg-brand-primary text-white flex items-center justify-center text-xl font-bold">
            {(user?.nombre ?? 'U').split(' ').map((segment) => segment[0]).join('').slice(0, 2)}
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {user?.nombre ?? 'Usuario sin nombre'}
            </h2>
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
          </div>
        </article>
      </section>

      <section className="glass-panel rounded-card p-6 space-y-4">
        <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-brand-primary" />
          Autenticación de dos factores (MFA)
        </h3>

        {mfaStatus?.mfa_enabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">MFA activo</span>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Métodos activos</p>
              {mfaStatus.mfa_methods?.map((m) => {
                const info = methodLabels[m];
                if (!info) return null;
                const Icon = info.icon;
                return (
                  <div key={m} className="flex items-center gap-2 text-sm text-slate-700">
                    <Icon className="w-4 h-4 text-brand-primary" />
                    <span className="font-medium">{info.label}</span>
                    {m === 'backup_codes' && backupCodesLeft && (
                      <span className={`text-xs ${backupCodesLeft.remaining === 0 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                        ({backupCodesLeft.remaining === 0 ? 'AGOTADOS - regenere' : `${backupCodesLeft.remaining} restantes`})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowMfaSettings(true)}
                className="px-4 py-2 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary/5 transition-all bg-transparent cursor-pointer">
                Modificar métodos
              </button>
              {mfaStatus.mfa_methods?.includes('backup_codes') && (
                <button onClick={() => setShowRegenerateConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-all bg-transparent cursor-pointer">
                  Regenerar códigos de respaldo
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <input type="password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Contraseña actual"
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none" />
                <button onClick={() => { if (!disablePassword) { notify({ type: 'warning', message: 'Ingrese su contraseña para desactivar MFA' }); return; } disableMfa.mutate(disablePassword); setDisablePassword(''); }}
                  disabled={disableMfa.isPending}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50 bg-transparent cursor-pointer">
                  Desactivar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-600">Active la verificación en dos pasos para mayor seguridad.</p>
            <button onClick={() => setShowMfaSetup(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all cursor-pointer">
              Configurar MFA
            </button>
          </div>
        )}
      </section>

      <section className="glass-panel rounded-card p-6 space-y-4">
        <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-primary" />
          Cambiar contraseña
        </h3>
        <form onSubmit={handleSubmit((data) => cambiarPassword.mutate(data))} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Contraseña actual</label>
            <input type="password" {...register('password_actual')}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
            {errors.password_actual && <p className="text-xs text-red-500">{errors.password_actual.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Nueva contraseña</label>
            <input type="password" {...register('password_nueva')}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
            {errors.password_nueva && <p className="text-xs text-red-500">{errors.password_nueva.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Confirmar contraseña</label>
            <input type="password" {...register('confirmar_password')}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
            {errors.confirmar_password && <p className="text-xs text-red-500">{errors.confirmar_password.message}</p>}
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" disabled={cambiarPassword.isPending}
              className="px-5 py-2.5 bg-brand-primary text-white rounded-btn font-display text-sm font-bold tracking-tight hover:bg-brand-primary/90 transition-all disabled:opacity-50">
              {cambiarPassword.isPending ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </section>
    </div>

    {/* MFA Setup Modal */}
    <MfaSetupModal open={showMfaSetup} onOpenChange={setShowMfaSetup} onComplete={() => refreshMfaStatus()} />

    {/* MFA Settings Modal (modify methods) */}
    <Modal open={showMfaSettings} onOpenChange={setShowMfaSettings} title="" className="max-w-md">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8 text-brand-primary" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Modificar métodos MFA</h2>
        <p className="text-sm text-slate-500 mb-6">Seleccione los métodos que desea mantener activos.</p>
        {showDisableConfirm ? (
          <div className="space-y-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              Va a desmarcar todos los métodos. Esto desactivará MFA. Ingrese su contraseña para confirmar.
            </div>
            <input type="password" value={disablePasswordInput} onChange={(e) => setDisablePasswordInput(e.target.value)}
              placeholder="Contraseña actual"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none" />
            <div className="flex gap-2">
              <button onClick={() => { setShowDisableConfirm(false); setDisablePasswordInput(''); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all bg-transparent cursor-pointer">
                Cancelar
              </button>
              <button onClick={async () => {
                if (!disablePasswordInput) { notify({ type: 'warning', message: 'Ingrese su contraseña' }); return; }
                try {
                  await apiClient.put('/api/auth/mfa/methods', { methods: [] });
                  refreshMfaStatus();
                  setShowMfaSettings(false);
                  setShowDisableConfirm(false);
                  setDisablePasswordInput('');
                  notify({ type: 'success', message: 'MFA desactivado' });
                } catch (err: any) {
                  notify({ type: 'error', message: err?.detail || 'Error al desactivar MFA' });
                }
              }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all cursor-pointer">
                Desactivar MFA
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-6 text-left">
            {[
              { id: 'totp', label: 'Authenticator (TOTP)', icon: Smartphone, desc: 'Google Authenticator, Microsoft Authenticator' },
              { id: 'email', label: 'Código por correo', icon: Mail, desc: 'Código de un solo uso al correo' },
              { id: 'backup_codes', label: 'Códigos de respaldo', icon: Key, desc: '8 códigos de un solo uso' },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = mfaStatus?.mfa_methods?.includes(opt.id);
              return (
                <button key={opt.id} onClick={async () => {
                  if (isSelected && mfaStatus?.mfa_methods?.length === 1) {
                    setShowDisableConfirm(true);
                    return;
                  }
                  const newMethods = isSelected
                    ? mfaStatus!.mfa_methods.filter((m) => m !== opt.id)
                    : [...(mfaStatus?.mfa_methods ?? []), opt.id];
                  try {
                    await apiClient.put('/api/auth/mfa/methods', { methods: newMethods });
                    refreshMfaStatus();
                    notify({ type: 'success', message: 'Métodos actualizados' });
                  } catch (err: any) {
                    notify({ type: 'error', message: err?.detail || 'Error al actualizar métodos' });
                  }
                }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left bg-transparent cursor-pointer ${
                    isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200'
                  }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'border-brand-primary bg-brand-primary' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {!showDisableConfirm && (
          <button onClick={() => setShowMfaSettings(false)}
            className="px-6 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all bg-transparent cursor-pointer">
            Cerrar
          </button>
        )}
      </div>
    </Modal>

    {/* Regenerate backup codes confirmation */}
    <Modal open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm} title="" className="max-w-sm">
      <div className="text-center p-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <Key className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-display mb-2">¿Regenerar códigos?</h2>
        <p className="text-sm text-slate-500 mb-6">Se invalidarán los códigos anteriores y se generarán 8 nuevos.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setShowRegenerateConfirm(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all bg-transparent cursor-pointer">Cancelar</button>
          <button onClick={handleRegenerateConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-all cursor-pointer">Regenerar</button>
        </div>
      </div>
    </Modal>

    {/* Show new backup codes */}
    <Modal open={newBackupCodes !== null} onOpenChange={() => {}} title="" className="max-w-md">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <Key className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Nuevos códigos de respaldo</h2>
        <p className="text-sm text-slate-500 mb-4">Guarde estos códigos. Los anteriores ya no funcionan.</p>
        <div className="bg-slate-50 rounded-lg p-4 mb-4 font-mono text-sm text-left">
          {newBackupCodes?.map((c, i) => (
            <div key={i} className="py-1 px-2 flex items-center gap-2">
              <span className="text-slate-400 w-6 text-right">{i + 1}.</span>
              <span className="text-slate-800 font-bold tracking-wider">{c}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={handleDownloadCodes}
            className="flex-1 py-2 px-4 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary/5 transition-all bg-transparent cursor-pointer flex items-center justify-center gap-2"
          >Descargar .txt</button>
          <button onClick={() => { navigator.clipboard.writeText(newBackupCodes?.join('\n') ?? ''); notify({ type: 'success', message: 'Copiado al portapapeles' }); }}
            className="flex-1 py-2 px-4 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary/5 transition-all bg-transparent cursor-pointer flex items-center justify-center gap-2"
          >Copiar</button>
        </div>
        <label className="flex items-center justify-center gap-2 mb-4 text-sm cursor-pointer">
          <input type="checkbox" checked={codesSaved} onChange={(e) => setCodesSaved(e.target.checked)}
            className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
          <span className="text-slate-600">Ya guardé los códigos</span>
        </label>
        <button onClick={handleCloseNewCodes} disabled={!codesSaved}
          className="px-6 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
          Cerrar
        </button>
      </div>
    </Modal>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parametrizacionService, Parametro, ParametroGroup } from '../services/parametrizacionService';
import { useNotificationStore } from '@/shared/stores/notification.store';
import { Settings, Save, Loader2, Database } from 'lucide-react';

export default function ParametrizacionPage() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  const { data: groups, isLoading, isError } = useQuery({
    queryKey: ['parametrizacion'],
    queryFn: () => parametrizacionService.listar(),
  });

  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  // initialize edited values from fetched data
  useEffect(() => {
    if (groups) {
      const initial: Record<string, string> = {};
      groups.forEach((group: ParametroGroup) => {
        group.parametros.forEach((p: Parametro) => {
          initial[p.id] = p.valor;
        });
      });
      setEditedValues(initial);
    }
  }, [groups]);

  const updateMutation = useMutation({
    mutationFn: ({ id, valor }: { id: string; valor: string }) =>
      parametrizacionService.actualizar(id, valor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametrizacion'] });
      notify({ type: 'success', message: 'Parámetro actualizado correctamente' });
    },
    onError: () => {
      notify({ type: 'error', message: 'Error al actualizar el parámetro' });
    },
  });

  const handleSave = (param: Parametro) => {
    const newValue = editedValues[param.id];
    if (newValue === param.valor) return;
    updateMutation.mutate({ id: param.id, valor: newValue });
  };

  const hasChanged = (param: Parametro) => {
    return editedValues[param.id] !== undefined && editedValues[param.id] !== param.valor;
  };

  const getGroupLabel = (grupo: string) => {
    const labels: Record<string, string> = {
      'UMBRAL': 'Umbrales de Riesgo',
      'PERIODO': 'Período Académico',
      'NOTIFICAR': 'Notificaciones',
      'OTROS': 'Otros Parámetros',
    };
    return labels[grupo] || grupo;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 text-sm">Error al cargar los parámetros del sistema.</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['parametrizacion'] })}
          className="mt-3 text-brand-primary text-sm font-medium hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center fade-in">
        <Settings className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="font-display text-xl font-bold text-slate-400">Sin parámetros</h2>
        <p className="text-slate-400 mt-2 text-sm">No hay parámetros configurados en el sistema.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>SATISUP - Configuración</title>
        <meta name="description" content="Parámetros del Sistema de Alertas Tempranas - Universidad de Pamplona." />
      </Helmet>
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-primary tracking-tight flex items-center gap-3">
            <Database className="w-6 h-6" />
            Parametrización del Sistema
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure las variables que controlan el comportamiento del sistema
          </p>
        </div>
      </div>

      {groups.map((group: ParametroGroup) => (
        <div key={group.grupo} className="glass-panel rounded-card overflow-hidden">
          <div className="px-6 py-4 bg-brand-primary/5 border-b border-slate-100">
            <h2 className="font-display text-sm font-bold text-brand-primary uppercase tracking-wider">
              {getGroupLabel(group.grupo)}
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {group.parametros.map((param: Parametro) => (
              <div key={param.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{param.clave}</p>
                  {param.descripcion && (
                    <p className="text-xs text-slate-400 mt-0.5">{param.descripcion}</p>
                  )}
                  {param.tipo && (
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {param.tipo}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:w-[320px]">
                  <input
                    type="text"
                    value={editedValues[param.id] ?? param.valor}
                    onChange={(e) =>
                      setEditedValues((prev) => ({ ...prev, [param.id]: e.target.value }))
                    }
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                  <button
                    disabled={!hasChanged(param) || updateMutation.isPending}
                    onClick={() => handleSave(param)}
                    className={`p-2 rounded-lg transition-all ${
                      hasChanged(param)
                        ? 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    </>
  );
}

import React from 'react';
import { UserPlus, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const ApoyoDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-primary">Panel de Apoyo Académico</h2>
          <p className="text-secondary text-sm">Seleccione una acción</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <Card 
          className="p-8 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary"
          onClick={() => navigate('/estudiantes')}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Registrar Estudiante</h3>
              <p className="text-sm text-slate-500 mt-1">Agregar nuevos estudiantes al sistema de alertas</p>
            </div>
            <Button variant="outline" className="mt-2">
              Ir a Estudiantes
            </Button>
          </div>
        </Card>

        <Card 
          className="p-8 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-red-500"
          onClick={() => navigate('/alertas')}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Crear Alerta</h3>
              <p className="text-sm text-slate-500 mt-1">Registrar nueva alerta de riesgo académico</p>
            </div>
            <Button variant="outline" className="mt-2">
              Ir a Alertas
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-slate-50">
        <h3 className="font-bold text-slate-700 mb-2">Información</h3>
        <p className="text-sm text-slate-500">
          Como usuario de apoyo, tienes acceso limitado a las siguientes funciones: 
          registrar estudiantes y crear alertas de riesgo académico. 
          Contacta al administrador si necesitas más permisos.
        </p>
      </Card>
    </div>
  );
};
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

  const getViewTitle = () => {
    if (location.pathname.includes('/dashboard')) return { title: 'Tablero de Control', subtitle: 'Ingeniería de Sistemas' };
    if (location.pathname.includes('/estudiantes')) return { title: 'Estudiantes', subtitle: 'Listado Maestro' };
    if (location.pathname.includes('/alertas')) return { title: 'Alertas y Pérdidas', subtitle: 'Monitor de Riesgo' };
    if (location.pathname.includes('/encuestas')) return { title: 'Encuestas', subtitle: 'Satisfacción y Seguimiento' };
    if (location.pathname.includes('/actividades')) return { title: 'Actividades', subtitle: 'Registro de Eventos' };
    if (location.pathname.includes('/artefactos')) return { title: 'Artefactos', subtitle: 'Documentación Factorial' };
    if (location.pathname.includes('/perfil')) return { title: 'Mi Perfil', subtitle: 'Datos de Cuenta y Sesión' };
    if (location.pathname.includes('/parametrizacion')) return { title: 'Configuración', subtitle: 'Parámetros del Sistema' };
    return { title: 'UNIPAMPLONA', subtitle: 'Gestión Académica' };
  };

  const { title, subtitle } = getViewTitle();

  return (
    <div className="min-h-screen bg-brand-background flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-[236px]">
        <Topbar 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <div className="px-4 md:px-10 py-8 flex-1 mt-[56px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14, scale: 0.995, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, scale: 0.998, filter: 'blur(4px)' }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
        
        <footer className="px-4 md:px-10 py-6 border-t border-slate-100/60 bg-white/50 text-center">
           <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
             © 2026 Universidad de Pamplona - Programa de Ingeniería de Sistemas
           </p>
        </footer>
      </main>
    </div>
  );
}
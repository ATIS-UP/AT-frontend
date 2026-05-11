import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomBar } from './BottomBar';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

const MIN_SIDEBAR_WIDTH = 64;
const MAX_SIDEBAR_WIDTH = 320;
const DEFAULT_SIDEBAR_WIDTH = 236;
const COLLAPSED_WIDTH = 64;

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = React.useState(false);
  const location = useLocation();

  // effective width considers collapsed state
  const effectiveWidth = sidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

  // handle mouse drag to resize sidebar
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, e.clientX));
      // snap to collapsed if dragged below threshold
      if (newWidth <= MIN_SIDEBAR_WIDTH + 10) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    // prevent text selection while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  const handleToggleCollapse = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    } else {
      setSidebarCollapsed(true);
    }
  };

  const getViewTitle = () => {
    if (location.pathname.includes('/apoyo')) return { title: 'Panel de Apoyo', subtitle: 'Acciones Disponibles' };
    if (location.pathname.includes('/dashboard')) return { title: 'Tablero de Control', subtitle: 'Ingeniería de Sistemas' };
    if (location.pathname.includes('/estudiantes')) return { title: 'Estudiantes', subtitle: 'Listado Maestro' };
    if (location.pathname.includes('/alertas')) return { title: 'Alertas y Pérdidas', subtitle: 'Monitor de Riesgo' };
    if (location.pathname.includes('/encuestas')) return { title: 'Encuestas', subtitle: 'Satisfacción y Seguimiento' };
    if (location.pathname.includes('/artefactos')) return { title: 'Documentos', subtitle: 'Evidencias y Archivos' };
    if (location.pathname.includes('/perfil')) return { title: 'Mi Perfil', subtitle: 'Datos de Cuenta y Sesión' };
    if (location.pathname.includes('/parametrizacion')) return { title: 'Configuración', subtitle: 'Parámetros del Sistema' };
    return { title: 'UNIPAMPLONA', subtitle: 'Gestión Académica' };
  };

  const { title, subtitle } = getViewTitle();

  return (
    <div className="min-h-screen bg-brand-background flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        width={effectiveWidth}
        onResizeStart={handleMouseDown}
      />
      
      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: undefined }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .app-main-content { margin-left: ${effectiveWidth}px; }
            .app-topbar-offset { left: ${effectiveWidth}px; }
          }
        `}</style>
        <Topbar 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setSidebarOpen(true)}
          sidebarWidth={effectiveWidth}
        />
        
        <div className="app-main-content px-4 md:px-10 py-8 flex-1 mt-[56px] transition-[margin] duration-150">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
        
        <footer className="app-main-content px-4 md:px-10 py-6 border-t border-slate-100/60 bg-white/50 text-center pb-20 md:pb-6 transition-[margin] duration-150">
           <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
             © 2026 Universidad de Pamplona - Programa de Ingeniería de Sistemas
           </p>
        </footer>
      </main>

      {/* mobile bottom navigation */}
      <BottomBar />
    </div>
  );
}

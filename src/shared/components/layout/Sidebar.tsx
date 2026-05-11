import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  collapsed?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, to, collapsed, onClick }: NavItemProps) => {
  const location = useLocation();
  const active = location.pathname.startsWith(to);

  return (
    <li>
      <NavLink
        to={to}
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={cn(
          "w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 group text-left",
          collapsed && "justify-center px-0",
          active 
            ? "border-l-[3px] border-brand-secondary bg-white/5 text-white" 
            : "text-slate-500 hover:text-white/80 hover:bg-white/5"
        )}
      >
        <Icon className={cn("w-[18px] h-[18px] shrink-0", active ? "text-brand-secondary" : "group-hover:text-white/60")} />
        {!collapsed && (
          <span className="font-display text-[11px] uppercase tracking-[0.05em] font-bold">
            {label}
          </span>
        )}
      </NavLink>
    </li>
  );
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar = ({ isOpen, onClose, collapsed = false, onToggleCollapse }: SidebarProps) => {
  const { logout, rol } = useAuthStore();
  const isApoyo = rol === 'APOYO';
  const navRef = React.useRef<HTMLElement>(null);
  const touchStartX = React.useRef<number | null>(null);

  const menuItems = isApoyo 
    ? [
        { icon: LayoutDashboard, label: 'Panel', to: '/apoyo/panel' },
        { icon: Users, label: 'Estudiantes', to: '/estudiantes' },
        { icon: AlertTriangle, label: 'Alertas', to: '/alertas' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Tablero', to: '/dashboard' },
        { icon: Users, label: 'Estudiantes', to: '/estudiantes' },
        { icon: AlertTriangle, label: 'Alertas y Pérdidas', to: '/alertas' },
        { icon: BarChart3, label: 'Encuestas', to: '/encuestas' },
        { icon: FileText, label: 'Documentos', to: '/artefactos' },
      ];

  // swipe-to-close gesture for mobile drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    // swipe left to close (threshold: 60px)
    if (deltaX < -60) {
      onClose();
    }
    touchStartX.current = null;
  };

  return (
    <>
      {/* overlay for mobile */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      <nav
        ref={navRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "h-screen fixed left-0 top-0 z-50 bg-[#10192A] border-r border-white/10 shadow-2xl flex flex-col justify-between py-6 transition-all duration-300 lg:translate-x-0",
          // mobile always full width
          "w-[236px]",
          // desktop collapsed width
          collapsed ? "lg:w-[64px]" : "lg:w-[236px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* header with title and collapse toggle */}
          <div className={cn("px-4 mb-8 flex items-center", collapsed ? "lg:justify-center lg:px-2" : "justify-between")}>
            {/* title text - hidden when collapsed on desktop */}
            <div className={cn("flex flex-col min-w-0", collapsed && "lg:hidden")}>
              <span className="text-white font-black tracking-tighter text-base leading-none">UNIPAMPLONA</span>
              <span className="text-white/60 font-display text-[9px] uppercase tracking-[0.05em] font-bold">Gestión Académica</span>
            </div>
            {/* collapse toggle (desktop only) */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-sm text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200 shrink-0"
              title={collapsed ? "Expandir menú" : "Contraer menú"}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
          
          <ul className="flex flex-col w-full">
            {menuItems.map((item) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                // only apply collapsed on desktop (lg+), mobile always shows full
                collapsed={collapsed}
                onClick={onClose}
              />
            ))}
          </ul>
        </div>

        <div>
          <ul className="flex flex-col w-full border-t border-white/10 pt-4">
            {!isApoyo && (
              <NavItem
                icon={Settings}
                label="Parámetros"
                to="/parametrizacion"
                collapsed={collapsed}
                onClick={onClose}
              />
            )}
            <li>
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                title={collapsed ? "Cerrar Sesión" : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 group text-left text-slate-500 hover:text-white/80 hover:bg-white/5",
                  collapsed && "lg:justify-center lg:px-0"
                )}
              >
                <LogOut className="w-[18px] h-[18px] shrink-0 group-hover:text-white/60" />
                {/* hide label on desktop when collapsed */}
                <span className={cn("font-display text-[11px] uppercase tracking-[0.05em] font-bold", collapsed && "lg:hidden")}>
                  Cerrar Sesión
                </span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

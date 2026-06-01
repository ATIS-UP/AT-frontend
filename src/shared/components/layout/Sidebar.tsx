import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/auth.store';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
  Calendar,
  Shield,
  PieChart,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  collapsed?: boolean;
  onClick?: () => void;
}

interface NavDividerProps {
  label: string;
  collapsed?: boolean;
}

const NavDivider = ({ label, collapsed }: NavDividerProps) => (
  <li className={cn('px-6 pt-4 pb-1', collapsed && 'px-2')}>
    {!collapsed && (
      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-600/50 select-none">
        {label}
      </span>
    )}
    {collapsed && <div className="border-t border-white/10 my-1" />}
  </li>
);

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
          <span className="font-display text-[11px] uppercase tracking-[0.05em] font-bold whitespace-nowrap overflow-hidden">
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
  width?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
}

export const Sidebar = ({ isOpen, onClose, collapsed = false, onToggleCollapse, width = 236, onResizeStart }: SidebarProps) => {
  const { user, logout } = useAuthStore();
  const rol = user?.rol;
  const isApoyo = rol === 'APOYO';
  const navRef = React.useRef<HTMLElement>(null);
  const touchStartX = React.useRef<number | null>(null);

  const isAdmin = rol === 'ADMINISTRADOR';

  type NavLink = { kind: 'link'; icon: React.ElementType; label: string; to: string };
  type NavSection = { kind: 'divider'; label: string };
  type MenuItem = NavLink | NavSection;

  const lnk = (icon: React.ElementType, label: string, to: string): NavLink => ({ kind: 'link', icon, label, to });
  const sec = (label: string): NavSection => ({ kind: 'divider', label });

  const menuItems: MenuItem[] = isApoyo
    ? [
        lnk(LayoutDashboard, 'Panel', '/apoyo/panel'),
        lnk(Users, 'Estudiantes', '/estudiantes'),
        lnk(AlertTriangle, 'Alertas', '/alertas'),
        lnk(Briefcase, 'Casos Especiales', '/casos-especiales'),
        lnk(Calendar, 'Actividades', '/actividades'),
      ]
    : [
        lnk(LayoutDashboard, 'Tablero', '/dashboard'),
        lnk(Users, 'Estudiantes', '/estudiantes'),
        lnk(AlertTriangle, 'Alertas y Pérdidas', '/alertas'),
        lnk(Briefcase, 'Casos Especiales', '/casos-especiales'),
        lnk(Calendar, 'Actividades', '/actividades'),
        lnk(BarChart3, 'Encuestas', '/encuestas'),
        lnk(FileText, 'Documentos', '/artefactos'),
        sec('Reportes'),
        lnk(PieChart, 'Caracterización', '/caracterizacion'),
        ...(isAdmin ? [lnk(Shield, 'Admin', '/admin')] : []),
      ];

  // swipe-to-close gesture for mobile drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
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
          "h-screen fixed left-0 top-0 z-50 bg-[#10192A] border-r border-white/10 shadow-2xl flex flex-col justify-between py-6 lg:translate-x-0 transition-[width] duration-150",
          // mobile: always 236px
          "w-[236px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${width}px` : undefined }}
      >
        {/* override width on desktop via css */}
        <style>{`@media (min-width: 1024px) { .sidebar-nav { width: ${width}px !important; } }`}</style>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* header with title and collapse toggle */}
          <div className={cn("px-4 mb-8 flex items-center shrink-0", collapsed ? "justify-center px-2" : "justify-between")}>
            {!collapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-white font-black tracking-tighter text-base leading-none whitespace-nowrap">UNIPAMPLONA</span>
                <span className="text-white/60 font-display text-[9px] uppercase tracking-[0.05em] font-bold whitespace-nowrap">Gestión Académica</span>
              </div>
            )}
            {/* collapse toggle (desktop only) */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-sm text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200 shrink-0"
              title={collapsed ? "Expandir menú" : "Contraer menú"}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
          
          <ul className="flex flex-col w-full flex-1">
            {menuItems.map((item, idx) => {
              if (item.kind === 'divider') {
                return <NavDivider key={`divider-${idx}`} label={item.label} collapsed={collapsed} />;
              }
              return (
                <NavItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  collapsed={collapsed}
                  onClick={onClose}
                />
              );
            })}
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
                onClick={async () => {
                  onClose();
                  await logout();
                }}
                title={collapsed ? "Cerrar Sesión" : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 group text-left text-slate-500 hover:text-white/80 hover:bg-white/5",
                  collapsed && "justify-center px-0"
                )}
              >
                <LogOut className="w-[18px] h-[18px] shrink-0 group-hover:text-white/60" />
                {!collapsed && (
                  <span className="font-display text-[11px] uppercase tracking-[0.05em] font-bold whitespace-nowrap">
                    Cerrar Sesión
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>

        {/* resize drag handle on the right edge (desktop only) */}
        <div
          onMouseDown={onResizeStart}
          className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-brand-secondary/40 active:bg-brand-secondary/60 transition-colors z-[60]"
        />
      </nav>
    </>
  );
};

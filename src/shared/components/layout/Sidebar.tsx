import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  PlusCircle, 
  FileText, 
  Settings, 
  LogOut,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, to, onClick }: NavItemProps) => {
  const location = useLocation();
  const active = location.pathname.startsWith(to);

  return (
    <li>
      <NavLink
        to={to}
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 group text-left",
          active 
            ? "border-l-[3px] border-brand-secondary bg-white/5 text-white" 
            : "text-slate-500 hover:text-white/80 hover:bg-white/5"
        )}
      >
        <Icon className={cn("w-[18px] h-[18px]", active ? "text-brand-secondary" : "group-hover:text-white/60")} />
        <span className="font-display text-[11px] uppercase tracking-[0.05em] font-bold">
          {label}
        </span>
      </NavLink>
    </li>
  );
};

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { logout } = useAuthStore();

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      <nav className={cn(
        "w-[236px] h-screen fixed left-0 top-0 z-50 bg-[#10192A] border-r border-white/10 shadow-2xl flex flex-col justify-between py-6 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div>
          <div className="px-6 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center shrink-0">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black tracking-tighter text-xl leading-none">UNIPAMPLONA</span>
              <span className="text-white/60 font-display text-[10px] uppercase tracking-[0.05em] font-bold">Gestión Académica</span>
            </div>
          </div>
          
          <ul className="flex flex-col w-full">
            <NavItem icon={LayoutDashboard} label="Tablero" to="/dashboard" onClick={onClose} />
            <NavItem icon={Users} label="Estudiantes" to="/estudiantes" onClick={onClose} />
            <NavItem icon={AlertTriangle} label="Alertas y Pérdidas" to="/alertas" onClick={onClose} />
            <NavItem icon={BarChart3} label="Encuestas" to="/encuestas" onClick={onClose} />
            <NavItem icon={PlusCircle} label="Actividades" to="/actividades" onClick={onClose} />
            <NavItem icon={FileText} label="Artefactos" to="/artefactos" onClick={onClose} />
          </ul>
        </div>

        <ul className="flex flex-col w-full border-t border-white/10 pt-4">
          <NavItem icon={Settings} label="Parámetros" to="/parametrizacion" onClick={onClose} />
          <li>
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 group text-left text-slate-500 hover:text-white/80 hover:bg-white/5"
            >
              <LogOut className="w-[18px] h-[18px] group-hover:text-white/60" />
              <span className="font-display text-[11px] uppercase tracking-[0.05em] font-bold">
                Cerrar Sesión
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};

import React from 'react';
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
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <li>
    <button
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
    </button>
  </li>
);

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar = ({ currentView, onNavigate }: SidebarProps) => {
  return (
    <nav className="w-[236px] h-screen fixed left-0 top-0 z-50 bg-[#10192A] border-r border-white/10 shadow-2xl flex flex-col justify-between py-6">
      <div>
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black tracking-tighter text-xl leading-none">UNIPAMPLONA</span>
            <span className="text-white/60 font-display text-[10px] uppercase tracking-[0.05em] font-bold">Gestión Académica</span>
          </div>
        </div>
        
        <ul className="flex flex-col w-full">
          <NavItem 
            icon={LayoutDashboard} 
            label="Tablero de Control" 
            active={currentView === 'dashboard'} 
            onClick={() => onNavigate('dashboard')} 
          />
          <NavItem 
            icon={Users} 
            label="Estudiantes" 
            active={currentView === 'students'} 
            onClick={() => onNavigate('students')} 
          />
          <NavItem 
            icon={AlertTriangle} 
            label="Alertas y Pérdidas" 
            active={currentView === 'alerts'} 
            onClick={() => onNavigate('alerts')} 
          />
          <NavItem 
            icon={BarChart3} 
            label="Encuestas" 
            active={currentView === 'surveys'} 
            onClick={() => onNavigate('surveys')} 
          />
          <NavItem 
            icon={PlusCircle} 
            label="Nueva Actividad" 
            active={currentView === 'new-activity'} 
            onClick={() => onNavigate('new-activity')} 
          />
          <NavItem 
            icon={FileText} 
            label="Artefactos" 
            active={currentView === 'artifacts'} 
            onClick={() => onNavigate('artifacts')} 
          />
        </ul>
      </div>

      <ul className="flex flex-col w-full border-t border-white/10 pt-4">
        <NavItem 
          icon={Settings} 
          label="Configuración" 
          onClick={() => {}} 
        />
        <NavItem 
          icon={LogOut} 
          label="Cerrar Sesión" 
          onClick={() => onNavigate('login')} 
        />
      </ul>
    </nav>
  );
};

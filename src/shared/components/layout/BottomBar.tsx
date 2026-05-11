import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '../../../features/auth/store/authStore';

interface BottomNavItem {
  icon: React.ElementType;
  label: string;
  to: string;
}

export function BottomBar() {
  const location = useLocation();
  const { rol } = useAuthStore();
  const isApoyo = rol === 'APOYO';

  const items: BottomNavItem[] = isApoyo
    ? [
        { icon: LayoutDashboard, label: 'Panel', to: '/apoyo/panel' },
        { icon: Users, label: 'Estudiantes', to: '/estudiantes' },
        { icon: AlertTriangle, label: 'Alertas', to: '/alertas' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Tablero', to: '/dashboard' },
        { icon: Users, label: 'Estudiantes', to: '/estudiantes' },
        { icon: AlertTriangle, label: 'Alertas', to: '/alertas' },
        { icon: BarChart3, label: 'Encuestas', to: '/encuestas' },
        { icon: Settings, label: 'Parámetros', to: '/parametrizacion' },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-slate-200 shadow-lg">
      <ul className="flex items-center justify-around h-14">
        {items.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 h-14 transition-colors',
                  active ? 'text-brand-primary' : 'text-slate-400'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

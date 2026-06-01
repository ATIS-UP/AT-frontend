import React from 'react';
import { Search, Menu, UserCircle, Settings, LogOut, Bell, CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/auth.store';
import { useNotificationStore } from '../../stores/notification.store';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  sidebarWidth?: number;
}

// icon and color mapping for notification types
const notificationIconMap: Record<string, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />,
  error: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
};

export const Topbar = ({ title, subtitle, onMenuClick, sidebarWidth = 236 }: TopbarProps) => {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const notifMenuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.remove);
  const clearNotifications = useNotificationStore((state) => state.clear);

  // close profile dropdown on outside click
  React.useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  // sidebar width used for dynamic positioning via css class in AppShell

  // last 10 notifications (most recent first)
  const recentNotifications = [...notifications].reverse().slice(0, 10);
  const hasUnread = notifications.length > 0;

  return (
    <header className="app-topbar-offset h-[56px] fixed top-0 right-0 left-0 z-40 glass-panel border-b border-white/55 flex items-center justify-between px-4 md:px-6 transition-all duration-150">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-sm transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-brand-primary font-bold text-sm md:text-base font-display flex items-center gap-2 truncate">
          {title}
          {subtitle && (
            <span className="hidden sm:flex items-center gap-2">
              <span className="text-slate-400 text-sm font-normal">/</span>
              <span className="text-slate-600 text-sm font-medium">{subtitle}</span>
            </span>
          )}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden xl:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" />
          <input 
            className="w-48 xxl:w-64 pl-10 pr-4 py-1.5 bg-slate-100/50 border-none rounded-sm text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all text-on-surface placeholder:text-slate-400" 
            placeholder="Buscar..." 
            type="text" 
          />
        </div>

        {/* notification bell */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-sm transition-colors"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto glass-panel bg-white border border-slate-200 shadow-lg rounded-sm z-50">
              {/* header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white z-10">
                <span className="text-sm font-bold text-slate-700">Notificaciones</span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      clearNotifications();
                      setNotifOpen(false);
                    }}
                    className="text-xs text-brand-primary hover:underline font-medium"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* notification list */}
              {recentNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  Sin notificaciones nuevas
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentNotifications.map((n) => (
                    <li key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="mt-0.5">
                        {notificationIconMap[n.type] ?? notificationIconMap.info}
                      </div>
                      <p className="flex-1 text-sm text-slate-700 leading-snug">{n.message}</p>
                      <button
                        onClick={() => removeNotification(n.id)}
                        className="p-0.5 text-slate-400 hover:text-slate-600 shrink-0"
                        title="Descartar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 border-l border-slate-200 pl-2 md:pl-4">
          <div className="relative ml-1" ref={profileMenuRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 hover:bg-slate-100 p-1 rounded-sm md:pr-3 transition-all"
            >
              <div className="w-7 h-7 rounded-sm bg-brand-primary flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0 select-none">
                {(user?.nombre ?? 'U').split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span className="font-display text-[11px] font-bold uppercase tracking-wider text-slate-700 hidden sm:block truncate max-w-[100px]">
                {user?.nombre ?? 'Usuario'}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-lg rounded-sm overflow-hidden z-50">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/perfil');
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserCircle className="w-4 h-4" />
                  Mi perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/parametrizacion');
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Ir a parametros
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

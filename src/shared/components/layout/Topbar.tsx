import React from 'react';
import { Search, Bell, Menu, UserCircle, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export const Topbar = ({ title, subtitle, onMenuClick }: TopbarProps) => {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  React.useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
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

  return (
    <header className="h-[56px] fixed top-0 right-0 left-0 lg:left-[236px] z-40 glass-panel border-b border-white/55 flex items-center justify-between px-4 md:px-6 transition-all duration-300">
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
        
        <div className="flex items-center gap-1 md:gap-2 border-l border-slate-200 pl-2 md:pl-4">
          <button className="w-8 h-8 flex items-center justify-center rounded-sm text-slate-600 hover:bg-slate-100 transition-all relative">
            <Bell className="w-[18px] md:w-[20px] h-[18px] md:h-[20px]" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-600 rounded-full border border-white"></span>
          </button>

          <div className="relative ml-1" ref={profileMenuRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 hover:bg-slate-100 p-1 rounded-sm md:pr-3 transition-all"
            >
              <div className="w-7 h-7 rounded-sm bg-brand-primary flex items-center justify-center text-white text-[10px] font-bold border border-white shadow-sm overflow-hidden shrink-0">
                 <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Admin" />
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

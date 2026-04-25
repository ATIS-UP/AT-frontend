import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-[120px]" />
      <div className="absolute top-[20%] left-[10%] w-[20%] h-[20%] bg-brand-primary/5 rounded-full blur-[80px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="glass-panel p-10 rounded-[28px] border border-white/60 bg-white/70 shadow-[0_20px_50px_rgba(2,36,72,0.12)]">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-primary tracking-tight mb-2">Sistema de Gestión</h1>
            <p className="text-slate-500 font-medium text-sm text-center">Acceso institucional UNIPAMPLONA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Usuario / E-mail</label>
              <div className="relative group">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                 <input 
                   required
                   type="text" 
                   placeholder="Ej: d.valbuena@unipamplona.edu.co"
                   className="w-full bg-white/50 border border-slate-200 pl-11 pr-4 py-3.5 rounded-xl text-sm focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all"
                 />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                 <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Contraseña</label>
                 <button type="button" className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider hover:underline">¿Olvidaste tu clave?</button>
              </div>
              <div className="relative group">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                 <input 
                   required
                   type={showPassword ? "text" : "password"} 
                   placeholder="••••••••••••"
                   className="w-full bg-white/50 border border-slate-200 pl-11 pr-11 py-3.5 rounded-xl text-sm focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all"
                 />
                 <button 
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                 >
                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary text-white py-4 rounded-xl font-display text-sm font-bold tracking-tight shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/95 hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Ingresar al sistema
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-100/60 text-center">
             <p className="text-[11px] text-slate-400 font-medium">Ingeniería de Sistemas - Facultad de Ingenierías y Arquitectura</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6">
           <img src="https://www.unipamplona.edu.co/unipamplona/portalIG/paginas_propias/img/logo_unipamplona.png" alt="UNIPAMPLONA" className="h-10 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer" />
        </div>
      </motion.div>
    </div>
  );
};

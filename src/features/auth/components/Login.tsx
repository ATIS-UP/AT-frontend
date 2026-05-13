import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const loginWithCredentials = useAuthStore((state) => state.loginWithCredentials);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await loginWithCredentials(email, password);
      if (user.rol === 'APOYO') {
        navigate('/apoyo');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Credenciales académicas inválidas. Por favor intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased h-screen w-full flex flex-col overflow-hidden">
      {/* Main Split Layout */}
      <main className="flex-1 flex w-full">
        {/* Left Panel: 60% Brutalist Editorial */}
        <section className="hidden lg:flex w-[60%] border-r border-primary-container relative p-16 flex-col justify-between overflow-hidden bg-surface">
          {/* Custom Technical SVG Background Element */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex items-center justify-center">
            <svg 
              className="stroke-primary-container" 
              fill="none" 
              height="100%" 
              strokeWidth="1" 
              viewBox="0 0 800 800" 
              width="100%" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 100 0 V 800 M 300 0 V 800 M 500 0 V 800 M 700 0 V 800" strokeDasharray="4 4" />
              <path d="M 0 200 H 800 M 0 400 H 800 M 0 600 H 800" strokeDasharray="4 4" />
              <rect height="100" strokeWidth="2" width="100" x="250" y="350" />
              <rect height="150" strokeWidth="2" width="150" x="450" y="250" />
              <path d="M 350 400 L 450 325" strokeWidth="2" />
              <circle cx="250" cy="350" fill="#0b1f4b" r="4" />
              <circle cx="450" cy="325" fill="#0b1f4b" r="4" />
              <path d="M 100 600 L 250 450 L 450 450 L 700 700" strokeWidth="2" />
              <circle cx="700" cy="700" fill="#0b1f4b" r="6" />
            </svg>
          </div>

          <div className="relative z-10">
            {/* Se agregaron las clases 'flex', 'items-center' y 'gap-4' para alinear el logo y el texto */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-4"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Escudo_Universidad_de_Pamplona.svg/250px-Escudo_Universidad_de_Pamplona.svg.png" 
                alt="Universidad de Pamplona" 
                className="h-26"
              />
              <h1 className="font-display-xl text-display-xl text-primary-container leading-tight">
                <strong>SAT</strong>
              </h1>
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center gap-8">
            
          </div>
        </section>

        {/* Right Panel: 40% Precision Form */}
        <section className="w-full lg:w-[40%] bg-surface-container-lowest flex flex-col justify-center px-8 lg:px-24 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-sm mx-auto"
          >
            {/* Institutional Header */}
            <div className="mb-16">
              <h2 className="font-headline-md text-headline-md text-primary-container mb-2">Acceso Institucional</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Ingrese sus credenciales académicas para acceder al sistema.</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 p-4 bg-error-container text-error text-sm flex items-start gap-3 border-l-4 border-error"
              >
                <span className="material-symbols-outlined text-[20px]">error</span>
                <p>{error}</p>
              </motion.div>
            )}

            {/* Precision Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div className="relative group">
                <label className="block font-technical-sm text-technical-sm text-primary-container mb-2 uppercase tracking-wide" htmlFor="email">
                  Correo Institucional
                </label>
                <div className="flex items-end border-b-2 border-primary-container focus-within:border-secondary transition-colors pb-2">
                  <input 
                    className="flex-1 bg-transparent border-none p-0 font-body-md text-body-md text-primary-container placeholder:text-outline focus:ring-0 outline-none" 
                    id="email" 
                    name="email" 
                    placeholder="usuario" 
                    required 
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {!email.includes('@') && (
                    <span className="font-technical-sm text-technical-sm text-on-surface-variant pl-2 select-none">
                      @unipamplona.edu.co
                    </span>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div className="flex justify-between items-baseline mb-2">
                  <label className="block font-technical-sm text-technical-sm text-primary-container uppercase tracking-wide" htmlFor="password">
                    Contraseña
                  </label>
                  <button type="button" className="font-technical-sm text-technical-sm text-secondary hover:underline decoration-secondary underline-offset-4 bg-transparent border-none p-0 cursor-pointer">
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <div className="flex items-end border-b-2 border-primary-container focus-within:border-secondary transition-colors pb-2">
                  <input 
                    className="flex-1 bg-transparent border-none p-0 font-body-md text-body-md text-primary-container placeholder:text-outline focus:ring-0 outline-none" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    aria-label="Toggle password visibility" 
                    className="text-primary-container hover:text-secondary transition-colors flex items-center justify-center p-1 bg-transparent border-none cursor-pointer" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-8">
                <button 
                  className="w-full bg-primary-container text-surface-container-lowest font-label-caps text-label-caps py-4 px-6 rounded-none uppercase tracking-[0.2em] hover:bg-secondary transition-all duration-300 ease-out flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-surface-container-lowest/30 border-t-surface-container-lowest rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <span className="material-symbols-outlined text-[16px] transform group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </section>
      </main>
    </div>
  );
};
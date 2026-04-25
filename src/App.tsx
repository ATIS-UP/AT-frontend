import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { Artifacts } from './components/Artifacts';
import { Login } from './components/Login';
import { StudentProfileDrawer } from './components/StudentProfileDrawer';
import { motion, AnimatePresence } from 'motion/react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return { title: 'Tablero de Control', subtitle: 'Ingeniería de Sistemas' };
      case 'students': return { title: 'Estudiantes', subtitle: 'Listado Maestro' };
      case 'alerts': return { title: 'Alertas y Pérdidas', subtitle: 'Monitor de Riesgo' };
      case 'surveys': return { title: 'Encuestas', subtitle: 'Satisfacción y Seguimiento' };
      case 'new-activity': return { title: 'Nueva Actividad', subtitle: 'Registro de Eventos' };
      case 'artifacts': return { title: 'Artefactos', subtitle: 'Documentación Factorial' };
      default: return { title: 'UNIPAMPLONA', subtitle: 'Gestión Académica' };
    }
  };

  const { title, subtitle } = getViewTitle();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentList onSelectStudent={handleSelectStudent} />;
      case 'artifacts':
        return <Artifacts />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center mb-6">
               <span className="text-4xl text-brand-primary/20">🚧</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-400">Vista en desarrollo</h2>
            <p className="text-slate-400 mt-2 max-w-sm">Esta sección del sistema está siendo optimizada para ofrecer la mejor experiencia académica.</p>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-brand-background flex">
      <Sidebar 
        currentView={currentView} 
        onNavigate={(view) => {
          if (view === 'login') {
            setIsAuthenticated(false);
          } else {
            setCurrentView(view);
          }
        }} 
      />
      
      <main className="flex-1 ml-[236px] flex flex-col min-h-screen">
        <Topbar title={title} subtitle={subtitle} />
        
        <div className="px-10 py-8 flex-1 mt-[64px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="px-10 py-6 border-t border-slate-100/60 bg-white/50 text-center">
           <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
             © 2023 Universidad de Pamplona - Programa de Ingeniería de Sistemas
           </p>
        </footer>
      </main>

      <StudentProfileDrawer 
        student={selectedStudent} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}

export default App;

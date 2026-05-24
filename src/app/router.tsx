import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RoleGuard } from './guards/RoleGuard';
import { ErrorBoundary } from './guards/ErrorBoundary';
import { AppShell } from '../shared/components/layout/AppShell';
import { Rol } from '../shared/types/roles.types';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('../pages/LoginPage'));
const ResponderEncuestaPage = lazy(() => import('../pages/ResponderEncuestaPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ApoyoPage = lazy(() => import('../pages/ApoyoPage'));
const EstudiantesPage = lazy(() => import('../pages/EstudiantesPage'));
const AlertasPage = lazy(() => import('../pages/AlertasPage'));
const EncuestasPage = lazy(() => import('../pages/EncuestasPage'));
const ArtefactosPage = lazy(() => import('../pages/ArtefactosPage'));
const ParametrizacionPage = lazy(() => import('../pages/ParametrizacionPage'));
const PerfilPage = lazy(() => import('../pages/PerfilPage'));
const CasosEspecialesPage = lazy(() => import('../pages/CasosEspecialesPage'));
const ActividadesPage = lazy(() => import('../pages/ActividadesPage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>,
  },
  {
    path: '/encuestas/:encuestaId/responder',
    element: <Suspense fallback={<PageLoader />}><ResponderEncuestaPage /></Suspense>,
  },
  {
    path: '/',
    element: (
      <RoleGuard allowedRoles={[Rol.ADMINISTRADOR, Rol.DOCENTE, Rol.APOYO]}>
        <AppShell />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={<PageLoader />}><ErrorBoundary><DashboardPage /></ErrorBoundary></Suspense> },
      {
        path: 'estudiantes',
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><ErrorBoundary><EstudiantesPage /></ErrorBoundary></Suspense> },
        ],
      },
      { path: 'alertas', element: <Suspense fallback={<PageLoader />}><ErrorBoundary><AlertasPage /></ErrorBoundary></Suspense> },
      { path: 'casos-especiales', element: <Suspense fallback={<PageLoader />}><ErrorBoundary><CasosEspecialesPage /></ErrorBoundary></Suspense> },
      { path: 'actividades', element: <Suspense fallback={<PageLoader />}><ErrorBoundary><ActividadesPage /></ErrorBoundary></Suspense> },
      {
        path: 'encuestas',
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><ErrorBoundary><EncuestasPage /></ErrorBoundary></Suspense> },
        ],
      },

      {
        path: 'artefactos',
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><ErrorBoundary><ArtefactosPage /></ErrorBoundary></Suspense> },
        ],
      },
      {
        path: 'perfil',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ErrorBoundary>
              <RoleGuard allowedRoles={[Rol.ADMINISTRADOR, Rol.DOCENTE, Rol.APOYO]}>
                <PerfilPage />
              </RoleGuard>
            </ErrorBoundary>
          </Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ErrorBoundary>
              <RoleGuard allowedRoles={[Rol.ADMINISTRADOR]}>
                <AdminPage />
              </RoleGuard>
            </ErrorBoundary>
          </Suspense>
        ),
      },
      {
        path: 'parametrizacion',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ErrorBoundary>
              <RoleGuard allowedRoles={[Rol.ADMINISTRADOR, Rol.DOCENTE]}>
                <ParametrizacionPage />
              </RoleGuard>
            </ErrorBoundary>
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/apoyo',
    element: (
      <RoleGuard allowedRoles={[Rol.APOYO]}>
        <AppShell />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/apoyo/panel" replace /> },
      { path: 'panel', element: <Suspense fallback={<PageLoader />}><ErrorBoundary><ApoyoPage /></ErrorBoundary></Suspense> },
    ],
  },
]);
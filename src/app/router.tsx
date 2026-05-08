import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RoleGuard } from './guards/RoleGuard';
import { AppShell } from '../shared/components/layout/AppShell';
import { Rol } from '../shared/types/roles.types';

// Pages
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ApoyoPage from '../pages/ApoyoPage';
import EstudiantesPage from '../pages/EstudiantesPage';
import AlertasPage from '../pages/AlertasPage';
import EncuestasPage from '../pages/EncuestasPage';
import ActividadesPage from '../pages/ActividadesPage';
import ArtefactosPage from '../pages/ArtefactosPage';
import ParametrizacionPage from '../pages/ParametrizacionPage';
import PerfilPage from '../pages/PerfilPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'estudiantes',
        children: [
          { index: true, element: <EstudiantesPage /> },
        ],
      },
      { path: 'alertas', element: <AlertasPage /> },
      {
        path: 'encuestas',
        children: [
          { index: true, element: <EncuestasPage /> },
        ],
      },
      { path: 'actividades', element: <ActividadesPage /> },
      {
        path: 'artefactos',
        children: [
          { index: true, element: <ArtefactosPage /> },
        ],
      },
      {
        path: 'perfil',
        element: (
          <RoleGuard allowedRoles={[Rol.ADMINISTRADOR, Rol.DOCENTE, Rol.APOYO]}>
            <PerfilPage />
          </RoleGuard>
        ),
      },
      {
        path: 'parametrizacion',
        element: (
          <RoleGuard allowedRoles={[Rol.ADMINISTRADOR]}>
            <ParametrizacionPage />
          </RoleGuard>
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
      { path: 'panel', element: <ApoyoPage /> },
    ],
  },
]);
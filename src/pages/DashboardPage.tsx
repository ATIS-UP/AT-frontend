import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Dashboard } from '../features/dashboard/components/Dashboard';

export default function DashboardPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Tablero de Control</title>
        <meta name="description" content="Tablero de control del Sistema de Alertas Tempranas - Universidad de Pamplona." />
      </Helmet>
      <Dashboard />
    </>
  );
}
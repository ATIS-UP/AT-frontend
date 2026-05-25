import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Alertas } from '../features/alertas/components/Alertas';

export default function AlertasPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Alertas y Pérdidas</title>
        <meta name="description" content="Monitoreo de riesgo académico y alertas tempranas por estudiante - Universidad de Pamplona." />
      </Helmet>
      <Alertas />
    </>
  );
}
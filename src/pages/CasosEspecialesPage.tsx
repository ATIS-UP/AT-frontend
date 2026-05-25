import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CasosEspeciales } from '../features/casos-especiales/components/CasosEspeciales';

export default function CasosEspecialesPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Casos Especiales</title>
        <meta name="description" content="Gestión y seguimiento de casos especiales de estudiantes - Universidad de Pamplona." />
      </Helmet>
      <CasosEspeciales />
    </>
  );
}
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Artifacts } from '../features/artefactos/components/Artifacts';

export default function ArtefactosPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Documentos</title>
        <meta name="description" content="Evidencias y archivos del Sistema de Alertas Tempranas - Universidad de Pamplona." />
      </Helmet>
      <Artifacts />
    </>
  );
}
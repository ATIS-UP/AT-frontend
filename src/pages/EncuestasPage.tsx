import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Encuestas } from '../features/encuestas/components/Encuestas';

export default function EncuestasPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Encuestas</title>
        <meta name="description" content="Gestión de encuestas de satisfacción y seguimiento académico - Universidad de Pamplona." />
      </Helmet>
      <Encuestas />
    </>
  );
}
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Caracterizacion } from '../features/caracterizacion/components/Caracterizacion';

export default function CaracterizacionPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Caracterización</title>
        <meta name="description" content="Perfil socioeconómico y demográfico del cuerpo estudiantil." />
      </Helmet>
      <Caracterizacion />
    </>
  );
}

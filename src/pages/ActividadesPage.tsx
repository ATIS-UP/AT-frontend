import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Actividades } from '../features/actividades/components/Actividades';

export default function ActividadesPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Actividades</title>
        <meta name="description" content="Eventos de bienestar y apoyo académico - Universidad de Pamplona." />
      </Helmet>
      <Actividades />
    </>
  );
}
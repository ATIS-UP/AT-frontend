import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MonitoreoAcademico } from '../features/monitoreo/components/MonitoreoAcademico';

export default function MonitoreoPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Monitoreo Académico</title>
        <meta name="description" content="Monitoreo académico de estudiantes de primer semestre." />
      </Helmet>
      <MonitoreoAcademico />
    </>
  );
}

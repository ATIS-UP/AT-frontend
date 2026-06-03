import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ParticipacionEstudiantil } from '../features/participacion/components/ParticipacionEstudiantil';

export default function ParticipacionPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Participación Estudiantil</title>
        <meta name="description" content="Análisis de participación y caracterización estudiantil." />
      </Helmet>
      <ParticipacionEstudiantil />
    </>
  );
}

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ResponderEncuesta } from '../features/encuestas/components/ResponderEncuesta';

export default function ResponderEncuestaPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Responder Encuesta</title>
        <meta name="description" content="Responder encuesta de satisfacción del Sistema de Alertas Tempranas - Universidad de Pamplona." />
      </Helmet>
      <ResponderEncuesta />
    </>
  );
}

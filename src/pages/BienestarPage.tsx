import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BienestarTCBU } from '../features/bienestar/components/BienestarTCBU';

export default function BienestarPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Bienestar TCBU</title>
        <meta name="description" content="Tasa de Cobertura de Bienestar Universitario por servicio y periodo." />
      </Helmet>
      <BienestarTCBU />
    </>
  );
}

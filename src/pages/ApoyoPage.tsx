import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ApoyoDashboard } from '../features/dashboard/components/ApoyoDashboard';

export default function ApoyoPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Panel de Apoyo</title>
        <meta name="description" content="Panel de apoyo del Sistema de Alertas Tempranas - Universidad de Pamplona." />
      </Helmet>
      <ApoyoDashboard />
    </>
  );
}
/**
 * Las actividades usan fechas/hora de pared (hora local prevista por el usuario).
 * El backend almacena TIMESTAMP WITHOUT TIME ZONE. No convertir a UTC.
 */
export function fechaHoraActividad(fecha: string, hora: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error('Fecha inválida');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) throw new Error('Hora inválida');
  return `${fecha}T${hora}:00`;
}

export function horaGuardada(valor: string): string {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(valor)
    ? valor.slice(11, 16) : '';
}

export function mostrarFechaActividad(valor: string, mes: 'short' | 'long' = 'short'): string {
  const fecha = valor.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return 'Fecha no válida';
  // El mediodía local evita que una conversión de UTC cambie de día.
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-CO', {
    day: '2-digit', month: mes, year: 'numeric',
  });
}

export function mostrarHoraActividad(valor: string): string {
  const hora = horaGuardada(valor);
  if (!hora) return 'Hora no válida';
  const [hh, mm] = hora.split(':').map(Number);
  const ampm = hh < 12 ? 'a. m.' : 'p. m.';
  return `${String(hh % 12 || 12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ampm}`;
}

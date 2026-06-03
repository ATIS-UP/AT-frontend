export const EMPTY_STUDENT_FORM = {
  nombres: '',
  apellidos: '',
  codigo: '',
  email: '',
  programa: '',
  semestre: 1,
  documento: '',
  telefono: '',
};

export type StudentForm = typeof EMPTY_STUDENT_FORM;

export function validateStudentForm(form: StudentForm): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.nombres.trim()) errors.nombres = 'Requerido';
  else if (!/^[a-zA-ZáéíóúüñÑÁÉÍÓÚÜ\s]+$/.test(form.nombres)) errors.nombres = 'Solo letras';
  else if (form.nombres.length > 100) errors.nombres = 'Máx 100 caracteres';

  if (!form.apellidos.trim()) errors.apellidos = 'Requerido';
  else if (!/^[a-zA-ZáéíóúüñÑÁÉÍÓÚÜ\s]+$/.test(form.apellidos)) errors.apellidos = 'Solo letras';
  else if (form.apellidos.length > 100) errors.apellidos = 'Máx 100 caracteres';

  if (!form.codigo.trim()) errors.codigo = 'Requerido';
  else if (!/^\d+$/.test(form.codigo)) errors.codigo = 'Solo números';
  else if (form.codigo.length > 20) errors.codigo = 'Máx 20 caracteres';

  if (form.email && form.email.trim()) {
    if (!form.email.includes('@')) errors.email = 'Debe contener @';
    else if (form.email.length > 100) errors.email = 'Máx 100 caracteres';
  }

  if (!form.documento.trim()) errors.documento = 'Requerido';
  else if (!/^\d+$/.test(form.documento)) errors.documento = 'Solo números';
  else if (form.documento.length > 100) errors.documento = 'Máx 100 caracteres';

  if (!form.telefono.trim()) errors.telefono = 'Requerido';
  else if (!/^\d+$/.test(form.telefono)) errors.telefono = 'Solo números';
  else if (form.telefono.length > 100) errors.telefono = 'Máx 100 caracteres';

  if (!form.programa.trim()) errors.programa = 'Requerido';
  else if (form.programa.length > 100) errors.programa = 'Máx 100 caracteres';

  return errors;
}

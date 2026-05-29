import { z } from 'zod';

export const CharType = {
  LETTERS: /^[a-zA-ZáéíóúüñÑÁÉÍÓÚÜ\s]*$/,
  DIGITS: /^\d*$/,
  ALPHANUMERIC: /^[a-zA-ZáéíóúüñÑÁÉÍÓÚÜ0-9\s]*$/,
  EMAIL: /^[a-zA-Z0-9@._\-]*$/,
  FULL_TEXT: /^[a-zA-ZáéíóúüñÑÁÉÍÓÚÜ0-9\s\-.,/#()!?;:_"']*$/,
} as const;

export function createCharFilter(pattern: RegExp) {
  return (value: string): string =>
    value
      .split('')
      .filter((c) => pattern.test(c))
      .join('');
}

export function zodCharType(pattern: RegExp, message: string) {
  return z.string().regex(pattern, message);
}

export const ERROR_MSGS = {
  LETTERS: 'Solo se permiten letras y espacios',
  DIGITS: 'Solo se permiten números',
  ALPHANUMERIC: 'Solo se permiten letras, números y espacios',
  EMAIL: 'Caracteres no válidos en el email',
  FULL_TEXT: 'Caracteres no válidos',
};

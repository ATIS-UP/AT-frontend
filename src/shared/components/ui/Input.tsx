import React from 'react';
import { useController, type Control, type FieldValues, type Path, type RegisterOptions } from 'react-hook-form';
import { cn } from '@/src/lib/utils';

interface InputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  control: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
  disabled?: boolean;
  className?: string;
}

export function Input<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  control,
  rules,
  disabled,
  className,
}: InputProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  const errorId = `${name}-error`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        {...field}
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded border px-3 py-2 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
          error
            ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500'
            : 'border-slate-300 hover:border-slate-400'
        )}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

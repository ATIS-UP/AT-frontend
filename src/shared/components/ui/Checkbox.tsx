import React from 'react';
import { useController, type Control, type FieldValues, type Path, type RegisterOptions } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface CheckboxProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  control: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
  disabled?: boolean;
  className?: string;
}

export function Checkbox<T extends FieldValues>({
  name,
  label,
  control,
  rules,
  disabled,
  className,
}: CheckboxProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  const errorId = `${name}-error`;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        htmlFor={name}
        className={cn(
          'flex items-center gap-2 cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          type="checkbox"
          id={name}
          checked={!!field.value}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
          ref={field.ref}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-4 w-4 rounded border transition-colors cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary/30',
            error ? 'border-red-500' : 'border-slate-300'
          )}
        />
        {label && <span className="text-sm text-slate-700">{label}</span>}
      </label>
      {error && (
        <p id={errorId} className="text-xs text-red-600 ml-6" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

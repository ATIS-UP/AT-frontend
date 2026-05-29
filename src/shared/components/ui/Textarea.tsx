import React, { useCallback } from 'react';
import { useController, type Control, type FieldValues, type Path, type RegisterOptions } from 'react-hook-form';
import { cn } from '@/src/lib/utils';
import { createCharFilter } from '@/src/lib/validation';

interface TextareaProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  rows?: number;
  maxLength?: number;
  control: Control<T>;
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
  disabled?: boolean;
  className?: string;
  charType?: RegExp;
}

export function Textarea<T extends FieldValues>({
  name,
  label,
  rows = 4,
  maxLength,
  control,
  placeholder,
  rules,
  disabled,
  className,
  charType,
}: TextareaProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  const errorId = `${name}-error`;
  const charCount = typeof field.value === 'string' ? field.value.length : 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const raw = e.target.value;
      if (charType) {
        const filter = createCharFilter(charType);
        const filtered = filter(raw);
        if (filtered !== raw) {
          e.target.value = filtered;
        }
      }
      field.onChange(e);
    },
    [charType, field],
  );

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        {...field}
        id={name}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded border px-3 py-2 text-sm transition-colors resize-y',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
          error
            ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500'
            : 'border-slate-300 hover:border-slate-400'
        )}
      />
      <div className="flex items-center justify-between">
        {error && (
          <p id={errorId} className="text-xs text-red-600" role="alert">
            {error.message}
          </p>
        )}
        {maxLength && (
          <span className="text-xs text-slate-400 ml-auto">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

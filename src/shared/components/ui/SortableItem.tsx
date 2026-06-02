import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/src/lib/utils';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';

export interface SortableRowProps {
  id: UniqueIdentifier;
  children: (handleProps: {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners | undefined;
    setHandleRef: (el: HTMLElement | null) => void;
    isDragging: boolean;
  }) => React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SortableRow({ id, children, className, disabled = false }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'z-10 opacity-70', className)}
    >
      {children({
        attributes,
        listeners,
        setHandleRef: setActivatorNodeRef,
        isDragging,
      })}
    </div>
  );
}

export interface DragHandleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  listeners?: DraggableSyntheticListeners;
  handleRef?: (el: HTMLElement | null) => void;
  disabled?: boolean;
}

export function DragHandle({ listeners, handleRef, disabled, className, ...rest }: DragHandleProps) {
  return (
    <button
      type="button"
      ref={handleRef as React.Ref<HTMLButtonElement>}
      aria-label="Arrastrar para reordenar"
      disabled={disabled}
      className={cn(
        'flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing touch-none select-none transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
        className
      )}
      {...(listeners ?? {})}
      {...rest}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
        <circle cx="3" cy="3" r="1.4" />
        <circle cx="3" cy="7" r="1.4" />
        <circle cx="3" cy="11" r="1.4" />
        <circle cx="11" cy="3" r="1.4" />
        <circle cx="11" cy="7" r="1.4" />
        <circle cx="11" cy="11" r="1.4" />
      </svg>
    </button>
  );
}

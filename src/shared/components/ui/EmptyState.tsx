import React from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="mb-4 text-slate-300">
        {icon ?? <Package className="w-12 h-12" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-600 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm">{description}</p>
      )}
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

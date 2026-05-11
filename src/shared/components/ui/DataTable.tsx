import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { EmptyState } from './EmptyState';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSortChange?: (sort: SortingState) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  mobileCardRenderer?: (item: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  totalItems,
  page,
  pageSize,
  onPageChange,
  onSortChange,
  isLoading = false,
  emptyState,
  mobileCardRenderer,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      onSortChange?.(next);
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages,
  });

  // loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  // empty state
  if (data.length === 0) {
    return (
      <div className={className}>
        {emptyState ?? <EmptyState title="Sin datos" description="No hay registros para mostrar." />}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* desktop table */}
      <div className="hidden md:block overflow-x-auto rounded border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider',
                        canSort && 'cursor-pointer select-none hover:bg-slate-100'
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-slate-400">
                            {sorted === 'asc' && <ArrowUp className="w-3.5 h-3.5" />}
                            {sorted === 'desc' && <ArrowDown className="w-3.5 h-3.5" />}
                            {!sorted && <ArrowUpDown className="w-3.5 h-3.5" />}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      {mobileCardRenderer && (
        <div className="md:hidden space-y-3">
          {data.map((item, idx) => (
            <div key={idx}>{mobileCardRenderer(item)}</div>
          ))}
        </div>
      )}

      {/* fallback mobile: simple table if no card renderer */}
      {!mobileCardRenderer && (
        <div className="md:hidden overflow-x-auto rounded border border-slate-200">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100 bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} totalItems={totalItems} />
    </div>
  );
}

// pagination sub-component
function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
}) {
  // generate visible page numbers
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [1];
    if (page > 3) pages.push('ellipsis');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-xs text-slate-500">
        {totalItems} registro{totalItems !== 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPageNumbers().map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e-${idx}`} className="px-1 text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-7 h-7 rounded text-xs font-medium transition-colors',
                p === page
                  ? 'bg-brand-primary text-white'
                  : 'hover:bg-slate-100 text-slate-600'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  emptyTitle = 'No results',
  emptyDescription = 'There is nothing to display yet.',
  className,
}: DataTableProps<T>) {
  if (isLoading) return <Loader />;

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border', className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className={cn('px-4 py-3 font-medium', column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
              {columns.map((column) => (
                <td key={`${row.id}-${String(column.key)}`} className={cn('px-4 py-3', column.className)}>
                  {column.cell
                    ? column.cell(row)
                    : String((row as Record<string, unknown>)[column.key as string] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

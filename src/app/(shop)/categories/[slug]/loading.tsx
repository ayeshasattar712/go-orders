import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryLoading() {
  return (
    <div className="pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="mt-4">
        <Skeleton className="h-52 w-full sm:h-64" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="-mt-14 flex items-end gap-4 pb-2">
            <Skeleton className="border-background h-20 w-20 shrink-0 rounded-2xl border-4" />
            <div className="flex-1 space-y-2 pb-1">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-80" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 py-6 sm:max-w-xl">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="mb-5 h-7 w-48" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-60 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

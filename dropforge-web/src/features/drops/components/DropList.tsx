
import { useGetDropsQuery } from '@/store/apis/drops';
import { DropCard } from './DropCard';
import { Skeleton } from '@/components/ui/skeleton';

export function DropList() {
  const { data: drops, isLoading, isError, error } = useGetDropsQuery();

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-destructive/50 bg-destructive/10 text-destructive">
        <p className="font-semibold text-lg">Failed to load drops</p>
        <p className="text-sm opacity-80 mt-1">
          {/* @ts-ignore */}
          {error?.data?.message || 'An unexpected error occurred while fetching the drops.'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-full mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!drops || drops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border/50 bg-background/50 backdrop-blur">
        <h3 className="text-xl font-bold">No drops available</h3>
        <p className="text-muted-foreground mt-2">Check back later for upcoming exclusive drops.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {drops.map((drop) => (
        <DropCard key={drop.id} drop={drop} />
      ))}
    </div>
  );
}

import { useState } from 'react';
import { useGetDropsQuery } from '@/store/apis/drops';
import { DropCard } from './DropCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Coming Soon', value: 'coming soon' },
  { label: 'Sold Out', value: 'soldout' },
];

export function DropList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  
  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, isError, error, isFetching } = useGetDropsQuery({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    status: status || undefined,
  });

  const drops = response?.data || [];
  const meta = response?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

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

  return (
    <div className="flex flex-col space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-[16px] border border-border shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search drops..." 
            value={search}
            onChange={handleSearchChange}
            className="pl-9 bg-secondary border-transparent focus-visible:ring-primary rounded-full"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={status === opt.value ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleStatusChange(opt.value)}
              className={`rounded-full transition-all ${status === opt.value ? 'shadow-md' : 'hover:bg-secondary/80'}`}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading || isFetching ? (
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
      ) : drops.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border/50 bg-background/50 backdrop-blur">
          <h3 className="text-xl font-bold">No drops found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {drops.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isFetching && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm font-medium text-body">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-full"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

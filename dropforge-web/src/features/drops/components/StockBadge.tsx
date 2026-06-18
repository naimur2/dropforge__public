
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StockBadgeProps {
  availableStock: number;
  totalStock: number;
  className?: string;
}

export function StockBadge({ availableStock, totalStock, className }: StockBadgeProps) {
  const isSoldOut = availableStock === 0;
  const isLowStock = availableStock > 0 && availableStock <= Math.max(5, totalStock * 0.1);

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-xs px-2 py-0.5 whitespace-nowrap transition-colors',
        isSoldOut
          ? 'border-destructive text-destructive bg-destructive/10'
          : isLowStock
          ? 'border-amber-500 text-amber-500 bg-amber-500/10'
          : 'border-green-500 text-green-500 bg-green-500/10',
        className
      )}
    >
      {isSoldOut ? (
        'SOLD OUT'
      ) : (
        <>
          <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full inline-block', isLowStock ? 'animate-pulse bg-amber-500' : 'bg-green-500')} />
          {availableStock} / {totalStock} LEFT
        </>
      )}
    </Badge>
  );
}

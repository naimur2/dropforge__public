
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
        'text-[11px] font-medium tracking-[0.5px] uppercase px-[8px] py-[4px] rounded-[8px] transition-colors border-0',
        isSoldOut
          ? 'text-fg-danger-strong bg-danger-soft'
          : isLowStock
          ? 'text-fg-warning bg-warning-soft'
          : 'text-fg-success-strong bg-success-soft',
        className
      )}
    >
      {isSoldOut ? (
        'SOLD OUT'
      ) : (
        <>
          <span className={cn('mr-[6px] h-[6px] w-[6px] rounded-full inline-block', isLowStock ? 'animate-pulse bg-fg-warning' : 'bg-fg-success-strong')} />
          {availableStock} / {totalStock} LEFT
        </>
      )}
    </Badge>
  );
}

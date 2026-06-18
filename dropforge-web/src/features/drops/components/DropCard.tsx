
import type { DropDto } from '@/shared/dto';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockBadge } from './StockBadge';
import { CalendarClock, Flame } from 'lucide-react';
import { formatDistanceToNow, isFuture } from 'date-fns';
import { useCreateReservationMutation } from '@/store/apis/reservations';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';

interface DropCardProps {
  drop: DropDto;
  onReservationSuccess?: (reservationId: string) => void;
}

export function DropCard({ drop, onReservationSuccess }: DropCardProps) {
  const [createReservation, { isLoading }] = useCreateReservationMutation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const isUpcoming = isFuture(new Date(drop.startAt));
  const isSoldOut = drop.availableStock <= 0;
  const canReserve = !isUpcoming && !isSoldOut;

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to reserve this drop.');
      return;
    }
    
    try {
      const reservation = await createReservation({ dropId: drop.id }).unwrap();
      toast.success(`Successfully reserved ${drop.name}!`);
      if (onReservationSuccess) {
        onReservationSuccess(reservation.id);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reserve drop. It might be sold out.');
    }
  };

  return (
    <Card className="group overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {drop.imageUrl ? (
          <img
            src={drop.imageUrl}
            alt={drop.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Flame className="w-12 h-12 text-muted-foreground opacity-20" />
          </div>
        )}
        
        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <StockBadge availableStock={drop.availableStock} totalStock={drop.totalStock} />
          
          {isUpcoming && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md text-xs font-semibold text-foreground border border-border/50 shadow-sm">
              <CalendarClock className="w-3.5 h-3.5 text-primary" />
              <span>Starts {formatDistanceToNow(new Date(drop.startAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl font-bold tracking-tight line-clamp-1">{drop.name}</CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 grow">
        {drop.latestPurchasers?.length > 0 && (
          <div className="mt-2 flex -space-x-2 overflow-hidden">
            <div className="text-xs text-muted-foreground mb-1 w-full flex items-center gap-1">
              🔥 Recently copped by:
            </div>
            {/* Just a visual representation of recent buyers */}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <Button 
          onClick={handleReserve} 
          disabled={!canReserve || isLoading} 
          className="w-full font-bold uppercase tracking-wider relative overflow-hidden group/btn"
          variant={isUpcoming ? "secondary" : "default"}
        >
          {isLoading ? (
            'Securing Drop...'
          ) : isUpcoming ? (
            'Coming Soon'
          ) : isSoldOut ? (
            'Sold Out'
          ) : (
            <>
              <span className="relative z-10">Reserve Now</span>
              <div className="absolute inset-0 bg-primary-foreground/10 translate-y-full transition-transform group-hover/btn:translate-y-0" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

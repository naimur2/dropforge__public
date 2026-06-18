
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
    <Card className="group overflow-hidden rounded-2xl glass-card flex flex-col h-full transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 relative">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/5 to-background pointer-events-none z-10" />
      
      <div className="relative aspect-square overflow-hidden bg-muted">
        {drop.imageUrl ? (
          <img
            src={drop.imageUrl}
            alt={drop.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Flame className="w-16 h-16 text-muted-foreground/30 animate-pulse" />
          </div>
        )}
        
        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
          <StockBadge availableStock={drop.availableStock} totalStock={drop.totalStock} />
          
          {isUpcoming && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-[11px] font-bold text-foreground border border-border/50 shadow-lg shadow-black/20 uppercase tracking-wide">
              <CalendarClock className="w-3.5 h-3.5 text-primary" />
              <span>Starts {formatDistanceToNow(new Date(drop.startAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>

      <CardHeader className="p-5 pb-2 relative z-20">
        <CardTitle className="text-2xl font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
          {drop.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 pt-0 grow relative z-20 flex flex-col">
        {drop.latestPurchasers?.length > 0 ? (
          <div className="mt-auto flex flex-col space-y-1.5">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Recently copped by:
            </div>
            <div className="flex flex-wrap gap-1">
               {drop.latestPurchasers.map((p, i) => (
                 <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/40 font-medium">
                   @{p.username}
                 </span>
               ))}
            </div>
          </div>
        ) : (
          <div className="mt-auto text-xs text-muted-foreground/50 italic">Be the first to secure this drop.</div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto relative z-20">
        <Button 
          onClick={handleReserve} 
          disabled={!canReserve || isLoading} 
          className="w-full h-11 font-bold uppercase tracking-widest relative overflow-hidden group/btn rounded-xl transition-all shadow-md active:scale-95"
          variant={isUpcoming ? "secondary" : "default"}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 animate-spin" /> Securing...
            </span>
          ) : isUpcoming ? (
            'Coming Soon'
          ) : isSoldOut ? (
            'Sold Out'
          ) : (
            <>
              <span className="relative z-10 drop-shadow-sm flex items-center gap-2">
                 Reserve Now <Flame className="w-4 h-4 opacity-70 group-hover/btn:opacity-100 group-hover/btn:animate-bounce" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-white/20 to-primary/0 -translate-x-full transition-transform duration-700 ease-in-out group-hover/btn:translate-x-full" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

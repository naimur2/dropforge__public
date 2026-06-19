
import type { DropDto } from '@/shared/dto';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockBadge } from './StockBadge';
import { CalendarClock, Flame } from 'lucide-react';
import { formatDistanceToNow, isFuture, differenceInSeconds } from 'date-fns';
import { useCreateReservationMutation, useGetMyReservationsQuery } from '@/store/apis/reservations';
import { useCreatePurchaseMutation } from '@/store/apis/purchases';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import { AuthModals } from '@/features/auth/components/AuthModals';
import { useEffect, useState, useRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

interface DropCardProps {
  drop: DropDto;
  onReservationSuccess?: (reservationId: string) => void;
}

export function DropCard({ drop, onReservationSuccess }: DropCardProps) {
  const [createReservation, { isLoading: isReserving }] = useCreateReservationMutation();
  const [createPurchase, { isLoading: isPurchasing }] = useCreatePurchaseMutation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: reservations, refetch: refetchReservations } = useGetMyReservationsQuery(undefined, { skip: !isAuthenticated });

  const activeReservation = reservations?.find((res) => res.dropId === drop.id && res.status === 'ACTIVE');
  const hasReserved = !!activeReservation;

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    if (!activeReservation) {
      setTimeLeft(null);
      return;
    }

    const calculateRemaining = () => {
      const remaining = differenceInSeconds(new Date(activeReservation.expiresAt), new Date());
      return remaining > 0 ? remaining : 0;
    };

    setTimeLeft(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        refetchReservations();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReservation, refetchReservations]);

  const isUpcoming = isFuture(new Date(drop.startAt));
  const isSoldOut = drop.availableStock <= 0;
  const canReserve = !isUpcoming && !isSoldOut && !hasReserved;

  const handleReserve = async () => {
    if (cooldown) return;
    
    if (!isAuthenticated) {
      toast.error('Please sign in to reserve this drop.');
      return;
    }
    
    if (!turnstileToken) {
      toast.error('Security check running, please wait a moment...');
      return;
    }

    setCooldown(true);
    setTimeout(() => setCooldown(false), 2000); // 2 second throttle

    try {
      const reservation = await createReservation({ 
        dropId: drop.id,
        turnstileToken
      }).unwrap();
      toast.success(`Successfully reserved ${drop.name}!`);
      turnstileRef.current?.reset();
      if (onReservationSuccess) {
        onReservationSuccess(reservation.id);
      }
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || 'Failed to reserve drop. It might be sold out.');
      turnstileRef.current?.reset();
    }
  };

  const handlePurchase = async () => {
    if (!activeReservation) return;
    try {
      await createPurchase({ reservationId: activeReservation.id }).unwrap();
      toast.success('Successfully copped! You are now an owner.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Checkout failed');
    }
  };

  return (
    <Card className="group overflow-hidden !pt-0 rounded-[12px] bg-card border border-border shadow-sm flex flex-col h-full transform transition-all duration-300 hover:bg-muted hover:shadow-md relative">
      <div className="relative aspect-square overflow-hidden bg-secondary flex items-center justify-center">
        {drop.imageUrl ? (
          <img
            src={drop.imageUrl}
            alt={drop.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/20">
            <Flame className="w-16 h-16 text-muted-foreground/30 animate-pulse" />
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-4 right-4 z-20">
          <StockBadge availableStock={drop.availableStock} totalStock={drop.totalStock} />
        </div>
        
        {isUpcoming && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-background/90 backdrop-blur-md text-[11px] font-bold text-heading border border-border shadow-sm uppercase tracking-wide">
            <CalendarClock className="w-3.5 h-3.5 text-primary" />
            <span>Starts {formatDistanceToNow(new Date(drop.startAt), { addSuffix: true })}</span>
          </div>
        )}
      </div>

      <CardHeader className="px-4 py-3 pb-1 relative z-20">
        <CardTitle className="text-[20px] font-medium leading-[1.27] text-heading line-clamp-1 group-hover:text-primary transition-colors">
          {drop.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pt-0 pb-2 grow relative z-20 flex flex-col">
        {drop.latestPurchasers?.length > 0 ? (
          <div className="flex flex-col space-y-1.5">
            <div className="text-[12px] text-body-subtle font-medium flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Recently copped by:
            </div>
            <div className="flex flex-wrap gap-1">
               {drop.latestPurchasers.map((p, i) => (
                 <span key={i} className="text-[11px] px-2 py-0.5 rounded-[8px] bg-secondary text-heading border border-border font-medium">
                   @{p.username}
                 </span>
               ))}
            </div>
          </div>
        ) : (
          <div className="text-[12px] text-body-subtle">Be the first to secure this drop.</div>
        )}
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-5 mt-auto relative z-20">
        <Turnstile
          siteKey={(import.meta as any).env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
          options={{ action: 'reserve', size: 'invisible' }}
          onSuccess={(token: string) => setTurnstileToken(token)}
          ref={turnstileRef}
        />
        {!isAuthenticated && canReserve ? (
          <AuthModals 
            defaultMode="login" 
            trigger={
              <Button 
                onClick={handleReserve} 
                disabled={isReserving} 
                className="w-full h-11 text-[14px] font-medium tracking-[0.1px] relative overflow-hidden group/btn rounded-[8px] transition-all shadow-sm active:scale-95"
                variant="default"
              >
                <span className="relative z-10 drop-shadow-sm flex items-center gap-2">
                   Reserve Now <Flame className="w-4 h-4 opacity-70 group-hover/btn:opacity-100 group-hover/btn:animate-bounce" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-white/20 to-primary/0 -translate-x-full transition-transform duration-700 ease-in-out group-hover/btn:translate-x-full" />
              </Button>
            } 
          />
        ) : hasReserved && timeLeft !== null && timeLeft > 0 ? (
          <Button 
            onClick={handlePurchase} 
            disabled={isPurchasing} 
            className="w-full h-11 text-[14px] font-medium tracking-[0.1px] relative overflow-hidden rounded-[8px] transition-all shadow-sm active:scale-95 bg-green-600 hover:bg-green-700 text-white"
          >
            {isPurchasing ? (
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Complete Purchase ({timeLeft}s)
              </span>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleReserve} 
            disabled={!canReserve || isReserving} 
            className="w-full h-11 text-[14px] font-medium tracking-[0.1px] relative overflow-hidden group/btn rounded-[8px] transition-all shadow-sm active:scale-95"
            variant={isUpcoming ? "secondary" : "default"}
          >
            {isReserving ? (
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
        )}
      </CardFooter>
    </Card>
  );
}

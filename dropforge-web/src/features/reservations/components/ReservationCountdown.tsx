import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface ReservationCountdownProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
}

export function ReservationCountdown({ expiresAt, onExpire, className }: ReservationCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const targetDate = new Date(expiresAt).getTime();
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      return difference > 0 ? difference : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  // Format mm:ss
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isWarning = timeLeft > 0 && timeLeft <= 60000; // less than 60 seconds
  const isExpired = timeLeft <= 0;

  if (isExpired) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-sm px-2 py-1 rounded-md border transition-colors',
        isWarning
          ? 'border-destructive text-destructive bg-destructive/10 animate-pulse'
          : 'border-primary/50 text-primary bg-primary/10',
        className
      )}
    >
      <Clock className="w-4 h-4" />
      <span>{formattedTime}</span>
    </div>
  );
}

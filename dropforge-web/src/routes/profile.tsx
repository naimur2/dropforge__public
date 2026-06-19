import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAppSelector } from '@/store/hooks';
import { useGetMyReservationsQuery } from '@/store/apis/reservations';
import { Flame, Clock, PackageCheck } from 'lucide-react';
import { format } from 'date-fns';

export const Route = createFileRoute('/profile')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/',
      });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: reservations, isLoading } = useGetMyReservationsQuery();

  if (!user) return null;

  return (
    <div className="flex flex-col w-full max-w-[1152px] mx-auto px-6 py-[48px] gap-8">
      {/* Profile Header */}
      <div className="bg-card border border-border shadow-sm rounded-[24px] p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
          <span className="text-4xl font-medium text-primary">
            {user?.username?.substring(0, 2).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex flex-col items-center md:items-start z-10 text-center md:text-left">
          <h1 className="text-[32px] font-medium text-heading leading-tight">{user?.username || 'User'}</h1>
          <p className="text-body-subtle text-[16px]">{user?.email || ''}</p>
        </div>
        <div className="md:ml-auto mt-4 md:mt-0 flex flex-col items-center md:items-end gap-1 z-10">
          <span className="text-[12px] font-medium text-body-subtle uppercase tracking-wider">Member Since</span>
          <span className="text-[14px] font-medium text-heading bg-muted px-3 py-1 rounded-[8px] border border-border">
            {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}
          </span>
        </div>
      </div>

      {/* Reservations Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[24px] font-medium text-heading flex items-center gap-2">
          <PackageCheck className="w-6 h-6 text-primary" />
          My Reservations
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Flame className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !reservations || reservations.length === 0 ? (
          <div className="bg-muted rounded-[16px] border border-border p-12 text-center flex flex-col items-center shadow-inner">
            <Clock className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-[18px] font-medium text-heading">No reservations yet</h3>
            <p className="text-body-subtle mt-2">When you secure a drop, it will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((res) => (
              <div key={res.id} className="bg-card border border-border shadow-sm rounded-[16px] overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                <div className="aspect-square bg-secondary relative overflow-hidden">
                  {res.drop.imageUrl ? (
                    <img 
                      src={res.drop.imageUrl} 
                      alt={res.drop.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                      <Flame className="w-12 h-12 text-muted-foreground/30 animate-pulse" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-medium border border-border shadow-sm">
                    {res.status === 'PURCHASED' ? (
                      <span className="text-green-500">Purchased</span>
                    ) : res.status === 'EXPIRED' ? (
                      <span className="text-red-500">Expired</span>
                    ) : (
                      <span className="text-primary">Reserved</span>
                    )}
                  </div>
                </div>
                <div className="p-4 flex flex-col grow">
                  <h3 className="font-medium text-[18px] text-heading truncate group-hover:text-primary transition-colors">{res.drop.name}</h3>
                  <p className="text-body-subtle text-[14px] mt-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Reserved on {format(new Date(res.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

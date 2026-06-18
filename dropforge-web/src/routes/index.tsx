import { createFileRoute } from '@tanstack/react-router';
import { DropList } from '@/features/drops/components/DropList';
import { Flame } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="w-full bg-muted relative overflow-hidden py-[96px]">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 blur-[100px] rounded-full mix-blend-screen animate-pulse opacity-60" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full mix-blend-screen animate-pulse opacity-60" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-[1152px] mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-[48px]">
          <div className="flex-1 space-y-[24px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-medium border border-primary/20">
              <Flame className="w-[14px] h-[14px] animate-bounce" />
              <span className="uppercase tracking-[0.5px]">Next-gen Drop Platform</span>
            </div>
            
            <h1 className="text-[36px] md:text-[45px] lg:text-[57px] font-medium text-heading leading-[1.12] tracking-[-0.25px]">
              Secure the <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-500 drop-shadow-sm">
                Unobtainable
              </span>
            </h1>
            
            <p className="text-[18px] text-body max-w-[70ch] leading-[1.5] tracking-[0.5px]">
              Real-time inventory. Instant reservations. Zero lag.
              Join the ultimate platform for high-demand product drops.
            </p>
          </div>

          <div className="hidden lg:flex flex-1 justify-center relative z-10">
             <div className="relative w-72 h-72 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden transition-transform duration-700 hover:rotate-12 hover:scale-105">
                <Flame className="w-32 h-32 text-primary/80 animate-pulse" />
             </div>
          </div>
        </div>
      </section>

      {/* Drops Grid Section */}
      <section className="w-full bg-background py-[96px]">
        <div className="max-w-[1152px] mx-auto px-6 space-y-[48px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[28px] md:text-[36px] lg:text-[45px] font-medium text-heading leading-[1.16] flex items-center gap-3">
              Active & Upcoming
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </h2>
          </div>
          
          <DropList />
        </div>
      </section>
    </div>
  );
}

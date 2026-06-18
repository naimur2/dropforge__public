import { createFileRoute } from '@tanstack/react-router';
import { DropList } from '@/features/drops/components/DropList';
import { Flame } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-card/40 border border-border/30 p-10 md:p-20 text-center md:text-left flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-background/20 group">
        
        {/* Animated Background Orbs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 blur-[100px] rounded-full mix-blend-screen animate-pulse opacity-60" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full mix-blend-screen animate-pulse opacity-60" style={{ animationDelay: '2s' }} />
        
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex-1 space-y-6 z-10 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <Flame className="w-4 h-4 animate-bounce" />
            <span className="uppercase tracking-wider text-xs">Next-gen Drop Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Secure the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-cyan-400 to-purple-500 drop-shadow-sm animate-gradient-x">
              Unobtainable
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground/90 max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed">
            Real-time inventory. Instant reservations. Zero lag.
            Join the ultimate platform for high-demand product drops.
          </p>
        </div>

        {/* Decorative elements for the right side of hero (optional illustration placeholder) */}
        <div className="hidden lg:flex flex-1 justify-center relative z-10">
           <div className="relative w-72 h-72 rounded-full border border-primary/20 bg-primary/5 shadow-[0_0_50px_rgba(var(--primary),0.1)] flex items-center justify-center overflow-hidden transition-transform duration-700 hover:rotate-12 hover:scale-105">
              <Flame className="w-32 h-32 text-primary/80 animate-pulse" />
              <div className="absolute inset-0 bg-linear-to-tr from-transparent via-primary/10 to-transparent" />
           </div>
        </div>
      </section>

      {/* Drops Grid */}
      <section className="space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight inline-flex items-center gap-3">
            Active & Upcoming
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </h2>
        </div>
        <DropList />
      </section>
    </div>
  );
}

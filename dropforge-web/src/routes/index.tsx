import { createFileRoute } from '@tanstack/react-router';
import { DropList } from '@/features/drops/components/DropList';
import { Flame } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-secondary/30 border border-border/50 p-8 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center gap-8">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex-1 space-y-4 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Flame className="w-4 h-4" />
            <span>Next-gen Drop Platform</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Secure the <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500">Unobtainable</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
            Real-time inventory. Instant reservations. Zero lag.
            Join the ultimate platform for high-demand product drops.
          </p>
        </div>
      </section>

      {/* Drops Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Active & Upcoming Drops</h2>
        </div>
        <DropList />
      </section>
    </div>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { DropList } from '@/features/drops/components/DropList';
import { Zap, Shield, Clock } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="w-full bg-slate-50 dark:bg-[#0B0C10] text-slate-900 dark:text-white relative overflow-hidden pt-[120px] pb-[80px] transition-colors duration-300">
        {/* Spotlights and dark background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-slate-200/50 via-slate-50 to-slate-50 dark:from-slate-900/50 dark:via-[#0B0C10] dark:to-[#0B0C10] opacity-80 transition-colors duration-300" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="max-w-[1152px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-[64px]">
          {/* Left Column */}
          <div className="flex-1 space-y-[40px] w-full max-w-xl lg:max-w-none">
            
            {/* Top Text Content */}
            <div className="space-y-[24px]">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                <Zap className="w-4 h-4 fill-primary animate-pulse" />
                <span className="text-[13px] font-bold tracking-widest uppercase">Live Drop</span>
              </div>
              
              {/* Headings */}
              <h1 className="text-[48px] sm:text-[56px] lg:text-[72px] font-bold leading-[1.05] tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
                Real-Time Drops.<br />
                <span className="text-primary drop-shadow-[0_0_20px_rgba(var(--primary),0.3)]">Zero Second Misses.</span>
              </h1>
              
              {/* Description */}
              <p className="text-[18px] sm:text-[20px] text-slate-600 dark:text-slate-400 max-w-[45ch] leading-[1.6] transition-colors duration-300">
                Reserve limited edition sneakers in real-time. <br className="hidden sm:block" />
                60 seconds is all you get.
              </p>
            </div>
            
            {/* Features Row */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-slate-800/50">
              <div className="flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shadow-inner transition-colors duration-300">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300">Real-Time Stock</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed mt-1 transition-colors duration-300">Live inventory updates instantly</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shadow-inner transition-colors duration-300">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300">Atomic Reservations</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed mt-1 transition-colors duration-300">No overselling. Ever.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shadow-inner transition-colors duration-300">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300">60s To Checkout</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed mt-1 transition-colors duration-300">Complete your purchase before time runs out.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sneaker & Pedestal */}
          <div className="hidden lg:flex flex-1 justify-center items-center relative z-10 min-h-[600px] w-full">
             
             {/* Floating Sneaker */}
             <div className="relative z-20 animate-[bounce_6s_ease-in-out_infinite] w-full max-w-[450px] mt-[-5%]">
               <img 
                 src="https://freepngimg.com/thumb/shoes/27428-5-nike-shoes-transparent-background.png" 
                 alt="Limited Edition Sneaker"
                 className="w-full h-auto drop-shadow-[0_45px_45px_rgba(0,0,0,0.8)] transform -rotate-12 object-contain hover:scale-105 transition-transform duration-700"
                 onError={(e) => {
                   // Fallback if the png is unavailable
                   e.currentTarget.src = "https://cdn.pixabay.com/photo/2013/07/12/18/20/shoes-153310_960_720.png";
                 }}
               />
             </div>
             
             {/* Glowing Pedestal */}
             <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 w-[280px] h-[60px]">
               {/* Core Ring */}
               <div className="absolute inset-0 rounded-[100%] border-[5px] border-primary shadow-[0_0_35px_rgba(var(--primary),0.8),inset_0_0_25px_rgba(var(--primary),0.6)] z-10" />
               {/* Inner Glow Center */}
               <div className="absolute inset-4 rounded-[100%] bg-primary/40 blur-md" />
               
               {/* Base cylinder effect */}
               <div className="absolute top-[30px] left-[-10px] right-[-10px] h-[90px] bg-linear-to-b from-slate-200 to-slate-100 dark:from-[#151922] dark:to-[#050608] rounded-b-[100%] border-t-2 border-primary/30 dark:border-primary/50 shadow-xl transition-colors duration-300" />
               <div className="absolute top-[30px] left-0 right-0 h-[90px] bg-linear-to-b from-transparent to-slate-300 dark:to-black opacity-90 rounded-b-[100%] transition-colors duration-300" />
             </div>
             
             {/* Background particles/stars effect behind pedestal */}
             <div className="absolute inset-0 -z-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen" />
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

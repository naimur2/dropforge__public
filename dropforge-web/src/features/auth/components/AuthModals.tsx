import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoginMutation, useRegisterMutation } from '@/store/apis/auth';
import { toast } from 'sonner';

interface AuthModalsProps {
  defaultMode?: 'login' | 'register';
  trigger: React.ReactElement;
}

export function AuthModals({ defaultMode = 'login', trigger }: AuthModalsProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // API Hooks
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  const isLoading = isLoggingIn || isRegistering;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login({ email, password }).unwrap();
        toast.success('Successfully logged in!');
      } else {
        await register({ username, email, password }).unwrap();
        toast.success('Account created! Welcome to DropForge.');
      }
      setOpen(false);
      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (val) setMode(defaultMode); }}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md glass border-border/40 shadow-2xl overflow-hidden rounded-[2rem]">
        {/* Decorative background glow inside modal */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none opacity-50" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none opacity-50" />
        
        <DialogHeader className="relative z-10 pt-4">
          <DialogTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-br from-foreground to-foreground/70">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {mode === 'login' 
              ? 'Enter your credentials to access your account.' 
              : 'Join DropForge to reserve exclusive limited-edition drops.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-6 relative z-10">
          {mode === 'register' && (
            <div className="space-y-2.5">
              <Label htmlFor="username" className="font-semibold text-muted-foreground ml-1">Username</Label>
              <Input
                id="username"
                placeholder="hypebeast99"
                required
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl transition-all"
              />
            </div>
          )}
          <div className="space-y-2.5">
            <Label htmlFor="email" className="font-semibold text-muted-foreground ml-1">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl transition-all"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="password" className="font-semibold text-muted-foreground ml-1">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl transition-all"
            />
          </div>

          <Button type="submit" className="w-full h-12 mt-6 rounded-xl font-bold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all" disabled={isLoading}>
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mb-2 relative z-10">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-primary hover:text-primary/80 font-bold underline decoration-primary/30 underline-offset-4 transition-colors"
            disabled={isLoading}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

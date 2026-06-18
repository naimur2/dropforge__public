import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
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

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

export function AuthModals({ defaultMode = 'login', trigger }: AuthModalsProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  const [showPassword, setShowPassword] = useState(false);

  // Form setup
  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema) as any,
    defaultValues: { email: '', password: '', username: '' }
  });

  // API Hooks
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerAction, { isLoading: isRegistering }] = useRegisterMutation();

  const isLoading = isLoggingIn || isRegistering;

  const onSubmit = async (data: any) => {
    try {
      if (mode === 'login') {
        await login({ email: data.email, password: data.password }).unwrap();
        toast.success('Successfully logged in!');
      } else {
        await registerAction({ username: data.username!, email: data.email, password: data.password }).unwrap();
        toast.success('Account created! Welcome to DropForge.');
      }
      setOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (val) setMode(defaultMode); }}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md bg-popover border border-border shadow-xl overflow-hidden rounded-[28px] p-[24px]">
        <DialogHeader className="relative z-10 pt-2">
          <DialogTitle className="text-[24px] font-medium leading-[1.33] text-heading">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-[14px] leading-[1.4] text-body mt-2">
            {mode === 'login' 
              ? 'Enter your credentials to access your account.' 
              : 'Join DropForge to reserve exclusive limited-edition drops.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-[16px] py-4 relative z-10">
          {mode === 'register' && (
            <div className="space-y-1">
              <Label htmlFor="username" className="text-[12px] font-medium tracking-[0.4px] text-body-subtle ml-1">Username</Label>
              <Input
                id="username"
                placeholder="hypebeast99"
                disabled={isLoading}
                {...formRegister('username')}
                className={`bg-secondary text-heading text-[16px] border-transparent hover:border-input focus-visible:ring-0 focus-visible:border-primary rounded-[12px] px-[16px] py-[12px] h-auto transition-all ${errors.username ? 'border-red-500 focus-visible:border-red-500' : ''}`}
              />
              {errors.username && <p className="text-red-500 text-[12px] ml-1">{errors.username.message}</p>}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-[12px] font-medium tracking-[0.4px] text-body-subtle ml-1">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
              {...formRegister('email')}
              className={`bg-secondary text-heading text-[16px] border-transparent hover:border-input focus-visible:ring-0 focus-visible:border-primary rounded-[12px] px-[16px] py-[12px] h-auto transition-all ${errors.email ? 'border-red-500 focus-visible:border-red-500' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-[12px] ml-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password" className="text-[12px] font-medium tracking-[0.4px] text-body-subtle ml-1">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                {...formRegister('password')}
                className={`bg-secondary text-heading text-[16px] border-transparent hover:border-input focus-visible:ring-0 focus-visible:border-primary rounded-[12px] px-[16px] py-[12px] h-auto transition-all pr-[40px] ${errors.password ? 'border-red-500 focus-visible:border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-[12px] ml-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full h-[48px] mt-[24px] rounded-[12px] text-[14px] font-medium tracking-[0.1px] shadow-md transition-all" disabled={isLoading}>
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="text-center text-[14px] text-body mb-2 relative z-10">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              reset();
            }}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
            disabled={isLoading}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

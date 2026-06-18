
import { Flame, LogOut, User, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link, Outlet } from '@tanstack/react-router';
import { useAppSelector } from '@/store/hooks';
import { useLogoutMutation } from '@/store/apis/auth';
import { AuthModals } from '@/features/auth/components/AuthModals';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export function AppLayout() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success('Successfully logged out.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to logout. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative selection:bg-primary/30 selection:text-primary">
      {/* Ambient Background Glow */}
      <div className="pointer-events-none fixed inset-0 flex justify-center -z-10 overflow-hidden">
        <div className="absolute top-0 w-full max-w-7xl">
          <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full opacity-50 dark:opacity-30 mix-blend-screen" />
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full sticky top-0 z-50 bg-card">
        <header className="mx-auto max-w-[1152px] px-6 py-4 transition-all duration-300">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95 group">
              <div className="bg-primary/10 p-1.5 rounded-full border border-primary/20 group-hover:border-primary/50 transition-colors">
                <Flame className="h-5 w-5 text-primary group-hover:animate-pulse" />
              </div>
              <span className="font-medium text-[20px] tracking-tight hidden sm:inline-block text-heading">
                DropForge
              </span>
            </Link>

            <nav className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all"
              >
                <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all">
                      <Avatar className="h-9 w-9 border border-border shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  } />
                  <DropdownMenuContent className="w-56 bg-card border border-border shadow-lg rounded-[12px]" align="end">
                    <DropdownMenuLabel className="font-normal px-4 py-3 bg-muted border-b border-border">
                      <div className="flex flex-col space-y-1">
                        <p className="text-[14px] font-medium leading-none text-heading">{user.username}</p>
                        <p className="text-[14px] leading-none text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer hover:bg-muted focus:bg-muted transition-colors rounded-[8px] m-2">
                      <User className="mr-2 h-[18px] w-[18px] text-body" />
                      <span className="text-[14px] font-medium text-body">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer hover:bg-muted focus:bg-muted transition-colors rounded-[8px] m-2">
                      <LogOut className="mr-2 h-[18px] w-[18px]" />
                      <span className="text-[14px] font-medium">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <AuthModals defaultMode="login" trigger={<Button variant="ghost" className="rounded-full px-6 hover:bg-secondary/80">Sign In</Button>} />
                  <AuthModals defaultMode="register" trigger={<Button className="rounded-full px-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">Sign Up</Button>} />
                </div>
              )}
            </nav>
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto relative z-10">
        <div className="max-w-[1152px] mx-auto flex flex-col items-center justify-between gap-4 md:flex-row px-6">
          <div className="flex items-center gap-2 text-[14px] font-medium text-body">
            <Flame className="w-4 h-4 text-primary" />
            <p>Built for velocity. Engineered for scale.</p>
          </div>
          <p className="text-[14px] font-medium text-body">
            &copy; {new Date().getFullYear()} DropForge. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Global Toast Notifications */}
      <Toaster position="bottom-right" richColors theme={theme as any} />
    </div>
  );
}

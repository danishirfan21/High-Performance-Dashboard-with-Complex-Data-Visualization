'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">{user?.name}</span>
            <span className="text-xs text-muted-foreground">({user?.role})</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

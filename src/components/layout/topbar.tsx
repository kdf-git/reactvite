import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="topbar sticky top-0 z-20 h-16 border-b">
      <div className="h-full flex items-center px-4 md:px-6">
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 hover:text-primary hover:bg-primary/10 rounded-full"
          >
            <span className="material-icons">menu</span>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right side: Actions and Profile */}
        <div className="flex items-center space-x-2">

          {/* Theme Toggle */}
          <ThemeToggle />



          {/* User Profile - just show avatar in topbar */}
          <DropdownMenu
            open={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar?.url?.original} alt={user?.displayName || 'User'} />
                  <AvatarFallback>{getInitials(user?.displayName || 'User')}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">{user?.displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1 mt-1 inline-block">
                  {user?.role}
                </p>
              </div>
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex cursor-pointer items-center">
                  <span className="material-icons mr-2 text-sm">account_circle</span>
                  My Profile
                </Link>
              </DropdownMenuItem>


              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={handleLogout}>
                <span className="material-icons mr-2 text-sm">logout</span>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
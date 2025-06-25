import { useState } from 'react';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white p-4 shadow-sm md:hidden flex items-center justify-between">
      <h1 className="text-xl font-semibold text-primary flex items-center">
        <img src="/logo.png" alt="Tracksol Admin" className="w-10 h-10 mb-2" />
        <span className="text-xl font-bold text-gray-500 dark:text-gray-300">System</span>
      </h1>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full text-gray-700 hover:bg-gray-100">
              <span className="material-icons">notifications</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="py-2 max-h-[300px] overflow-y-auto">
              <div className="p-3 hover:bg-gray-100">
                <p className="text-sm font-medium">New order received</p>
                <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
              </div>
              <div className="p-3 hover:bg-gray-100">
                <p className="text-sm font-medium">Farm verification pending</p>
                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
              </div>
            </div>
            <div className="p-2 border-t border-gray-200">
              <Link href="/notifications">
                <a className="block w-full text-center text-sm text-primary p-2 hover:bg-gray-100 rounded">
                  View all notifications
                </a>
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu
          open={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <button className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user?.displayName || 'User')}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium">{user?.displayName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <a className="flex cursor-pointer items-center">
                  <span className="material-icons mr-2 text-sm">account_circle</span>
                  My Profile
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <a className="flex cursor-pointer items-center">
                  <span className="material-icons mr-2 text-sm">settings</span>
                  Settings
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
              <span className="material-icons mr-2 text-sm">logout</span>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={onMenuClick}
          className="md:hidden bg-primary text-white rounded-full p-2 shadow-lg"
        >
          <span className="material-icons">menu</span>
        </button>
      </div>
    </header>
  );
}

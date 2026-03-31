import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/services/ledger.service';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex justify-between items-center sticky top-0 z-30">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page context — hidden on mobile */}
      <div className="hidden md:block">
        <h2 className="text-lg font-semibold text-slate-800">Overview</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Batch Fund Balance Pill */}
        <div className="bg-emerald-50 border border-emerald-200 px-4 md:px-6 py-2 rounded-xl flex items-center gap-2 md:gap-3">
          <span className="text-xs md:text-sm text-emerald-600 font-medium hidden sm:inline">
            Batch Fund Balance:
          </span>
          <span className="text-lg md:text-xl font-bold text-emerald-700 tracking-tight font-mono">
            {isLoading ? '...' : `Rs. ${stats?.balance.toLocaleString()}`}
          </span>
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full bg-slate-100 inline-flex items-center justify-center outline-none hover:bg-slate-200 transition-colors">
              <span className="text-sm font-bold text-slate-600">
                {user?.profile.full_name.charAt(0) ?? '?'}
              </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user?.profile.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

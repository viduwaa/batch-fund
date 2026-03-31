import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  HandCoins,
  BookOpen,
  FolderKanban,
  Shield,
  User,
  PieChart,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/collections', label: 'Collections', icon: FolderKanban },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/ledger', label: 'Master Ledger', icon: BookOpen },
  { to: '/reports', label: 'Reports', icon: PieChart },
];

const userLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ledger', label: 'Master Ledger', icon: BookOpen },
];

export default function Sidebar() {
  const { isAdmin, user } = useAuth();
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <HandCoins className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">BatchFund</h1>
            <p className="text-[11px] text-slate-400 -mt-0.5">University Portal</p>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-800" />


      {/* Role badge */}
      <div className="px-4 pb-3">
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ${isAdmin ? 'bg-blue-900/50 text-blue-300' : 'bg-emerald-900/50 text-emerald-300'}`}>
          {isAdmin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
          <span>{isAdmin ? 'Administrator' : 'Student'}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <Separator className="bg-slate-800" />

      {/* User info */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            {user?.profile.full_name.charAt(0) ?? '?'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.profile.full_name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.profile.student_id}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

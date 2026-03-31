import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserDashboard from '@/components/user/UserDashboard';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}

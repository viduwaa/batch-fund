import { Wallet, TrendingUp, Clock, TrendingDown } from 'lucide-react';
import BalanceCard from '@/components/shared/BalanceCard';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/services/ledger.service';
import { fetchCollectionsWithStats } from '@/services/collections.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });

  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ['collectionsStats'],
    queryFn: fetchCollectionsWithStats
  });

  if (statsLoading || collectionsLoading || !stats) {
    return (
      <div className="flex justify-center items-center h-48 text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of batch fund finances.</p>
        </div>
        <Button onClick={() => navigate('/collections')} size="lg" className="gap-2 shadow-sm bg-blue-600 hover:bg-blue-700">
          <Wallet className="h-5 w-5" />
          Collect Cash
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard
          title="Total Balance"
          amount={stats.balance}
          icon={Wallet}
          trend={stats.balance >= 0 ? 'positive' : 'negative'}
          subtitle="Collections − Expenses"
        />
        <BalanceCard
          title="Total Collected"
          amount={stats.totalCollected}
          icon={TrendingUp}
          trend="positive"
          subtitle="Confirmed cash received"
        />
        <BalanceCard
          title="Pending Dues"
          amount={stats.totalPending}
          icon={Clock}
          trend="neutral"
          subtitle="Awaiting payment"
        />
        <BalanceCard
          title="Total Expenses"
          amount={stats.totalExpenses}
          icon={TrendingDown}
          trend="negative"
          subtitle="All recorded outflows"
        />
      </div>

      {/* Active Collections Overview */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Active Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections?.filter(c => c.status === 'active').slice(0, 3).map((cStats: any) => {
            const percentage = cStats.total_users > 0 ? Math.round((cStats.paid_count / cStats.total_users) * 100) : 0;

            return (
              <Card
                key={cStats.id}
                className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-0 shadow-sm"
                onClick={() => navigate('/collections')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold text-slate-800 leading-tight pr-2">
                      {cStats.title}
                    </CardTitle>
                    <StatusBadge status={cStats.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-slate-800">
                      Rs. {cStats.amount_per_person?.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">/person</span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>{cStats.paid_count} of {cStats.total_users} paid</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Stat chips */}
                  <div className="flex gap-2 text-xs">
                    {cStats.pending_count > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                        {cStats.pending_count} pending
                      </span>
                    )}
                    {cStats.overdue_count > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                        {cStats.overdue_count} overdue
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

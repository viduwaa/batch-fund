import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchUserContributions, fetchCollectionStatsForUser, fetchUserAdhocPayments } from '@/services/contributions.service';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/shared/StatusBadge';
import { InfoIcon, HandCoins, CheckCircle2, Users } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const { data: rawContributions, isLoading } = useQuery({
    queryKey: ['userContributions', user?.id],
    queryFn: () => fetchUserContributions(user?.id ?? ''),
    enabled: !!user?.id
  });

  const { data: rawAdhocPayments, isLoading: adhocLoading } = useQuery({
    queryKey: ['userAdhocPayments', user?.id],
    queryFn: () => fetchUserAdhocPayments(user?.id ?? ''),
    enabled: !!user?.id
  });

  const { data: collectionStats } = useQuery({
    queryKey: ['collectionStatsForUser'],
    queryFn: fetchCollectionStatsForUser
  });

  const contributions = rawContributions || [];
  const adhocPayments = rawAdhocPayments || [];

  const pendingDues = contributions.filter(
    (c) => c.status === 'pending' || c.status === 'overdue' || c.status === 'partial'
  );
  
  const paymentRecord = contributions.filter((c) => (c.paid_amount || 0) > 0);

  const totalOwed = pendingDues.reduce((sum, c) => sum + ((c.amount || 0) - (c.paid_amount || 0)), 0);
  const totalPaid = contributions.reduce((sum, c) => sum + (c.paid_amount || 0), 0) +
    adhocPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  if (isLoading || adhocLoading) {
    return (
      <div className="flex justify-center items-center h-48 text-slate-500">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">My Contributions</h1>
        <p className="text-sm text-slate-500 mt-1">Track your personal payments and pending dues.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-400">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50">
              <HandCoins className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Remaining Balance to Pay</p>
              <p className="text-2xl font-bold font-mono text-amber-600">Rs. {totalOwed.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-emerald-400">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Money Contributed</p>
              <p className="text-2xl font-bold font-mono text-emerald-600">Rs. {totalPaid.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Dues Section */}
      {pendingDues.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Outstanding Dues</h2>

          {/* Important instruction banner */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How to make payment</p>
              <p className="text-blue-700">
                Please hand over the cash amount to the <strong>batch treasurer</strong> in person.
                Once they confirm receipt, your status will be updated automatically. You cannot mark your own dues as paid.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {pendingDues.map((contribution) => {
              const dueDate = new Date(contribution.collection.due_date).toLocaleDateString('en-LK', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
<Card key={contribution.id} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{contribution.collection.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">Due by {dueDate}</p>
                        {(() => {
                          const stats = collectionStats?.find(s => s.id === contribution.collection_id);
                          if (!stats) return null;
                          return (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                              <Users className="h-3 w-3" />
                              {stats.paid_count} of {stats.total_users} paid
                              <span className="mx-1">·</span>
                              Rs. {(stats.amount_collected || 0).toLocaleString()} collected
                            </p>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={contribution.status} />
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-bold font-mono text-slate-800 leading-tight">
                           {contribution.status === 'partial' ? (
                            <>
                             Rs. {contribution.paid_amount.toLocaleString()} <span className="text-sm text-slate-400 font-normal">/ {contribution.amount.toLocaleString()}</span>
                            </>
                           ) : (
                            <>Rs. {(contribution.amount || 0).toLocaleString()}</>
                           )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 italic">
                      Hand over Rs. {((contribution.amount || 0) - (contribution.paid_amount || 0)).toLocaleString()} to the batch treasurer to complete this payment.
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Payment History</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Collection</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Collection Progress</TableHead>
                    <TableHead className="font-semibold">Amount Made</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date Logged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRecord.length === 0 && adhocPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                        No payments recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {paymentRecord.map((contribution) => {
                      const confirmedDate = contribution.confirmed_at
                        ? new Date(contribution.confirmed_at).toLocaleDateString('en-LK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—';

                      return (
                        <TableRow key={contribution.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-slate-800">
                            {contribution.collection.title}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500 max-w-[200px]">
                            {contribution.collection.description || '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {(() => {
                              const stats = collectionStats?.find(s => s.id === contribution.collection_id);
                              if (!stats) return <span className="text-slate-400">—</span>;
                              const pct = stats.total_users > 0 ? Math.round((stats.paid_count / stats.total_users) * 100) : 0;
                              return (
                                <div className="flex flex-col gap-1">
                                  <span className="text-slate-600">{stats.paid_count}/{stats.total_users} paid</span>
                                  <div className="w-20 h-1 bg-slate-100 rounded-full">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="font-medium font-mono text-emerald-600 flex flex-col">
                            <span>Rs. {contribution.paid_amount.toLocaleString()}</span>
                            {contribution.status === 'partial' && (
                              <span className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Partial Log</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={contribution.status} />
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">{confirmedDate}</TableCell>
                        </TableRow>
                      );
                    })}
                      {adhocPayments.map((payment: any) => {
                        const confirmedDate = payment.confirmed_at
                          ? new Date(payment.confirmed_at).toLocaleDateString('en-LK', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—';
                        return (
                          <TableRow key={payment.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium text-slate-800">
                              {payment.collection?.title || 'Ad-hoc Collection'}
                            </TableCell>
                            <TableCell className="text-sm text-slate-500 max-w-[200px]">
                              {payment.collection?.description || '—'}
                            </TableCell>
                            <TableCell className="text-sm">
                              <span className="text-slate-400">—</span>
                            </TableCell>
                            <TableCell className="font-medium font-mono text-emerald-600 flex flex-col">
                              <span>Rs. {(payment.amount || 0).toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Ad-hoc</span>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status="paid" />
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">{confirmedDate}</TableCell>
                          </TableRow>
                        );
                      })}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

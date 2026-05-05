import { useState, useMemo, useEffect } from 'react';
import type { ContributionWithUser } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCollectionContributions, recordPayment } from '@/services/contributions.service';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import { Check, Clock, AlertTriangle, Search, Pencil, X, RotateCcw } from 'lucide-react';

interface CashCollectionUIProps {
  collection: any; // Using stats collection
}

export default function CashCollectionUI({ collection }: CashCollectionUIProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const stats = collection; // It's pre-computed in fetchCollectionsWithStats

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(50);

  const { data: rawContributions, isLoading } = useQuery({
    queryKey: ['contributions', collection.id],
    queryFn: () => fetchCollectionContributions(collection.id),
    enabled: !!collection.id
  });

  const contributions = rawContributions || [];

  const paymentMutation = useMutation({
    mutationFn: (variables: { id: string; amount: number; status: string; confirmedBy: string | null }) => 
      recordPayment(variables.id, variables.amount, variables.status, variables.confirmedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions', collection.id] });
      queryClient.invalidateQueries({ queryKey: ['collectionsStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.id) {
        setPendingId((current) => (current === variables.id ? null : current));
      } else {
        setPendingId(null);
      }
    }
  });

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(50);
  }, [searchQuery, deptFilter, statusFilter]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => {
      const matchesSearch =
        c.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.user.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = deptFilter === 'All' || c.user?.department === deptFilter;
      
      // Determine effective status exactly like render does
      const paid = c.paid_amount || 0;
      let effectiveStatus = c.status;
      if (paid >= c.amount) effectiveStatus = 'paid';
      else if (paid > 0) effectiveStatus = 'partial';
      
      const matchesStatus = statusFilter === 'All' || effectiveStatus === statusFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [contributions, searchQuery, deptFilter, statusFilter]);

  const percentage = stats.total_users > 0 ? Math.round((stats.paid_count / stats.total_users) * 100) : 0;
  const totalCollected = useMemo(
    () => contributions.reduce((sum, c) => sum + (c.paid_amount || 0), 0),
    [contributions]
  );

  const handleCollectFull = (contribution: ContributionWithUser) => {
    const target = contribution.amount || 0;
    if (target <= 0) return;
    setPendingId(contribution.id);
    paymentMutation.mutate({
      id: contribution.id,
      amount: target,
      status: 'paid',
      confirmedBy: user?.id ?? null,
    });
  };

  const startEdit = (contribution: ContributionWithUser) => {
    setEditingId(contribution.id);
    setEditAmount(String(contribution.paid_amount ?? 0));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
  };

  const saveEdit = (contribution: ContributionWithUser) => {
    const target = contribution.amount || 0;
    const newPaid = Math.max(0, Number(editAmount) || 0);
    let newStatus = 'pending';
    if (newPaid >= target && target > 0) newStatus = 'paid';
    else if (newPaid > 0) newStatus = 'partial';

    setPendingId(contribution.id);
    paymentMutation.mutate({
      id: contribution.id,
      amount: newPaid,
      status: newStatus,
      confirmedBy: newStatus === 'pending' ? null : (user?.id ?? null),
    });
    cancelEdit();
  };

  const resetPayment = (contribution: ContributionWithUser) => {
    setPendingId(contribution.id);
    paymentMutation.mutate({
      id: contribution.id,
      amount: 0,
      status: 'pending',
      confirmedBy: null,
    });
    cancelEdit();
  };

  return (
    <div className="space-y-6">
      {/* Collection Header */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl text-slate-800">{collection.title}</CardTitle>
              <p className="text-sm text-slate-500 mt-1">{collection.description}</p>
            </div>
            <StatusBadge status={collection.status} />
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-2xl font-bold font-mono text-slate-800">{stats.total_users}</p>
              <p className="text-xs text-slate-500">Total Members</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-2xl font-bold font-mono text-emerald-600">Rs. {totalCollected.toLocaleString()}</p>
              <p className="text-xs text-emerald-600">Collected</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold font-mono text-blue-600">{stats.paid_count}</p>
              <p className="text-xs text-blue-600">Payments Made</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-2xl font-bold font-mono text-amber-600">{stats.total_users - stats.paid_count}</p>
              <p className="text-xs text-amber-600">Pending</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-2xl font-bold font-mono text-red-600">0</p>
              <p className="text-xs text-red-600">Overdue</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Collection Progress (by volume)</span>
              <span className="font-medium">{percentage}% complete</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Collection Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
            <CardTitle className="text-base">Member Payment Status</CardTitle>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by name, ID, or email..." 
                  className="pl-9 bg-slate-50 border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={deptFilter} onValueChange={(v) => v && setDeptFilter(v)}>
                <SelectTrigger className="w-full sm:w-[140px] bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Depts</SelectItem>
                  <SelectItem value="ITT">ITT</SelectItem>
                  <SelectItem value="MTT">MTT</SelectItem>
                  <SelectItem value="EET">EET</SelectItem>
                  <SelectItem value="FDT">FDT</SelectItem>
                  <SelectItem value="BPT">BPT</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
                <SelectTrigger className="w-full sm:w-[130px] bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold px-4">Student</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">ID / Dept</TableHead>
                  <TableHead className="font-semibold text-right hidden md:table-cell">Progress</TableHead>
                  <TableHead className="font-semibold text-center hidden md:table-cell w-[120px]">Status</TableHead>
                  <TableHead className="font-semibold text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading members...</TableCell>
                  </TableRow>
                ) : filteredContributions.slice(0, visibleCount).map((contribution: any) => {
                  const paid = contribution.paid_amount || 0;
                  const target = contribution.amount;
                  
                  let effectiveStatus = contribution.status;
                  if (paid >= target) effectiveStatus = 'paid';
                  else if (paid > 0) effectiveStatus = 'partial';
                  else if (contribution.status === 'paid') effectiveStatus = 'pending'; // In case locally we resetted it somehow 

                  const progressPct = target > 0 ? Math.min(100, Math.round((paid / target) * 100)) : 0;

                  return (
                    <TableRow
                      key={contribution.id}
                      className={`cursor-pointer transition-colors ${
                        pendingId === contribution.id
                          ? 'bg-blue-50'
                          : 'hover:bg-slate-50 active:bg-blue-50'
                      }`}
                      onClick={() => {
                        if (effectiveStatus !== 'paid' && editingId !== contribution.id) {
                          handleCollectFull(contribution);
                        }
                      }}
                    >
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex shadow-sm items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                              {contribution.user?.full_name?.charAt(0) || '?'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800 leading-none">{contribution.user?.full_name || 'Unknown User'}</span>
                              <span className="text-[11px] text-slate-400 mt-1">{contribution.user?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col font-mono text-xs">
                          <span className="text-slate-600">{contribution.user?.student_id || 'N/A'}</span>
                          <span className="text-slate-400 mt-0.5">{contribution.user?.department || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="font-medium font-mono text-slate-700">
                            Rs. {paid.toLocaleString()} <span className="text-slate-400 font-normal">/ {target.toLocaleString()}</span>
                          </span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${paid >= target ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        <StatusBadge status={effectiveStatus} />
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === contribution.id ? (
                            <>
                              <Input
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                type="number"
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 w-24 text-xs font-mono"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); saveEdit(contribution); }}
                                className="h-8 w-8"
                                disabled={pendingId === contribution.id}
                              >
                                <Check className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                                className="h-8 w-8"
                              >
                                <X className="h-4 w-4 text-slate-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); resetPayment(contribution); }}
                                className="h-8 w-8"
                                disabled={pendingId === contribution.id}
                              >
                                <RotateCcw className="h-4 w-4 text-amber-600" />
                              </Button>
                            </>
                          ) : (
                            <>
                              {pendingId === contribution.id ? (
                                <span className="text-xs text-blue-600">Collecting...</span>
                              ) : effectiveStatus === 'paid' ? (
                                <span className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-emerald-600 uppercase tracking-wider">
                                  <Check className="h-3.5 w-3.5" />
                                  Completed
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">Tap row to collect</span>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); startEdit(contribution); }}
                                className="h-8 w-8"
                                disabled={pendingId === contribution.id}
                              >
                                <Pencil className="h-4 w-4 text-slate-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredContributions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No members found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {visibleCount < filteredContributions.length && (
            <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50/50">
              <Button 
                variant="outline" 
                className="bg-white text-slate-600 shadow-sm"
                onClick={() => setVisibleCount(prev => prev + 50)}
              >
                Load More (+50)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pl-1">
        <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Paid — fully received</span>
        <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" /> Partial — partially paid</span>
        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" /> Pending — awaiting payment</span>
        <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Overdue — past due date</span>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import type { ContributionWithUser } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCollectionContributions, fetchAdhocPayments, recordAdhocPayment, recordPayment } from '@/services/contributions.service';
import { fetchProfiles } from '@/services/profiles.service';
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
import { Check, Clock, AlertTriangle, Search, Pencil, X, RotateCcw, Plus } from 'lucide-react';

interface CashCollectionUIProps {
  collection: any; // Using stats collection
  readOnly?: boolean;
}

export default function CashCollectionUI({ collection, readOnly = false }: CashCollectionUIProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const stats = collection; // It's pre-computed in fetchCollectionsWithStats
  const isAdhoc = collection.collection_type === 'adhoc';

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(50);

  const { data: rawContributions, isLoading } = useQuery({
    queryKey: ['contributions', collection.id],
    queryFn: () => fetchCollectionContributions(collection.id),
    enabled: !!collection.id && !isAdhoc
  });

  const { data: adhocPayments, isLoading: adhocLoading } = useQuery({
    queryKey: ['adhocPayments', collection.id],
    queryFn: () => fetchAdhocPayments(collection.id),
    enabled: !!collection.id && isAdhoc
  });

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
    enabled: isAdhoc
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [adhocSearch, setAdhocSearch] = useState('');
  const [adhocAmounts, setAdhocAmounts] = useState<Record<string, string>>({});
  const [adhocPendingUserId, setAdhocPendingUserId] = useState<string | null>(null);
  const [adhocVisibleCount, setAdhocVisibleCount] = useState(50);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(50);
  }, [searchQuery, deptFilter, statusFilter]);

  useEffect(() => {
    setAdhocVisibleCount(50);
  }, [adhocSearch]);

  const filteredContributions = useMemo(() => {
    const normalizeValue = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isSubsequence = (needle: string, haystack: string) => {
      if (!needle) return true;
      let i = 0;
      for (let j = 0; j < haystack.length && i < needle.length; j += 1) {
        if (needle[i] === haystack[j]) i += 1;
      }
      return i === needle.length;
    };
    const q = normalizeValue(searchQuery);

    return contributions.filter((c) => {
      const name = normalizeValue(c.user?.full_name || '');
      const studentId = normalizeValue(c.user?.student_id || '');
      const email = normalizeValue(c.user?.email || '');
      const dept = normalizeValue(c.user?.department || '');

      const matchesSearch = !q ||
        name.includes(q) ||
        studentId.includes(q) ||
        email.includes(q) ||
        dept.includes(q) ||
        isSubsequence(q, studentId) ||
        isSubsequence(q, email) ||
        isSubsequence(q, name);
      
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
  const adhocCollected = useMemo(
    () => (adhocPayments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
    [adhocPayments]
  );
  const adhocPayers = useMemo(() => {
    const ids = new Set((adhocPayments || []).map((p: any) => p.user_id));
    return ids.size;
  }, [adhocPayments]);

  const handleCollectFull = (contribution: ContributionWithUser) => {
    if (readOnly) return;
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
    if (readOnly) return;
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
    if (readOnly) return;
    setPendingId(contribution.id);
    paymentMutation.mutate({
      id: contribution.id,
      amount: 0,
      status: 'pending',
      confirmedBy: null,
    });
    cancelEdit();
  };

  const adhocMutation = useMutation({
    mutationFn: async (variables: { userId: string; amount: number }) => {
      return recordAdhocPayment(collection.id, variables.userId, variables.amount, user?.id ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhocPayments', collection.id] });
      queryClient.invalidateQueries({ queryKey: ['collectionsStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.userId) {
        setAdhocPendingUserId((current) => (current === variables.userId ? null : current));
      } else {
        setAdhocPendingUserId(null);
      }
    }
  });

  const normalizeValue = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  const isSubsequence = (needle: string, haystack: string) => {
    if (!needle) return true;
    let i = 0;
    for (let j = 0; j < haystack.length && i < needle.length; j += 1) {
      if (needle[i] === haystack[j]) i += 1;
    }
    return i === needle.length;
  };

  const matchesSearch = (profile: any, query: string) => {
    if (!query) return true;
    const q = normalizeValue(query);
    if (!q) return true;
    const studentId = normalizeValue(profile.student_id || '');
    const email = normalizeValue(profile.email || '');
    const fullName = normalizeValue(profile.full_name || '');
    const dept = normalizeValue(profile.department || '');

    return (
      studentId.includes(q) ||
      email.includes(q) ||
      fullName.includes(q) ||
      dept.includes(q) ||
      isSubsequence(q, studentId) ||
      isSubsequence(q, email)
    );
  };

  const filteredProfiles = useMemo(() => {
    return (profiles || []).filter((p: any) => matchesSearch(p, adhocSearch));
  }, [profiles, adhocSearch]);

  const submitAdhocPayment = (profile: any) => {
    if (readOnly) return;
    const amountRaw = adhocAmounts[profile.id] || '';
    const amount = Math.max(0, Number(amountRaw) || 0);
    if (amount <= 0) return;
    setAdhocPendingUserId(profile.id);
    adhocMutation.mutate({ userId: profile.id, amount });
    setAdhocAmounts((prev) => ({ ...prev, [profile.id]: '' }));
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
          {isAdhoc ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold font-mono text-slate-800">{adhocPayers}</p>
                <p className="text-xs text-slate-500">Unique Payers</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-2xl font-bold font-mono text-emerald-600">Rs. {adhocCollected.toLocaleString()}</p>
                <p className="text-xs text-emerald-600">Collected</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-2xl font-bold font-mono text-blue-600">{(adhocPayments || []).length}</p>
                <p className="text-xs text-blue-600">Payments Logged</p>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </CardContent>
      </Card>

      {isAdhoc ? (
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
                <div>
                  <CardTitle className="text-base">Ad-hoc Payments</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Pick a person, enter amount, and record a payment. No default list or progress.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search name, ID, email, dept..."
                    className="pl-9 bg-slate-50 border-slate-200"
                    value={adhocSearch}
                    onChange={(e) => setAdhocSearch(e.target.value)}
                  />
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
                      <TableHead className="font-semibold text-right">Amount</TableHead>
                      <TableHead className="font-semibold text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profilesLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">Loading members...</TableCell>
                      </TableRow>
                  ) : adhocLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">Loading payments...</TableCell>
                    </TableRow>
                    ) : filteredProfiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">No members match your search.</TableCell>
                      </TableRow>
                    ) : (
                      filteredProfiles.slice(0, adhocVisibleCount).map((profile: any) => (
                        <TableRow key={profile.id} className="hover:bg-slate-50/50">
                          <TableCell className="px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex shadow-sm items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                                {profile.full_name?.charAt(0) || '?'}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-800 leading-none">{profile.full_name}</span>
                                <span className="text-[11px] text-slate-400 mt-1">{profile.email || 'N/A'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col font-mono text-xs">
                              <span className="text-slate-600">{profile.student_id || 'N/A'}</span>
                              <span className="text-slate-400 mt-0.5">{profile.department || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              value={adhocAmounts[profile.id] || ''}
                              onChange={(e) => setAdhocAmounts((prev) => ({ ...prev, [profile.id]: e.target.value }))}
                              type="number"
                              min="1"
                              className="h-8 w-28 text-xs font-mono ml-auto"
                              disabled={readOnly}
                            />
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            {readOnly ? (
                              <span className="text-xs text-slate-400">Read-only</span>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => submitAdhocPayment(profile)}
                                disabled={adhocPendingUserId === profile.id || readOnly}
                              >
                                {adhocPendingUserId === profile.id ? (
                                  'Saving...'
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {adhocVisibleCount < filteredProfiles.length && (
                <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50/50">
                  <Button
                    variant="outline"
                    className="bg-white text-slate-600 shadow-sm"
                    onClick={() => setAdhocVisibleCount((prev) => prev + 50)}
                  >
                    Load More (+50)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Recent Ad-hoc Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold px-4">Student</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">ID / Dept</TableHead>
                      <TableHead className="font-semibold text-right">Amount</TableHead>
                      <TableHead className="font-semibold text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adhocLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">Loading payments...</TableCell>
                      </TableRow>
                    ) : (adhocPayments || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">No ad-hoc payments recorded yet.</TableCell>
                      </TableRow>
                    ) : (
                      (adhocPayments || []).map((payment: any) => (
                        <TableRow key={payment.id} className="hover:bg-slate-50/50">
                          <TableCell className="px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex shadow-sm items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                                {payment.user?.full_name?.charAt(0) || '?'}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-800 leading-none">{payment.user?.full_name || 'Unknown User'}</span>
                                <span className="text-[11px] text-slate-400 mt-1">{payment.user?.email || 'N/A'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col font-mono text-xs">
                              <span className="text-slate-600">{payment.user?.student_id || 'N/A'}</span>
                              <span className="text-slate-400 mt-0.5">{payment.user?.department || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-emerald-600">Rs. {(payment.amount || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs text-slate-500">
                            {payment.confirmed_at ? new Date(payment.confirmed_at).toLocaleDateString('en-LK', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }) : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
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
                        if (!readOnly && effectiveStatus !== 'paid' && editingId !== contribution.id) {
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
                                disabled={pendingId === contribution.id || readOnly}
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
                                disabled={pendingId === contribution.id || readOnly}
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
                              {!readOnly && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => { e.stopPropagation(); startEdit(contribution); }}
                                  className="h-8 w-8"
                                  disabled={pendingId === contribution.id || readOnly}
                                >
                                  <Pencil className="h-4 w-4 text-slate-600" />
                                </Button>
                              )}
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
      )}

      {/* Legend */}
      {!isAdhoc && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pl-1">
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Paid — fully received</span>
          <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" /> Partial — partially paid</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" /> Pending — awaiting payment</span>
          <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Overdue — past due date</span>
        </div>
      )}
    </div>
  );
}

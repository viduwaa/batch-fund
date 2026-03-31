import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLedgerEntries } from '@/services/ledger.service';
import { fetchCollections } from '@/services/collections.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowDownCircle, ArrowUpCircle, BookOpen, Search } from 'lucide-react';

type TypeFilter = 'all' | 'income' | 'expense';

export default function MasterLedger() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(50);
  }, [typeFilter, searchQuery, reasonFilter, deptFilter, dateFrom, dateTo]);

  const { data: entriesResponse, isLoading: ledgerLoading } = useQuery({
    queryKey: ['ledgerEntries'],
    queryFn: fetchLedgerEntries
  });

  const { data: mockCollections } = useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections
  });

  const entries = useMemo(() => entriesResponse || [], [entriesResponse]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      const matchSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (e.reference_name && e.reference_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (e.student_id && e.student_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (e.department && e.department.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchReason = reasonFilter === 'All' || e.collection_id === reasonFilter;
      const matchDept = deptFilter === 'All' || e.department === deptFilter || !e.department; // expenses usually don't have dept

      const entryDate = new Date(e.date).getTime();
      const matchDateFrom = dateFrom ? entryDate >= new Date(dateFrom).getTime() : true;
      const matchDateTo = dateTo ? entryDate <= new Date(dateTo).getTime() + 86400000 : true; // include end of day

      return matchType && matchSearch && matchReason && matchDept && matchDateFrom && matchDateTo;
    });
  }, [entries, typeFilter, searchQuery, reasonFilter, deptFilter, dateFrom, dateTo]);

  const totalIncome = filteredEntries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = filteredEntries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Master Ledger</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Complete financial transparency — every rupee in and out.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end flex-wrap gap-3">
          <div className="flex flex-col gap-1.5 w-full sm:w-64">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Ledger</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Name, Reg No, or Dept..." 
                className="pl-9 bg-slate-50 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 w-full sm:w-[140px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction Type</label>
            <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v as TypeFilter)}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income (+)</SelectItem>
                <SelectItem value="expense">Expenses (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-[180px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter by Reason</label>
            <Select value={reasonFilter} onValueChange={(v) => v && setReasonFilter(v)}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                <SelectValue placeholder="Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Reasons</SelectItem>
                {mockCollections?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-[120px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</label>
            <Select value={deptFilter} onValueChange={(v) => v && setDeptFilter(v)}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                <SelectValue placeholder="Dept" />
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
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-[130px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From Date</label>
            <Input type="date" className="bg-slate-50 border-slate-200" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-[130px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Date</label>
            <Input type="date" className="bg-slate-50 border-slate-200" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Summary Strip (dynamically updates based on filters) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-xs text-emerald-600 font-medium">Filtered Income</p>
            <p className="text-lg font-bold font-mono text-emerald-700">Rs. {totalIncome.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <ArrowUpCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-xs text-red-600 font-medium">Filtered Expenses</p>
            <p className="text-lg font-bold font-mono text-red-700">Rs. {totalExpense.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-xs text-blue-600 font-medium">Filtered Net Balance</p>
            <p className={`text-lg font-bold font-mono ${totalIncome - totalExpense >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              Rs. {(totalIncome - totalExpense).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Transaction History ({filteredEntries.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold w-10"></TableHead>
                  <TableHead className="font-semibold px-4">Date</TableHead>
                  <TableHead className="font-semibold">Payer / Reference</TableHead>
                  <TableHead className="font-semibold">Reason / Description</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                  <TableHead className="font-semibold text-right pr-6">Net Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      Loading ledger records...
                    </TableCell>
                  </TableRow>
                ) : filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      No transactions found matching filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.slice(0, visibleCount).map((entry) => {
                    const date = new Date(entry.date).toLocaleDateString('en-LK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <TableRow key={entry.id + entry.date} className="hover:bg-slate-50/50">
                        <TableCell>
                          {entry.type === 'income' ? (
                            <ArrowDownCircle className="h-4 w-4 text-emerald-500 ml-2" />
                          ) : (
                            <ArrowUpCircle className="h-4 w-4 text-red-500 ml-2" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 whitespace-nowrap px-4">{date}</TableCell>
                        
                        {/* Who paid / Reference */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">{entry.reference_name}</span>
                            {(entry.student_id || entry.department) && (
                              <span className="text-[11px] text-slate-400 font-mono mt-0.5 tracking-tight uppercase">
                                {entry.student_id && `${entry.student_id} `}
                                {entry.department && `• ${entry.department}`}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Reason / Description */}
                        <TableCell>
                          <span className={`text-xs px-2.5 py-1 rounded-md inline-block max-w-[280px] break-words leading-tight ${
                            entry.type === 'income'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {entry.description}
                          </span>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className={`text-right font-medium font-mono whitespace-nowrap ${
                          entry.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {entry.type === 'income' ? '+' : '-'} Rs. {entry.amount.toLocaleString()}
                        </TableCell>

                        {/* Net Running Balance */}
                        <TableCell className={`text-right font-mono text-sm whitespace-nowrap pr-6 ${
                          entry.running_balance >= 0 ? 'text-slate-700' : 'text-red-600'
                        }`}>
                          Rs. {entry.running_balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {visibleCount < filteredEntries.length && (
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
    </div>
  );
}

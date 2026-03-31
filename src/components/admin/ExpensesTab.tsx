import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchExpenses } from '@/services/expenses.service';
import { fetchCollections } from '@/services/collections.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, X, FileText, Upload, Search } from 'lucide-react';

export default function ExpensesTab() {
  const [showForm, setShowForm] = useState(false);
  
  // Search and Filter Settings
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');

  const { data: rawExpenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses
  });

  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections
  });

  const expenses = rawExpenses || [];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesReason = reasonFilter === 'All' || e.collection_id === reasonFilter;
      return matchesSearch && matchesReason;
    });
  }, [expenses, searchQuery, reasonFilter]);

  const totalFilteredExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expense Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track outgoing funds. Total expenses: <span className="font-semibold text-red-600 font-mono">Rs. {totalExpenses.toLocaleString()}</span>
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'default'}
          className={showForm ? '' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Record New Expense
            </>
          )}
        </Button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <Card className="border-0 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="text-base">New Expense Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="exp-desc">Description</Label>
                <Input id="exp-desc" placeholder="e.g. Lab network cables" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-amount">Amount (Rs.)</Label>
                <Input id="exp-amount" type="number" placeholder="0.00" min="1" />
              </div>
              <div className="space-y-2">
                <Label>Reason (Collection)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specific reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {collections?.filter(c => c.status === 'active').map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-receipt">Upload Receipt / Invoice <span className="text-slate-400 font-normal">(Optional)</span></Label>
                <div className="relative">
                  <Input
                    id="exp-receipt"
                    type="file"
                    className="file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer text-slate-500"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Upload className="h-4 w-4 mr-2" />
                Save Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
            <div>
              <CardTitle className="text-base">Expense Ledger</CardTitle>
              {reasonFilter !== 'All' && (
                <p className="text-sm text-slate-500 mt-1">
                  Filtered Total: <span className="font-medium text-red-600">Rs. {totalFilteredExpenses.toLocaleString()}</span>
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search description..." 
                  className="pl-9 bg-slate-50 border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={reasonFilter} onValueChange={(v) => v && setReasonFilter(v)}>
                <SelectTrigger className="w-full sm:w-[220px] bg-slate-50 border-slate-200">
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Reasons</SelectItem>
                  {collections?.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.title}
                    </SelectItem>
                  ))}
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
                  <TableHead className="font-semibold px-4">Date</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Linked Reason</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                  <TableHead className="font-semibold w-[140px]">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      Loading expenses...
                    </TableCell>
                  </TableRow>
                ) : filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No expenses found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense: any) => {
                    const date = new Date(expense.created_at).toLocaleDateString('en-LK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });
                    
                    const collectionTitle = expense.collection?.title || 'Unknown Reason';

                    return (
                      <TableRow key={expense.id} className="hover:bg-slate-50/50">
                        <TableCell className="text-sm text-slate-500 px-4">{date}</TableCell>
                        <TableCell className="font-medium text-slate-800">{expense.description}</TableCell>
                        <TableCell>
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium truncate max-w-[200px] inline-block">
                            {collectionTitle}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium font-mono text-red-600 text-right">
                          - Rs. {expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {expense.receipt_url ? (
                          <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                            <FileText className="h-3.5 w-3.5" />
                            View
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Optional</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

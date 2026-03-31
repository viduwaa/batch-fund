import { useQuery } from '@tanstack/react-query';
import { fetchCollectionsWithStats } from '@/services/collections.service';
import { fetchExpenses } from '@/services/expenses.service';
import { fetchCollectionReport } from '@/services/reports.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, HandCoins, Receipt, PiggyBank, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';

export default function ReportsTab() {
  const { data: collections, isLoading: colsLoading } = useQuery({
    queryKey: ['collectionsStats'],
    queryFn: fetchCollectionsWithStats
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses
  });

  const handleExport = async (colId: string, title: string) => {
    try {
      const data = await fetchCollectionReport(colId);

      let tableHtml = `<table style="width:100%; border-collapse: collapse; font-family: sans-serif;">
        <tr style="background-color: #f1f5f9; text-align: left;">
          <th style="padding: 12px; border-bottom: 2px solid #cbd5e1;">Student Name</th>
          <th style="padding: 12px; border-bottom: 2px solid #cbd5e1;">Reg No</th>
          <th style="padding: 12px; border-bottom: 2px solid #cbd5e1;">Department</th>
          <th style="padding: 12px; border-bottom: 2px solid #cbd5e1;">Status</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #cbd5e1;">Paid Amount</th>
        </tr>`;

      data.forEach((row: any) => {
        const bg = row.status === 'paid' ? '#f0fdf4' : row.status === 'partial' ? '#eff6ff' : '#fef2f2';
        tableHtml += `<tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px;">${row.student_name}</td>
          <td style="padding: 10px;">${row.student_id}</td>
          <td style="padding: 10px;">${row.department}</td>
          <td style="padding: 10px; font-weight: bold; color: #475569;">${String(row.status).toUpperCase()}</td>
          <td style="padding: 10px; text-align: right; font-family: monospace; font-size: 16px;">Rs. ${(row.amount_paid || 0).toLocaleString()}</td>
        </tr>`;
      });

      tableHtml += `</table>`;

      const content = `
        <html>
          <head><title>Collection Report - ${title}</title></head>
          <body style="padding: 40px; font-family: sans-serif; background: #ffffff;">
            <h1 style="color: #0f172a;">Collection Report: ${title}</h1>
            <p style="color: #64748b; margin-bottom: 30px;">Batch Fund Management System <br/> Generated on: ${new Date().toLocaleDateString()}</p>
            ${tableHtml}
          </body>
        </html>
      `;
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      alert("Failed to export report.");
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Detailed breakdown of expected versus actual collection per reason.</p>
        </div>
      </div>

      <div className="space-y-6">
        {colsLoading && <div className="text-center py-12 text-slate-500">Loading reports data...</div>}
        {collections?.map((col: any) => {
          // stats mapped from our RPC query alias
          const totalExpected = col.total_users * col.amount_per_person;
          const amountCollected = col.paid_count * col.amount_per_person;
          
          const colExpenses = (expenses || []).filter((e: any) => e.collection_id === col.id);
          const totalSpent = colExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
          
          const remainingToCollect = totalExpected - amountCollected;
          const netBalance = amountCollected - totalSpent;

          // Compute percentages for visuals
          const collectPct = totalExpected > 0 ? (amountCollected / totalExpected) * 100 : 0;
          const spentPctOfCollected = amountCollected > 0 ? (totalSpent / amountCollected) * 100 : 0;

          return (
            <Card key={col.id} className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      {col.title}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-0.5">{col.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={col.status} />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs bg-white"
                      onClick={() => handleExport(col.id, col.title)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Total Expected */}
                  <div className="p-6 flex flex-col gap-2 relative">
                    <Target className="absolute top-4 right-4 h-5 w-5 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">Total Expected</p>
                    <p className="text-2xl font-bold font-mono text-slate-800">
                      Rs. {totalExpected.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">Target goal</p>
                  </div>

                  {/* Total Collected */}
                  <div className="p-6 flex flex-col gap-2 relative">
                    <TrendingUp className="absolute top-4 right-4 h-5 w-5 text-emerald-200" />
                    <p className="text-sm font-medium text-emerald-600">Total Collected</p>
                    <p className="text-2xl font-bold font-mono text-emerald-600">
                      Rs. {amountCollected.toLocaleString()}
                    </p>
                    <div className="mt-auto pt-2">
                      <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${collectPct}%` }} />
                      </div>
                      <p className="text-[10px] text-emerald-500 font-medium text-right mt-1">{Math.round(collectPct)}% achieved</p>
                    </div>
                  </div>

                  {/* Left to Collect */}
                  <div className="p-6 flex flex-col gap-2 relative">
                    <HandCoins className="absolute top-4 right-4 h-5 w-5 text-amber-200" />
                    <p className="text-sm font-medium text-amber-600">Left to Collect</p>
                    <p className="text-2xl font-bold font-mono text-amber-600">
                      Rs. {remainingToCollect.toLocaleString()}
                    </p>
                    <p className="text-xs text-amber-600/70 mt-auto pt-2">From {col.total_users - col.paid_count} pending users</p>
                  </div>

                  {/* Total Expenses */}
                  <div className="p-6 flex flex-col gap-2 relative">
                     <Receipt className="absolute top-4 right-4 h-5 w-5 text-red-200" />
                    <p className="text-sm font-medium text-red-500">Total Expenses</p>
                    <p className="text-2xl font-bold font-mono text-red-500">
                      Rs. {totalSpent.toLocaleString()}
                    </p>
                    <div className="mt-auto pt-2">
                      <div className="w-full bg-red-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-400 h-full" style={{ width: `${Math.min(spentPctOfCollected, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-red-500 font-medium mt-1 inline-block">({Math.round(spentPctOfCollected)}% of collected)</p>
                    </div>
                  </div>

                  {/* Net Balance */}
                  <div className="p-6 flex flex-col gap-2 relative bg-blue-50/30">
                    <PiggyBank className="absolute top-4 right-4 h-5 w-5 text-blue-300" />
                    <p className="text-sm font-medium text-blue-700">Net Balance</p>
                    <p className={`text-2xl font-bold font-mono ${netBalance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                      Rs. {netBalance.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-600/70 mt-auto pt-2 leading-tight">
                      Available cash remaining for this reason
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

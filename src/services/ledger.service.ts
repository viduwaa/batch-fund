import { supabase } from '@/lib/supabase';

export async function fetchLedgerEntries() {
  const { data, error } = await supabase
    .from('master_ledger_view')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchDashboardStats() {
  const { data: balanceData } = await supabase
    .from('master_ledger_view')
    .select('running_balance')
    .order('date', { ascending: false })
    .limit(1);

  const { count: activeCollections } = await supabase
    .from('collections')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: collectedData } = await supabase
    .from('contributions')
    .select('amount, paid_amount');

  const { data: expensesData } = await supabase
    .from('expenses')
    .select('amount');

  let totalCollected = 0;
  let totalPending = 0;
  
  collectedData?.forEach(c => {
    totalCollected += (c.paid_amount || 0);
    totalPending += ((c.amount || 0) - (c.paid_amount || 0));
  });

  return {
    balance: balanceData?.[0]?.running_balance || 0,
    activeCollections: activeCollections || 0,
    totalCollected,
    totalPending,
    totalExpenses: expensesData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
  };
}

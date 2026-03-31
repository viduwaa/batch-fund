import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

export async function fetchExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
       *,
       creator:created_by (full_name),
       collection:collection_id (title)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addExpense(payload: ExpenseInsert) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

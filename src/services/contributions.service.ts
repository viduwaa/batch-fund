import { supabase } from '@/lib/supabase';

export async function fetchCollectionContributions(collectionId: string) {
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      *,
      user:user_id ( full_name, student_id, email, department )
    `)
    .eq('collection_id', collectionId);

  if (error) throw error;
  
  return (data || []).map(row => ({
    ...row,
    user: Array.isArray(row.user) ? row.user[0] : row.user
  }));
}

export async function fetchUserContributions(userId: string) {
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      *,
      collection:collection_id ( title, description, amount_per_person, due_date, collection_type )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function fetchUserAdhocPayments(userId: string) {
  const { data, error } = await supabase
    .from('adhoc_payments')
    .select(`
      *,
      collection:collection_id ( title, description, due_date, amount_per_person, collection_type )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchCollectionStatsForUser(): Promise<any[]> {
  const { data, error } = await supabase
    .from('collection_stats_view')
    .select('id, title, description, total_users, paid_count, amount_collected, total_expected, amount_per_person, status');

  if (error) return [];
  return data || [];
}

export async function recordPayment(contributionId: string, paidAmount: number, status: string, confirmedBy: string | null) {
  const { data, error } = await supabase
    .from('contributions')
    .update({
      paid_amount: paidAmount,
      status: status,
      confirmed_by: confirmedBy,
      confirmed_at: confirmedBy ? new Date().toISOString() : null
    })
    .eq('id', contributionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchAdhocPayments(collectionId: string) {
  const { data, error } = await supabase
    .from('adhoc_payments')
    .select(`
      *,
      user:user_id ( full_name, student_id, email, department )
    `)
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row: any) => ({
    ...row,
    user: Array.isArray(row.user) ? row.user[0] : row.user,
  }));
}

export async function recordAdhocPayment(collectionId: string, userId: string, amount: number, confirmedBy: string | null) {
  const { data, error } = await supabase
    .from('adhoc_payments')
    .insert({
      collection_id: collectionId,
      user_id: userId,
      amount,
      confirmed_by: confirmedBy,
      confirmed_at: confirmedBy ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

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
      collection:collection_id ( title, amount_per_person, due_date )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function recordPayment(contributionId: string, paidAmount: number, status: string, confirmedBy: string) {
  const { data, error } = await supabase
    .from('contributions')
    .update({
      paid_amount: paidAmount,
      status: status,
      confirmed_by: confirmedBy,
      confirmed_at: new Date().toISOString()
    })
    .eq('id', contributionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

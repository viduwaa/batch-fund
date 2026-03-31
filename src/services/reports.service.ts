import { supabase } from '@/lib/supabase';

export async function fetchCollectionReport(collectionId: string) {
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      paid_amount,
      status,
      user:user_id ( full_name, student_id, department )
    `)
    .eq('collection_id', collectionId);

  if (error) throw error;
  
  // Map the flattened structure that the report UI expects
  return (data || []).map((row: any) => {
    const user = Array.isArray(row.user) ? row.user[0] : row.user;
    return {
      student_name: user?.full_name || 'Unknown',
      student_id: user?.student_id || 'N/A',
      department: user?.department || 'N/A',
      status: row.status,
      amount_paid: row.paid_amount || 0
    };
  });
}

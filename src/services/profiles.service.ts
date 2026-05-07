import { supabase } from '@/lib/supabase';

export async function fetchProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, student_id, email, department')
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data || [];
}

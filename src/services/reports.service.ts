import { supabase } from '@/lib/supabase';

export async function fetchCollectionReport(collectionId: string) {
  const { data, error } = await supabase.rpc('generate_collection_report', {
    p_collection_id: collectionId
  });

  if (error) throw error;
  
  // Need to safely cast or assert this since the RPC returns a JSONB blob structurally equivalent to our reports UI expectation
  return data as any;
}

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type CollectionRow = Database['public']['Tables']['collections']['Row'];
type CollectionInsert = Database['public']['Tables']['collections']['Insert'];

export async function fetchCollections(): Promise<CollectionRow[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchCollectionsWithStats(): Promise<any[]> {
  const { data, error } = await supabase
    .from('collection_stats_view')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCollection(payload: CollectionInsert): Promise<CollectionRow> {
  const { data, error } = await supabase
    .from('collections')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCollectionStatus(id: string, status: 'active' | 'closed' | 'cancelled'): Promise<CollectionRow> {
  const { data, error } = await supabase
    .from('collections')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCollectionDetails(id: string, payload: Partial<CollectionInsert>): Promise<CollectionRow> {
  const { data, error } = await supabase
    .from('collections')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCollection(id: string): Promise<void> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

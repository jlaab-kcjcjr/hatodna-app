import { supabase } from './supabase';

const STORE_FIELDS = 'id, name, category, town, address, image_path, is_open, prep_minutes, lat, lng';

// Only approved stores are visible to customers; the database security rules enforce this.
export async function fetchStores() {
  const { data, error } = await supabase
    .from('stores')
    .select(STORE_FIELDS)
    .eq('status', 'active')
    .order('is_open', { ascending: false })
    .order('name');
  if (error) throw new Error('Could not load stores. Check your connection and try again.');
  return data;
}

export async function fetchStore(id) {
  const { data, error } = await supabase
    .from('stores')
    .select(`${STORE_FIELDS}, products(id, name, description, category, price, image_path, is_available)`)
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw new Error('Could not load this store. Check your connection and try again.');
  return data;
}

export async function fetchSettings() {
  const { data } = await supabase.from('platform_settings').select('*').eq('id', 1).single();
  return data;
}

// Same formula the database uses when the order is placed.
export function estimateDeliveryFee(settings, km) {
  if (!settings || km == null) return null;
  return Number(settings.base_delivery_fee) + Number(settings.per_km_fee) * km;
}

export function etaOf(store) {
  const prep = store.prep_minutes ?? 20;
  return `${prep + 10}-${prep + 25} min`;
}

export function publicUrl(bucket, path) {
  if (!path) return '';
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
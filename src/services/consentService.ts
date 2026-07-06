import { supabase } from './supabase';
import { isSupabaseStorageError, memoryStore } from './memoryStore';

export interface ConsentData {
  user_id: string;
  data_collection: boolean;
  notification: boolean;
  chatbot_optin: boolean;
}

export const upsertConsent = async (data: ConsentData) => {
  const row = { ...data, updated_at: new Date().toISOString() };

  const { data: result, error } = await supabase
    .from('consents')
    .upsert(row, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    if (!isSupabaseStorageError(error)) throw new Error(error.message);
    memoryStore.consents.set(data.user_id, row);
    return row;
  }

  return result;
};

export const getConsent = async (user_id: string) => {
  const { data, error } = await supabase
    .from('consents')
    .select('user_id, data_collection, notification, chatbot_optin, updated_at')
    .eq('user_id', user_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    if (!isSupabaseStorageError(error)) throw new Error(error.message);
    return memoryStore.consents.get(user_id) ?? null;
  }

  return data ?? memoryStore.consents.get(user_id) ?? null;
};

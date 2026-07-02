import { supabase } from './supabase';

export interface ConsentData {
  user_id: string;
  data_collection: boolean;
  notification: boolean;
  chatbot_optin: boolean;
}

export const upsertConsent = async (data: ConsentData) => {
  const { data: result, error } = await supabase
    .from('consents')
    .upsert(
      { ...data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return result;
};

export const getConsent = async (user_id: string) => {
  const { data, error } = await supabase
    .from('consents')
    .select('user_id, data_collection, notification, chatbot_optin, updated_at')
    .eq('user_id', user_id)
    .single();

  // PGRST116: 결과 없음 (정상 케이스)
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data ?? null;
};
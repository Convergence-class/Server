import { supabase } from './supabase';
import { isSupabaseStorageError, memoryStore } from './memoryStore';

export interface UsageLog {
  user_id: string;
  app_name: string;
  duration_minutes: number;
  logged_at?: string;
}

export const saveUsageLog = async (data: UsageLog) => {
  const row = { ...data, logged_at: data.logged_at ?? new Date().toISOString() };

  const { data: result, error } = await supabase
    .from('usage_logs')
    .insert([row])
    .select()
    .single();

  if (error) {
    if (!isSupabaseStorageError(error)) throw new Error(error.message);
    memoryStore.usageLogs.push(row);
    return row;
  }

  return result;
};

export const getUsageSummary = async (user_id: string, date?: string) => {
  const target = date ?? new Date().toISOString().slice(0, 10);
  const startOfDay = `${target}T00:00:00.000Z`;
  const endOfDay = `${target}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from('usage_logs')
    .select('app_name, duration_minutes, logged_at')
    .eq('user_id', user_id)
    .gte('logged_at', startOfDay)
    .lte('logged_at', endOfDay)
    .order('logged_at', { ascending: false });

  let usageLogs = data ?? [];

  if (error) {
    if (!isSupabaseStorageError(error)) throw new Error(error.message);
    usageLogs = memoryStore.usageLogs
      .filter((row) => row.user_id === user_id && row.logged_at >= startOfDay && row.logged_at <= endOfDay)
      .sort((a, b) => b.logged_at.localeCompare(a.logged_at));
  }

  const totalMinutes = usageLogs.reduce((sum, row) => sum + row.duration_minutes, 0);

  return {
    date: target,
    total_usage_minutes: totalMinutes,
    usage_logs: usageLogs,
    emotion_logs: [],
  };
};

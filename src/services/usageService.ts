import { supabase } from './supabase';

export interface UsageLog {
  user_id: string;
  app_name: string;
  duration_minutes: number;
  logged_at?: string;
}

export const saveUsageLog = async (data: UsageLog) => {
  const { data: result, error } = await supabase
    .from('usage_logs')
    .insert([{ ...data }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return result;
};

export const getUsageSummary = async (user_id: string, date?: string) => {
  // 기준 날짜 (없으면 오늘)
  const target = date ?? new Date().toISOString().slice(0, 10);
  const startOfDay = `${target}T00:00:00.000Z`;
  const endOfDay = `${target}T23:59:59.999Z`;

  const [usageResult, emotionResult] = await Promise.all([
    supabase
      .from('usage_logs')
      .select('app_name, duration_minutes, logged_at')
      .eq('user_id', user_id)
      .gte('logged_at', startOfDay)
      .lte('logged_at', endOfDay)
      .order('logged_at', { ascending: false }),

    supabase
      .from('emotion_logs')
      .select('emoji, note, created_at')
      .eq('user_id', user_id)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false }),
  ]);

  if (usageResult.error) throw new Error(usageResult.error.message);
  if (emotionResult.error) throw new Error(emotionResult.error.message);

  const totalMinutes = (usageResult.data ?? []).reduce(
    (sum, row) => sum + row.duration_minutes,
    0
  );

  return {
    date: target,
    total_usage_minutes: totalMinutes,
    usage_logs: usageResult.data ?? [],
    emotion_logs: emotionResult.data ?? [],
  };
};
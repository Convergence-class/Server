import { supabase } from './supabase';

export const getRandomNotice = async () => {
  // Supabase는 ORDER BY RANDOM() 직접 지원 안 하므로 count 후 offset으로 랜덤 조회
  const { count, error: countError } = await supabase
    .from('notices')
    .select('*', { count: 'exact', head: true });

  if (countError) throw new Error(countError.message);
  if (!count || count === 0) return null;

  const randomOffset = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from('notices')
    .select('id, message, author')
    .range(randomOffset, randomOffset)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

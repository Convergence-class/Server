import { supabase } from './supabase';
import { isSupabaseStorageError, memoryStore } from './memoryStore';

const REVERSE_ITEMS = new Set([4, 8, 12, 16]);

export type CESDLevel = 'normal' | 'mild_depression' | 'severe_depression';

export const CESD_QUESTIONS = [
  { no: 1, text: 'I was bothered by things that usually do not bother me.', reverse: false },
  { no: 2, text: 'I did not feel like eating; my appetite was poor.', reverse: false },
  { no: 3, text: 'I felt that I could not shake off the blues.', reverse: false },
  { no: 4, text: 'I felt that I was just as good as other people.', reverse: true },
  { no: 5, text: 'I had trouble keeping my mind on what I was doing.', reverse: false },
  { no: 6, text: 'I felt depressed.', reverse: false },
  { no: 7, text: 'I felt that everything I did was an effort.', reverse: false },
  { no: 8, text: 'I felt hopeful about the future.', reverse: true },
  { no: 9, text: 'I thought my life had been a failure.', reverse: false },
  { no: 10, text: 'I felt fearful.', reverse: false },
  { no: 11, text: 'My sleep was restless.', reverse: false },
  { no: 12, text: 'I was happy.', reverse: true },
  { no: 13, text: 'I talked less than usual.', reverse: false },
  { no: 14, text: 'I felt lonely.', reverse: false },
  { no: 15, text: 'People were unfriendly.', reverse: false },
  { no: 16, text: 'I enjoyed life.', reverse: true },
  { no: 17, text: 'I had crying spells.', reverse: false },
  { no: 18, text: 'I felt sad.', reverse: false },
  { no: 19, text: 'I felt that people disliked me.', reverse: false },
  { no: 20, text: 'I could not get going.', reverse: false },
];

export const calcCESDScore = (answers: number[]): { score: number; level: CESDLevel } => {
  const score = answers.reduce((sum, val, idx) => {
    const questionNo = idx + 1;
    const adjusted = REVERSE_ITEMS.has(questionNo) ? 3 - val : val;
    return sum + adjusted;
  }, 0);

  let level: CESDLevel;
  if (score <= 15) level = 'normal';
  else if (score <= 24) level = 'mild_depression';
  else level = 'severe_depression';

  return { score, level };
};

export const validateCESDAnswers = (answers: unknown): answers is number[] => {
  if (!Array.isArray(answers) || answers.length !== 20) return false;
  return answers.every((v) => Number.isInteger(v) && v >= 0 && v <= 3);
};

export const submitCESD = async (user_id: string, answers: number[]) => {
  const { score, level } = calcCESDScore(answers);
  const row = { user_id, answers, score, level, created_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from('cesd_results')
    .insert([row])
    .select()
    .single();

  if (error) {
    if (!isSupabaseStorageError(error)) throw new Error(error.message);
    memoryStore.cesdResults.push(row);
    return row;
  }

  return data;
};

export const getLatestCESD = async (user_id: string) => {
  const { data, error } = await supabase
    .from('cesd_results')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    if (!isSupabaseStorageError(error)) throw new Error(error.message);
    return (
      memoryStore.cesdResults
        .filter((row) => row.user_id === user_id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
    );
  }

  return data ?? null;
};

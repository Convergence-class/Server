import { supabase } from './supabase';

// 역채점 문항 번호 (1-based)
const REVERSE_ITEMS = new Set([4, 8, 12, 16]);

export type CESDLevel = '정상' | '경증 우울' | '중증 우울';

export const CESD_QUESTIONS = [
  { no: 1,  text: '평소에는 아무렇지도 않던 일들이 귀찮고 신경 쓰였다.',         reverse: false },
  { no: 2,  text: '먹고 싶지 않았다; 식욕이 없었다.',                           reverse: false },
  { no: 3,  text: '가족이나 친구가 도와주더라도 울적한 기분을 떨쳐버릴 수 없었다.', reverse: false },
  { no: 4,  text: '다른 사람들만큼 능력이 있다고 느꼈다.',                        reverse: true  },
  { no: 5,  text: '무슨 일을 하든 정신을 집중하기가 힘들었다.',                   reverse: false },
  { no: 6,  text: '우울했다.',                                                  reverse: false },
  { no: 7,  text: '하는 일마다 힘들게 느껴졌다.',                                reverse: false },
  { no: 8,  text: '앞일이 희망적으로 느껴졌다.',                                 reverse: true  },
  { no: 9,  text: '내 인생은 실패작이라는 생각이 들었다.',                        reverse: false },
  { no: 10, text: '두려움을 느꼈다.',                                            reverse: false },
  { no: 11, text: '잠을 설쳤다 (잠을 잘 이루지 못했다).',                        reverse: false },
  { no: 12, text: '행복했다.',                                                  reverse: true  },
  { no: 13, text: '평소보다 말을 적게 했다.',                                    reverse: false },
  { no: 14, text: '외로움을 느꼈다.',                                            reverse: false },
  { no: 15, text: '사람들이 불친절하다고 느꼈다.',                               reverse: false },
  { no: 16, text: '생활이 즐거웠다.',                                            reverse: true  },
  { no: 17, text: '울었다.',                                                    reverse: false },
  { no: 18, text: '슬픔을 느꼈다.',                                              reverse: false },
  { no: 19, text: '사람들이 나를 싫어하는 것 같은 느낌이 들었다.',               reverse: false },
  { no: 20, text: '도무지 무슨 일이든 시작하기가 힘들었다.',                      reverse: false },
];

export const calcCESDScore = (answers: number[]): { score: number; level: CESDLevel } => {
  const score = answers.reduce((sum, val, idx) => {
    const questionNo = idx + 1;
    const adjusted = REVERSE_ITEMS.has(questionNo) ? 3 - val : val;
    return sum + adjusted;
  }, 0);

  let level: CESDLevel;
  if (score <= 15)      level = '정상';
  else if (score <= 24) level = '경증 우울';
  else                  level = '중증 우울';

  return { score, level };
};

export const validateCESDAnswers = (answers: unknown): answers is number[] => {
  if (!Array.isArray(answers) || answers.length !== 20) return false;
  return answers.every((v) => Number.isInteger(v) && v >= 0 && v <= 3);
};

export const submitCESD = async (user_id: string, answers: number[]) => {
  const { score, level } = calcCESDScore(answers);

  const { data, error } = await supabase
    .from('cesd_results')
    .insert([{ user_id, answers, score, level }])
    .select()
    .single();

  if (error) throw new Error(error.message);
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

  // PGRST116: 결과 없음 (정상 케이스)
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data ?? null;
};

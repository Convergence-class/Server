import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type Role = 'user' | 'model';

export interface ChatMessage {
  role: Role;
  content: string;
}

const buildHistory = (messages: ChatMessage[]) =>
  messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

export const sendMessage = async (
  user_id: string,
  userMessage: string
): Promise<{ reply: string }> => {
  // 이전 대화 이력 조회 (최근 20개, 시간순)
  const { data: history, error: historyError } = await supabase
    .from('chat_history')
    .select('role, content')
    .eq('user_id', user_id)
    .order('created_at', { ascending: true })
    .limit(20);

  if (historyError) throw new Error(historyError.message);

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chat = model.startChat({
    history: buildHistory((history ?? []) as ChatMessage[]),
  });

  const result = await chat.sendMessage(userMessage);
  const reply = result.response.text();

  // 유저 메시지 + AI 응답 저장
  const { error: insertError } = await supabase.from('chat_history').insert([
    { user_id, role: 'user',  content: userMessage },
    { user_id, role: 'model', content: reply },
  ]);

  if (insertError) throw new Error(insertError.message);

  return { reply };
};

export const getChatHistory = async (user_id: string, limit = 50) => {
  const { data, error } = await supabase
    .from('chat_history')
    .select('role, content, created_at')
    .eq('user_id', user_id)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
};
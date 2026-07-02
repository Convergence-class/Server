import { supabase } from './supabase';

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw new Error(error.message);
  return { user_id: data.user.id };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
  return {
    access_token: data.session.access_token,
    user_id: data.user.id,
  };
};

export const signOut = async (accessToken: string) => {
  // service role key로 해당 토큰의 세션을 서버에서 강제 만료
  const { error } = await supabase.auth.admin.signOut(accessToken);
  if (error) throw new Error(error.message);
};
import { Request, Response } from 'express';
import { signUp, signIn, signOut } from '../services/authService';

export const signUpHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'email과 password는 필수입니다.' });
    return;
  }

  try {
    const result = await signUp(email, password);
    res.status(201).json({ message: '회원가입 성공', ...result });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const signInHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'email과 password는 필수입니다.' });
    return;
  }

  try {
    const result = await signIn(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
};

export const signOutHandler = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization 헤더가 필요합니다.' });
    return;
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    await signOut(accessToken);
    res.status(200).json({ message: '로그아웃 완료' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
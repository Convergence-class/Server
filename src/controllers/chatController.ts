import { Request, Response } from 'express';
import { sendMessage, getChatHistory } from '../services/chatService';

export const sendMessageHandler = async (req: Request, res: Response) => {
  const { user_id, message } = req.body;

  if (!user_id || !message) {
    res.status(400).json({ error: 'user_id와 message는 필수입니다.' });
    return;
  }

  if (typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({ error: 'message는 비어있을 수 없습니다.' });
    return;
  }

  try {
    const { reply } = await sendMessage(user_id, message.trim());
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getChatHistoryHandler = async (req: Request, res: Response) => {
  const { user_id, limit } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    res.status(400).json({ error: 'user_id 쿼리 파라미터가 필요합니다.' });
    return;
  }

  const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    res.status(400).json({ error: 'limit은 양의 정수여야 합니다.' });
    return;
  }

  try {
    const data = await getChatHistory(user_id, parsedLimit);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
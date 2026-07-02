import { Request, Response } from 'express';
import { getCardStatus, dismissChatbotCard } from '../services/statusService';

export const getCardStatusHandler = async (req: Request, res: Response) => {
  const { user_id } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    res.status(400).json({ error: 'user_id 쿼리 파라미터가 필요합니다.' });
    return;
  }

  try {
    const data = await getCardStatus(user_id);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const dismissChatbotCardHandler = async (req: Request, res: Response) => {
  const { user_id } = req.body;

  if (!user_id) {
    res.status(400).json({ error: 'user_id는 필수입니다.' });
    return;
  }

  try {
    await dismissChatbotCard(user_id);
    res.status(200).json({ message: '챗봇 카드가 7일간 숨겨집니다.' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
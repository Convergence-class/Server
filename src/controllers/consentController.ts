import { Request, Response } from 'express';
import { upsertConsent, getConsent } from '../services/consentService';

export const saveConsentHandler = async (req: Request, res: Response) => {
  const { user_id, data_collection, notification, chatbot_optin } = req.body;

  if (!user_id) {
    res.status(400).json({ error: 'user_id는 필수입니다.' });
    return;
  }

  if (
    typeof data_collection !== 'boolean' ||
    typeof notification !== 'boolean' ||
    typeof chatbot_optin !== 'boolean'
  ) {
    res.status(400).json({
      error: 'data_collection, notification, chatbot_optin은 boolean 필수입니다.',
    });
    return;
  }

  try {
    const result = await upsertConsent({ user_id, data_collection, notification, chatbot_optin });
    res.status(200).json({ message: '동의 정보 저장 완료', data: result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getConsentHandler = async (req: Request, res: Response) => {
  const { user_id } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    res.status(400).json({ error: 'user_id 쿼리 파라미터가 필요합니다.' });
    return;
  }

  try {
    const data = await getConsent(user_id);
    if (!data) {
      res.status(404).json({ message: '동의 정보가 없습니다.' });
      return;
    }
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
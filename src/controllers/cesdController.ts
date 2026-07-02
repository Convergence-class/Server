import { Request, Response } from 'express';
import {
  submitCESD,
  getLatestCESD,
  validateCESDAnswers,
  CESD_QUESTIONS,
} from '../services/cesdService';

export const submitCESDHandler = async (req: Request, res: Response) => {
  const { user_id, answers } = req.body;

  if (!user_id) {
    res.status(400).json({ error: 'user_id는 필수입니다.' });
    return;
  }

  if (!validateCESDAnswers(answers)) {
    res.status(400).json({
      error: 'answers는 0~3 사이의 정수 20개 배열이어야 합니다.',
    });
    return;
  }

  try {
    const result = await submitCESD(user_id, answers);
    res.status(201).json({ message: 'CES-D 제출 완료', data: result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getCESDResultHandler = async (req: Request, res: Response) => {
  const { user_id } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    res.status(400).json({ error: 'user_id 쿼리 파라미터가 필요합니다.' });
    return;
  }

  try {
    const data = await getLatestCESD(user_id);
    if (!data) {
      res.status(404).json({ message: '조회된 결과가 없습니다.' });
      return;
    }
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getCESDQuestionsHandler = (_req: Request, res: Response) => {
  res.status(200).json({ data: CESD_QUESTIONS });
};
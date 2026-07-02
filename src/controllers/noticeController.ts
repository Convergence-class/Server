import { Request, Response } from 'express';
import { getRandomNotice } from '../services/noticeService';

export const getRandomNoticeHandler = async (_req: Request, res: Response) => {
  try {
    const data = await getRandomNotice();
    if (!data) {
      res.status(404).json({ message: '등록된 문구가 없습니다.' });
      return;
    }
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

import { Request, Response } from 'express';
import { saveUsageLog, getUsageSummary } from '../services/usageService';

export const logUsage = async (req: Request, res: Response) => {
  const { user_id, app_name, duration_minutes, logged_at } = req.body;

  if (!user_id || !app_name || duration_minutes == null) {
    res.status(400).json({ error: 'user_id, app_name, duration_minutes는 필수입니다.' });
    return;
  }

  if (typeof duration_minutes !== 'number' || duration_minutes <= 0) {
    res.status(400).json({ error: 'duration_minutes는 양수여야 합니다.' });
    return;
  }

  try {
    const result = await saveUsageLog({ user_id, app_name, duration_minutes, logged_at });
    res.status(201).json({ message: '사용시간 저장 완료', data: result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getUsageSummaryHandler = async (req: Request, res: Response) => {
  const { user_id, date } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    res.status(400).json({ error: 'user_id 쿼리 파라미터가 필요합니다.' });
    return;
  }

  if (date && typeof date === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'date 형식은 YYYY-MM-DD여야 합니다.' });
    return;
  }

  try {
    const data = await getUsageSummary(user_id, date as string | undefined);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
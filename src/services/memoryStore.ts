export interface MemoryUsageLog {
  user_id: string;
  app_name: string;
  duration_minutes: number;
  logged_at: string;
}

export interface MemoryCesdResult {
  user_id: string;
  answers: number[];
  score: number;
  level: string;
  created_at: string;
}

export interface MemoryConsent {
  user_id: string;
  data_collection: boolean;
  notification: boolean;
  chatbot_optin: boolean;
  updated_at: string;
}

export interface MemoryChatMessage {
  user_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export const memoryStore = {
  usageLogs: [] as MemoryUsageLog[],
  cesdResults: [] as MemoryCesdResult[],
  consents: new Map<string, MemoryConsent>(),
  chatHistory: [] as MemoryChatMessage[],
};

export const isSupabaseStorageError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    message.includes('row-level security') ||
    message.includes('schema cache') ||
    message.includes('Could not find the table') ||
    message.includes('permission denied')
  );
};

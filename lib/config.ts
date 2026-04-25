// Cấu hình app đọc từ environment variables.
// Sau khi chuyển sang Supabase, không còn dùng config.json hay Google Sheets creds.

export interface AppConfig {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
}

export function getConfig(): AppConfig {
  return {
    GOOGLE_CLIENT_ID:     process.env.GOOGLE_CLIENT_ID     || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    NEXTAUTH_SECRET:      process.env.NEXTAUTH_SECRET      || 'secret-placeholder',
    NEXTAUTH_URL:         process.env.NEXTAUTH_URL         || 'http://localhost:3000',
  };
}

export function isConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

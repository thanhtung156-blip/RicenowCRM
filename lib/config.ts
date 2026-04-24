import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

export interface AppConfig {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string;
  GOOGLE_SHEET_ID: string;
}

export function getConfig(): AppConfig {
  // 1. Try ENV first
  const config: AppConfig = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'secret-placeholder',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '',
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || '',
  };

  // 2. Override with config.json if exists
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      return { ...config, ...fileConfig };
    } catch (e) {
      console.error('Error reading config.json:', e);
    }
  }

  return config;
}

export function saveConfig(newConfig: Partial<AppConfig>) {
  const currentConfig = getConfig();
  const mergedConfig = { ...currentConfig, ...newConfig };
  
  // Clean up private key newlines if entered via UI
  if (mergedConfig.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    mergedConfig.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = mergedConfig.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(mergedConfig, null, 2));
  return mergedConfig;
}

export function isConfigured(): boolean {
  const config = getConfig();
  return !!(
    config.GOOGLE_CLIENT_ID && 
    config.GOOGLE_SERVICE_ACCOUNT_EMAIL && 
    config.GOOGLE_SHEET_ID
  );
}

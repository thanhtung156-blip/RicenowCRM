import { supabase } from './supabase';

export interface BusinessSettings {
  bufferPercent: number;
  gioChotDon: string;
  tenDonVi: string;
  sdtLienHe: string;
  googleFormUrl: string;
}

const DEFAULTS: BusinessSettings = {
  bufferPercent: 10,
  gioChotDon: '08:30',
  tenDonVi: 'Bếp Ricenow',
  sdtLienHe: '',
  googleFormUrl: '',
};

export async function getBusinessSettings(): Promise<BusinessSettings> {
  try {
    const { data, error } = await supabase.from('cai_dat').select('key, value');
    if (error) throw error;

    const settings = { ...DEFAULTS };
    for (const row of data ?? []) {
      const key = String(row.key);
      const val = String(row.value ?? '');
      if (key === 'bufferPercent') settings.bufferPercent = Number(val);
      else if (key === 'gioChotDon')   settings.gioChotDon  = val;
      else if (key === 'tenDonVi')     settings.tenDonVi    = val;
      else if (key === 'sdtLienHe')    settings.sdtLienHe   = val;
      else if (key === 'googleFormUrl') settings.googleFormUrl = val;
    }
    return settings;
  } catch (error) {
    console.error('[settings] getBusinessSettings:', error);
    return DEFAULTS;
  }
}

export async function updateBusinessSetting(key: string, value: unknown) {
  const { error } = await supabase
    .from('cai_dat')
    .update({ value: String(value ?? '') })
    .eq('key', key);
  if (error) throw error;
}

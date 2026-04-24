import { SHEETS } from "./constants";
import { getRows, updateRow } from "./sheets";

export interface BusinessSettings {
  bufferPercent: number;
  gioChotDon: string;
  tenDonVi: string;
  sdtLienHe: string;
  googleFormUrl: string;
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  try {
    const rows = await getRows(SHEETS.CAI_DAT);

    const settings: BusinessSettings = {
      bufferPercent: 10,
      gioChotDon: "08:30",
      tenDonVi: "Bếp Ricenow",
      sdtLienHe: "",
      googleFormUrl: "",
    };

    rows.forEach(row => {
      const key = String(row[0] ?? "");
      const value = row[1];
      if (key === "bufferPercent") settings.bufferPercent = Number(value);
      else if (key === "gioChotDon") settings.gioChotDon = String(value ?? "");
      else if (key === "tenDonVi") settings.tenDonVi = String(value ?? "");
      else if (key === "sdtLienHe") settings.sdtLienHe = String(value ?? "");
      else if (key === "googleFormUrl") settings.googleFormUrl = String(value ?? "");
    });

    return settings;
  } catch (error) {
    console.error("Error fetching business settings:", error);
    return {
      bufferPercent: 10,
      gioChotDon: "08:30",
      tenDonVi: "Bếp Ricenow",
      sdtLienHe: "",
      googleFormUrl: "",
    };
  }
}

export async function updateBusinessSetting(key: string, value: unknown) {
  const rows = await getRows(SHEETS.CAI_DAT);
  const rowIndex = rows.findIndex(row => row[0] === key);

  if (rowIndex !== -1) {
    await updateRow(SHEETS.CAI_DAT, rowIndex + 1, [key, String(value ?? "")]);
  } else {
    console.warn(`Setting key ${key} not found in ${SHEETS.CAI_DAT}`);
  }
}

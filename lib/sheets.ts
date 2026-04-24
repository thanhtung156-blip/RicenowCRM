import { google } from 'googleapis';
import { getConfig, isConfigured } from './config';
import { getLocalRows, appendLocalRow, updateLocalRow } from "./local-db";

type SheetValue = string | number | boolean | null;

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const getSheetsClient = async () => {
  if (!isConfigured()) {
    throw new Error('System not configured for Google Sheets');
  }

  const config = getConfig();
  const privateKey = config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = config.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const spreadsheetId = config.GOOGLE_SHEET_ID;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      private_key: privateKey,
      client_email: clientEmail,
    },
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, spreadsheetId };
};

export async function getRows(sheetName: string, range?: string): Promise<SheetValue[][]> {
  if (!isConfigured()) {
    return getLocalRows(sheetName);
  }

  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const fullRange = range ? `${sheetName}!${range}` : sheetName;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: fullRange,
    });

    return (response.data.values as SheetValue[][]) || [];
  } catch (error) {
    console.error("Sheets GET Error, falling back to local:", error);
    return getLocalRows(sheetName);
  }
}

export async function appendRow(sheetName: string, values: SheetValue[]) {
  if (!isConfigured()) {
    return appendLocalRow(sheetName, values);
  }

  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
  } catch (error) {
    console.error("Sheets APPEND Error, falling back to local:", error);
    return appendLocalRow(sheetName, values);
  }
}

export async function updateRow(sheetName: string, rowIndex: number, values: SheetValue[]) {
  if (!isConfigured()) {
    return updateLocalRow(sheetName, rowIndex, values);
  }

  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const range = `${sheetName}!A${rowIndex}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
  } catch (error) {
    console.error("Sheets UPDATE Error, falling back to local:", error);
    return updateLocalRow(sheetName, rowIndex, values);
  }
}

export async function batchGet(ranges: string[]) {
  if (!isConfigured()) {
    const results = await Promise.all(ranges.map(r => getLocalRows(r.split('!')[0])));
    return results.map((values, i) => ({ range: ranges[i], values }));
  }

  try {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });
    return response.data.valueRanges || [];
  } catch (error) {
    console.error("Sheets BATCH GET Error, falling back to local:", error);
    return [];
  }
}

export async function findRowById(sheetName: string, id: string, idColumnIndex: number = 0) {
  const rows = await getRows(sheetName);
  if (!rows || rows.length === 0) return null;

  const rowIndex = rows.findIndex(row => row[idColumnIndex] === id);
  if (rowIndex === -1) return null;

  return {
    row: rows[rowIndex],
    index: rowIndex + 1,
  };
}

// 從環境變數讀取 Google Apps Script URL
// 在本地開發時讀取 .env，在 Cloud Run 時讀取部署參數
export const GOOGLE_SCRIPT_URL = (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || '';
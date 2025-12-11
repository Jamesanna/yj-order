/**
 * BACKEND CODE FOR GOOGLE APPS SCRIPT
 * -----------------------------------
 * Save this code in a Google Apps Script project attached to a Google Sheet.
 */

// --- CONFIGURATION ---
const SHEETS = {
  ORDERS: 'Orders',
  MENUS: 'Menus',
  EMPLOYEES: 'Employees',
  ANNOUNCEMENTS: 'Announcements',
  ADMINS: 'Admins',
  CONFIG: 'Config'
};

// --- INITIALIZATION ---
function doGet(e) {
  return ContentService.createTextOutput("YJ-Order Backend V2 is Active.");
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const rawData = e.postData.contents;
    const request = JSON.parse(rawData);
    const result = handleRequest(request);

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    lock.releaseLock();
  }
}

// --- ROUTER ---
function handleRequest(req) {
  const { action, data } = req;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets(ss);

  switch (action) {
    case 'GET_ALL_DATA':
      return getAllData(ss);
    case 'SAVE_ORDER':
      return appendRow(ss, SHEETS.ORDERS, data);
    case 'UPDATE_ALL_ORDERS':
      return replaceSheetData(ss, SHEETS.ORDERS, data);
    case 'UPDATE_ALL_MENUS':
      return replaceSheetData(ss, SHEETS.MENUS, data);
    case 'UPDATE_ALL_EMPLOYEES':
      return replaceSheetData(ss, SHEETS.EMPLOYEES, data);
    case 'UPDATE_ALL_ANNOUNCEMENTS':
      return replaceSheetData(ss, SHEETS.ANNOUNCEMENTS, data);
    case 'UPDATE_ALL_ADMINS':
      return replaceSheetData(ss, SHEETS.ADMINS, data);
    case 'UPDATE_CONFIG':
      return updateConfig(ss, data);
    default:
      throw new Error("Unknown Action: " + action);
  }
}

// --- CONTROLLERS ---

function getAllData(ss) {
  return {
    orders: getSheetData(ss, SHEETS.ORDERS),
    menus: getSheetData(ss, SHEETS.MENUS),
    employees: getSheetData(ss, SHEETS.EMPLOYEES),
    announcements: getSheetData(ss, SHEETS.ANNOUNCEMENTS),
    admins: getSheetData(ss, SHEETS.ADMINS),
    config: getConfig(ss)
  };
}

function appendRow(ss, sheetName, item) {
  const sheet = ss.getSheetByName(sheetName);
  // Store the full object as a JSON string in column A
  // This is the most flexible way to handle complex nested objects (like order items)
  // without creating 20 columns.
  const jsonStr = JSON.stringify(item);
  
  // Optional: Extract key fields for readability in columns B, C, D...
  const readableInfo = extractReadableInfo(sheetName, item);
  
  sheet.appendRow([jsonStr, ...readableInfo]);
  return { success: true };
}

function replaceSheetData(ss, sheetName, list) {
  const sheet = ss.getSheetByName(sheetName);
  sheet.clearContents();
  
  if (!list || list.length === 0) return { success: true };

  // Prepare 2D array
  const rows = list.map(item => {
     const jsonStr = JSON.stringify(item);
     const readableInfo = extractReadableInfo(sheetName, item);
     return [jsonStr, ...readableInfo];
  });

  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  return { success: true };
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return [];

  // Assuming Column A always holds the JSON source of truth
  const data = sheet.getRange(1, 1, lastRow, 1).getValues();
  
  return data
    .map(row => {
      try {
        return JSON.parse(row[0]);
      } catch (e) {
        return null;
      }
    })
    .filter(item => item !== null);
}

function updateConfig(ss, newConfig) {
  const sheet = ss.getSheetByName(SHEETS.CONFIG);
  sheet.clearContents();
  sheet.appendRow([JSON.stringify(newConfig)]); // Save in A1
  return { success: true };
}

function getConfig(ss) {
  const sheet = ss.getSheetByName(SHEETS.CONFIG);
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return {};
  
  const val = sheet.getRange(1, 1).getValue();
  try {
    return JSON.parse(val);
  } catch(e) {
    return {};
  }
}

// --- HELPERS ---

function ensureSheets(ss) {
  Object.values(SHEETS).forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });
}

function extractReadableInfo(sheetName, item) {
  // Returns array of values for columns B, C, D...
  // Just for human readability in the spreadsheet
  if (sheetName === 'Orders') {
    return [
      item.dateStr,
      item.employeeName, 
      item.categoryLabel, 
      item.totalAmount, 
      item.status,
      item.isPaid ? 'Paid' : 'Unpaid'
    ];
  }
  if (sheetName === 'Employees') return [item.name];
  if (sheetName === 'Menus') return [item.label, item.config?.shopName];
  if (sheetName === 'Admins') return [item.username, item.name];
  
  return [];
}

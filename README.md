# 羿鈞科技訂餐系統 - 完整部署教學

本手冊專為無工程背景人員設計，請依照步驟一步一步執行即可完成部署。

---

## 階段一：建立雲端資料庫 (Google Sheets)

1.  **建立試算表**
    *   前往 Google Drive，建立一個新的 Google 試算表。
    *   將檔名修改為：`YJ-Order-DB`。
    *   **建立分頁 (關鍵)**：請在下方建立 6 個分頁 (工作表)，名稱請**複製貼上**以確保完全正確：
        *   `Orders`
        *   `Menus`
        *   `Employees`
        *   `Announcements`
        *   `Admins`
        *   `Config`

2.  **設定後端程式 (Apps Script)**
    *   在試算表上方選單，點擊 **「擴充功能」** -> **「Apps Script」**。
    *   將編輯畫面中的程式碼全部刪除。
    *   複製並貼上以下程式碼：

```javascript
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const payload = e.postData ? JSON.parse(e.postData.contents) : {};
    const action = e.parameter.action || payload.action;
    const data = payload.data;
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let result = {};

    switch (action) {
      case 'GET_ALL_DATA':
        result = {
          orders: getSheetData(ss, 'Orders'),
          menus: getSheetData(ss, 'Menus'),
          employees: getSheetData(ss, 'Employees'),
          announcements: getSheetData(ss, 'Announcements'),
          admins: getSheetData(ss, 'Admins'),
          config: getConfigData(ss)
        };
        break;
      case 'SAVE_ORDER': appendRow(ss, 'Orders', data); result = { success: true }; break;
      case 'UPDATE_ALL_ORDERS': overwriteSheet(ss, 'Orders', data, true); result = { success: true }; break;
      case 'UPDATE_ALL_MENUS': overwriteSheet(ss, 'Menus', data); result = { success: true }; break;
      case 'UPDATE_ALL_EMPLOYEES': overwriteSheet(ss, 'Employees', data); result = { success: true }; break;
      case 'UPDATE_ALL_ANNOUNCEMENTS': overwriteSheet(ss, 'Announcements', data); result = { success: true }; break;
      case 'UPDATE_ALL_ADMINS': overwriteSheet(ss, 'Admins', data); result = { success: true }; break;
      case 'UPDATE_CONFIG': saveConfigData(ss, data); result = { success: true }; break;
      default: result = { status: 'OK', message: 'No action specified' };
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  if (sheetName === 'Orders') {
    return rows.slice(1).map(row => ({
      id: String(row[0]), dateStr: row[1], employeeName: row[2], items: row[3] ? JSON.parse(row[3]) : [],
      totalAmount: Number(row[4]), status: row[5], categoryLabel: row[6], timestamp: Number(row[7]), isPaid: row[8] === true || row[8] === 'TRUE'
    }));
  }
  return rows.slice(1).map(row => { try { return JSON.parse(row[1]); } catch { return null; } }).filter(item => item !== null);
}

function getConfigData(ss) {
  const sheet = ss.getSheetByName('Config');
  const rows = sheet.getDataRange().getValues();
  const config = {};
  rows.forEach(row => { if (row[0]) config[row[0]] = row[1]; });
  return config;
}

function saveConfigData(ss, data) {
  const sheet = ss.getSheetByName('Config');
  sheet.clear();
  const rows = Object.entries(data).map(([k, v]) => [k, v]);
  if (rows.length > 0) sheet.getRange(1, 1, rows.length, 2).setValues(rows);
}

function appendRow(ss, sheetName, data) {
  const sheet = ss.getSheetByName(sheetName);
  if (sheetName === 'Orders') {
    sheet.appendRow([data.id, data.dateStr, data.employeeName, JSON.stringify(data.items), data.totalAmount, data.status, data.categoryLabel, data.timestamp, data.isPaid]);
  } else {
    sheet.appendRow([data.id, JSON.stringify(data)]);
  }
}

function overwriteSheet(ss, sheetName, dataList, isOrderTable = false) {
  const sheet = ss.getSheetByName(sheetName);
  sheet.clear();
  if (isOrderTable) {
    sheet.appendRow(['ID', 'Date', 'Name', 'Items', 'Amount', 'Status', 'Category', 'Timestamp', 'IsPaid']);
    const rows = dataList.map(d => [d.id, d.dateStr, d.employeeName, JSON.stringify(d.items), d.totalAmount, d.status, d.categoryLabel, d.timestamp, d.isPaid]);
    if (rows.length > 0) sheet.getRange(2, 1, rows.length, 9).setValues(rows);
  } else {
    sheet.appendRow(['ID', 'Data']);
    const rows = dataList.map(item => [item.id, JSON.stringify(item)]);
    if (rows.length > 0) sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}
```

3.  **發布 (取得 API 網址)**
    *   點擊 Apps Script 右上角的 **「部署」** 按鈕 -> **「新增部署作業」**。
    *   左側齒輪選單選擇類型：**「網頁應用程式」**。
    *   設定選項 (非常重要)：
        *   執行身分：選擇 **「我 (您的 Email)」**。
        *   誰可以存取：選擇 **「所有人」** (這樣雲端主機才能寫入資料)。
    *   點擊「部署」。
    *   **複製網址**：畫面會顯示一串以 `https://script.google.com/...` 開頭的網址，請複製它。

---

## 階段二：設定本地環境變數

1.  **建立環境變數檔案**
    *   在您的專案資料夾中，新增一個檔案命名為 `.env`。
    *   用記事本打開它，貼上以下內容：

    ```properties
    VITE_GOOGLE_SCRIPT_URL=請貼上您剛剛複製的網址
    ```
    *   儲存檔案。

---

## 階段三：部署到 Google Cloud Run

1.  **開啟終端機**
    *   在專案資料夾中，右鍵選擇「在終端機開啟」或「Open in Terminal」。

2.  **執行部署指令**
    *   複製以下指令並貼上執行：

    ```bash
    gcloud run deploy yj-order-app --source . --port 8080 --allow-unauthenticated --region asia-east1
    ```

3.  **完成**
    *   等待數分鐘後，終端機顯示 `Service URL: ...` 即代表部署成功！再幫我做最後確認所有全部的檔案跟程式碼，因為我要轉移開發環境，要把這套訂餐系統，轉移到Google Antigravity上面去開發。
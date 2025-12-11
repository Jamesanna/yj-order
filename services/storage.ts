import { Order, Employee, Announcement, MenuCategory, MenuConfig, AdminAccount, OrderStatus } from '../types';
import { GOOGLE_SCRIPT_URL } from './config';

/**
 * DATABASE SERVICE
 * Supports dual mode: 
 * 1. LocalStorage (Mock/Dev) - if GOOGLE_SCRIPT_URL is empty
 * 2. Google Sheets (Prod) - if GOOGLE_SCRIPT_URL is set
 */

const STORAGE_KEYS = {
  ORDERS: 'cofoodie_orders',
  MENU_CATEGORIES: 'cofoodie_menus_v3',
  EMPLOYEES: 'cofoodie_employees_v2',
  ANNOUNCEMENTS: 'cofoodie_announcements',
  ADMIN_SETTINGS: 'cofoodie_admin_settings',
  ADMIN_ACCOUNTS: 'cofoodie_admin_accounts',
  SESSION: 'cofoodie_session',
  SESSION_USER_ID: 'cofoodie_session_user_id',
  FRONTEND_PASSWORD: 'cofoodie_frontend_password'
};

const todayStr = new Date().toISOString().split('T')[0];

// --- Initial Data for Local Fallback ---
const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: '王小明' },
  { id: '2', name: '李美華' },
  { id: '3', name: '陳大文' },
  { id: '4', name: '張志豪' },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', content: '今日下午茶請在 14:00 前完成下單！', isActive: true },
  { id: '2', content: '本週五團購項目：知名網紅蛋糕。', isActive: true },
];

const INITIAL_MENUS: MenuCategory[] = [
  { 
    id: 'FOOD', 
    label: '訂餐', 
    config: { imageUrl: 'https://picsum.photos/800/600?random=1', shopName: '阿嬤古早味排骨飯', date: todayStr } 
  },
  { 
    id: 'DRINKS', 
    label: '訂飲料', 
    config: { imageUrl: 'https://picsum.photos/800/600?random=2', shopName: '五桐號 - 台北通化店', date: todayStr } 
  },
  { 
    id: 'GROUP_BUY', 
    label: '揪團購', 
    config: { imageUrl: 'https://picsum.photos/800/600?random=3', shopName: '諾貝爾奶凍捲', date: todayStr } 
  }
];

const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: 'sysop',
    username: 'sysop',
    password: 'Admin@123',
    name: '超級管理員',
    isSuperAdmin: true
  }
];

const DEFAULT_FRONTEND_PWD = '24664941';

class StorageService {
  private get useCloud() {
    return !!GOOGLE_SCRIPT_URL;
  }

  // --- Helper to fetch from Apps Script ---
  private async apiCall(action: string, data?: any) {
    if (!this.useCloud) return null;
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow', 
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify({ action, data }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn('Failed to parse JSON response', text);
        return { success: true }; 
      }
    } catch (e) {
      console.error("API Connection Failed", e);
      return null;
    }
  }

  // --- Orders ---
  async getOrders(): Promise<Order[]> {
    if (this.useCloud) {
       const res = await this.apiCall('GET_ALL_DATA');
       return res?.orders || [];
    }
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  }

  async saveOrder(order: Order): Promise<void> {
    if (this.useCloud) {
      await this.apiCall('SAVE_ORDER', order);
      return;
    }
    const orders = await this.getOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (this.useCloud) {
        let orders = await this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].status = status;
            await this.apiCall('UPDATE_ALL_ORDERS', orders);
        }
        return;
    }
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  }

  async toggleOrderPayment(orderId: string): Promise<void> {
    if (this.useCloud) {
        let orders = await this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].isPaid = !orders[index].isPaid;
            await this.apiCall('UPDATE_ALL_ORDERS', orders);
        }
        return;
    }
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].isPaid = !orders[index].isPaid;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  }

  async deleteOrdersByContext(dateStr: string, categoryLabel: string): Promise<void> {
    if (this.useCloud) {
        let orders = await this.getOrders();
        orders = orders.filter(o => !(o.dateStr === dateStr && o.categoryLabel === categoryLabel));
        await this.apiCall('UPDATE_ALL_ORDERS', orders);
        return;
    }
    let orders = await this.getOrders();
    orders = orders.filter(o => !(o.dateStr === dateStr && o.categoryLabel === categoryLabel));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  // --- Menu Categories ---
  async getMenuCategories(): Promise<MenuCategory[]> {
    if (this.useCloud) {
        const res = await this.apiCall('GET_ALL_DATA');
        return res?.menus || [];
    }
    const data = localStorage.getItem(STORAGE_KEYS.MENU_CATEGORIES);
    return data ? JSON.parse(data) : INITIAL_MENUS;
  }

  async saveMenuCategories(menus: MenuCategory[]): Promise<void> {
    if (this.useCloud) {
        await this.apiCall('UPDATE_ALL_MENUS', menus);
        return;
    }
    localStorage.setItem(STORAGE_KEYS.MENU_CATEGORIES, JSON.stringify(menus));
  }

  async addMenuCategory(label: string, config: MenuConfig): Promise<void> {
    const menus = await this.getMenuCategories();
    const newId = 'MENU_' + Date.now();
    menus.push({ id: newId, label, config });
    await this.saveMenuCategories(menus);
  }

  async updateMenuCategory(id: string, label: string, config: MenuConfig): Promise<void> {
    const menus = await this.getMenuCategories();
    const idx = menus.findIndex(m => m.id === id);
    if (idx !== -1) {
      menus[idx].label = label;
      menus[idx].config = config;
      await this.saveMenuCategories(menus);
    }
  }

  async deleteMenuCategory(id: string): Promise<void> {
    let menus = await this.getMenuCategories();
    menus = menus.filter(m => m.id !== id);
    await this.saveMenuCategories(menus);
  }

  // --- Employees ---
  async getEmployees(): Promise<Employee[]> {
    if (this.useCloud) {
        const res = await this.apiCall('GET_ALL_DATA');
        return res?.employees || [];
    }
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
  }

  async saveEmployees(list: Employee[]): Promise<void> {
    if (this.useCloud) {
        await this.apiCall('UPDATE_ALL_EMPLOYEES', list);
        return;
    }
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
  }

  async addEmployee(emp: Employee): Promise<void> {
    const list = await this.getEmployees();
    list.push(emp);
    await this.saveEmployees(list);
  }

  async updateEmployee(updatedEmp: Employee): Promise<void> {
    const list = await this.getEmployees();
    const newList = list.map(e => e.id === updatedEmp.id ? updatedEmp : e);
    await this.saveEmployees(newList);
  }
  
  async deleteEmployee(id: string): Promise<void> {
    const list = await this.getEmployees();
    const newList = list.filter(e => e.id !== id);
    await this.saveEmployees(newList);
  }

  // --- Announcements ---
  async getAnnouncements(): Promise<Announcement[]> {
    if (this.useCloud) {
        const res = await this.apiCall('GET_ALL_DATA');
        return res?.announcements || [];
    }
    const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data) : INITIAL_ANNOUNCEMENTS;
  }

  async saveAnnouncements(list: Announcement[]): Promise<void> {
    if (this.useCloud) {
        await this.apiCall('UPDATE_ALL_ANNOUNCEMENTS', list);
        return;
    }
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
  }

  // --- Admin Settings & Accounts ---
  async getAdminSettings() {
    if (this.useCloud) {
        return { isGoogleBound: true, googleAccountName: 'Cloud Mode', googleAccountType: 'WORKSPACE' };
    }
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
    return data ? JSON.parse(data) : { 
      isGoogleBound: false,
      googleAccountName: '',
      googleAccountType: 'PERSONAL' 
    };
  }

  async setGoogleBound(isBound: boolean, accountName: string = '', accountType: 'PERSONAL' | 'WORKSPACE' = 'PERSONAL') {
    const settings = {
      isGoogleBound: isBound,
      googleAccountName: accountName,
      googleAccountType: accountType
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
  }

  async checkDatabaseConnection(): Promise<boolean> {
    if (this.useCloud) {
        try {
            const res = await this.apiCall('GET_ALL_DATA');
            return !!res;
        } catch {
            return false;
        }
    }
    // Simulate local
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); 
      }, 1000);
    });
  }

  async getAdminAccounts(): Promise<AdminAccount[]> {
    if (this.useCloud) {
        const res = await this.apiCall('GET_ALL_DATA');
        return res?.admins || [];
    }
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCOUNTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(INITIAL_ADMINS));
      return INITIAL_ADMINS;
    }
    return JSON.parse(data);
  }

  async saveAdminAccounts(admins: AdminAccount[]): Promise<void> {
    if (this.useCloud) {
        await this.apiCall('UPDATE_ALL_ADMINS', admins);
        return;
    }
    localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(admins));
  }

  async verifyAdmin(username: string, password: string): Promise<AdminAccount | null> {
    const admins = await this.getAdminAccounts();
    const admin = admins.find(a => a.username === username && a.password === password);
    return admin || null;
  }

  async getAdminById(id: string): Promise<AdminAccount | undefined> {
    const admins = await this.getAdminAccounts();
    return admins.find(a => a.id === id);
  }

  async addAdminAccount(account: AdminAccount): Promise<void> {
    const admins = await this.getAdminAccounts();
    if (admins.some(a => a.username === account.username)) {
      throw new Error('帳號已存在');
    }
    admins.push(account);
    await this.saveAdminAccounts(admins);
  }

  async updateAdminAccount(updated: AdminAccount): Promise<void> {
    const admins = await this.getAdminAccounts();
    const idx = admins.findIndex(a => a.id === updated.id);
    if (idx !== -1) {
      admins[idx] = updated;
      await this.saveAdminAccounts(admins);
    }
  }

  async deleteAdminAccount(id: string): Promise<void> {
    let admins = await this.getAdminAccounts();
    admins = admins.filter(a => a.id !== id);
    await this.saveAdminAccounts(admins);
  }

  // --- Frontend Password ---
  async getFrontendPassword(): Promise<string> {
    if (this.useCloud) {
       const res = await this.apiCall('GET_ALL_DATA');
       return res?.config?.frontendPassword || DEFAULT_FRONTEND_PWD;
    }
    const pwd = localStorage.getItem(STORAGE_KEYS.FRONTEND_PASSWORD);
    return pwd || DEFAULT_FRONTEND_PWD;
  }

  async setFrontendPassword(password: string): Promise<void> {
    if (this.useCloud) {
        const res = await this.apiCall('GET_ALL_DATA');
        const currentConfig = res?.config || {};
        await this.apiCall('UPDATE_CONFIG', { ...currentConfig, frontendPassword: password });
        return;
    }
    localStorage.setItem(STORAGE_KEYS.FRONTEND_PASSWORD, password);
  }

  // --- Session (Keep Local) ---
  setSession(role: 'USER' | 'ADMIN', userId?: string) {
    localStorage.setItem(STORAGE_KEYS.SESSION, role);
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.SESSION_USER_ID, userId);
    }
  }

  getSession(): { role: 'USER' | 'ADMIN' | null, userId: string | null } {
    const role = localStorage.getItem(STORAGE_KEYS.SESSION) as 'USER' | 'ADMIN' | null;
    const userId = localStorage.getItem(STORAGE_KEYS.SESSION_USER_ID);
    return { role, userId };
  }

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.SESSION_USER_ID);
  }
}

export const db = new StorageService();
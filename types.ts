export enum TabType {
  FOOD = 'FOOD',
  DRINKS = 'DRINKS',
  GROUP_BUY = 'GROUP_BUY'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface MenuConfig {
  imageUrl: string;
  shopName: string;
  date: string; // YYYY-MM-DD
  cutoffTime?: string; // HH:mm (e.g., "14:00")
  options?: { id: string; label: string; price: number; }[];
}

// New Dynamic Structure
export interface MenuCategory {
  id: string;
  label: string; // The display name of the tab (e.g., "訂餐", "下午茶")
  config: MenuConfig;
}

export type MenuImagesMap = Record<string, MenuConfig>;

export interface OrderItem {
  id: string;
  name: string;
  note: string;
  price: number;
}

export interface Order {
  id: string;
  employeeName: string;
  items: OrderItem[];
  totalAmount: number;
  timestamp: number; // Unix timestamp
  status: OrderStatus;
  dateStr: string; // YYYY-MM-DD for easy filtering
  categoryLabel?: string; // New field for categorization (e.g., "訂餐")
  isPaid?: boolean; // Track payment status
}

export interface Employee {
  id: string;
  name: string;
}

export interface Announcement {
  id: string;
  content: string;
  isActive: boolean;
}

// New Admin Account Interface
export interface AdminAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  isSuperAdmin: boolean; // True for sysop
}

export interface AppState {
  isAuthenticatedUser: boolean;
  isAuthenticatedAdmin: boolean;
  isGoogleBound: boolean;
  currentAdmin?: AdminAccount; // Track who is logged in
}
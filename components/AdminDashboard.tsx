import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/storage';
import { seedDatabase } from '../utils/seeder';
import { Order, Employee, Announcement, MenuCategory, MenuConfig, AdminAccount } from '../types';
import { ShoppingBag, Utensils, Users, Megaphone, Settings, LogOut, Trash2, Edit2, CheckCircle, XCircle, LayoutList, LayoutGrid, Calendar, Store, PlusCircle, UploadCloud, FileImage, User, BarChart3, ArrowUpDown, GripVertical, Save, Menu, X, PlayCircle, PauseCircle, ChevronLeft, ChevronRight, History, Zap, Filter, DollarSign, Shield, UserCog, Lock, ZoomIn, Circle, Database, RefreshCw, Link, Link2Off, Briefcase } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onGoToFrontend: () => void;
  currentUser: AdminAccount;
}

enum AdminView {
  ORDERS = 'ORDERS',
  MENU = 'MENU',
  EMPLOYEES = 'EMPLOYEES',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  SYSTEM = 'SYSTEM'
}

const CATEGORY_PALETTE = [
  { label: '訂餐', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', tab: 'data-[state=active]:bg-blue-600' },
  { label: '訂飲料', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', tab: 'data-[state=active]:bg-emerald-600' },
  { label: '揪團購', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', tab: 'data-[state=active]:bg-amber-600' },
  { label: '下午茶', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', tab: 'data-[state=active]:bg-rose-600' },
  { label: '宵夜', bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', tab: 'data-[state=active]:bg-violet-600' },
];

const getCategoryColor = (label: string | undefined) => {
  if (!label) return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', tab: '' };
  const known = CATEGORY_PALETTE.find(c => c.label === label);
  if (known) return known;
  const idx = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % CATEGORY_PALETTE.length;
  return CATEGORY_PALETTE[idx];
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onGoToFrontend, currentUser }) => {
  const [currentView, setCurrentView] = useState<AdminView>(AdminView.ORDERS);
  const [adminSettings, setAdminSettings] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    db.getAdminSettings().then(setAdminSettings);
  }, []);

  const handleGoogleBind = async (accountName: string, accountType: 'PERSONAL' | 'WORKSPACE') => {
    await db.setGoogleBound(true, accountName, accountType);
    const updated = await db.getAdminSettings();
    setAdminSettings(updated);
  };

  const renderContent = () => {
    switch (currentView) {
      case AdminView.ORDERS: return <OrderManager />;
      case AdminView.MENU: return <MenuManager />;
      case AdminView.EMPLOYEES: return <EmployeeManager />;
      case AdminView.ANNOUNCEMENTS: return <AnnouncementManager />;
      case AdminView.SYSTEM: return <SystemManager settings={adminSettings} onBind={handleGoogleBind} currentUser={currentUser} />;
      default: return <OrderManager />;
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case AdminView.ORDERS: return '訂單管理';
      case AdminView.MENU: return '菜單管理';
      case AdminView.EMPLOYEES: return '同事管理';
      case AdminView.ANNOUNCEMENTS: return '公告管理';
      case AdminView.SYSTEM: return '系統管理';
      default: return '管理中心';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 relative overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed md:relative z-50 w-64 h-full bg-slate-900 text-white flex flex-col shadow-lg transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center"><div><h1 className="text-xl font-bold tracking-wide">羿鈞科技<br />訂餐、揪團系統</h1><p className="text-xs text-slate-400 mt-2">後台管理中心</p></div><button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white"><X size={24} /></button></div>
        <div className="px-6 py-4 flex items-center gap-3 bg-slate-800/50 border-b border-slate-800"><div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">{currentUser.name.charAt(0)}</div><div className="flex-1 min-w-0"><div className="text-sm font-bold text-white truncate">{currentUser.name}</div><div className="text-xs text-emerald-400 flex items-center gap-1"><Shield size={10} /> {currentUser.isSuperAdmin ? '超級管理員' : '次管理員'}</div></div></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={<ShoppingBag size={20} />} label="訂單管理" active={currentView === AdminView.ORDERS} onClick={() => { setCurrentView(AdminView.ORDERS); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<Utensils size={20} />} label="菜單管理" active={currentView === AdminView.MENU} onClick={() => { setCurrentView(AdminView.MENU); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<Users size={20} />} label="同事管理" active={currentView === AdminView.EMPLOYEES} onClick={() => { setCurrentView(AdminView.EMPLOYEES); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<Megaphone size={20} />} label="公告管理" active={currentView === AdminView.ANNOUNCEMENTS} onClick={() => { setCurrentView(AdminView.ANNOUNCEMENTS); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<Settings size={20} />} label="系統管理" active={currentView === AdminView.SYSTEM} onClick={() => { setCurrentView(AdminView.SYSTEM); setIsSidebarOpen(false); }} />
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2"><button onClick={onGoToFrontend} className="flex items-center gap-3 w-full px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"><Store size={20} /><span>回前台首頁</span></button><button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-slate-800 rounded transition-colors"><LogOut size={20} /><span>登出系統</span></button></div>
      </aside>
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md shrink-0"><div className="flex items-center gap-3"><button onClick={() => setIsSidebarOpen(true)} className="text-white hover:text-slate-300"><Menu size={24} /></button><h2 className="font-bold text-lg">{getPageTitle()}</h2></div><div className="text-xs text-slate-400">{currentUser.username}</div></header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full bg-slate-100">{renderContent()}</main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded transition-colors ${active ? 'bg-primary text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}>{icon}<span className="font-medium">{label}</span></button>
);

const OrderManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allMenus, setAllMenus] = useState<MenuCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'TODAY' | 'HISTORY'>('TODAY');
  const [todayViewMode, setTodayViewMode] = useState<'CARD' | 'LIST'>('CARD');
  const [filterCategory, setFilterCategory] = useState<string>('全部顯示');
  const [historyMode, setHistoryMode] = useState<'WEEK' | 'MONTH' | 'CUSTOM'>('WEEK');
  const [refDate, setRefDate] = useState(new Date());
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [selectedDateDetails, setSelectedDateDetails] = useState<string | null>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [o, m] = await Promise.all([db.getOrders(), db.getMenuCategories()]);
      setOrders(o);
      setAllMenus(m);
      const categories = Array.from(new Set(m.map(item => item.label)));
      setExistingCategories(categories);
    }
    load();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const getStartOfWeek = (date: Date) => { const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); return new Date(d.setDate(diff)); };
  const getWeekDays = (referenceDate: Date) => { const start = getStartOfWeek(referenceDate); return Array.from({ length: 5 }).map((_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d.toISOString().split('T')[0]; }); };
  const getDaysInMonth = (referenceDate: Date) => { const year = referenceDate.getFullYear(); const month = referenceDate.getMonth(); const date = new Date(year, month, 1); const days = []; while (date.getMonth() === month) { days.push(new Date(date).toISOString().split('T')[0]); date.setDate(date.getDate() + 1); } return days; };
  const shiftDate = (delta: number) => { const newDate = new Date(refDate); if (historyMode === 'WEEK') newDate.setDate(newDate.getDate() + (delta * 7)); else if (historyMode === 'MONTH') newDate.setMonth(newDate.getMonth() + delta); setRefDate(newDate); };
  const filterByCat = (o: Order) => filterCategory === '全部顯示' ? true : o.categoryLabel === filterCategory;
  const todayOrders = orders.filter(o => o.dateStr === todayStr).filter(filterByCat).sort((a, b) => b.timestamp - a.timestamp);
  const allTodayOrders = orders.filter(o => o.dateStr === todayStr);
  const todayStats = allTodayOrders.reduce((acc, order) => { const label = order.categoryLabel || '未分類'; if (!acc[label]) acc[label] = { amount: 0, count: 0 }; acc[label].amount += order.totalAmount; acc[label].count += 1; return acc; }, {} as Record<string, { amount: number, count: number }>);
  const grandTotal = allTodayOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const grandCount = allTodayOrders.length;

  const getHistoryOrders = () => { let filtered = []; if (historyMode === 'WEEK') filtered = orders.filter(o => o.dateStr < todayStr); else if (historyMode === 'MONTH') filtered = orders.filter(o => o.dateStr.startsWith(refDate.toISOString().slice(0, 7))); else filtered = (customRange.start && customRange.end) ? orders.filter(o => o.dateStr >= customRange.start && o.dateStr <= customRange.end) : []; return filtered.filter(filterByCat); };
  const historyOrders = getHistoryOrders();
  const detailedOrdersList = selectedDateDetails ? orders.filter(o => o.dateStr === selectedDateDetails).filter(filterByCat) : [];
  const detailedTotal = detailedOrdersList.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const showPicker = (ref: React.RefObject<HTMLInputElement>) => { try { ref.current?.showPicker(); } catch (e) { ref.current?.focus(); ref.current?.click(); } };
  const getMenuImage = (dateStr: string, label?: string) => { if (!label) return undefined; const menu = allMenus.find(m => m.config.date === dateStr && m.label === label); return menu?.config.imageUrl; };
  const handleTogglePayment = async (orderId: string) => { await db.toggleOrderPayment(orderId); setOrders(await db.getOrders()); };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">訂單管理</h2><div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200"><button onClick={() => setActiveTab('TODAY')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'TODAY' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>今日訂單</button><button onClick={() => setActiveTab('HISTORY')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'HISTORY' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>歷史訂單</button></div></div>
      {activeTab === 'TODAY' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-2"><div className="bg-slate-800 rounded-xl p-4 text-white shadow-md flex flex-col justify-between relative overflow-hidden"><div className="absolute right-0 top-0 p-3 opacity-10"><DollarSign size={48} /></div><div className="text-sm text-slate-400 font-bold mb-1">今日總計</div><div><div className="text-2xl font-bold tracking-tight">${grandTotal.toLocaleString()}</div><div className="text-xs text-slate-400 mt-1">{grandCount} 筆訂單</div></div></div>{existingCategories.map(label => { const color = getCategoryColor(label); const stat = todayStats[label] || { amount: 0, count: 0 }; return (<div key={label} className={`rounded-xl p-4 shadow-sm border flex flex-col justify-between ${color.bg} ${color.border}`}><div className="text-xs font-bold opacity-70 mb-1 flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${color.tab.replace('data-[state=active]:', '')}`}></span>{label}</div><div><div className={`text-xl font-bold ${color.text}`}>${stat.amount.toLocaleString()}</div><div className="text-xs opacity-60 font-bold">{stat.count} 筆</div></div></div>) })}</div>
          <div className="flex flex-wrap gap-2 mb-4 items-center"><span className="text-sm font-bold text-slate-500 mr-2 flex items-center gap-1"><Filter size={14} /> 分類篩選:</span><button onClick={() => setFilterCategory('全部顯示')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterCategory === '全部顯示' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>全部顯示</button>{existingCategories.map(label => { const isActive = filterCategory === label; return <button key={label} onClick={() => setFilterCategory(label)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${isActive ? 'bg-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{label}</button> })}</div>
          <div className="flex justify-end md:justify-start"><div className="hidden md:flex bg-white rounded-lg p-1 shadow-sm border border-slate-200"><button onClick={() => setTodayViewMode('CARD')} className={`p-2 rounded ${todayViewMode === 'CARD' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}><LayoutGrid size={18} /></button><button onClick={() => setTodayViewMode('LIST')} className={`p-2 rounded ${todayViewMode === 'LIST' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}><LayoutList size={18} /></button></div></div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><div className={`${todayViewMode === 'LIST' ? 'md:hidden' : ''}`}><div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{todayOrders.length === 0 && <div className="col-span-full text-center text-slate-400 py-8">此分類尚無訂單</div>}{todayOrders.map(order => { const badgeColor = getCategoryColor(order.categoryLabel); const menuImage = getMenuImage(order.dateStr, order.categoryLabel); return (<div key={order.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"><div className="flex justify-between items-start mb-3"><div className="flex items-center gap-2"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">{order.employeeName.charAt(0)}</div><div className="flex flex-col"><span className="font-bold text-slate-700 leading-none text-base">{order.employeeName}</span>{order.categoryLabel && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor.bg} ${badgeColor.text} border ${badgeColor.border} w-fit mt-0.5`}>{order.categoryLabel}</span>}</div></div><span className="text-xs text-slate-400 font-mono">{new Date(order.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}</span></div><div className="flex gap-3 mb-3">{menuImage && (<div className="w-16 h-16 rounded-md bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 cursor-zoom-in relative group" onClick={() => setZoomImage(menuImage)}><img src={menuImage} alt="Menu" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center"><ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100" /></div></div>)}<div className="flex-1 space-y-1">{order.items.map((item, idx) => (<div key={idx} className="text-sm text-slate-600 flex justify-between items-start"><span>{item.name} {item.note && <span className="text-xs text-slate-400">({item.note})</span>}</span><span className="font-mono font-medium">${item.price}</span></div>))}</div></div><div className="pt-3 border-t border-slate-100 flex justify-between items-center"><div className="flex flex-col"><span className="font-bold text-primary text-xl">${order.totalAmount}</span></div><div className="flex items-center gap-2"><button onClick={() => handleTogglePayment(order.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${order.isPaid ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{order.isPaid ? <CheckCircle size={14} /> : <Circle size={14} />}{order.isPaid ? '已付款' : '未付款'}</button><span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-bold">{order.status}</span></div></div></div>) })}</div></div><div className={`hidden ${todayViewMode === 'LIST' ? 'md:block' : ''}`}><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4 font-semibold text-slate-600 w-24">時間</th><th className="p-4 font-semibold text-slate-600">菜單</th><th className="p-4 font-semibold text-slate-600">員工姓名</th><th className="p-4 font-semibold text-slate-600">分類</th><th className="p-4 font-semibold text-slate-600">訂購內容</th><th className="p-4 font-semibold text-slate-600 text-right">總金額</th><th className="p-4 font-semibold text-slate-600 text-center">付款狀態</th><th className="p-4 font-semibold text-slate-600 text-center">狀態</th></tr></thead><tbody className="divide-y divide-slate-100">{todayOrders.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-400">目前沒有資料</td></tr>}{todayOrders.map(order => { const badgeColor = getCategoryColor(order.categoryLabel); const menuImage = getMenuImage(order.dateStr, order.categoryLabel); return (<tr key={order.id} className="hover:bg-slate-50"><td className="p-4 text-slate-500 text-sm font-mono">{new Date(order.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}</td><td className="p-4">{menuImage ? (<div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 overflow-hidden cursor-zoom-in" onClick={() => setZoomImage(menuImage)}><img src={menuImage} alt="Menu" className="w-full h-full object-cover" /></div>) : <div className="w-10 h-10 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300"><FileImage size={16} /></div>}</td><td className="p-4 font-bold text-slate-700">{order.employeeName}</td><td className="p-4">{order.categoryLabel ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor.bg} ${badgeColor.text} border ${badgeColor.border}`}>{order.categoryLabel}</span> : <span className="text-xs text-slate-300">-</span>}</td><td className="p-4 text-sm text-slate-600">{order.items.map(i => `${i.name}${i.note ? `(${i.note})` : ''}`).join(', ')}</td><td className="p-4 font-bold text-primary text-right">${order.totalAmount}</td><td className="p-4 text-center"><button onClick={() => handleTogglePayment(order.id)} className={`mx-auto px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 transition-all ${order.isPaid ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{order.isPaid ? <CheckCircle size={12} /> : <Circle size={12} />}{order.isPaid ? '已付' : '未付'}</button></td><td className="p-4 text-center"><span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">{order.status}</span></td></tr>) })}</tbody></table></div></div>
        </>
      )}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap gap-2 mb-4 items-center"><span className="text-sm font-bold text-slate-500 mr-2 flex items-center gap-1"><Filter size={14} /> 分類篩選:</span><button onClick={() => setFilterCategory('全部顯示')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterCategory === '全部顯示' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>全部顯示</button>{existingCategories.map(label => { const isActive = filterCategory === label; return <button key={label} onClick={() => setFilterCategory(label)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${isActive ? 'bg-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{label}</button> })}</div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"><div className="flex bg-slate-100 rounded-lg p-1 self-start"><button onClick={() => setHistoryMode('WEEK')} className={`px-3 py-1.5 text-sm rounded-md transition-all ${historyMode === 'WEEK' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>週檢視</button><button onClick={() => setHistoryMode('MONTH')} className={`px-3 py-1.5 text-sm rounded-md transition-all ${historyMode === 'MONTH' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>月檢視</button><button onClick={() => setHistoryMode('CUSTOM')} className={`px-3 py-1.5 text-sm rounded-md transition-all ${historyMode === 'CUSTOM' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>自訂範圍</button></div>{historyMode !== 'CUSTOM' ? (<div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200"><button onClick={() => shiftDate(-1)} className="p-1 hover:bg-slate-200 rounded"><ChevronLeft size={18} /></button><span className="font-mono font-bold text-slate-700">{historyMode === 'WEEK' ? `${getStartOfWeek(refDate).toLocaleDateString()} - ${(() => { const d = getStartOfWeek(refDate); d.setDate(d.getDate() + 4); return d.toLocaleDateString(); })()}` : refDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}</span><button onClick={() => shiftDate(1)} className="p-1 hover:bg-slate-200 rounded"><ChevronRight size={18} /></button></div>) : (<div className="flex items-center gap-2"><div className="relative group" onClick={() => showPicker(startDateRef)}><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors cursor-pointer" size={16} /><input ref={startDateRef} type="date" value={customRange.start} onClick={() => showPicker(startDateRef)} onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))} className="pl-10 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none shadow-sm cursor-pointer hover:border-primary transition-colors w-40" /></div><span className="text-slate-400 font-bold">-</span><div className="relative group" onClick={() => showPicker(endDateRef)}><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors cursor-pointer" size={16} /><input ref={endDateRef} type="date" value={customRange.end} onClick={() => showPicker(endDateRef)} onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))} className="pl-10 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none shadow-sm cursor-pointer hover:border-primary transition-colors w-40" /></div></div>)}</div>
          {historyMode === 'WEEK' && (<div className="grid grid-cols-1 md:grid-cols-5 gap-4">{getWeekDays(refDate).map((dateStr, idx) => { const dayOrders = orders.filter(o => o.dateStr === dateStr).filter(filterByCat); const total = dayOrders.reduce((acc, curr) => acc + curr.totalAmount, 0); return (<div key={dateStr} className={`border rounded-lg p-3 ${dateStr === todayStr ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}><div className="font-bold text-slate-700 mb-2 border-b border-slate-200 pb-1 flex justify-between"><span>{['週一', '週二', '週三', '週四', '週五'][idx]}</span><span className="text-xs font-normal text-slate-500">{dateStr.slice(5)}</span></div>{dayOrders.length === 0 ? <div className="text-xs text-slate-400 text-center py-4">無訂單</div> : (<div className="space-y-2"><div className="text-xs text-slate-500">訂單數: {dayOrders.length}</div><div className="text-sm font-bold text-primary">總計: ${total}</div><button onClick={() => setSelectedDateDetails(dateStr)} className="w-full text-xs bg-white border border-slate-300 py-1 rounded hover:bg-slate-100 font-bold text-slate-600">查看詳情</button></div>)}</div>) })}</div>)}
          {historyMode === 'MONTH' && (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">{getDaysInMonth(refDate).map(dateStr => { const dayOrders = orders.filter(o => o.dateStr === dateStr).filter(filterByCat); const total = dayOrders.reduce((acc, curr) => acc + curr.totalAmount, 0); const hasOrders = dayOrders.length > 0; return (<div key={dateStr} onClick={() => hasOrders && setSelectedDateDetails(dateStr)} className={`border rounded p-2 min-h-[80px] flex flex-col justify-between cursor-pointer transition-colors ${hasOrders ? 'bg-white border-blue-200 hover:bg-blue-50' : 'bg-slate-50 border-slate-100 text-slate-300'}`}><div className="text-xs font-mono text-right">{dateStr.slice(8)}</div>{hasOrders && (<div><div className="text-xs font-bold text-slate-700">{dayOrders.length} 單</div><div className="text-xs text-primary">${total}</div></div>)}</div>) })}</div>)}
          {historyMode === 'CUSTOM' && (<div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-3 font-semibold text-slate-600">日期</th><th className="p-3 font-semibold text-slate-600">姓名</th><th className="p-3 font-semibold text-slate-600">分類</th><th className="p-3 font-semibold text-slate-600">內容</th><th className="p-3 font-semibold text-slate-600">金額</th><th className="p-3 font-semibold text-slate-600 text-center">付款</th></tr></thead><tbody className="divide-y divide-slate-100">{historyOrders.length === 0 ? (<tr><td colSpan={6} className="p-8 text-center text-slate-400">此範圍無訂單資料</td></tr>) : (historyOrders.map(order => { const badgeColor = getCategoryColor(order.categoryLabel); return (<tr key={order.id} className="hover:bg-slate-50"><td className="p-3 text-sm text-slate-500 font-mono">{order.dateStr}</td><td className="p-3 text-sm font-bold text-slate-700">{order.employeeName}</td><td className="p-3">{order.categoryLabel ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor.bg} ${badgeColor.text} border ${badgeColor.border}`}>{order.categoryLabel}</span> : <span className="text-xs text-slate-300">-</span>}</td><td className="p-3 text-sm text-slate-600">{order.items[0].name}...</td><td className="p-3 text-sm font-bold text-primary">${order.totalAmount}</td><td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{order.isPaid ? '已付款' : '未付款'}</span></td></tr>) }))}</tbody></table></div>)}
        </div>
      )}
      {selectedDateDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center"><h3 className="text-lg font-bold flex items-center gap-2"><Calendar size={18} /> {selectedDateDetails} 訂單詳情 {filterCategory !== '全部顯示' && <span className="text-xs bg-slate-700 px-2 py-0.5 rounded ml-2">分類: {filterCategory}</span>}</h3><button onClick={() => setSelectedDateDetails(null)} className="text-slate-400 hover:text-white"><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-0"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10"><tr><th className="p-4 text-sm font-semibold text-slate-600">時間</th><th className="p-4 text-sm font-semibold text-slate-600">菜單</th><th className="p-4 text-sm font-semibold text-slate-600">姓名</th><th className="p-4 text-sm font-semibold text-slate-600">分類</th><th className="p-4 text-sm font-semibold text-slate-600">內容</th><th className="p-4 text-sm font-semibold text-slate-600 text-right">金額</th><th className="p-4 text-sm font-semibold text-slate-600 text-center">付款</th></tr></thead><tbody className="divide-y divide-slate-100">{detailedOrdersList.length === 0 ? (<tr><td colSpan={7} className="p-8 text-center text-slate-400">無資料</td></tr>) : (detailedOrdersList.map(order => { const badgeColor = getCategoryColor(order.categoryLabel); const menuImage = getMenuImage(order.dateStr, order.categoryLabel); return (<tr key={order.id} className="hover:bg-slate-50"><td className="p-4 text-xs font-mono text-slate-500">{new Date(order.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}</td><td className="p-4">{menuImage ? (<div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden cursor-zoom-in" onClick={() => setZoomImage(menuImage)}><img src={menuImage} alt="Menu" className="w-full h-full object-cover" /></div>) : <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300"><FileImage size={14} /></div>}</td><td className="p-4 font-bold text-slate-800">{order.employeeName}</td><td className="p-4">{order.categoryLabel ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor.bg} ${badgeColor.text} border ${badgeColor.border}`}>{order.categoryLabel}</span> : <span className="text-xs text-slate-300">-</span>}</td><td className="p-4 text-sm text-slate-600">{order.items.map(i => (<div key={i.name} className="flex gap-1"><span>{i.name}</span>{i.note && <span className="text-xs text-slate-400">({i.note})</span>}</div>))}</td><td className="p-4 font-bold text-primary text-right">${order.totalAmount}</td><td className="p-4 text-center"><button onClick={() => handleTogglePayment(order.id)} className={`mx-auto px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border ${order.isPaid ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>{order.isPaid ? '已付款' : '未付款'}</button></td></tr>) }))}</tbody></table></div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center"><div className="flex gap-4"><span className="text-sm text-slate-500">共 {detailedOrdersList.length} 筆訂單</span><span className="text-sm text-emerald-600 font-bold">已收: ${detailedOrdersList.filter(o => o.isPaid).reduce((acc, curr) => acc + curr.totalAmount, 0)}</span><span className="text-sm text-slate-400">未收: ${detailedOrdersList.filter(o => !o.isPaid).reduce((acc, curr) => acc + curr.totalAmount, 0)}</span></div><div className="text-lg font-bold text-slate-800">當日總計: <span className="text-primary">${detailedTotal}</span></div></div>
          </div>
        </div>
      )}
      {zoomImage && (<div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm" onClick={() => setZoomImage(null)}><img src={zoomImage} alt="Zoom" className="max-w-full max-h-[90vh] rounded shadow-2xl animate-in fade-in zoom-in duration-200" /><button className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={32} /></button></div>)}
    </div>
  );
};

const MenuManager = () => {
  const [menus, setMenus] = useState<MenuCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [selectedLabel, setSelectedLabel] = useState<string>('全部顯示');
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [historyRefDate, setHistoryRefDate] = useState(new Date());
  const [historyFilter, setHistoryFilter] = useState<string>('全部顯示');
  const [formData, setFormData] = useState({ categoryLabel: '訂餐', shopName: '', date: new Date().toISOString().split('T')[0], cutoffTime: '', imageFile: null as File | null, imageUrl: '' });
  const todayStr = new Date().toISOString().split('T')[0];
  useEffect(() => { db.getMenuCategories().then(setMenus); }, []);
  const handleSave = async () => {
    try {
      if (!formData.shopName) { alert('請輸入店家名稱'); return; }

      let finalImageUrl = formData.imageUrl;

      if (formData.imageFile) {
        try {
          finalImageUrl = await compressImage(formData.imageFile);
        } catch (e) {
          alert('圖片處理失敗');
          return;
        }
      }

      if (finalImageUrl && finalImageUrl.length > 50000) {
        alert('圖片檔案過大 (限制 50,000 字元)。請上傳更小的圖片或是使用外部連結。');
        return;
      }

      const config: MenuConfig = { imageUrl: finalImageUrl, shopName: formData.shopName, date: formData.date, cutoffTime: formData.cutoffTime };
      await saveToDb(config);
    } catch (e: any) {
      console.error(e);
      alert('儲存失敗，請檢查網路連線或稍後再試。\n錯誤訊息: ' + e.message);
    }
  };

  const saveToDb = async (config: MenuConfig) => {
    if (editId) {
      await db.updateMenuCategory(editId, formData.categoryLabel, config);
    } else {
      await db.addMenuCategory(formData.categoryLabel, config);
    }
    setMenus(await db.getMenuCategories());
    setIsEditing(false);
    resetForm();
  };

  // --- Helper for Image Compression ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {

          const MAX_WIDTH = 400; // Small enough for 50k char limit
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas context not supported')); return; }

          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.5 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };
  const handleDelete = async (id: string) => {
    const menuToDelete = menus.find(m => m.id === id);
    if (!menuToDelete) return;
    const allOrders = await db.getOrders();
    const relatedOrders = allOrders.filter(o => o.dateStr === menuToDelete.config.date && o.categoryLabel === menuToDelete.label);
    if (relatedOrders.length > 0) {
      const confirmMsg = `⚠️ 警告：系統偵測到「${menuToDelete.config.date}」的「${menuToDelete.label}」分類下，已有 ${relatedOrders.length} 筆訂單。\n\n刪除此菜單將會「一併刪除」這些已下的訂單，以便重新開放下單。\n\n您確定要繼續嗎？`;
      if (confirm(confirmMsg)) { await db.deleteOrdersByContext(menuToDelete.config.date, menuToDelete.label); await db.deleteMenuCategory(id); setMenus(await db.getMenuCategories()); alert('已刪除菜單及相關聯的訂單。'); }
    } else { if (confirm('確定要刪除此菜單嗎？')) { await db.deleteMenuCategory(id); setMenus(await db.getMenuCategories()); } }
  };
  const startEdit = (menu: MenuCategory) => { setIsEditing(true); setEditId(menu.id); setFormData({ categoryLabel: menu.label, shopName: menu.config.shopName, date: menu.config.date, cutoffTime: menu.config.cutoffTime || '', imageUrl: menu.config.imageUrl, imageFile: null }); };
  const resetForm = () => { setEditId(null); setFormData({ categoryLabel: '訂餐', shopName: '', date: todayStr, cutoffTime: '', imageFile: null, imageUrl: '' }); };
  const getStartOfWeek = (date: Date) => { const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); return new Date(d.setDate(diff)); };
  const getWeekDays = (refDate: Date) => { const start = getStartOfWeek(refDate); return Array.from({ length: 5 }).map((_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d.toISOString().split('T')[0]; }); };
  const existingLabels = Array.from(new Set(menus.map(m => m.label)));
  const activeMenus = menus.filter(m => m.config.date >= todayStr).filter(m => selectedLabel === '全部顯示' ? true : m.label === selectedLabel);
  const historyMenus = menus.filter(m => m.config.date < todayStr);
  const historyWeekDays = getWeekDays(historyRefDate);
  const historyWeekMenus = historyMenus.filter(m => historyWeekDays.includes(m.config.date));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">菜單管理</h2></div>
      <div className="flex border-b border-slate-200"><button onClick={() => setActiveTab('ACTIVE')} className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'ACTIVE' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>當期菜單 (未結單)</button><button onClick={() => setActiveTab('HISTORY')} className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'HISTORY' ? 'border-slate-500 text-slate-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>歷史菜單 (已結單)</button></div>
      {isEditing ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-2xl mx-auto"><h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Edit2 className="text-primary" /> {editId ? '編輯菜單' : '新增菜單'}</h3><div className="space-y-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">1. 分類 (Tab)</label><select value={formData.categoryLabel} onChange={e => setFormData({ ...formData, categoryLabel: e.target.value })} className="w-full p-2.5 bg-white border border-slate-300 rounded outline-none focus:ring-2 focus:ring-primary">{existingLabels.length === 0 && <option value="訂餐">訂餐 (預設)</option>}{existingLabels.map(l => <option key={l} value={l}>{l}</option>)}{!existingLabels.includes('訂餐') && <option value="訂餐">訂餐</option>}{!existingLabels.includes('訂飲料') && <option value="訂飲料">訂飲料</option>}{!existingLabels.includes('揪團購') && <option value="揪團購">揪團購</option>}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">2. 店家名稱</label><input value={formData.shopName} onChange={e => setFormData({ ...formData, shopName: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded outline-none focus:ring-2 focus:ring-primary" placeholder="例如: 八方雲集" /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">3. 日期</label><input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded outline-none focus:ring-2 focus:ring-primary" /></div></div><div><label className="block text-sm font-bold text-slate-700 mb-1">4. 截止時間 (選填)</label><select value={formData.cutoffTime} onChange={e => setFormData({ ...formData, cutoffTime: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded outline-none focus:ring-2 focus:ring-primary"><option value="">無限制</option>{Array.from({ length: 11 }).map((_, i) => { const hour = i + 8; const timeStr = `${hour.toString().padStart(2, '0')}:00`; return <option key={timeStr} value={timeStr}>{timeStr}</option> })}</select></div><div><label className="block text-sm font-bold text-slate-700 mb-1">5. 菜單圖片</label><div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative"><input type="file" accept="image/png, image/jpeg, image/gif, image/bmp" onChange={e => { const file = e.target.files?.[0]; if (file) { if (file.size > 2 * 1024 * 1024) { alert('檔案大小不能超過 2MB'); return; } setFormData({ ...formData, imageFile: file }); } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />{formData.imageFile ? (<div className="text-primary font-bold flex flex-col items-center"><CheckCircle size={32} className="mb-2" /> 已選擇: {formData.imageFile.name}</div>) : formData.imageUrl ? (<div className="flex flex-col items-center"><img src={formData.imageUrl} alt="Current" className="h-32 object-contain mb-2 rounded shadow-sm" /><span className="text-xs text-slate-500">點擊或拖曳以更換圖片</span></div>) : (<div className="text-slate-400 flex flex-col items-center"><UploadCloud size={32} className="mb-2" /> 點擊上傳 或 將圖片拖曳至此<span className="text-xs mt-1">JPG, PNG, GIF, BMP (Max 2MB)</span></div>)}</div></div><div className="flex gap-4 pt-4"><button onClick={handleSave} className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">{editId ? '儲存變更' : '新增'}</button><button onClick={() => { setIsEditing(false); resetForm(); }} className="flex-1 bg-white text-slate-600 border border-slate-300 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors">取消</button></div></div></div>
      ) : (
        <>
          {activeTab === 'ACTIVE' && (
            <>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4"><div className="flex flex-wrap gap-2"><button onClick={() => setSelectedLabel('全部顯示')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${selectedLabel === '全部顯示' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>全部顯示</button>{existingLabels.map(label => { const isActive = selectedLabel === label; return (<button key={label} onClick={() => setSelectedLabel(label)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${isActive ? 'bg-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{label}</button>) })}</div><div className="flex items-center gap-2 w-full md:w-auto"><button onClick={() => { resetForm(); setIsEditing(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm font-bold"><PlusCircle size={18} /> 新增菜單</button><div className="hidden md:flex bg-slate-100 p-1 rounded-lg border border-slate-200"><button onClick={() => setViewMode('LIST')} className={`p-2 rounded ${viewMode === 'LIST' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}><LayoutList size={18} /></button><button onClick={() => setViewMode('CARD')} className={`p-2 rounded ${viewMode === 'CARD' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}><LayoutGrid size={18} /></button></div></div></div>
              <div className={`${viewMode === 'LIST' ? 'md:hidden' : ''}`}><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{activeMenus.length === 0 && <div className="col-span-full text-center text-slate-400 py-12">無符合條件的菜單</div>}{activeMenus.map(menu => { const color = getCategoryColor(menu.label); return (<div key={menu.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all"><div className={`px-4 py-2 border-b flex justify-between items-center ${color.bg} ${color.border}`}><span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 ${color.text}`}>{menu.label}</span><div className="flex gap-2"><button onClick={() => startEdit(menu)} className="p-1.5 bg-white rounded-full text-slate-500 hover:text-primary shadow-sm"><Edit2 size={14} /></button><button onClick={() => handleDelete(menu.id)} className="p-1.5 bg-white rounded-full text-slate-500 hover:text-red-500 shadow-sm"><Trash2 size={14} /></button></div></div><div className="aspect-video bg-slate-100 relative">{menu.config.imageUrl ? (<img src={menu.config.imageUrl} alt="Menu" className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-slate-300"><FileImage size={32} /></div>)}<div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white"><h4 className="font-bold truncate">{menu.config.shopName}</h4><div className="text-xs opacity-90">{menu.config.date} {menu.config.cutoffTime && `• ${menu.config.cutoffTime} 截止`}</div></div></div></div>) })}</div></div>
              <div className={`hidden ${viewMode === 'LIST' ? 'md:block' : ''}`}><div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4 font-semibold text-slate-600">分類</th><th className="p-4 font-semibold text-slate-600">店家名稱 / 時間</th><th className="p-4 font-semibold text-slate-600 w-32">縮圖</th><th className="p-4 font-semibold text-slate-600 text-right">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{activeMenus.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">無資料</td></tr>}{activeMenus.map(menu => { const color = getCategoryColor(menu.label); return (<tr key={menu.id} className="hover:bg-slate-50"><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>{menu.label}</span></td><td className="p-4"><div className="font-bold text-slate-800">{menu.config.shopName}</div><div className="text-sm text-slate-500 flex items-center gap-2"><Calendar size={14} /> {menu.config.date}{menu.config.cutoffTime && <span className="text-red-500 font-bold ml-2">({menu.config.cutoffTime} 截止)</span>}</div></td><td className="p-4"><div className="w-16 h-10 bg-slate-100 rounded overflow-hidden border border-slate-200">{menu.config.imageUrl ? <img src={menu.config.imageUrl} className="w-full h-full object-cover" /> : null}</div></td><td className="p-4 text-right space-x-2"><button onClick={() => startEdit(menu)} className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-primary hover:text-white hover:border-primary transition-colors">編輯</button><button onClick={() => handleDelete(menu.id)} className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">刪除</button></td></tr>) })}</tbody></table></div></div>
            </>
          )}
          {activeTab === 'HISTORY' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-100 pb-4"><span className="text-sm font-bold text-slate-500 flex items-center mr-2">分類篩選:</span><button onClick={() => setHistoryFilter('全部顯示')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${historyFilter === '全部顯示' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>全部顯示</button>{existingLabels.map(label => { const isActive = historyFilter === label; return (<button key={label} onClick={() => setHistoryFilter(label)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${isActive ? 'bg-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{label}</button>) })}</div>
              <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-700 flex items-center gap-2"><History size={18} /> 歷史菜單週曆</h3><div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"><button onClick={() => { const d = new Date(historyRefDate); d.setDate(d.getDate() - 7); setHistoryRefDate(d); }} className="p-1 hover:bg-slate-200 rounded"><ChevronLeft size={18} /></button><span className="font-mono text-sm font-bold text-slate-700">{getStartOfWeek(historyRefDate).toLocaleDateString()} - {(() => { const d = getStartOfWeek(historyRefDate); d.setDate(d.getDate() + 4); return d.toLocaleDateString(); })()}</span><button onClick={() => { const d = new Date(historyRefDate); d.setDate(d.getDate() + 7); setHistoryRefDate(d); }} className="p-1 hover:bg-slate-200 rounded"><ChevronRight size={18} /></button></div></div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">{getWeekDays(historyRefDate).map((dateStr, idx) => { const dayMenus = historyWeekMenus.filter(m => m.config.date === dateStr && (historyFilter === '全部顯示' || m.label === historyFilter)); return (<div key={dateStr} className="border border-slate-200 rounded-lg bg-slate-50 min-h-[150px] flex flex-col"><div className="p-2 border-b border-slate-200 bg-white rounded-t-lg text-center"><div className="text-sm font-bold text-slate-700">{['週一', '週二', '週三', '週四', '週五'][idx]}</div><div className="text-xs text-slate-400">{dateStr}</div></div><div className="p-2 space-y-2 flex-1">{dayMenus.length === 0 ? (<div className="text-center text-xs text-slate-300 py-4">無記錄</div>) : (dayMenus.map(menu => { const color = getCategoryColor(menu.label); return (<div key={menu.id} className="bg-white border border-slate-200 rounded p-2 shadow-sm text-xs cursor-pointer hover:border-primary group" onClick={() => startEdit(menu)}><div className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold mb-1 ${color.bg} ${color.text}`}>{menu.label}</div><div className="font-bold text-slate-700 truncate">{menu.config.shopName}</div><div className="hidden group-hover:block text-[10px] text-primary mt-1 text-center font-bold">點擊編輯/複製</div></div>) }))}</div></div>) })}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const EmployeeManager = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useEffect(() => { loadData(); }, []);
  const loadData = async () => { const emps = await db.getEmployees(); setEmployees(emps); const orders = await db.getOrders(); const currentMonth = new Date().toISOString().slice(0, 7); const newStats: Record<string, number> = {}; emps.forEach(emp => { const count = orders.filter(o => o.employeeName === emp.name && o.dateStr.startsWith(currentMonth)).length; newStats[emp.id] = count; }); setStats(newStats); setHasUnsavedChanges(false); };
  const handleSave = async () => { if (!formName.trim()) { alert('請輸入姓名'); return; } if (editId) { await db.updateEmployee({ id: editId, name: formName }); } else { await db.addEmployee({ id: Date.now().toString(), name: formName }); } loadData(); setIsEditing(false); setFormName(''); setEditId(null); };
  const handleDelete = async (id: string) => { if (confirm('確定刪除此同事資料？')) { await db.deleteEmployee(id); loadData(); } };
  const startEdit = (emp: Employee) => { setIsEditing(true); setEditId(emp.id); setFormName(emp.name); };
  const handleAutoSort = () => { const sorted = [...employees].sort((a, b) => a.name.localeCompare(b.name, 'zh-TW')); setEmployees(sorted); setHasUnsavedChanges(true); };
  const onDragStart = (e: React.DragEvent, index: number) => { setDraggedItemIndex(index); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); if (draggedItemIndex === null || draggedItemIndex === index) return; const newItems = [...employees]; const draggedItem = newItems[draggedItemIndex]; newItems.splice(draggedItemIndex, 1); newItems.splice(index, 0, draggedItem); setEmployees(newItems); setDraggedItemIndex(index); setHasUnsavedChanges(true); };
  const onDragEnd = () => { setDraggedItemIndex(null); };
  const saveOrder = async () => { await db.saveEmployees(employees); setHasUnsavedChanges(false); alert('排序已儲存'); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">同事管理</h2><div className="hidden md:flex bg-white rounded-lg p-1 shadow-sm border border-slate-200"><button onClick={() => setViewMode('CARD')} className={`p-2 rounded ${viewMode === 'CARD' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}><LayoutGrid size={18} /></button><button onClick={() => setViewMode('LIST')} className={`p-2 rounded ${viewMode === 'LIST' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}><LayoutList size={18} /></button></div></div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">{hasUnsavedChanges && (<button onClick={saveOrder} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold shadow animate-pulse"><Save size={18} /> 確認排序</button>)}<div className="flex gap-2 ml-auto"><button onClick={handleAutoSort} className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"><ArrowUpDown size={16} /> 自動排序</button><button onClick={() => { setIsEditing(true); setEditId(null); setFormName(''); }} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 font-bold shadow-sm"><PlusCircle size={18} /> 新增同事</button></div></div>
      {isEditing && (<div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-md mx-auto"><h3 className="text-lg font-bold mb-4">{editId ? '編輯資料' : '新增同事'}</h3><input value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-2 border border-slate-300 rounded mb-4 focus:ring-2 focus:ring-primary outline-none" placeholder="請輸入姓名" /><div className="flex gap-2"><button onClick={handleSave} className="flex-1 bg-primary text-white py-2 rounded font-bold">儲存</button><button onClick={() => setIsEditing(false)} className="flex-1 border border-slate-300 py-2 rounded font-bold">取消</button></div></div>)}
      <div className="text-xs text-slate-400 flex items-center gap-1"><Zap size={12} /> 提示：長按卡片或列表項目，即可使用滑鼠拖曳調整順序。完成後請點擊上方「確認排序」按鈕以儲存設定。</div>
      <div className={`${viewMode === 'LIST' ? 'md:hidden' : ''}`}><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{employees.map((emp, idx) => (<div key={emp.id} draggable={!isEditing} onDragStart={(e) => onDragStart(e, idx)} onDragOver={(e) => onDragOver(e, idx)} onDragEnd={onDragEnd} className={`relative p-4 rounded-xl border cursor-move transition-all flex flex-col items-center text-center ${idx % 2 === 0 ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'} hover:shadow-md hover:scale-[1.02]`}><div className="absolute top-2 right-2 text-slate-300"><GripVertical size={16} /></div><div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg mb-2">{emp.name.charAt(0)}</div><h3 className="font-bold text-slate-800 text-lg">{emp.name}</h3><div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><BarChart3 size={12} /> 本月訂單: <span className="font-bold text-primary">{stats[emp.id] || 0}</span></div><div className="flex gap-2 mt-4 w-full"><button onClick={() => startEdit(emp)} className="flex-1 py-1 text-xs border border-slate-300 rounded hover:bg-white text-slate-600">編輯</button><button onClick={() => handleDelete(emp.id)} className="flex-1 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50">刪除</button></div></div>))}</div></div>
      <div className={`hidden ${viewMode === 'LIST' ? 'md:block' : ''}`}><div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4 w-16">排序</th><th className="p-4">姓名</th><th className="p-4">本月訂單數</th><th className="p-4 text-right">操作</th></tr></thead><tbody>{employees.map((emp, idx) => (<tr key={emp.id} draggable={!isEditing} onDragStart={(e) => onDragStart(e, idx)} onDragOver={(e) => onDragOver(e, idx)} onDragEnd={onDragEnd} className={`cursor-move transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50/50`}><td className="p-4 text-slate-300"><GripVertical size={20} /></td><td className="p-4 font-bold text-slate-700 text-lg">{emp.name}</td><td className="p-4"><div className="flex items-center gap-2"><BarChart3 size={16} className="text-slate-400" /><span className="font-bold text-primary">{stats[emp.id] || 0}</span></div></td><td className="p-4 text-right space-x-2"><button onClick={() => startEdit(emp)} className="text-sm font-bold text-blue-600 hover:underline">編輯</button><button onClick={() => handleDelete(emp.id)} className="text-sm font-bold text-red-500 hover:underline">刪除</button></td></tr>))}</tbody></table></div></div>
    </div>
  );
};

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formContent, setFormContent] = useState('');
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useEffect(() => { db.getAnnouncements().then(setAnnouncements); }, []);
  const handleSave = async () => { if (!formContent.trim()) { alert('請輸入公告內容'); return; } const newList = [...announcements]; if (editId) { const idx = newList.findIndex(a => a.id === editId); if (idx !== -1) newList[idx].content = formContent; } else { newList.push({ id: Date.now().toString(), content: formContent, isActive: true }); } await db.saveAnnouncements(newList); setAnnouncements(newList); setIsEditing(false); setFormContent(''); setEditId(null); };
  const handleDelete = async (id: string) => { if (confirm('確定刪除？')) { const newList = announcements.filter(a => a.id !== id); await db.saveAnnouncements(newList); setAnnouncements(newList); } };
  const toggleStatus = async (id: string) => { const newList = announcements.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a); await db.saveAnnouncements(newList); setAnnouncements(newList); };
  const startEdit = (a: Announcement) => { setIsEditing(true); setEditId(a.id); setFormContent(a.content); };
  const onDragStart = (e: React.DragEvent, index: number) => { setDraggedItemIndex(index); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); if (draggedItemIndex === null || draggedItemIndex === index) return; const newItems = [...announcements]; const item = newItems[draggedItemIndex]; newItems.splice(draggedItemIndex, 1); newItems.splice(index, 0, item); setAnnouncements(newItems); setDraggedItemIndex(index); setHasUnsavedChanges(true); };
  const saveSort = async () => { await db.saveAnnouncements(announcements); setHasUnsavedChanges(false); alert('公告順序已儲存'); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">公告管理</h2><div className="hidden md:flex bg-white rounded-lg p-1 shadow-sm border border-slate-200"><button onClick={() => setViewMode('CARD')} className={`p-2 rounded ${viewMode === 'CARD' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}><LayoutGrid size={18} /></button><button onClick={() => setViewMode('LIST')} className={`p-2 rounded ${viewMode === 'LIST' ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}><LayoutList size={18} /></button></div></div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">{hasUnsavedChanges ? (<button onClick={saveSort} className="bg-primary text-white px-4 py-2 rounded-lg font-bold shadow animate-pulse flex items-center gap-2"><Save size={18} /> 確認排序</button>) : <div></div>}<button onClick={() => { setIsEditing(true); setEditId(null); setFormContent(''); }} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 flex items-center gap-2"><PlusCircle size={18} /> 新增公告</button></div>
      {isEditing && (<div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"><textarea value={formContent} onChange={e => setFormContent(e.target.value)} className="w-full p-4 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary outline-none" placeholder="請輸入公告內容..." rows={3} /><div className="flex gap-2"><button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded font-bold">儲存</button><button onClick={() => setIsEditing(false)} className="border border-slate-300 px-6 py-2 rounded font-bold">取消</button></div></div>)}
      <div className={`${viewMode === 'LIST' ? 'md:hidden' : ''}`}><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{announcements.map((a, idx) => (<div key={a.id} draggable onDragStart={(e) => onDragStart(e, idx)} onDragOver={(e) => onDragOver(e, idx)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-all group"><div className="flex justify-between items-start mb-2"><div className="p-1 text-slate-300"><GripVertical size={16} /></div><button onClick={() => toggleStatus(a.id)} className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${a.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{a.isActive ? <PlayCircle size={12} /> : <PauseCircle size={12} />}{a.isActive ? '公告中' : '已取消'}</button></div><p className="text-slate-700 font-medium mb-4 min-h-[3rem]">{a.content}</p><div className="flex border-t border-slate-100 pt-3 gap-2"><button onClick={() => startEdit(a)} className="flex-1 py-1 text-sm bg-slate-50 text-slate-600 rounded hover:bg-slate-100">編輯</button><button onClick={() => handleDelete(a.id)} className="flex-1 py-1 text-sm bg-red-50 text-red-500 rounded hover:bg-red-100">刪除</button></div></div>))}</div></div>
      <div className={`hidden ${viewMode === 'LIST' ? 'md:block' : ''}`}><div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4 w-12"></th><th className="p-4">內容</th><th className="p-4 w-32 text-center">狀態</th><th className="p-4 w-32 text-right">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{announcements.map((a, idx) => (<tr key={a.id} draggable onDragStart={(e) => onDragStart(e, idx)} onDragOver={(e) => onDragOver(e, idx)} className="hover:bg-slate-50 cursor-move"><td className="p-4 text-slate-300"><GripVertical size={20} /></td><td className="p-4 text-slate-700 font-medium">{a.content}</td><td className="p-4 text-center"><button onClick={() => toggleStatus(a.id)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${a.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{a.isActive ? '公告中' : '已取消'}</button></td><td className="p-4 text-right space-x-2"><button onClick={() => startEdit(a)} className="text-blue-600 font-bold text-sm hover:underline">編輯</button><button onClick={() => handleDelete(a.id)} className="text-red-500 font-bold text-sm hover:underline">刪除</button></td></tr>))}</tbody></table></div></div>
    </div>
  );
};

const SystemManager = ({ settings, onBind, currentUser }: any) => {
  const [activeTab, setActiveTab] = useState<'ACCOUNTS' | 'INFO'>('ACCOUNTS');
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'IDLE' | 'CHECKING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [lastDbCheck, setLastDbCheck] = useState<Date | null>(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [newFrontendPwd, setNewFrontendPwd] = useState('');
  const [confirmFrontendPwd, setConfirmFrontendPwd] = useState('');

  useEffect(() => { db.getAdminAccounts().then(setAccounts); }, []);

  const handleSaveAccount = async () => {
    if (!formData.name || !formData.username || !formData.password) { alert('請填寫所有欄位'); return; }
    try {
      if (editId) {
        const existing = accounts.find(a => a.id === editId);
        if (existing) await db.updateAdminAccount({ ...existing, name: formData.name, username: formData.username, password: formData.password });
      } else {
        await db.addAdminAccount({ id: Date.now().toString(), name: formData.name, username: formData.username, password: formData.password, isSuperAdmin: false });
      }
      setAccounts(await db.getAdminAccounts());
      setIsEditing(false); resetForm();
    } catch (e: any) { alert(e.message || 'Error'); }
  };
  const handleDeleteAccount = async (id: string) => { if (confirm('確定刪除此管理員帳號？')) { await db.deleteAdminAccount(id); setAccounts(await db.getAdminAccounts()); } };
  const startEdit = (acc: AdminAccount) => { setIsEditing(true); setEditId(acc.id); setFormData({ name: acc.name, username: acc.username, password: acc.password }); };
  const resetForm = () => { setEditId(null); setFormData({ name: '', username: '', password: '' }); };
  const handleUpdateFrontendPassword = async () => { if (!newFrontendPwd || !confirmFrontendPwd) { alert('請輸入新密碼'); return; } if (newFrontendPwd !== confirmFrontendPwd) { alert('兩次輸入的密碼不一致'); return; } if (confirm('確定要變更前台首頁的登入密碼嗎？')) { await db.setFrontendPassword(newFrontendPwd); alert('密碼變更成功！下次登入前台請使用新密碼。'); setNewFrontendPwd(''); setConfirmFrontendPwd(''); } };
  const handleCheckConnection = async () => { if (!settings.isGoogleBound) { setDbStatus('ERROR'); return; } setDbStatus('CHECKING'); const isConnected = await db.checkDatabaseConnection(); setDbStatus(isConnected ? 'SUCCESS' : 'ERROR'); setLastDbCheck(new Date()); };
  const canEdit = (target: AdminAccount) => { if (currentUser.isSuperAdmin) return true; if (target.id === currentUser.id) return true; return false; };
  const canDelete = (target: AdminAccount) => { if (target.isSuperAdmin) return false; if (currentUser.isSuperAdmin) return true; return false; };

  const handleSensitiveAction = async (action: () => Promise<void>) => {
    if (!currentUser.isSuperAdmin) {
      alert('此功能僅限最高管理員使用！');
      return;
    }
    const pwd = prompt('請輸入最高管理員密碼以確認執行：');
    if (pwd === null) return; // Cancelled
    if (pwd !== currentUser.password) {
      alert('密碼錯誤，拒絕執行！');
      return;
    }
    await action();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">系統管理</h2></div>
      <div className="flex border-b border-slate-200"><button onClick={() => setActiveTab('ACCOUNTS')} className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'ACCOUNTS' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>帳號與權限</button><button onClick={() => setActiveTab('INFO')} className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'INFO' ? 'border-slate-500 text-slate-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>系統資訊</button></div>
      {activeTab === 'ACCOUNTS' && (
        <>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center"><div className="text-sm text-slate-500">目前登入：<span className="font-bold text-slate-800">{currentUser.name} ({currentUser.isSuperAdmin ? '最高權限' : '一般權限'})</span></div><div className="flex gap-2"><button onClick={() => { resetForm(); setIsEditing(true); }} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 flex items-center gap-2"><PlusCircle size={18} /> 新增次管理員</button><div className="hidden md:flex bg-slate-100 p-1 rounded-lg border border-slate-200"><button onClick={() => setViewMode('CARD')} className={`p-2 rounded ${viewMode === 'CARD' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}><LayoutGrid size={18} /></button><button onClick={() => setViewMode('LIST')} className={`p-2 rounded ${viewMode === 'LIST' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}><LayoutList size={18} /></button></div></div></div>
          {isEditing && (<div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-lg mx-auto"><h3 className="text-xl font-bold mb-4 flex items-center gap-2"><UserCog className="text-primary" /> {editId ? '編輯帳號' : '新增次管理員'}</h3><div className="space-y-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">姓名</label><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-primary outline-none" /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">登入帳號</label><input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} disabled={!!editId && formData.username === 'sysop'} className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-primary outline-none disabled:bg-slate-100" /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">密碼</label><input value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-primary outline-none" type="text" placeholder="設定密碼" /></div><div className="flex gap-4 mt-4"><button onClick={handleSaveAccount} className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-700">儲存</button><button onClick={() => { setIsEditing(false); resetForm(); }} className="flex-1 bg-white text-slate-600 border border-slate-300 py-2 rounded-lg font-bold hover:bg-slate-50">取消</button></div></div></div>)}
          <div className={`${viewMode === 'LIST' ? 'md:hidden' : ''}`}><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{accounts.map(acc => (<div key={acc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all"><div className="flex justify-between items-start mb-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${acc.isSuperAdmin ? 'bg-indigo-600' : 'bg-slate-500'}`}>{acc.name.charAt(0)}</div><div><div className="font-bold text-slate-800">{acc.name}</div><div className="text-xs text-slate-500 flex items-center gap-1"><User size={12} /> {acc.username}</div></div></div>{acc.isSuperAdmin && <Shield className="text-amber-500" size={20} />}</div><div className="flex gap-2 pt-2 border-t border-slate-100">{canEdit(acc) ? (<button onClick={() => startEdit(acc)} className="flex-1 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-bold">編輯/改密碼</button>) : (<button disabled className="flex-1 py-1.5 text-sm bg-slate-50 text-slate-300 rounded cursor-not-allowed">無權限編輯</button>)}{canDelete(acc) && (<button onClick={() => handleDeleteAccount(acc.id)} className="px-3 py-1.5 text-sm bg-red-50 text-red-500 rounded hover:bg-red-100 font-bold">刪除</button>)}</div></div>))}</div></div>
          <div className={`hidden ${viewMode === 'LIST' ? 'md:block' : ''}`}><div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4">姓名</th><th className="p-4">帳號</th><th className="p-4">權限等級</th><th className="p-4 text-right">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{accounts.map(acc => (<tr key={acc.id} className="hover:bg-slate-50"><td className="p-4 font-bold text-slate-700">{acc.name}</td><td className="p-4 font-mono text-slate-600">{acc.username}</td><td className="p-4">{acc.isSuperAdmin ? <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">最高管理員</span> : <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">次管理員</span>}</td><td className="p-4 text-right space-x-2">{canEdit(acc) && <button onClick={() => startEdit(acc)} className="text-blue-600 font-bold text-sm hover:underline">編輯</button>}{canDelete(acc) && <button onClick={() => handleDeleteAccount(acc.id)} className="text-red-500 font-bold text-sm hover:underline">刪除</button>}</td></tr>))}</tbody></table></div></div>
          <div className="bg-red-50/50 p-6 rounded-xl shadow-sm border border-red-100 mt-8"><h3 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-4"><Lock size={18} /> 變更前台首頁密碼</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"><div><label className="block text-sm font-bold text-slate-700 mb-1">新密碼</label><input type="password" value={newFrontendPwd} onChange={(e) => setNewFrontendPwd(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-red-500 outline-none" placeholder="請輸入新密碼" /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">二次確認密碼</label><input type="password" value={confirmFrontendPwd} onChange={(e) => setConfirmFrontendPwd(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-red-500 outline-none" placeholder="再次輸入新密碼" /></div><div><button onClick={handleUpdateFrontendPassword} className="w-full bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 transition-colors shadow-sm">確認變更</button></div></div><p className="text-xs text-red-400 mt-2 font-bold">注意：此操作將立即影響所有員工的前台登入密碼。</p></div>
        </>
      )}
      {activeTab === 'INFO' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Database className="text-indigo-600" /> 資料庫連線監控</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                  <span className="font-bold text-slate-700">資料庫模式</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-500 p-1 rounded-full text-white"><Database size={14} /></div>
                    <span className="font-mono font-bold text-slate-800">Google Firestore</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-700">連線狀態</span>
                  {dbStatus === 'IDLE' && <span className="text-slate-400 font-bold text-sm">尚未檢查</span>}
                  {dbStatus === 'CHECKING' && <span className="text-blue-500 font-bold text-sm animate-pulse">檢查中...</span>}
                  {dbStatus === 'SUCCESS' && <span className="text-emerald-600 font-bold text-sm flex items-center gap-1"><CheckCircle size={14} /> 連線正常</span>}
                  {dbStatus === 'ERROR' && <span className="text-red-500 font-bold text-sm flex items-center gap-1"><XCircle size={14} /> 連線失敗</span>}
                </div>
                {lastDbCheck && (<div className="text-xs text-slate-400 text-right">上次檢查: {lastDbCheck.toLocaleTimeString()}</div>)}
              </div>
              <div className="flex flex-col gap-2 justify-center border-l pl-6 border-slate-100">
                <button onClick={handleCheckConnection} disabled={dbStatus === 'CHECKING'} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:bg-indigo-300">
                  <RefreshCw size={18} className={dbStatus === 'CHECKING' ? 'animate-spin' : ''} /> 測試連線
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Database className="text-indigo-600" /> 資料庫維護工具</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <p className="text-slate-600 mb-1 font-bold">建立標準範例資料</p>
                  <p className="text-xs text-slate-400">若資料庫為空，此功能將自動建立：3組菜單、5位員工、3則公告。</p>
                </div>
                <button
                  onClick={() => handleSensitiveAction(seedDatabase)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
                >
                  <Database size={16} /> 建立標準範例資料
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 mb-1 font-bold">一鍵清除資料庫</p>
                  <p className="text-xs text-slate-400">注意！此操作將永久刪除所有訂單、菜單、員工與公告資料。</p>
                </div>
                <button
                  onClick={() => handleSensitiveAction(async () => {
                    await db.clearAllData();
                    alert('資料庫已清空！');
                    window.location.reload();
                  })}
                  className="bg-white border-2 border-red-100 text-red-500 px-6 py-2 rounded-lg font-bold hover:bg-red-50 hover:border-red-200 transition-all flex items-center gap-2"
                >
                  <Trash2 size={16} /> 一鍵清除資料庫
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { db } from '../services/storage';
import { OrderItem, Employee, Announcement, OrderStatus, MenuCategory, Order } from '../types';
import { ShoppingCart, Plus, X, Clock, LayoutDashboard, ZoomIn, Store, HelpCircle, ListChecks, User, LayoutGrid, List as ListIcon, Star, FileImage, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface FrontendAppProps {
  onLogout: () => void;
  onGoToAdmin: () => void;
}

const FrontendApp: React.FC<FrontendAppProps> = ({ onLogout, onGoToAdmin }) => {
  // Data State
  const [allMenus, setAllMenus] = useState<MenuCategory[]>([]);
  const [activeLabel, setActiveLabel] = useState<string>('');

  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');
  const [focusedMenu, setFocusedMenu] = useState<MenuCategory | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [isMenuExpanded, setIsMenuExpanded] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [formItemName, setFormItemName] = useState('');
  const [formItemNote, setFormItemNote] = useState('');
  const [formItemPrice, setFormItemPrice] = useState<number | ''>('');

  const [todayOrderFilter, setTodayOrderFilter] = useState<string>('ALL');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Async Data Loading
    const loadData = async () => {
      const [loadedMenus, loadedEmps, loadedAnnouncements, loadedOrders] = await Promise.all([
        db.getMenuCategories(),
        db.getEmployees(),
        db.getAnnouncements(),
        db.getOrders()
      ]);

      setAllMenus(loadedMenus);

      const uniqueLabels = Array.from(new Set(loadedMenus.map(m => m.label)));
      if (uniqueLabels.length > 0 && !activeLabel) {
        const defaultLabel = uniqueLabels.includes('訂餐') ? '訂餐' : uniqueLabels[0];
        setActiveLabel(defaultLabel);
      }

      setEmployees(loadedEmps);
      setAnnouncements(loadedAnnouncements.filter(a => a.isActive));
      setOrders(loadedOrders);
    };
    loadData();

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuExpanded(true);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!activeLabel) return;

    const categoryMenus = allMenus.filter(m => m.label === activeLabel);
    const todayMenu = categoryMenus.find(m => m.config.date === todayStr);

    if (todayMenu) {
      setFocusedMenu(todayMenu);
    } else if (categoryMenus.length > 0) {
      const sorted = [...categoryMenus].sort((a, b) => b.config.date.localeCompare(a.config.date));
      setFocusedMenu(sorted[0]);
    } else {
      setFocusedMenu(null);
    }
  }, [activeLabel, allMenus]);

  const uniqueLabels = Array.from(new Set(allMenus.map(m => m.label)));
  const currentCategoryMenus = allMenus.filter(m => m.label === activeLabel);

  const startOfWeek = getStartOfWeek(new Date());
  const weekDays = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const weekDayNames = ['週一', '週二', '週三', '週四', '週五'];

  const TAB_PALETTE = [
    { active: 'bg-blue-50 text-blue-800 border-blue-600', hover: 'hover:bg-blue-50 hover:text-blue-600', border: 'border-blue-600', badge: 'bg-blue-100 text-blue-700' },
    { active: 'bg-emerald-50 text-emerald-800 border-emerald-600', hover: 'hover:bg-emerald-50 hover:text-emerald-600', border: 'border-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    { active: 'bg-amber-50 text-amber-800 border-amber-600', hover: 'hover:bg-amber-50 hover:text-amber-600', border: 'border-amber-600', badge: 'bg-amber-100 text-amber-700' },
    { active: 'bg-rose-50 text-rose-800 border-rose-600', hover: 'hover:bg-rose-50 hover:text-rose-600', border: 'border-rose-600', badge: 'bg-rose-100 text-rose-700' },
    { active: 'bg-violet-50 text-violet-800 border-violet-600', hover: 'hover:bg-violet-50 hover:text-violet-600', border: 'border-violet-600', badge: 'bg-violet-100 text-violet-700' },
  ];

  const getBadgeStyle = (label: string | undefined) => {
    if (!label) return 'bg-slate-100 text-slate-500';
    const idx = uniqueLabels.indexOf(label);
    if (idx !== -1) return TAB_PALETTE[idx % TAB_PALETTE.length].badge;
    const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAB_PALETTE[hash % TAB_PALETTE.length].badge;
  };

  const isMenuExpired = focusedMenu ? focusedMenu.config.date < todayStr : false;

  const handleAddToCart = () => {
    if (!selectedEmployee) { alert('請先選擇「訂購人」！'); return; }
    if (!formItemName) { alert('請輸入「品項名稱」！'); return; }
    if (!formItemPrice) { alert('請輸入「金額」！'); return; }

    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: formItemName,
      note: formItemNote,
      price: Number(formItemPrice)
    };
    setCart([...cart, newItem]);
    setFormItemName('');
    setFormItemNote('');
    setFormItemPrice('');
  };

  const submitOrder = async () => {
    if (!selectedEmployee || cart.length === 0) {
      alert('請填寫完整訂單資訊');
      return;
    }
    const emp = employees.find(e => e.id === selectedEmployee);
    const order: Order = {
      id: Date.now().toString(),
      employeeName: emp ? emp.name : 'Unknown',
      items: cart,
      totalAmount: cart.reduce((sum, item) => sum + item.price, 0),
      timestamp: Date.now(),
      status: OrderStatus.PENDING,
      dateStr: todayStr,
      categoryLabel: activeLabel
    };
    await db.saveOrder(order);
    alert('訂單已送出！');
    setCart([]);
    setSelectedEmployee('');
    const updatedOrders = await db.getOrders();
    setOrders(updatedOrders);
  };

  const todayOrders = orders
    .filter(o => o.dateStr === todayStr)
    .sort((a, b) => b.timestamp - a.timestamp);

  const todayOrderCategories = Array.from(new Set(todayOrders.map(o => o.categoryLabel || '未分類')));
  const filteredTodayOrders = todayOrders.filter(o => todayOrderFilter === 'ALL' || (o.categoryLabel || '未分類') === todayOrderFilter);
  const isWeeklyViewType = activeLabel === '訂餐' || activeLabel === '訂飲料';

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center text-sm">
          <div className="font-mono flex items-center gap-2">
            <Clock size={14} />
            {currentTime.toLocaleDateString('zh-TW')} {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onGoToAdmin} className="flex items-center gap-1 text-slate-300 hover:text-white text-xs transition-colors">
              <LayoutDashboard size={14} /> 後台管理
            </button>
            <button onClick={onLogout} className="text-slate-400 hover:text-white text-xs">Exit</button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-white font-bold overflow-hidden whitespace-nowrap py-2 shadow-inner">
          <div className="inline-block animate-marquee pl-full">
            {announcements.map((a, i) => <span key={i} className="mx-8 drop-shadow-sm">📢 {a.content}</span>)}
          </div>
        </div>

        <div className="text-center py-4 bg-white border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">羿鈞科技訂餐、揪團系統</h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center border-b border-slate-200 overflow-x-auto px-4 bg-white">
          {uniqueLabels.length === 0 ? (
            <div className="p-4 text-slate-400 text-sm flex items-center gap-2">
              <HelpCircle size={16} /> 暫無菜單，請通知管理員新增
            </div>
          ) : (
            uniqueLabels.map((label, index) => {
              const theme = TAB_PALETTE[index % TAB_PALETTE.length];
              const isActive = activeLabel === label;
              return (
                <button
                  key={label}
                  onClick={() => { setActiveLabel(label); setViewMode('CARD'); }}
                  className={`px-6 md:px-8 py-3 text-lg font-bold rounded-t-lg transition-all whitespace-nowrap border-b-4 mx-1 ${isActive ? theme.active : `border-transparent text-slate-500 bg-transparent ${theme.hover}`
                    }`}
                >
                  {label}
                </button>
              );
            })
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-8">
        <div
          className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-pointer lg:cursor-auto select-none"
          onClick={() => window.innerWidth < 1024 && setIsMenuExpanded(!isMenuExpanded)}
        >
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Store className="text-primary" />
            {activeLabel} - {isWeeklyViewType ? '本週菜單' : '團購列表'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="lg:hidden text-slate-400 flex items-center gap-1 text-xs">
              {isMenuExpanded ? (<>收起 <ChevronUp size={20} /></>) : (<>展開 <ChevronDown size={20} /></>)}
            </div>
            <div
              className="flex bg-slate-100 rounded-lg p-1 shadow-inner"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setViewMode('CARD')} className={`p-2 rounded flex items-center gap-2 transition-colors ${viewMode === 'CARD' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="卡片顯示"><LayoutGrid size={18} /></button>
              <button onClick={() => setViewMode('LIST')} className={`p-2 rounded flex items-center gap-2 transition-colors ${viewMode === 'LIST' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="列表顯示"><ListIcon size={18} /></button>
            </div>
          </div>
        </div>

        {isMenuExpanded && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            {isWeeklyViewType && viewMode === 'CARD' && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {weekDays.map((dateStr, idx) => {
                  const menu = currentCategoryMenus.find(m => m.config.date === dateStr);
                  const isToday = dateStr === todayStr;
                  const isSelected = focusedMenu?.id === menu?.id;
                  return (
                    <div key={dateStr} onClick={() => menu && setFocusedMenu(menu)} className={`relative flex flex-col rounded-xl overflow-hidden transition-all cursor-pointer border-2 ${isToday ? 'border-amber-400 shadow-lg ring-2 ring-amber-100 scale-[1.02] z-10' : 'border-slate-200 hover:border-blue-300'} ${isSelected ? 'ring-2 ring-primary' : ''} bg-white`}>
                      <div className={`p-2 text-center font-bold text-sm ${isToday ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-600'}`}>{weekDayNames[idx]} <span className="text-xs font-normal opacity-90 block">{dateStr.slice(5)}</span></div>
                      <div className="flex-1 min-h-[140px] flex items-center justify-center bg-slate-50 relative group flex-col">
                        {menu ? (
                          <>
                            {menu.config.imageUrl ? (<img src={menu.config.imageUrl} alt="Menu" className="w-full h-full object-cover absolute inset-0" />) : (<div className="text-xs text-slate-400 flex flex-col items-center z-10"><FileImage size={24} /> <span>無圖片</span></div>)}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 z-10"><div className="text-white text-xs font-bold truncate">{menu.config.shopName}</div>{menu.config.cutoffTime && (<div className="text-red-500 text-xs font-bold bg-white/90 px-1 rounded backdrop-blur-sm mt-1 inline-block">截止時間: {menu.config.cutoffTime}</div>)}</div>
                          </>
                        ) : (<div className="text-slate-300 text-xs">未設定</div>)}
                      </div>
                      {isToday && (<div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow animate-pulse z-20">Today</div>)}
                    </div>
                  );
                })}
              </div>
            )}

            {isWeeklyViewType && viewMode === 'LIST' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-slate-100">
                  {weekDays.map((dateStr, idx) => {
                    const menu = currentCategoryMenus.find(m => m.config.date === dateStr);
                    const isToday = dateStr === todayStr;
                    const isSelected = focusedMenu?.id === menu?.id;
                    return (
                      <div key={dateStr} onClick={() => menu && setFocusedMenu(menu)} className={`p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all cursor-pointer relative ${isToday ? 'bg-amber-50/60 hover:bg-amber-100/50' : 'hover:bg-slate-50'} ${isSelected ? 'bg-blue-50/40 ring-1 ring-inset ring-primary' : ''}`}>
                        {isToday && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>}
                        <div className="sm:w-40 flex-shrink-0 flex items-center gap-2 pl-2"><div className={`font-bold text-lg ${isToday ? 'text-amber-700' : 'text-slate-600'}`}>{weekDayNames[idx]}</div><div className="flex flex-col"><span className="text-xs text-slate-400 font-mono">{dateStr}</span>{isToday && <span className="inline-block px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold w-fit mt-0.5">Today</span>}</div></div>
                        <div className="flex-1 flex items-center gap-4"><div className="w-20 h-14 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm relative">{menu?.config.imageUrl ? (<img src={menu.config.imageUrl} className="w-full h-full object-cover" alt="thumb" />) : (<div className="w-full h-full flex items-center justify-center text-slate-300"><FileImage size={16} /></div>)}{!menu && <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-[10px] text-slate-400">未設定</div>}</div><div className="flex-1 min-w-0">{menu ? (<><div className="font-bold text-slate-800 text-base truncate">{menu.config.shopName}</div>{menu.config.cutoffTime ? (<div className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1"><Clock size={12} /> 截止: {menu.config.cutoffTime}</div>) : (<div className="text-xs text-slate-400 mt-1">無截止時間</div>)}</>) : (<span className="text-slate-400 italic text-sm">-- 本日尚未安排菜單 --</span>)}</div></div>
                        <div className="text-right flex-shrink-0">{menu ? (<button className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all border ${isSelected ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-slate-300 text-slate-600 hover:border-primary hover:text-primary'}`}>{isSelected ? '已選擇' : '選擇此單'}</button>) : (<button disabled className="px-4 py-2 rounded-lg text-sm text-slate-300 border border-slate-100 bg-slate-50 cursor-not-allowed">不可用</button>)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(!isWeeklyViewType && viewMode === 'CARD') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentCategoryMenus.length === 0 && <div className="col-span-full text-center text-slate-400 py-8">暫無團購項目</div>}
                {currentCategoryMenus.map(menu => {
                  const isSelected = focusedMenu?.id === menu.id;
                  return (
                    <div key={menu.id} onClick={() => setFocusedMenu(menu)} className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer overflow-hidden group hover:shadow-md ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-blue-300'}`}>
                      <div className="aspect-video bg-slate-100 relative">{menu.config.imageUrl ? (<img src={menu.config.imageUrl} alt="item" className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-slate-300"><Store size={32} /></div>)}<div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow text-slate-700">{menu.config.date}</div></div>
                      <div className="p-3"><h3 className="font-bold text-slate-800 truncate">{menu.config.shopName}</h3>{menu.config.cutoffTime && (<div className="text-sm font-bold text-red-600 mt-1">截止時間: {menu.config.date} {menu.config.cutoffTime}</div>)}<div className="text-xs text-slate-500 mt-1 flex items-center gap-1">點擊查看詳情</div></div>
                    </div>
                  )
                })}
              </div>
            )}

            {(!isWeeklyViewType && viewMode === 'LIST') && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100"><tr><th className="p-4 text-slate-600 font-semibold w-32">日期</th><th className="p-4 text-slate-600 font-semibold">名稱 / 店家</th><th className="p-4 text-slate-600 font-semibold text-right">動作</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentCategoryMenus.length === 0 && (<tr><td colSpan={3} className="p-8 text-center text-slate-400">無資料</td></tr>)}
                    {currentCategoryMenus.sort((a, b) => b.config.date.localeCompare(a.config.date)).map(menu => (
                      <tr key={menu.id} className={`hover:bg-slate-50 transition-colors ${focusedMenu?.id === menu.id ? 'bg-blue-50/50' : ''}`}><td className="p-4 text-slate-600 font-mono text-sm">{menu.config.date}</td><td className="p-4"><div className="font-bold text-slate-800">{menu.config.shopName}</div>{menu.config.cutoffTime && (<div className="text-red-600 text-sm font-bold mt-1">截止時間: {menu.config.date} {menu.config.cutoffTime}</div>)}</td><td className="p-4 text-right"><button onClick={() => setFocusedMenu(menu)} className="px-4 py-2 bg-white border border-slate-300 rounded text-sm font-medium hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-sm">選擇此單</button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {focusedMenu && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex justify-between items-end"><div><h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><Star className="text-amber-400 fill-amber-400" /> 目前選擇：{focusedMenu.config.shopName}</h3>{focusedMenu.config.cutoffTime && (<div className="text-red-600 font-bold mt-1 flex items-center gap-1 animate-pulse"><Clock size={16} /> 截止時間: {focusedMenu.config.date} {focusedMenu.config.cutoffTime}</div>)}</div><span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{focusedMenu.config.date}</span></div>
              <div className="w-full bg-white rounded-xl shadow border border-slate-200 overflow-hidden cursor-zoom-in group relative" onClick={() => focusedMenu.config.imageUrl && setZoomImage(focusedMenu.config.imageUrl)}>
                {focusedMenu.config.imageUrl ? (<><img src={focusedMenu.config.imageUrl} alt="Menu Detail" className="w-full h-auto max-h-[500px] object-contain" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center"><div className="opacity-0 group-hover:opacity-100 bg-white px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all"><ZoomIn size={18} /> 放大查看</div></div></>) : (<div className="h-64 flex items-center justify-center text-slate-400">無圖片預覽</div>)}
              </div>
            </div>
            <div className="lg:col-span-7 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col relative">
              {isMenuExpired && (<div className="absolute inset-0 bg-slate-100/60 z-20 flex items-center justify-center backdrop-blur-[2px]"><div className="bg-white p-6 rounded-2xl shadow-xl text-center border-2 border-red-100 max-w-sm"><div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><Lock size={32} /></div><h3 className="text-xl font-bold text-slate-800 mb-2">已停止下單</h3><p className="text-slate-500">此菜單日期已過，無法進行點餐操作。</p></div></div>)}
              <div className={`${isMenuExpired ? 'bg-slate-400' : 'bg-slate-800'} text-white p-4 transition-colors`}><h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart size={20} /> 填寫訂單</h2></div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <div className="space-y-4">
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">1. 訂購人</label><select disabled={isMenuExpired} value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-primary outline-none disabled:bg-slate-100 disabled:text-slate-400"><option value="">-- 請選擇 --</option>{employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}</select></div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3"><div className="text-sm font-bold text-slate-700 border-b pb-2 mb-2">2. 新增品項</div><input disabled={isMenuExpired} placeholder="品項名稱 (如: 雞腿飯)" value={formItemName} onChange={e => setFormItemName(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-slate-100" /><input disabled={isMenuExpired} type="number" placeholder="金額" value={formItemPrice} onChange={e => setFormItemPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-slate-100" /><input disabled={isMenuExpired} placeholder="備註 (如: 小辣)" value={formItemNote} onChange={e => setFormItemNote(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-slate-100" /><button disabled={isMenuExpired} onClick={handleAddToCart} className="w-full py-2 bg-secondary text-white rounded hover:bg-slate-700 text-sm font-bold flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"><Plus size={16} /> 加入購物車</button></div>
                </div>
                <div className="flex flex-col bg-amber-50 rounded-lg border border-amber-100 p-4"><h3 className="text-sm font-bold text-amber-800 mb-3">購物車內容</h3><div className="flex-1 overflow-y-auto max-h-[200px] space-y-2 mb-3 pr-1 custom-scrollbar">{cart.length === 0 ? (<p className="text-xs text-amber-600/60 text-center py-4">尚無品項</p>) : (cart.map((item, idx) => (<div key={idx} className="bg-white p-2 rounded shadow-sm flex justify-between items-start text-sm"><div><div className="font-bold text-slate-800">{item.name}</div>{item.note && <div className="text-xs text-slate-500">{item.note}</div>}</div><div className="flex items-center gap-2"><span className="font-medium">${item.price}</span><button disabled={isMenuExpired} onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 disabled:text-slate-300"><X size={14} /></button></div></div>)))}</div><div className="pt-3 border-t border-amber-200"><div className="flex justify-between items-center mb-3"><span className="font-bold text-slate-700">總計</span><span className="text-xl font-bold text-primary">${cart.reduce((a, b) => a + b.price, 0)}</span></div><button onClick={submitOrder} disabled={cart.length === 0 || isMenuExpired} className={`w-full py-3 rounded font-bold transition-all ${cart.length > 0 && !isMenuExpired ? 'bg-primary text-white hover:bg-blue-700 shadow' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>下單送出</button><p className="text-xs text-red-500 font-bold mt-2 text-center">下單後，修改、刪除訂單，請親洽聯絡管理員協助處理</p></div></div>
              </div>
            </div>
          </div>
        )}

        <section className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 p-4 border-b border-slate-200"><h2 className="font-bold text-slate-800 flex items-center gap-2"><ListChecks size={20} className="text-primary" /> 今日已下訂單</h2></div>
          <div className="p-3 border-b border-slate-100 flex gap-2 overflow-x-auto"><button onClick={() => setTodayOrderFilter('ALL')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${todayOrderFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>全部</button>{todayOrderCategories.map(cat => { const isActive = todayOrderFilter === cat; return (<button key={cat} onClick={() => setTodayOrderFilter(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${isActive ? 'bg-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{cat}</button>) })}</div>
          <div className="p-0 divide-y divide-slate-100">
            {filteredTodayOrders.length === 0 ? (<div className="p-8 text-center text-slate-400">目前尚無訂單</div>) : (filteredTodayOrders.map(order => { const badgeStyle = getBadgeStyle(order.categoryLabel); return (<div key={order.id} className="p-4 flex items-center gap-4 hover:bg-slate-50"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0"><User size={16} /></div><div className="flex-1 min-w-0"><div className="flex justify-between mb-1"><div className="flex items-center gap-2"><span className="font-bold text-slate-800">{order.employeeName}</span>{order.categoryLabel && (<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}`}>{order.categoryLabel}</span>)}</div><span className="text-xs text-slate-400 flex-shrink-0">{new Date(order.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}</span></div><div className="text-sm text-slate-600 truncate">{order.items.map(i => `${i.name}${i.note ? `(${i.note})` : ''}`).join(', ')}</div></div></div>) }))}
          </div>
        </section>
      </main>
      {zoomImage && (<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm" onClick={() => setZoomImage(null)}><img src={zoomImage} alt="Zoom" className="max-w-full max-h-[90vh] rounded shadow-2xl animate-in fade-in zoom-in duration-200" /><button className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={32} /></button></div>)}
      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } } .animate-marquee { animation: marquee 20s linear infinite; } .pl-full { padding-left: 100%; } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }`}</style>
    </div>
  );
};

export default FrontendApp;
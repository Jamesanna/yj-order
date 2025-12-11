import { db } from '../services/storage';
import { MenuCategory, Employee, Announcement } from '../types';


// Mock Data Configuration
const INITIAL_MENUS: MenuCategory[] = [
    {
        id: 'MENU_001',
        label: '美味便當',
        config: {
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60',
            shopName: '好食光便當專賣',
            date: new Date().toISOString().split('T')[0],
            cutoffTime: '10:30',
            options: [
                { id: 'opt_1', label: '招牌排骨飯', price: 100 },
                { id: 'opt_2', label: '酥炸雞腿飯', price: 110 },
                { id: 'opt_3', label: '香煎鯖魚飯', price: 120 },
                { id: 'opt_4', label: '蔥爆牛肉飯', price: 130 },
                { id: 'opt_5', label: '養生蔬菜飯', price: 90 }
            ]
        }
    },
    {
        id: 'MENU_002',
        label: '清涼飲料',
        config: {
            imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=60',
            shopName: '50嵐 (預設)',
            date: new Date().toISOString().split('T')[0],
            cutoffTime: '14:00',
            options: [
                { id: 'drink_1', label: '四季春青茶 (L)', price: 35 },
                { id: 'drink_2', label: '波霸奶茶 (L)', price: 55 },
                { id: 'drink_3', label: '燕麥紅茶拿鐵 (M)', price: 60 },
                { id: 'drink_4', label: '黃金烏龍 (L)', price: 35 },
                { id: 'drink_5', label: '檸檬綠茶 (L)', price: 50 },
                { id: 'drink_6', label: '布丁奶茶 (L)', price: 65 }
            ]
        }
    },
    {
        id: 'MENU_003',
        label: '揪團購',
        config: {
            imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=60',
            shopName: '星巴克咖啡',
            date: new Date().toISOString().split('T')[0],
            cutoffTime: '15:00',
            options: [
                { id: 'tea_1', label: '美式咖啡 (大)', price: 110 },
                { id: 'tea_2', label: '那堤 (大)', price: 135 },
                { id: 'tea_3', label: '焦糖瑪奇朵 (大)', price: 155 },
                { id: 'tea_4', label: '抹茶那堤 (大)', price: 145 },
                { id: 'tea_5', label: '經典巧克力 (大)', price: 125 }
            ]
        }
    }
];

const INITIAL_EMPLOYEES: Employee[] = [
    { id: 'EMP_001', name: '王小明' },
    { id: 'EMP_002', name: '李美華' },
    { id: 'EMP_003', name: '張志強' },
    { id: 'EMP_004', name: '陳雅婷' },
    { id: 'EMP_005', name: '林建國' }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
    { id: 'ANN_001', content: '🎉 歡迎使用全新的訂餐系統！', isActive: true },
    { id: 'ANN_002', content: '⚠️ 訂便當請記得在 10:30 前完成下單。', isActive: true },
    { id: 'ANN_003', content: '🥤 週五是飲料日，歡迎大家踴躍訂購！', isActive: true }
];

export const seedDatabase = async () => {
    console.log('Starting full database seed...');
    let seededCount = 0;

    try {
        // 1. Seed Menus
        const existingMenus = await db.getMenuCategories();
        if (existingMenus.length === 0) {
            console.log('Seeding menus...');
            for (const menu of INITIAL_MENUS) {
                await db.addMenuCategory(menu.label, menu.config);
            }
            seededCount++;
        } else {
            console.log('Menus already exist.');
        }

        // 2. Seed Employees
        const existingEmps = await db.getEmployees();
        if (existingEmps.length === 0) {
            console.log('Seeding employees...');
            for (const emp of INITIAL_EMPLOYEES) {
                await db.addEmployee(emp);
            }
            seededCount++;
        } else {
            console.log('Employees already exist.');
        }

        // 3. Seed Announcements
        const existingAnns = await db.getAnnouncements();
        if (existingAnns.length === 0) {
            console.log('Seeding announcements...');
            // Need to handle announcements carefully as there is no bulk add in our interface usually
            // but we can loop add/save.
            // Actually db.saveAnnouncements replaces the whole list usually in local, but for cloud we might need loop.
            // Let's rely on specific add if available or just construct logic.
            // The storage service 'saveAnnouncements' with cloud uses a loop setDoc merge, which is fine.
            await db.saveAnnouncements(INITIAL_ANNOUNCEMENTS);
            seededCount++;
        } else {
            console.log('Announcements already exist.');
        }

        if (seededCount > 0) {
            console.log('Database seed completed!');
            alert('系統資料範例初始化成功！\n包含：菜單、員工名單、系統公告。');
            // Force reload to see changes
            window.location.reload();
        } else {
            alert('系統檢測到已有資料，為避免覆蓋，跳過初始化步驟。\n若需重置，請先手動清空相關資料。');
        }

    } catch (e) {
        console.error('Seeding failed:', e);
        alert('初始化失敗，請查看 Console。');
    }
};

import { db } from '../services/storage';
import { MenuCategory } from '../types';

const INITIAL_MENUS: MenuCategory[] = [
    {
        id: 'MENU_001',
        label: '美味便當',
        config: {
            options: [
                { id: 'opt_1', label: '排骨飯', price: 100 },
                { id: 'opt_2', label: '雞腿飯', price: 110 },
                { id: 'opt_3', label: '鱈魚飯', price: 120 }
            ]
        }
    },
    {
        id: 'MENU_002',
        label: '清涼飲料',
        config: {
            options: [
                { id: 'drink_1', label: '紅茶', price: 20 },
                { id: 'drink_2', label: '綠茶', price: 20 },
                { id: 'drink_3', label: '奶茶', price: 30 }
            ]
        }
    }
];

export const seedDatabase = async () => {
    console.log('Starting database seed...');
    try {
        const existing = await db.getMenuCategories();
        if (existing.length > 0) {
            console.log('Database already has menus, skipping seed.');
            alert('資料庫已有菜單，跳過初始化。');
            return;
        }

        for (const menu of INITIAL_MENUS) {
            await db.addMenuCategory(menu.label, menu.config);
            console.log(`Added menu: ${menu.label}`);
        }
        console.log('Database seed completed!');
        alert('菜單初始化成功！');
    } catch (e) {
        console.error('Seeding failed:', e);
        alert('初始化失敗，請查看 Console。');
    }
};

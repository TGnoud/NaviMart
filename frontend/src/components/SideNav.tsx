import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logoIconTransparentUrl } from '../assets/logos';

const navItems = [
  { path: '/home', icon: 'home', label: 'Trang chủ' },
  { path: '/pantry', icon: 'kitchen', label: 'Kho' },
  { path: '/lists', icon: 'shopping_cart', label: 'Danh sách' },
  { path: '/meals', icon: 'restaurant', label: 'Bữa ăn' },
  { path: '/recipe-suggestion', icon: 'skillet', label: 'Gợi ý món' },
  { path: '/reports', icon: 'assessment', label: 'Báo cáo' },
  { path: '/family', icon: 'group', label: 'Gia đình' },
  { path: '/profile', icon: 'person', label: 'Hồ sơ' },
];

export default function SideNav() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('navimart-sidebar-collapsed') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
    localStorage.setItem('navimart-sidebar-collapsed', String(collapsed));
    return () => document.documentElement.classList.remove('sidebar-collapsed');
  }, [collapsed]);

  return (
    <nav className={`hidden md:flex flex-col bg-surface-container-low border-r border-outline-variant fixed left-0 top-0 h-full py-6 px-4 z-40 transition-all duration-200 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className={`mb-8 px-2 flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
          <img src={logoIconTransparentUrl} alt="NaviMart Icon" className="w-6 h-6 object-contain" />
        </div>
          {!collapsed && <span className="font-headline-sm text-headline-sm font-bold text-primary truncate">NaviMart</span>}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="w-9 h-9 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-highest flex items-center justify-center transition-colors"
            aria-label="Thu gọn sidebar"
            title="Thu gọn"
          >
            <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_left</span>
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-2 font-label-sm text-label-sm w-full">
        {collapsed && (
          <li>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
              aria-label="Mở rộng sidebar"
              title="Mở rộng"
            >
              <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_right</span>
            </button>
          </li>
        )}
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-150 rounded-xl ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold scale-100'
                    : 'text-on-surface-variant hover:bg-surface-container-highest scale-95 hover:scale-100'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="font-body-md text-body-md truncate">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

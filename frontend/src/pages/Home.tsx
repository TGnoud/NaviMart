import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import NotificationDropdown from '../components/NotificationDropdown';
import SideNav from '../components/SideNav';
import { pantryApi, recipesApi, shoppingListsApi } from '../api';
import type { PantryItem, RecipeSuggestion, ShoppingList } from '../api';
import { logoPrimaryUrl } from '../assets/logos';
import { useAuth } from '../contexts/AuthContext';
import { daysLeft } from '../utils/expiry';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 14) return 'Chào buổi trưa';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

export default function Home() {
  const { user } = useAuth();
  const [expiringItems, setExpiringItems] = useState<PantryItem[]>([]);
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [suggestion, setSuggestion] = useState<RecipeSuggestion | null>(null);

  useEffect(() => {
    let cancelled = false;
    pantryApi
      .list({ expiryStatus: 'expiring' })
      .then((items) => {
        if (!cancelled) setExpiringItems(items.slice(0, 3));
      })
      .catch(() => undefined);
    shoppingListsApi
      .list('active')
      .then((lists) => {
        if (!cancelled) setActiveList(lists[0] ?? null);
      })
      .catch(() => undefined);
    recipesApi
      .suggestions({ limit: 1, prioritizeExpiring: true })
      .then((suggestions) => {
        if (!cancelled) setSuggestion(suggestions[0] ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleItem = useCallback(
    async (itemId: string, checked: boolean) => {
      if (!activeList) return;
      try {
        setActiveList(
          await shoppingListsApi.updateItem(activeList.id, itemId, { checked: !checked }),
        );
      } catch {
        // home is a dashboard; failures here are non-blocking
      }
    },
    [activeList],
  );

  const listItems = activeList?.items.slice(0, 5) ?? [];

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden flex font-body-md antialiased">
      <SideNav />
      <div className="flex-1 flex flex-col md:ml-64 w-full h-full relative">
        {/* TopNavBar (Web) */}
        <header className="hidden md:flex bg-surface dark:bg-surface-dim border-b border-outline-variant w-full shrink-0 z-30">
          <div className="flex justify-between items-center w-full h-nav-height px-margin-mobile max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Link to="/home" className="hover:text-primary transition-colors flex items-center">
                <span className="material-symbols-outlined text-[20px]">home</span>
              </Link>
              <span className="text-sm">/</span>
              <span className="font-bold text-primary text-sm">Trang chủ</span>
            </div>
            <div className="flex gap-4">
              <NotificationDropdown />
              <Link to="/profile" className="text-on-surface-variant font-medium hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80 active:scale-95 duration-150">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full relative flex flex-col">
          <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-margin-mobile py-stack-md gap-stack-md pb-[100px] md:pb-8">
            <section className="py-4 flex justify-between items-center">
              <div>
                <h1 className="font-headline-md text-headline-md text-primary mb-2">
                  {greeting()}, {user?.firstName ?? user?.displayName ?? 'bạn'}!
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Hôm nay bạn muốn nấu món gì?</p>
              </div>
              <Link to="/add-item" className="hidden md:flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-body-md shadow-sm hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined">add</span>
                Thêm thực phẩm
              </Link>
            </section>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-stack-md">
            {/* Section 1: Thực phẩm sắp hết hạn */}
            <section className="md:col-span-8 bg-surface-container-low rounded-xl p-4 border border-outline-variant shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  Sắp hết hạn
                </h2>
                <Link to="/pantry" className="font-label-sm text-label-sm text-primary underline">Xem tất cả</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {expiringItems.map((item) => {
                  const days = daysLeft(item.expiryDate);
                  const urgent = days <= 2;
                  return (
                    <div key={item.id} className={`bg-surface rounded-lg p-3 shadow-sm border ${urgent ? 'border-error-container' : 'border-secondary-container'} relative overflow-hidden group`}>
                      <div className={`absolute top-0 right-0 font-label-sm text-xs px-2 py-1 rounded-bl-lg z-10 ${urgent ? 'bg-error text-on-error' : 'bg-secondary-container text-on-secondary-container'}`}>{days} ngày</div>
                      <div className="w-full h-24 rounded mb-2 bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-outline">grocery</span>
                      </div>
                      <h3 className="font-body-md text-body-md text-on-surface mb-1 line-clamp-1">{item.name}</h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Còn {item.quantity} {item.unit}</p>
                    </div>
                  );
                })}
                {expiringItems.length === 0 && (
                  <div className="col-span-2 md:col-span-3 flex items-center gap-3 p-4 bg-surface rounded-lg border border-outline-variant/40 text-on-surface-variant">
                    <span className="material-symbols-outlined text-tertiary">check_circle</span>
                    <p className="font-body-md text-body-md">Tuyệt vời! Không có thực phẩm nào sắp hết hạn.</p>
                  </div>
                )}
                {/* Empty Slot */}
                <Link to="/add-item" className="bg-surface-container rounded-lg p-3 border border-dashed border-outline-variant flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity bg-primary/5 hover:bg-primary/10 min-h-[120px]">
                  <span className="material-symbols-outlined text-primary mb-2 text-3xl">add_circle</span>
                  <p className="font-label-sm text-label-sm text-primary font-medium">Thêm thực phẩm</p>
                </Link>
              </div>
            </section>

            {/* Section 2: Danh sách đi chợ */}
            <section className="md:col-span-4 bg-surface-container rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{activeList ? activeList.name : 'Cần mua hôm nay'}</h2>
                <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2 py-1 rounded-full whitespace-nowrap">{activeList?.items.length ?? 0} món</span>
              </div>
              <div className="space-y-3">
                {listItems.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 p-2 bg-surface rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors">
                    <input
                      className="w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary"
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id, item.checked)}
                    />
                    <span className={`font-body-md text-body-md text-on-surface flex-grow ${item.checked ? 'line-through text-on-surface-variant opacity-70' : ''}`}>
                      {item.name} ({item.quantity} {item.unit})
                    </span>
                  </label>
                ))}
                {listItems.length === 0 && (
                  <p className="font-body-md text-body-md text-on-surface-variant p-2">Chưa có danh sách mua sắm nào đang hoạt động.</p>
                )}
              </div>
              <Link
                to={activeList ? `/list-detail/${activeList.id}` : '/lists'}
                className="w-full mt-4 bg-surface text-primary border border-outline-variant font-body-md text-body-md py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">{activeList ? 'open_in_new' : 'add'}</span>
                {activeList ? 'Mở danh sách' : 'Tạo danh sách'}
              </Link>
            </section>

            {/* Section 3: Gợi ý bữa ăn */}
            {suggestion && (
              <section className="md:col-span-12">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Gợi ý hôm nay</h2>
                <div className="relative rounded-xl overflow-hidden shadow-sm group cursor-pointer h-64 md:h-80 bg-surface-container">
                  {suggestion.recipe.imageUrl ? (
                    <img alt={suggestion.recipe.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={suggestion.recipe.imageUrl}/>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-9xl text-outline">restaurant</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                    <div className="flex gap-2 mb-2">
                      <span className="bg-tertiary-container text-on-tertiary-container font-label-sm px-3 py-1 rounded-full backdrop-blur-sm bg-opacity-90">Có sẵn {suggestion.availableCount}/{suggestion.totalCount} nguyên liệu</span>
                      <span className="bg-surface/20 text-on-primary font-label-sm px-3 py-1 rounded-full backdrop-blur-sm border border-surface/30">{suggestion.recipe.cookTimeMinutes} phút</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-primary mb-1">{suggestion.recipe.name}</h3>
                    <p className="font-body-md text-body-md text-surface-variant opacity-90 line-clamp-2">{suggestion.recipe.description ?? 'Món ăn phù hợp với nguyên liệu sẵn có của bạn.'}</p>
                    <Link to={`/recipe-detail/${suggestion.recipe.id}`} className="mt-4 self-start bg-primary text-on-primary font-body-md text-body-md px-6 py-2 rounded-lg shadow-md hover:bg-surface-tint transition-colors text-center">
                      Xem công thức
                    </Link>
                  </div>
                </div>
              </section>
            )}
          </div>
          </div>

          {/* Footer */}
          <footer className="hidden md:block bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant w-full mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center w-full py-8 px-margin-mobile max-w-7xl mx-auto gap-stack-md">
              <img src={logoPrimaryUrl} alt="NaviMart" className="h-6 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
              <nav className="flex gap-6">
                <Link to="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-body-md text-body-md">Về chúng tôi</Link>
                <Link to="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-body-md text-body-md">Chính sách</Link>
                <Link to="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-body-md text-body-md">Hướng dẫn</Link>
              </nav>
              <div className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant">© 2026 NaviMart. All rights reserved.</div>
            </div>
          </footer>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

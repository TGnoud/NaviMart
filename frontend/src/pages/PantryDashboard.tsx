import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import NotificationDropdown from '../components/NotificationDropdown';
import PaginationControls from '../components/PaginationControls';
import SideNav from '../components/SideNav';
import { CardGridSkeleton } from '../components/Skeleton';
import { pantryApi, catalogApi } from '../api';
import type { PantryItem, StorageLocation, CatalogCategory, CatalogFood } from '../api';
import { useDialog } from '../contexts/DialogContext';
import { daysLeft, daysOverdue } from '../utils/expiry';

const LOCATION_FILTERS: { label: string; value?: StorageLocation }[] = [
  { label: 'Tất cả' },
  { label: 'Tủ đông', value: 'freezer' },
  { label: 'Tủ mát', value: 'fridge' },
  { label: 'Đồ khô', value: 'pantry' },
  { label: 'Khác', value: 'other' },
];

const LOCATION_LABELS: Record<StorageLocation, string> = {
  freezer: 'Tủ đông',
  fridge: 'Tủ mát',
  pantry: 'Đồ khô',
  other: 'Khác',
};

const PANTRY_PAGE_SIZE = 12;

function expiryBadge(item: PantryItem) {
  if (item.expiryStatus === 'expired') {
    return { status: 'Hết hạn', color: 'error', border: 'border-error/30', text: `Quá hạn ${daysOverdue(item.expiryDate)} ngày` };
  }
  if (item.expiryStatus === 'expiring') {
    return { status: `Còn ${daysLeft(item.expiryDate)} ngày`, color: 'secondary', border: 'border-secondary/30', text: `HSD: ${new Date(item.expiryDate).toLocaleDateString('vi-VN')}` };
  }
  return { status: 'An toàn', color: 'tertiary', border: 'border-outline-variant/50', text: `HSD: ${new Date(item.expiryDate).toLocaleDateString('vi-VN')}` };
}

export default function PantryDashboard() {
  const { showAlert } = useDialog();
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [editQuantityInput, setEditQuantityInput] = useState('');

  const [deletedItem, setDeletedItem] = useState<PantryItem | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [foods, setFoods] = useState<CatalogFood[]>([]);

  useEffect(() => {
    catalogApi.categories().then(setCategories).catch(console.error);
    catalogApi.searchFoods().then(setFoods).catch(console.error);
  }, []);

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      showAlert(err instanceof Error ? err.message : fallback);
    },
    [showAlert],
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const location = LOCATION_FILTERS.find((f) => f.label === activeFilter)?.value;
      setPantryItems(await pantryApi.list({ location, q: search.trim() || undefined }));
    } catch (err) {
      handleError(err, 'Không tải được kho thực phẩm.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, search, handleError]);

  useEffect(() => {
    const timer = setTimeout(loadItems, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadItems, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, search]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(pantryItems.length / PANTRY_PAGE_SIZE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, pantryItems.length]);

  const pagedPantryItems = useMemo(
    () =>
      pantryItems.slice(
        (currentPage - 1) * PANTRY_PAGE_SIZE,
        currentPage * PANTRY_PAGE_SIZE,
      ),
    [currentPage, pantryItems],
  );

  const groupedItems = useMemo(() => {
    return pagedPantryItems.reduce((acc, item) => {
      const catId = item.categoryId || 'other';
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push(item);
      return acc;
    }, {} as Record<string, PantryItem[]>);
  }, [pagedPantryItems]);

  const getStorageTip = (item: PantryItem) => {
    if (item.foodId) {
      const food = foods.find(f => f.id === item.foodId);
      if (food?.storageTips) return food.storageTips;
    }
    const cat = categories.find(c => c.id === item.categoryId);
    return cat?.description;
  };

  const stats = {
    total: pantryItems.length,
    safe: pantryItems.filter((item) => item.expiryStatus === 'safe').length,
    expiring: pantryItems.filter((item) => item.expiryStatus === 'expiring').length,
    expired: pantryItems.filter((item) => item.expiryStatus === 'expired').length,
  };

  const handleDelete = async (id: string) => {
    const itemToDelete = pantryItems.find((item) => item.id === id);
    setActiveMenu(null);
    if (!itemToDelete) return;
    try {
      await pantryApi.remove(id);
      setPantryItems((items) => items.filter((item) => item.id !== id));
      setDeletedItem(itemToDelete);
      setShowUndo(true);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setShowUndo(false), 4000);
    } catch (err) {
      handleError(err, 'Không xóa được thực phẩm.');
    }
  };

  const handleWaste = async (id: string) => {
    setActiveMenu(null);
    try {
      await pantryApi.markWasted(id);
      await loadItems();
    } catch (err) {
      handleError(err, 'Không cập nhật được trạng thái.');
    }
  };

  const handleUndo = async () => {
    if (!deletedItem) return;
    try {
      const recreated = await pantryApi.create({
        name: deletedItem.name,
        categoryId: deletedItem.categoryId,
        quantity: deletedItem.quantity,
        unit: deletedItem.unit,
        expiryDate: deletedItem.expiryDate,
        location: deletedItem.location,
        note: deletedItem.note,
        imageUrl: deletedItem.imageUrl,
      });
      setPantryItems((items) => [recreated, ...items]);
    } catch (err) {
      handleError(err, 'Không khôi phục được thực phẩm.');
    } finally {
      setDeletedItem(null);
      setShowUndo(false);
    }
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item);
    setEditQuantityInput(String(item.quantity));
    setActiveMenu(null);
  };

  const handleSaveEdit = async () => {
    const quantity = Number(editQuantityInput);
    if (!editingItem || Number.isNaN(quantity) || quantity < 0) return;
    try {
      const updated = await pantryApi.update(editingItem.id, { quantity });
      setPantryItems((items) =>
        items.map((item) => (item.id === editingItem.id ? updated : item)),
      );
      setEditingItem(null);
    } catch (err) {
      handleError(err, 'Không cập nhật được số lượng.');
    }
  };

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden flex">
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
              <span className="font-bold text-primary text-sm">Kho thực phẩm</span>
            </div>
          <div className="flex gap-4">
            <NotificationDropdown />
              <Link to="/profile" className="text-on-surface-variant font-medium hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80 active:scale-95 duration-150">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full px-margin-mobile py-stack-md md:py-8 pb-[100px] md:pb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-headline-md text-headline-md text-primary mb-2">Tổng quan tủ lạnh</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Quản lý thực phẩm gia đình tươi ngon mỗi ngày.</p>
          </div>
          <Link to="/add-item" className="hidden md:flex items-center gap-2 bg-primary text-on-primary font-body-md px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined">add</span>
            Thêm thực phẩm
          </Link>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
            placeholder="Tìm thực phẩm theo tên..."
            type="text"
          />
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
          {LOCATION_FILTERS.map(filter => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full font-body-md transition-colors ${activeFilter === filter.label ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>kitchen</span>
              <span className="font-label-sm text-label-sm font-semibold">Tổng thực phẩm</span>
            </div>
            <div className="mt-2 font-headline-md text-headline-md text-on-surface">{stats.total} <span className="text-body-md text-on-surface-variant font-normal">món</span></div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-tertiary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-sm text-label-sm font-semibold">An toàn</span>
            </div>
            <div className="mt-2 font-headline-md text-headline-md text-on-surface">{stats.safe} <span className="text-body-md text-on-surface-variant font-normal">món</span></div>
          </div>
          <div className="bg-secondary-container/20 rounded-xl p-4 border border-secondary-container/30 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <span className="font-label-sm text-label-sm font-semibold">Sắp hết hạn</span>
            </div>
            <div className="mt-2 font-headline-md text-headline-md text-on-surface">{stats.expiring} <span className="text-body-md text-on-surface-variant font-normal">món</span></div>
          </div>
          <div className="bg-error-container/30 rounded-xl p-4 border border-error/20 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <span className="font-label-sm text-label-sm font-semibold">Đã hết hạn</span>
            </div>
            <div className="mt-2 font-headline-md text-headline-md text-on-surface">{stats.expired} <span className="text-body-md text-on-surface-variant font-normal">món</span></div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter-mobile md:gap-4">
              <CardGridSkeleton count={8} />
            </div>
          ) : pantryItems.length > 0 ? (
            Object.entries(groupedItems).map(([catId, items]) => {
              const category = categories.find(c => c.id === catId);
              const catName = category ? category.name : 'Khác';
              return (
                <div key={catId} className="flex flex-col gap-4">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-b border-outline-variant pb-2">{catName}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter-mobile md:gap-4">
                    {items.map(item => {
                      const badge = expiryBadge(item);
                      const tip = getStorageTip(item);
                      return (
                        <div key={item.id} className={`bg-surface-container-lowest rounded-lg shadow-sm border ${badge.border} overflow-visible flex flex-col relative`}>
                          <div className="relative h-32 md:h-40 bg-surface-container rounded-t-lg overflow-hidden flex items-center justify-center">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-6xl text-outline">grocery</span>
                            )}
                            <div className={`absolute top-2 right-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-${badge.color}/20`}>
                              <span className={`w-2 h-2 rounded-full bg-${badge.color}`}></span>
                              <span className={`font-label-sm text-label-sm text-${badge.color} font-semibold`}>{badge.status}</span>
                            </div>
                          </div>
                          <div className="p-3 flex-1 flex flex-col">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-headline-sm text-[16px] leading-[24px] text-on-surface font-semibold line-clamp-1">{item.name}</h3>
                              <button
                                onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                                className="text-on-surface-variant hover:text-primary transition-colors p-1 -mr-1 -mt-1 rounded-full hover:bg-surface-container-high"
                              >
                                <span className="material-symbols-outlined text-lg">more_vert</span>
                              </button>
                              {activeMenu === item.id && (
                                <div className="absolute top-10 right-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
                                  <button onClick={() => openEditModal(item)} className="w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors font-body-md text-on-surface flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">edit</span> Cập nhật số lượng
                                  </button>
                                  <button onClick={() => handleWaste(item.id)} className="w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors font-body-md text-secondary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">delete_sweep</span> Bỏ đi (lãng phí)
                                  </button>
                                  <button onClick={() => handleDelete(item.id)} className="w-full text-left px-4 py-3 hover:bg-error-container/50 transition-colors font-body-md text-error flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">delete</span> Đã dùng hết (Xoá)
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{LOCATION_LABELS[item.location]}</p>
                            
                            {tip && (
                              <div className="mt-2 bg-tertiary-container/20 p-2 rounded text-[12px] text-tertiary font-body-sm flex items-start gap-1">
                                <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                                <span className="line-clamp-2" title={tip}>{tip}</span>
                              </div>
                            )}

                            <div className="mt-auto pt-3 flex justify-between items-center border-t border-outline-variant/30">
                              <span className="font-body-md text-body-md font-bold text-on-surface">{item.quantity} {item.unit}</span>
                              <span className={`font-label-sm text-label-sm text-${badge.color} font-medium`}>{badge.text}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-6xl text-surface-variant mb-4">kitchen</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Tủ lạnh đang trống</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Hãy thêm thực phẩm để bắt đầu quản lý nhé.</p>
              <Link to="/add-item" className="bg-primary text-on-primary px-6 py-2 rounded-lg font-body-md flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                <span className="material-symbols-outlined">add</span>
                Thêm thực phẩm ngay
              </Link>
            </div>
          )}
        </div>
        {!loading && pantryItems.length > 0 && (
          <PaginationControls
            page={currentPage}
            pageSize={PANTRY_PAGE_SIZE}
            totalItems={pantryItems.length}
            onPageChange={setCurrentPage}
          />
        )}
        </div>
      </main>

      <Link to="/add-item" className="md:hidden fixed bottom-[calc(69px+env(safe-area-inset-bottom)+16px)] right-4 w-14 h-14 bg-primary text-on-primary rounded-xl shadow-md flex items-center justify-center hover:bg-primary/90 transition-colors z-40">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </Link>
      </div>

      <BottomNav />

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-slide-up">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Cập nhật số lượng</h2>
            <p className="font-body-md text-on-surface-variant mb-2">Đang chỉnh sửa: <span className="font-semibold text-on-surface">{editingItem.name}</span></p>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm font-medium text-on-surface">Số lượng còn lại ({editingItem.unit})</label>
              <input
                autoFocus
                type="number"
                min="0"
                step="any"
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-on-surface"
                placeholder="VD: 1, 0.5, 2..."
                value={editQuantityInput}
                onChange={(e) => setEditQuantityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); }}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditingItem(null)} className="px-4 py-2 font-label-md text-primary hover:bg-primary/10 rounded-full transition-colors">Hủy</button>
              <button
                onClick={handleSaveEdit}
                disabled={!editQuantityInput.trim()}
                className={`px-4 py-2 font-label-md rounded-full transition-colors ${editQuantityInput.trim() ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-surface-container-high text-on-surface-variant opacity-50'}`}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Snackbar */}
      {showUndo && deletedItem && (
        <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:bottom-8 md:translate-x-0 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-4 animate-slide-up whitespace-nowrap min-w-[300px] max-w-[90vw]">
          <span className="font-body-md text-body-md flex-1 overflow-hidden text-ellipsis">Đã xóa {deletedItem.name}</span>
          <button onClick={handleUndo} className="font-label-md text-primary font-bold hover:bg-primary/10 px-2 py-1 rounded transition-colors uppercase">
            Hoàn tác
          </button>
        </div>
      )}
    </div>
  );
}

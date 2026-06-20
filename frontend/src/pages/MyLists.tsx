import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import NotificationDropdown from '../components/NotificationDropdown';
import PaginationControls from '../components/PaginationControls';
import SideNav from '../components/SideNav';
import { CardGridSkeleton } from '../components/Skeleton';
import { shoppingListsApi } from '../api';
import type { ShoppingList, ShoppingListType } from '../api';
import { onSocketEvent } from '../api/socket';
import { useDialog } from '../contexts/DialogContext';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';

function formatDate(value?: string) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('vi-VN');
}

const LISTS_PAGE_SIZE = 6;

function startOfWeek(date: Date) {
  const result = new Date(date);
  const offset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function toDateInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export default function MyLists() {
  const { showAlert } = useDialog();
  const [activeTab, setActiveTab] = useState<'Đang mua' | 'Đã mua'>('Đang mua');
  const [activeLists, setActiveLists] = useState<ShoppingList[]>([]);
  const [completedLists, setCompletedLists] = useState<ShoppingList[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listNameInput, setListNameInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'daily' | 'weekly'>('daily');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date()));
  const [plannedForInput, setPlannedForInput] = useState(() => toDateInput(new Date()));
  const [listTypeInput, setListTypeInput] = useState<ShoppingListType>('daily');

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + index);
      return date;
    }),
    [currentWeekStart],
  );

  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const [active, completed] = await Promise.all([
        shoppingListsApi.list('active'),
        shoppingListsApi.list('completed'),
      ]);
      setActiveLists(active);
      setCompletedLists(completed);
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Không tải được danh sách mua sắm.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(activeLists.length / LISTS_PAGE_SIZE));
    if (activePage > totalPages) setActivePage(totalPages);
  }, [activeLists.length, activePage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(completedLists.length / LISTS_PAGE_SIZE));
    if (completedPage > totalPages) setCompletedPage(totalPages);
  }, [completedLists.length, completedPage]);

  // Live refresh when another family member changes any list.
  useEffect(() => {
    const apply = (updated: ShoppingList) => {
      setActiveLists((lists) => {
        const without = lists.filter((list) => list.id !== updated.id);
        return updated.status === 'active' ? [updated, ...without] : without;
      });
      setCompletedLists((lists) => {
        const without = lists.filter((list) => list.id !== updated.id);
        return updated.status === 'completed' ? [updated, ...without] : without;
      });
    };
    const offUpdated = onSocketEvent('shoppingList:updated', apply);
    const offRemoved = onSocketEvent('shoppingList:removed', ({ id }) => {
      setActiveLists((lists) => lists.filter((list) => list.id !== id));
      setCompletedLists((lists) => lists.filter((list) => list.id !== id));
    });
    return () => {
      offUpdated();
      offRemoved();
    };
  }, []);

  const openCreateModal = (date = new Date(), type: ShoppingListType = scheduleMode) => {
    setModalMode('create');
    setListNameInput('');
    setListTypeInput(type);
    setPlannedForInput(toDateInput(type === 'weekly' ? startOfWeek(date) : date));
    setIsModalOpen(true);
  };

  const openEditModal = (id: string, name: string) => {
    setModalMode('edit');
    setEditingId(id);
    setListNameInput(name);
    setIsModalOpen(true);
  };

  const handleSaveList = async () => {
    if (!listNameInput.trim() || saving) return;
    setSaving(true);
    try {
      if (modalMode === 'create') {
        const selectedDate = new Date(`${plannedForInput}T12:00:00`);
        const plannedFor = (listTypeInput === 'weekly' ? startOfWeek(selectedDate) : selectedDate).toISOString();
        const created = await shoppingListsApi.create({
          name: listNameInput.trim(),
          type: listTypeInput,
          plannedFor,
        });
        // The backend also broadcasts shoppingList:updated to our own socket, so
        // dedupe by id to avoid the list showing up twice (local add + echo).
        setActiveLists((lists) => [created, ...lists.filter((list) => list.id !== created.id)]);
      } else if (modalMode === 'edit' && editingId) {
        const updated = await shoppingListsApi.update(editingId, { name: listNameInput.trim() });
        setActiveLists((lists) => lists.map((list) => (list.id === editingId ? updated : list)));
      }
      setIsModalOpen(false);
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Không lưu được danh sách.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await shoppingListsApi.remove(deleteConfirmId);
      setActiveLists((lists) => lists.filter((list) => list.id !== deleteConfirmId));
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Không xóa được danh sách.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const pagedActiveLists = useMemo(
    () =>
      activeLists.slice(
        (activePage - 1) * LISTS_PAGE_SIZE,
        activePage * LISTS_PAGE_SIZE,
      ),
    [activeLists, activePage],
  );
  const pagedCompletedLists = useMemo(
    () =>
      completedLists.slice(
        (completedPage - 1) * LISTS_PAGE_SIZE,
        completedPage * LISTS_PAGE_SIZE,
      ),
    [completedLists, completedPage],
  );

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container flex">
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
              <span className="font-bold text-primary text-sm">Danh sách mua sắm</span>
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
        <div className="max-w-7xl mx-auto w-full pb-[100px] md:pb-8">
        <div className="px-margin-mobile py-stack-md sticky top-0 bg-background/95 backdrop-blur-sm z-30">
          <h1 className="font-headline-md text-headline-md text-primary mb-2">Danh sách</h1>
          
          <div className="flex bg-surface-container-high rounded-lg p-1 w-full max-w-sm">
            <button onClick={() => setActiveTab('Đang mua')} aria-selected={activeTab === 'Đang mua'} className={`flex-1 py-2 font-label-sm text-label-sm font-semibold rounded-md shadow-sm transition-all ${activeTab === 'Đang mua' ? 'bg-surface text-primary' : 'text-on-surface-variant hover:text-on-surface shadow-none bg-transparent'}`}>
              Đang mua
            </button>
            <button onClick={() => setActiveTab('Đã mua')} aria-selected={activeTab === 'Đã mua'} className={`flex-1 py-2 font-label-sm text-label-sm font-semibold rounded-md shadow-sm transition-all ${activeTab === 'Đã mua' ? 'bg-surface text-primary' : 'text-on-surface-variant hover:text-on-surface shadow-none bg-transparent'}`}>
              Đã mua
            </button>
          </div>
        </div>

        {!loading && activeTab === 'Đang mua' && (
          <section className="px-margin-mobile mb-stack-md">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant">
                <div className="flex bg-surface-container-high rounded-lg p-1">
                  <button onClick={() => setScheduleMode('daily')} className={`px-4 py-2 rounded-md font-label-md ${scheduleMode === 'daily' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant'}`}>Theo ngày</button>
                  <button onClick={() => setScheduleMode('weekly')} className={`px-4 py-2 rounded-md font-label-md ${scheduleMode === 'weekly' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant'}`}>Theo tuần</button>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <button aria-label="Tuần trước" onClick={() => setCurrentWeekStart((date) => { const next = new Date(date); next.setDate(next.getDate() - 7); return next; })} className="p-2 rounded-full hover:bg-surface-container-high"><span className="material-symbols-outlined">chevron_left</span></button>
                  <span className="font-label-md text-on-surface min-w-48 text-center">
                    {weekDays[0].toLocaleDateString('vi-VN')} – {weekDays[6].toLocaleDateString('vi-VN')}
                  </span>
                  <button aria-label="Tuần sau" onClick={() => setCurrentWeekStart((date) => { const next = new Date(date); next.setDate(next.getDate() + 7); return next; })} className="p-2 rounded-full hover:bg-surface-container-high"><span className="material-symbols-outlined">chevron_right</span></button>
                </div>
              </div>

              {scheduleMode === 'daily' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
                  {weekDays.map((date) => {
                    const dayLists = activeLists.filter((list) => list.type !== 'weekly' && list.plannedFor && sameDay(new Date(list.plannedFor), date));
                    return (
                      <div key={date.toISOString()} className="min-h-48 p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-label-sm text-on-surface-variant">{date.toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
                            <p className={`font-headline-sm ${sameDay(date, new Date()) ? 'text-primary' : 'text-on-surface'}`}>{date.getDate()}</p>
                          </div>
                          <button aria-label="Thêm danh sách theo ngày" onClick={() => openCreateModal(date, 'daily')} className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center"><span className="material-symbols-outlined text-lg">add</span></button>
                        </div>
                        {dayLists.map((list) => (
                          <Link key={list.id} to={`/list-detail/${list.id}`} className="p-2 rounded-lg bg-surface-container-low border border-outline-variant hover:border-primary">
                            <p className="font-label-md text-on-surface font-semibold line-clamp-2">{list.name}</p>
                            <p className="font-label-sm text-on-surface-variant">{list.progress.bought}/{list.progress.total} đã mua</p>
                          </Link>
                        ))}
                        {dayLists.length === 0 && <p className="text-label-sm text-outline mt-auto">Chưa có danh sách</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 min-h-64">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-headline-sm text-on-surface">Danh sách của tuần</h2>
                      <p className="font-body-sm text-on-surface-variant">Bắt đầu từ {formatDate(currentWeekStart.toISOString())}</p>
                    </div>
                    <button onClick={() => openCreateModal(currentWeekStart, 'weekly')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary"><span className="material-symbols-outlined">add</span>Thêm vào tuần</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeLists.filter((list) => list.type === 'weekly' && list.plannedFor && sameDay(startOfWeek(new Date(list.plannedFor)), currentWeekStart)).map((list) => (
                      <Link key={list.id} to={`/list-detail/${list.id}`} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant hover:border-primary">
                        <h3 className="font-headline-sm text-on-surface">{list.name}</h3>
                        <p className="font-body-sm text-on-surface-variant mt-1">{list.progress.bought}/{list.progress.total} đã mua</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {loading ? (
          <div className="hidden px-margin-mobile grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
            <CardGridSkeleton count={6} />
          </div>
        ) : activeTab === 'Đang mua' ? (
          <div className="px-margin-mobile grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
            {activeLists.length > 0 ? (
              pagedActiveLists.map(list => (
                <Link key={list.id} to={`/list-detail/${list.id}`} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-4 flex flex-col relative overflow-hidden transition-shadow hover:shadow-md cursor-pointer group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary-container group-hover:bg-primary transition-colors"></div>
                  <div className="flex justify-between items-start mt-1 mb-3">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors pr-2">{list.name}</h3>
                    <div className="flex">
                      <button aria-label="Đổi tên" className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-low" onClick={(e) => { e.preventDefault(); openEditModal(list.id, list.name); }}>
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button aria-label="Xóa" className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-surface-container-low" onClick={(e) => { e.preventDefault(); setDeleteConfirmId(list.id); }}>
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-outline">calendar_today</span>
                      <span>{formatDate(list.plannedFor)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-outline">shopping_basket</span>
                      <span>{list.items.length} món đồ</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-3 border-t border-outline-variant flex justify-between items-center">
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-1 bg-surface-container-low text-primary rounded-full">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>progress_activity</span>
                      {list.items.length === 0 ? 'Trống' : 'Đang chuẩn bị'}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{list.progress.bought}/{list.progress.total} đã chọn</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16 text-on-surface-variant text-center">
                <span className="material-symbols-outlined text-6xl mb-4 text-outline">shopping_cart</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Chưa có danh sách nào</h3>
                <p className="font-body-md text-body-md mb-6">Tạo danh sách mới để bắt đầu mua sắm.</p>
              </div>
            )}

            <article onClick={() => openCreateModal()} className="hidden md:flex bg-surface-container-lowest rounded-2xl p-6 border border-dashed border-outline hover:border-primary hover:bg-primary-container/20 transition-all cursor-pointer flex-col items-center justify-center min-h-[200px] gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-primary">Tạo danh sách mới</span>
            </article>
            <div className="md:col-span-2 lg:col-span-3">
              <PaginationControls
                page={activePage}
                pageSize={LISTS_PAGE_SIZE}
                totalItems={activeLists.length}
                onPageChange={setActivePage}
              />
            </div>
          </div>
        ) : completedLists.length > 0 ? (
          <div className="px-margin-mobile grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
            {pagedCompletedLists.map(list => (
              <Link key={list.id} to={`/list-detail/${list.id}`} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-4 flex flex-col relative overflow-hidden transition-shadow hover:shadow-md cursor-pointer group opacity-90">
                <div className="absolute top-0 left-0 w-full h-1 bg-tertiary-container group-hover:bg-tertiary transition-colors"></div>
                <div className="flex justify-between items-start mt-1 mb-3">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface pr-2">{list.name}</h3>
                </div>
                <div className="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline">event_available</span>
                    <span>Hoàn thành: {formatDate(list.completedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline">shopping_basket</span>
                    <span>{list.items.length} món đồ</span>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-outline-variant flex justify-between items-center">
                  <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-1 bg-tertiary-container/40 text-tertiary rounded-full">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Đã hoàn thành
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{list.progress.bought}/{list.progress.total} đã mua</span>
                </div>
              </Link>
            ))}
            <div className="md:col-span-2 lg:col-span-3">
              <PaginationControls
                page={completedPage}
                pageSize={LISTS_PAGE_SIZE}
                totalItems={completedLists.length}
                onPageChange={setCompletedPage}
              />
            </div>
          </div>
        ) : (
          <div className="px-margin-mobile flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 text-outline">check_circle</span>
            <p className="font-body-lg text-body-lg">Bạn chưa có danh sách nào đã hoàn thành.</p>
          </div>
        )}
        </div>
      </main>

      <button className="md:hidden fixed bottom-[85px] right-margin-mobile z-40 bg-primary text-on-primary rounded-[16px] shadow-lg flex items-center gap-2 px-4 py-4 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group" onClick={() => openCreateModal()}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        <span className="font-label-sm text-label-sm font-semibold whitespace-nowrap pr-1">Tạo danh sách</span>
      </button>
      </div>

      <BottomNav />

      {/* Modal Tạo/Sửa Danh Sách */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-slide-up">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {modalMode === 'create' ? 'Tạo danh sách mới' : 'Đổi tên danh sách'}
            </h2>
            <input 
              autoFocus
              className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-on-surface"
              placeholder="Nhập tên danh sách..."
              value={listNameInput}
              onChange={(e) => setListNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveList(); }}
            />
            {modalMode === 'create' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col font-label-sm text-on-surface-variant gap-1">
                  Loại danh sách
                  <CustomSelect
                    value={listTypeInput}
                    onChange={(value) => {
                      const type = value as ShoppingListType;
                      setListTypeInput(type);
                      if (type === 'weekly') {
                        setPlannedForInput(toDateInput(startOfWeek(new Date(`${plannedForInput}T12:00:00`))));
                      }
                    }}
                    options={[
                      { value: 'daily', label: 'Theo ngày' },
                      { value: 'weekly', label: 'Theo tuần' }
                    ]}
                    className="w-full h-[48px] bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md"
                  />
                </label>
                <label className="flex flex-col font-label-sm text-on-surface-variant gap-1">
                  {listTypeInput === 'weekly' ? 'Tuần bắt đầu' : 'Ngày dự kiến'}
                  <CustomDatePicker
                    value={plannedForInput}
                    onChange={setPlannedForInput}
                    className="w-full h-[48px] bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md"
                  />
                </label>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-label-md text-primary hover:bg-primary/10 rounded-full transition-colors">Hủy</button>
              <button 
                onClick={handleSaveList} 
                disabled={!listNameInput.trim()}
                className={`px-4 py-2 font-label-md rounded-full transition-colors ${listNameInput.trim() ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-surface-container-high text-on-surface-variant opacity-50'}`}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-slide-up">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Xác nhận xóa</h2>
            <p className="font-body-md text-on-surface-variant">Bạn có chắc chắn muốn xóa danh sách này không? Tất cả các món đồ bên trong sẽ bị xóa và không thể khôi phục.</p>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 font-label-md text-primary hover:bg-primary/10 rounded-full transition-colors">Hủy</button>
              <button onClick={confirmDelete} className="px-4 py-2 font-label-md bg-error text-on-error hover:bg-error/90 rounded-full transition-colors">Xóa danh sách</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

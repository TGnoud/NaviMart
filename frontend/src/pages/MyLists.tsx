import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import NotificationDropdown from '../components/NotificationDropdown';
import SideNav from '../components/SideNav';
import { shoppingListsApi } from '../api';
import type { ShoppingList, ShoppingListType } from '../api';
import { onSocketEvent } from '../api/socket';
import { useDialog } from '../contexts/DialogContext';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';



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

function getFirstDayOfMonthIndex(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7; // 0 is Monday
}

function getMonthWeeks(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = getFirstDayOfMonthIndex(year, month);
  
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    currentWeek.push(new Date(year, month - 1, prevMonthDays - i));
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    currentWeek.push(new Date(year, month, i));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  if (currentWeek.length > 0) {
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(year, month + 1, nextMonthDay++));
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}

export default function MyLists() {
  const { showAlert } = useDialog();
  const [activeTab, setActiveTab] = useState<'Đang mua' | 'Đã mua'>('Đang mua');
  const [activeLists, setActiveLists] = useState<ShoppingList[]>([]);
  const [completedLists, setCompletedLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listNameInput, setListNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'weekly' | 'monthly'>('monthly');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [plannedForInput, setPlannedForInput] = useState(() => toDateInput(new Date()));
  const [listTypeInput, setListTypeInput] = useState<ShoppingListType>('daily');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceEndDateInput, setRecurrenceEndDateInput] = useState(() => toDateInput(new Date()));

  const currentWeekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
  
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + index);
      return date;
    }),
    [currentWeekStart],
  );

  const monthWeeks = useMemo(() => getMonthWeeks(currentDate), [currentDate]);

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

  const openCreateModal = (date = new Date(), type: ShoppingListType = scheduleMode === 'weekly' ? 'weekly' : 'daily') => {
    setListNameInput('');
    setListTypeInput(type);
    setPlannedForInput(toDateInput(type === 'weekly' ? startOfWeek(date) : date));
    setIsRecurring(false);
    
    const end = new Date(date);
    end.setMonth(end.getMonth() + 1);
    setRecurrenceEndDateInput(toDateInput(end));

    setIsModalOpen(true);
  };


  const handleSaveList = async () => {
    if (!listNameInput.trim() || saving) return;
    setSaving(true);
    try {
        const selectedDate = new Date(`${plannedForInput}T12:00:00`);
        const plannedFor = (listTypeInput === 'weekly' ? startOfWeek(selectedDate) : selectedDate).toISOString();
        
        let recurrenceEndDate: string | undefined = undefined;
        if (isRecurring && ['daily', 'weekly', 'monthly'].includes(listTypeInput)) {
            recurrenceEndDate = new Date(`${recurrenceEndDateInput}T12:00:00`).toISOString();
        }

        await shoppingListsApi.create({
          name: listNameInput.trim(),
          type: listTypeInput,
          plannedFor,
          recurrenceEndDate,
        });
        
        loadLists();
        setIsModalOpen(false);
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Không lưu được danh sách.');
    } finally {
      setSaving(false);
    }
  };


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

          {loading ? (
            <div className="px-margin-mobile">
              <div className="w-full h-96 bg-surface-container-lowest animate-pulse rounded-2xl"></div>
            </div>
          ) : (
            <section className="px-margin-mobile mb-stack-md">
              {activeTab === 'Đã mua' ? (
                <div className="flex flex-col gap-3">
                  {completedLists.map(list => (
                    <Link key={list.id} to={`/list-detail/${list.id}`} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center justify-between hover:bg-surface-container-low transition-colors shadow-sm">
                      <div className="flex flex-col">
                         <span className="font-label-lg font-bold text-on-surface mb-1">{list.name}</span>
                         <span className="font-body-md text-on-surface-variant text-sm">
                           {list.completedAt ? `Hoàn thành: ${new Date(list.completedAt).toLocaleDateString('vi-VN')}` : (list.plannedFor ? `Dự kiến: ${new Date(list.plannedFor).toLocaleDateString('vi-VN')}` : 'Không rõ ngày')}
                           {list.progress.total > 0 ? ` • ${list.progress.bought}/${list.progress.total} món` : ''}
                         </span>
                      </div>
                      <span className="material-symbols-outlined text-outline">chevron_right</span>
                    </Link>
                  ))}
                  {completedLists.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                      <span className="material-symbols-outlined text-6xl mb-4 text-outline">history</span>
                      <p className="font-body-lg text-body-lg">Chưa có danh sách nào hoàn thành.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col">
                {/* Calendar Header */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant">
                  <div className="flex bg-surface-container-high rounded-lg p-1">
                    <button onClick={() => setScheduleMode('weekly')} className={`px-4 py-2 rounded-md font-label-md transition-colors ${scheduleMode === 'weekly' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>Theo tuần</button>
                    <button onClick={() => setScheduleMode('monthly')} className={`px-4 py-2 rounded-md font-label-md transition-colors ${scheduleMode === 'monthly' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>Theo tháng</button>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <button aria-label="Trước" onClick={() => setCurrentDate((date) => { const next = new Date(date); scheduleMode === 'weekly' ? next.setDate(next.getDate() - 7) : next.setMonth(next.getMonth() - 1); return next; })} className="p-2 rounded-full hover:bg-surface-container-high active:bg-surface-container transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
                    <span className="font-label-md text-on-surface min-w-40 text-center font-bold">
                      {scheduleMode === 'weekly' 
                        ? `${weekDays[0].toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' })} – ${weekDays[6].toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' })}`
                        : `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`}
                    </span>
                    <button aria-label="Sau" onClick={() => setCurrentDate((date) => { const next = new Date(date); scheduleMode === 'weekly' ? next.setDate(next.getDate() + 7) : next.setMonth(next.getMonth() + 1); return next; })} className="p-2 rounded-full hover:bg-surface-container-high active:bg-surface-container transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
                    
                    {/* Nút Tạo danh sách trên header của lịch */}
                    <button onClick={() => openCreateModal(currentDate)} className="ml-2 px-4 py-2 bg-primary text-on-primary rounded-full font-label-md flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">add</span>
                      <span className="hidden sm:inline">Tạo danh sách</span>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-x-auto">
                  <div className="min-w-[700px] flex flex-col h-full">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-lowest">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                        <div key={day} className="py-2 text-center font-label-sm font-bold text-on-surface-variant border-r border-outline-variant last:border-r-0">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Weekly View Grid */}
                    {scheduleMode === 'weekly' && (
                      <div className="grid grid-cols-7 flex-1 min-h-[400px] divide-x divide-outline-variant">
                        {weekDays.map((date) => {
                          const displayLists = (activeTab === 'Đang mua' ? activeLists : completedLists).filter(l => l.plannedFor && sameDay(new Date(l.plannedFor), date));
                          const isToday = sameDay(date, new Date());
                          return (
                            <div key={date.toISOString()} className={`p-2 flex flex-col gap-1 hover:bg-surface-container-lowest/50 transition-colors ${isToday ? 'bg-primary/5' : ''}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full font-label-md ${isToday ? 'bg-primary text-on-primary' : 'text-on-surface'}`}>{date.getDate()}</span>
                              </div>
                              {displayLists.map(list => (
                                <Link key={list.id} to={`/list-detail/${list.id}`} className={`px-2 py-1.5 rounded-md text-xs font-medium truncate border transition-colors hover:opacity-80 ${activeTab === 'Đang mua' ? 'bg-primary-container text-on-primary-container border-primary/20' : 'bg-surface-container text-on-surface-variant border-outline-variant'}`}>
                                  {list.name}
                                </Link>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Monthly View Grid */}
                    {scheduleMode === 'monthly' && (
                      <div className="flex flex-col flex-1 divide-y divide-outline-variant">
                        {monthWeeks.map((week, wIdx) => (
                          <div key={wIdx} className="grid grid-cols-7 flex-1 min-h-[120px] divide-x divide-outline-variant">
                            {week.map((date, dIdx) => {
                              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                              const isToday = sameDay(date, new Date());
                              const displayLists = (activeTab === 'Đang mua' ? activeLists : completedLists).filter(l => l.plannedFor && sameDay(new Date(l.plannedFor), date));
                              
                              return (
                                <div key={dIdx} className={`p-1.5 flex flex-col gap-1 hover:bg-surface-container-lowest/50 transition-colors ${!isCurrentMonth ? 'bg-surface-container-lowest/30 opacity-50' : ''} ${isToday ? 'bg-primary/5' : ''}`}>
                                  <div className="flex justify-end mb-1">
                                    <span className={`w-7 h-7 flex items-center justify-center rounded-full font-label-sm ${isToday ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}>{date.getDate()}</span>
                                  </div>
                                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] hide-scrollbar">
                                    {displayLists.map(list => (
                                      <Link key={list.id} to={`/list-detail/${list.id}`} className={`px-1.5 py-1 rounded text-[11px] font-medium truncate border transition-colors hover:opacity-80 ${activeTab === 'Đang mua' ? 'bg-primary-container text-on-primary-container border-primary/20' : 'bg-surface-container text-on-surface-variant border-outline-variant'}`}>
                                        {list.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <button className="md:hidden fixed bottom-[85px] right-margin-mobile z-40 bg-primary text-on-primary rounded-[16px] shadow-lg flex items-center gap-2 px-4 py-4 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group" onClick={() => openCreateModal(currentDate)}>
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
              Tạo danh sách mới
            </h2>
            <input 
              autoFocus
              className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-on-surface"
              placeholder="Nhập tên danh sách..."
              value={listNameInput}
              onChange={(e) => setListNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveList(); }}
            />
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
                      { value: 'weekly', label: 'Theo tuần' },
                      { value: 'monthly', label: 'Theo tháng' }
                    ]}
                    className="w-full h-[48px] bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md"
                  />
                </label>
                <label className="flex flex-col font-label-sm text-on-surface-variant gap-1">
                  {listTypeInput === 'weekly' ? 'Tuần bắt đầu' : listTypeInput === 'monthly' ? 'Tháng bắt đầu' : 'Ngày dự kiến'}
                  <CustomDatePicker
                    value={plannedForInput}
                    onChange={setPlannedForInput}
                    className="w-full h-[48px] bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md"
                  />
                </label>
              </div>

              {['daily', 'weekly', 'monthly'].includes(listTypeInput) && (
                <div className="flex flex-col gap-2 mt-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                    />
                    <span className="font-label-md text-on-surface">Lặp lại định kỳ</span>
                  </label>
                  
                  {isRecurring && (
                    <div className="mt-2 pl-8 flex items-center gap-3">
                      <span className="font-label-sm text-on-surface-variant">Đến ngày:</span>
                      <CustomDatePicker
                        value={recurrenceEndDateInput}
                        onChange={setRecurrenceEndDateInput}
                        className="flex-1 h-[40px] bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md"
                      />
                    </div>
                  )}
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


    </div>
  );
}

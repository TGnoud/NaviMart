import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import NotificationDropdown from '../components/NotificationDropdown';
import SideNav from '../components/SideNav';
import { ListRowsSkeleton } from '../components/Skeleton';
import { useDialog } from '../contexts/DialogContext';
import { mealsApi, recipesApi } from '../api';
import { onSocketEvent } from '../api/socket';
import type { MealPlan, MealSession as MealSessionType, RecipeSuggestion } from '../api';

interface SessionDef {
  id: string;
  session: MealSessionType;
  customSessionName?: string;
  title: string;
  icon: string;
  colorClass: string;
  isMain: boolean;
}

const MAIN_SESSIONS: SessionDef[] = [
  { id: 'breakfast', session: 'breakfast', title: 'Bữa sáng', icon: 'wb_twilight', colorClass: 'text-primary', isMain: true },
  { id: 'lunch', session: 'lunch', title: 'Bữa trưa', icon: 'light_mode', colorClass: 'text-secondary', isMain: true },
  { id: 'dinner', session: 'dinner', title: 'Bữa tối', icon: 'bedtime', colorClass: 'text-tertiary', isMain: true },
  { id: 'snack', session: 'snack', title: 'Bữa phụ', icon: 'cookie', colorClass: 'text-on-surface-variant', isMain: true },
];

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7; // Monday = 0
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function MealPlanner() {
  const { showConfirm, showAlert } = useDialog();
  const navigate = useNavigate();

  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        return date;
      }),
    [weekStart],
  );
  const [activeDay, setActiveDay] = useState(() => (new Date().getDay() + 6) % 7);

  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [extraSessions, setExtraSessions] = useState<SessionDef[]>([]);

  // Modal states for Meals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [targetSession, setTargetSession] = useState<SessionDef>(MAIN_SESSIONS[0]);
  const [formData, setFormData] = useState({ name: '', servings: '1' });

  // Modal states for New Session
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  // Suggestion Modal states
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      showAlert(err instanceof Error ? err.message : fallback);
    },
    [showAlert],
  );

  const loadMeals = useCallback(async () => {
    setLoading(true);
    try {
      const endOfWeek = new Date(weekStart);
      endOfWeek.setDate(weekStart.getDate() + 7);
      // meal.recipeName is populated server-side in one batched query
      setMeals(await mealsApi.list(weekStart.toISOString(), endOfWeek.toISOString()));
    } catch (err) {
      handleError(err, 'Không tải được lịch trình bữa ăn.');
    } finally {
      setLoading(false);
    }
  }, [weekStart, handleError]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // A meal "waiting" on a shortfall list turns green once that list is bought,
  // so refresh meals whenever any shopping list changes (e.g. gets completed).
  useEffect(() => {
    const off = onSocketEvent('shoppingList:updated', () => loadMeals());
    return () => off();
  }, [loadMeals]);

  const selectedDate = weekDays[activeDay];
  const dayMeals = meals.filter((meal) => sameDay(new Date(meal.date), selectedDate));

  const customSessionNames = Array.from(
    new Set(
      dayMeals
        .filter((meal) => meal.session === 'custom' && meal.customSessionName)
        .map((meal) => meal.customSessionName!),
    ),
  );
  const sessions: SessionDef[] = [
    ...MAIN_SESSIONS,
    ...customSessionNames.map((name) => ({
      id: `custom-${name}`,
      session: 'custom' as MealSessionType,
      customSessionName: name,
      title: name,
      icon: 'restaurant',
      colorClass: 'text-on-surface',
      isMain: false,
    })),
    ...extraSessions.filter((extra) => !customSessionNames.includes(extra.customSessionName!)),
  ];

  const mealName = (meal: MealPlan) =>
    meal.customName ?? meal.recipeName ?? 'Món ăn';

  const mealsOfSession = (session: SessionDef) =>
    dayMeals.filter((meal) =>
      session.session === 'custom'
        ? meal.session === 'custom' && meal.customSessionName === session.customSessionName
        : meal.session === session.session,
    );

  const toggleMeal = async (meal: MealPlan) => {
    try {
      const updated = await mealsApi.update(meal.id, { isCompleted: !meal.isCompleted });
      setMeals((items) => items.map((m) => (m.id === meal.id ? updated : m)));
      // Completing a meal deducts ingredients from the pantry. If stock didn't
      // cover everything, the backend creates a shopping list for the shortfall.
      const completion = updated.completion;
      if (completion && completion.shortages.length > 0) {
        const lines = completion.shortages
          .map((s) => `• ${s.name}: thiếu ${s.missingQuantity} ${s.unit}`)
          .join('\n');
        showAlert(
          `Đã hoàn thành món và trừ nguyên liệu trong kho.\n\nMột số nguyên liệu không đủ:\n${lines}\n\nĐã tạo danh sách đi chợ "${completion.shoppingListName ?? 'Còn thiếu'}" cho phần còn thiếu.`,
        );
      }
    } catch (err) {
      handleError(err, 'Không cập nhật được món ăn.');
    }
  };

  const deleteMeal = (meal: MealPlan) => {
    showConfirm('Bạn có chắc chắn muốn xóa món ăn này khỏi lịch trình?', async () => {
      try {
        await mealsApi.remove(meal.id);
        setMeals((items) => items.filter((m) => m.id !== meal.id));
      } catch (err) {
        handleError(err, 'Không xóa được món ăn.');
      }
    });
  };

  const openAddModal = (session: SessionDef) => {
    setEditingMeal(null);
    setTargetSession(session);
    setFormData({ name: '', servings: '1' });
    setIsModalOpen(true);
  };

  const openEditModal = (meal: MealPlan, session: SessionDef) => {
    setEditingMeal(meal);
    setTargetSession(session);
    setFormData({ name: mealName(meal), servings: String(meal.servings) });
    setIsModalOpen(true);
  };

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const servings = Math.max(1, parseInt(formData.servings) || 1);
    try {
      if (editingMeal) {
        const updated = await mealsApi.update(editingMeal.id, {
          customName: formData.name.trim(),
          servings,
        });
        setMeals((items) => items.map((m) => (m.id === editingMeal.id ? updated : m)));
      } else {
        const created = await mealsApi.create({
          date: selectedDate.toISOString(),
          session: targetSession.session,
          customSessionName: targetSession.customSessionName,
          customName: formData.name.trim(),
          servings,
        });
        setMeals((items) => [...items, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      handleError(err, 'Không lưu được món ăn.');
    }
  };

  // Add Session logic — the section appears immediately; it persists once a meal is added to it.
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSessionName.trim();
    if (!name) return;
    setExtraSessions((sessionsList) => [
      ...sessionsList,
      {
        id: `custom-${name}`,
        session: 'custom',
        customSessionName: name,
        title: name,
        icon: 'restaurant',
        colorClass: 'text-on-surface',
        isMain: false,
      },
    ]);
    setNewSessionName('');
    setIsSessionModalOpen(false);
  };

  const handleDeleteSession = (session: SessionDef) => {
    showConfirm('Xóa bữa ăn này sẽ xóa toàn bộ món ăn bên trong. Bạn chắc chắn chứ?', async () => {
      try {
        await Promise.all(mealsOfSession(session).map((meal) => mealsApi.remove(meal.id)));
        setMeals((items) =>
          items.filter(
            (meal) =>
              !(
                meal.session === 'custom' &&
                meal.customSessionName === session.customSessionName &&
                sameDay(new Date(meal.date), selectedDate)
              ),
          ),
        );
        setExtraSessions((sessionsList) =>
          sessionsList.filter((extra) => extra.id !== session.id),
        );
      } catch (err) {
        handleError(err, 'Không xóa được bữa ăn.');
      }
    });
  };

  // Suggestion logic — recipes ranked by how many ingredients are already in the pantry.
  const openSuggestModal = async (session: SessionDef) => {
    setTargetSession(session);
    try {
      const data = await recipesApi.suggestions({ limit: 10, prioritizeExpiring: true });
      if (data.length === 0) {
        showAlert('Chưa có gợi ý phù hợp. Hãy thêm thực phẩm vào tủ lạnh hoặc thêm công thức.');
        return;
      }
      setSuggestions(data);
      setSuggestionIndex(0);
      setIsSuggestModalOpen(true);
    } catch (err) {
      handleError(err, 'Không tải được gợi ý món ăn.');
    }
  };

  const pickNextSuggestion = () => {
    setSuggestionIndex((index) => (index + 1) % suggestions.length);
  };

  const acceptSuggestion = async () => {
    const suggestion = suggestions[suggestionIndex];
    if (!suggestion) return;
    try {
      const created = await mealsApi.create({
        date: selectedDate.toISOString(),
        session: targetSession.session,
        customSessionName: targetSession.customSessionName,
        recipeId: suggestion.recipe.id,
        customName: suggestion.recipe.name,
        servings: suggestion.recipe.servings,
      });
      setMeals((items) => [...items, created]);
      setIsSuggestModalOpen(false);
    } catch (err) {
      handleError(err, 'Không thêm được món ăn.');
    }
  };

  const currentSuggestion = suggestions[suggestionIndex];

  const renderMealSection = (session: SessionDef) => {
    const sectionMeals = mealsOfSession(session);

    return (
      <section key={session.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col group transition-shadow mb-6">
        <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined ${session.colorClass}`}>{session.icon}</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{session.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            {!session.isMain && (
              <button
                onClick={() => handleDeleteSession(session)}
                className="text-error hover:bg-error-container p-1.5 rounded-full transition-colors"
                title="Xóa bữa ăn này"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            )}
            <button
              onClick={() => openAddModal(session)}
              className="text-primary hover:bg-primary-container hover:text-on-primary-container p-1.5 rounded-full transition-colors"
              title="Thêm món ăn"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        {sectionMeals.length > 0 ? (
          sectionMeals.map((meal, index) => (
            <div key={meal.id} className={`p-4 flex items-center gap-3 md:gap-4 ${index !== sectionMeals.length - 1 ? 'border-b border-outline-variant/50' : ''}`}>
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-outline">restaurant</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-body-lg text-body-lg text-on-surface font-semibold truncate">{mealName(meal)}</h4>
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">group</span> {meal.servings} khẩu phần
                  {meal.recipeId && (
                    <button
                      onClick={() => navigate(`/recipe-detail/${meal.recipeId}`)}
                      className="ml-2 text-primary hover:underline"
                    >
                      Xem công thức
                    </button>
                  )}
                </p>
                {meal.isCompleted && meal.awaitingIngredients && (
                  <span className="inline-flex items-center gap-1 mt-1 font-label-sm text-label-sm text-on-secondary-container bg-secondary-container/30 px-2 py-0.5 rounded-full w-fit">
                    <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                    Chờ mua đủ nguyên liệu
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleMeal(meal)}
                  title={
                    meal.isCompleted
                      ? meal.awaitingIngredients
                        ? 'Đang chờ mua đủ nguyên liệu'
                        : 'Đã hoàn thành'
                      : 'Đánh dấu hoàn thành'
                  }
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    meal.isCompleted
                      ? meal.awaitingIngredients
                        ? 'bg-secondary-container border-secondary-container text-on-secondary-container'
                        : 'bg-primary border-primary text-on-primary'
                      : 'border-outline text-primary hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] transition-all ${meal.isCompleted ? 'scale-100 opacity-100' : 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}>
                    {meal.isCompleted && meal.awaitingIngredients ? 'hourglass_top' : 'check'}
                  </span>
                </button>
                <button
                  onClick={() => openEditModal(meal, session)}
                  className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors flex"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => deleteMeal(meal)}
                  className="text-on-surface-variant hover:text-error hover:bg-error-container p-2 -mr-2 rounded-full transition-colors flex"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">restaurant_menu</span>
            <p className="font-body-md text-center">Chưa có món ăn nào.</p>
            <button
              onClick={() => openAddModal(session)}
              className="mt-2 text-primary font-label-md hover:underline"
            >
              Thêm món ăn
            </button>
          </div>
        )}

        <button
          onClick={() => openSuggestModal(session)}
          className="w-[calc(100%-2rem)] p-3 flex items-center justify-center border-2 border-dashed border-outline-variant mx-4 mb-4 mt-2 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-primary"
        >
          <div className="flex items-center gap-2 font-label-md font-medium"><span className="material-symbols-outlined text-[18px]">auto_awesome</span> Gợi ý món ăn từ tủ lạnh</div>
        </button>
      </section>
    );
  };

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden font-body-md antialiased flex flex-col md:flex-row">
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
              <span className="font-bold text-primary text-sm">Lịch trình bữa ăn</span>
            </div>
            <div className="flex gap-4">
              <NotificationDropdown />
              <Link to="/profile" className="text-on-surface-variant font-medium hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80 active:scale-95 duration-150">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
            </div>
          </div>
        </header>
        <header className="shrink-0 bg-surface border-b border-outline-variant md:border-none md:bg-transparent md:pt-8 md:px-8 px-margin-mobile py-4 flex flex-col gap-4 z-30">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <h1 className="font-headline-md text-headline-md text-primary mb-2">Lịch trình bữa ăn</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/recipe-suggestion" aria-label="Tìm kiếm món ăn" className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">search</span>
              </Link>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory hide-scrollbar -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`snap-center shrink-0 w-14 h-20 rounded-full flex flex-col items-center justify-center gap-1 transition-all ${activeDay === idx ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
              >
                <span className={`font-label-sm text-label-sm ${activeDay === idx ? 'opacity-80' : ''}`}>{day}</span>
                <span className="font-headline-sm text-headline-sm font-bold">{weekDays[idx].getDate()}</span>
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full">
          <div className="px-margin-mobile md:px-8 py-stack-md flex flex-col max-w-5xl mx-auto pb-[100px] md:pb-8">
            {loading ? (
              <ListRowsSkeleton count={6} />
            ) : (
              <>
                {sessions.map(session => renderMealSection(session))}

                {/* Thêm bữa ăn mới */}
                <button
                  onClick={() => setIsSessionModalOpen(true)}
                  className="mt-2 w-full py-4 border-2 border-dashed border-primary/40 rounded-2xl text-primary font-headline-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add_box</span>
                  Thêm bữa ăn
                </button>
              </>
            )}
          </div>
        </main>

        {/* Add/Edit Meal Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  {editingMeal ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveMeal}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block font-label-md text-on-surface mb-1">Tên món ăn</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Nhập tên món ăn..."
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-1">Khẩu phần (người ăn)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.servings}
                      onChange={e => setFormData({...formData, servings: e.target.value})}
                      placeholder="Ví dụ: 2"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg font-label-md font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg font-label-md font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Session Modal */}
        {isSessionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Tạo bữa ăn mới</h2>
                <button onClick={() => setIsSessionModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveSession}>
                <div className="mb-6">
                  <label className="block font-label-md text-on-surface mb-1">Tên bữa ăn</label>
                  <input
                    type="text"
                    required
                    value={newSessionName}
                    onChange={e => setNewSessionName(e.target.value)}
                    placeholder="VD: Ăn xế, Ăn đêm..."
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSessionModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg font-label-md font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg font-label-md font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Tạo mới
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Suggestion Modal */}
        {isSuggestModalOpen && currentSuggestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-xl border border-outline-variant/30 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-primary/10 -z-10"></div>

              <div className="flex justify-end mb-2">
                <button onClick={() => setIsSuggestModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors -mr-2 -mt-2">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="mb-2">
                <span className="material-symbols-outlined text-5xl text-primary mb-2">auto_awesome</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Hôm nay ăn gì?</h2>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm my-6">
                <div className="h-40 w-full bg-surface-variant flex items-center justify-center">
                  {currentSuggestion.recipe.imageUrl ? (
                    <img src={currentSuggestion.recipe.imageUrl} alt={currentSuggestion.recipe.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-outline">restaurant</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">{currentSuggestion.recipe.name}</h3>
                  <p className="font-body-md flex items-center justify-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">kitchen</span>
                    Có sẵn {currentSuggestion.availableCount}/{currentSuggestion.totalCount} nguyên liệu
                  </p>
                  {currentSuggestion.missingIngredients.length > 0 && (
                    <p className="font-label-sm text-label-sm text-secondary mt-1">
                      Thiếu: {currentSuggestion.missingIngredients.slice(0, 4).join(', ')}
                      {currentSuggestion.missingIngredients.length > 4 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={pickNextSuggestion}
                  className="flex-1 py-3 rounded-xl font-label-md font-bold text-on-surface border border-outline-variant hover:bg-surface-container-low transition-colors"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={acceptSuggestion}
                  className="flex-1 py-3 rounded-xl font-label-md font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-sm"
                >
                  Thêm món này
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}

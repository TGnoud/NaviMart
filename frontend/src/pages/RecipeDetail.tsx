import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import NotificationDropdown from '../components/NotificationDropdown';
import { ListRowsSkeleton, Skeleton } from '../components/Skeleton';
import { useDialog } from '../contexts/DialogContext';
import { useAuth } from '../contexts/AuthContext';
import { mealsApi, recipesApi } from '../api';
import type { MealSession, MissingIngredientsReport, RecipeDetail as Recipe } from '../api';

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

const SESSION_OPTIONS: { value: MealSession; label: string }[] = [
  { value: 'breakfast', label: 'Bữa sáng' },
  { value: 'lunch', label: 'Bữa trưa' },
  { value: 'dinner', label: 'Bữa tối' },
  { value: 'snack', label: 'Bữa phụ' },
];

const todayInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export default function RecipeDetail() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { showAlert } = useDialog();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [missing, setMissing] = useState<MissingIngredientsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [servings, setServings] = useState(0);
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealDate, setMealDate] = useState(todayInputValue);
  const [mealSession, setMealSession] = useState<MealSession>('dinner');
  const [mealServings, setMealServings] = useState(1);
  
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [slName, setSlName] = useState('');
  const [slDate, setSlDate] = useState(todayInputValue());
  const [slScheduleMode, setSlScheduleMode] = useState('one_time');
  const [slStartDate, setSlStartDate] = useState(todayInputValue());
  const [slEndDate, setSlEndDate] = useState('');
  
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      showAlert(err instanceof Error ? err.message : fallback);
    },
    [showAlert],
  );

  useEffect(() => {
    if (!recipeId) return;
    let cancelled = false;
    recipesApi
      .get(recipeId)
      .then((recipeData) => {
        if (cancelled) return;
        setRecipe(recipeData);
        setIsFavorite(recipeData.isFavorite ?? false);
        setServings(recipeData.servings || 1);
      })
      .catch((err) => handleError(err, 'Không tải được công thức.'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId, handleError]);

  // Recompute missing ingredients whenever the chosen servings change so the
  // "to buy" quantities always reflect the portion the user wants to cook.
  useEffect(() => {
    if (!recipeId || servings <= 0) return;
    let cancelled = false;
    recipesApi
      .missingIngredients(recipeId, servings)
      .then((data) => {
        if (!cancelled) setMissing(data);
      })
      .catch(() => {
        if (!cancelled) setMissing(null);
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId, servings]);

  const toggleFavorite = async () => {
    if (!recipeId) return;
    try {
      if (isFavorite) {
        await recipesApi.removeFavorite(recipeId);
      } else {
        await recipesApi.addFavorite(recipeId);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      handleError(err, 'Không cập nhật được yêu thích.');
    }
  };

  const missingLines = missing?.missingIngredients ?? [];

  const openShoppingListModal = () => {
    if (missingLines.length === 0) {
      showAlert('Bạn đã có đủ nguyên liệu cho món này!');
      return;
    }
    setSlName(`Nguyên liệu cho ${recipe?.name || 'món ăn'}`);
    setSlDate(todayInputValue());
    setSlScheduleMode('one_time');
    setSlStartDate(todayInputValue());
    setSlEndDate('');
    setShowShoppingListModal(true);
  };

  const addMissingToShoppingList = async () => {
    if (!recipeId || working) return;
    if (missingLines.length === 0) {
      showAlert('Bạn đã có đủ nguyên liệu cho món này!');
      return;
    }
    
    if (slScheduleMode !== 'one_time' && (!slStartDate || !slEndDate || new Date(slStartDate) > new Date(slEndDate))) {
      showAlert('Khoảng thời gian lặp lại không hợp lệ.');
      return;
    }
    
    setWorking(true);
    try {
      const payload: any = {
        name: slName,
        servings,
        type: slScheduleMode === 'one_time' ? 'custom' : slScheduleMode,
        plannedFor: slScheduleMode === 'one_time' ? new Date(slDate).toISOString() : new Date(slStartDate).toISOString(),
      };
      
      if (slScheduleMode !== 'one_time') {
        payload.recurrenceEndDate = new Date(slEndDate).toISOString();
      }
      
      const { shoppingList } = await recipesApi.generateShoppingList(recipeId, payload);
      showAlert(`Đã tạo danh sách "${shoppingList.name}" với ${shoppingList.items?.length || 0} nguyên liệu còn thiếu!`);
      setShowShoppingListModal(false);
      navigate(slScheduleMode === 'one_time' ? `/list-detail/${shoppingList.id}` : '/lists');
    } catch (err) {
      handleError(err, 'Không tạo được danh sách mua sắm.');
    } finally {
      setWorking(false);
    }
  };

  const openMealModal = () => {
    setMealDate(todayInputValue());
    setMealSession('dinner');
    setMealServings(servings || recipe?.servings || 1);
    setShowMealModal(true);
  };

  // Scale a base-recipe quantity to the currently selected servings.
  const baseServings = recipe?.servings || 1;
  const scaleQty = (quantity: number) => {
    const scaled = (quantity * (servings || baseServings)) / baseServings;
    return Number(scaled.toFixed(2));
  };

  const addToMealPlan = async () => {
    if (!recipe || working) return;
    setWorking(true);
    try {
      await mealsApi.create({
        date: new Date(`${mealDate}T00:00:00`).toISOString(),
        session: mealSession,
        recipeId: recipe.id,
        customName: recipe.name,
        servings: mealServings,
      });
      const sessionLabel = SESSION_OPTIONS.find((s) => s.value === mealSession)?.label ?? 'bữa ăn';
      setShowMealModal(false);
      showAlert(`Đã thêm món ăn vào ${sessionLabel.toLowerCase()} ngày ${mealDate}!`);
      navigate('/meals');
    } catch (err) {
      handleError(err, 'Không thêm được vào lịch trình.');
    } finally {
      setWorking(false);
    }
  };

  const missingLineOf = (name: string) =>
    missing?.ingredients.find(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    );

  const availabilityOf = (name: string) => {
    const line = missingLineOf(name);
    return line ? !line.isMissing : true;
  };

  // Drop trailing zeros so "2.00 qua" reads as "2 qua".
  const fmtQty = (value: number) => Number(value.toFixed(2)).toString();
  
  const toggleStep = (index: number) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(index)) newChecked.delete(index);
    else newChecked.add(index);
    setCheckedSteps(newChecked);
  };

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden antialiased flex">
      <SideNav />

      <div className="flex-1 flex flex-col md:ml-64 w-full h-full relative">
        <header className="md:hidden shrink-0 w-full z-50 flex justify-between items-center px-margin-mobile h-nav-height bg-surface dark:bg-surface-dim text-primary dark:text-primary-fixed-dim border-b border-outline-variant dark:border-outline">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-container-high transition-colors active:opacity-80">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed truncate">Chi tiết công thức</h1>
          <div className="flex gap-2">
            <button onClick={toggleFavorite} className="p-2 -mr-2 rounded-full hover:bg-surface-container-high transition-colors active:opacity-80">
              <span className={`material-symbols-outlined ${isFavorite ? 'text-amber-500' : 'text-on-surface-variant'}`} style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                star
              </span>
            </button>
          </div>
        </header>

        <header className="hidden md:flex bg-surface dark:bg-surface-dim border-b border-outline-variant w-full shrink-0 z-30">
          <div className="flex justify-between items-center w-full h-nav-height px-margin-mobile max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors flex items-center">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <span className="text-sm">/</span>
              <span className="font-bold text-primary text-sm">Chi tiết công thức</span>
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
          {loading ? (
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">
              <Skeleton className="w-full h-64 md:h-96" />
              <Skeleton className="h-10 w-2/3" />
              <ListRowsSkeleton count={4} />
            </div>
          ) : !recipe ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 text-outline">error</span>
              <p className="font-body-lg text-body-lg">Không tìm thấy công thức.</p>
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-[100px] md:pb-8">
              <section className="space-y-6">
                <div className="relative w-full h-[50vh] md:h-[60vh] rounded-3xl overflow-hidden shadow-sm bg-surface-container">
                  {recipe.imageUrl ? (
                    <img alt={recipe.name} className="object-cover w-full h-full" src={recipe.imageUrl}/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-8xl text-outline">restaurant</span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 backdrop-blur-md bg-opacity-90">
                        <span className="material-symbols-outlined text-[16px]">eco</span> {tag}
                      </span>
                    ))}
                    <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 backdrop-blur-md bg-opacity-90">
                      <span className="material-symbols-outlined text-[16px]">timer</span> {recipe.cookTimeMinutes} Phút
                    </span>
                  </div>
                  <button
                    onClick={toggleFavorite}
                    className="hidden md:flex absolute top-4 right-4 w-11 h-11 items-center justify-center rounded-full bg-surface/90 backdrop-blur-sm shadow-sm hover:bg-surface transition-colors"
                  >
                    <span className={`material-symbols-outlined ${isFavorite ? 'text-amber-500' : 'text-on-surface-variant'}`} style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      star
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h1 className="font-display-lg text-display-lg text-on-surface">{recipe.name}</h1>
                    {(recipe.authorId === user?.id || user?.role === 'admin') && (
                      <button
                        onClick={() => navigate(`/recipe-editor/${recipe.id}`)}
                        className="shrink-0 flex items-center gap-1.5 bg-surface-container-high text-on-surface font-label-md px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                        Sửa
                      </button>
                    )}
                  </div>
                  {recipe.description && (
                    <p className="font-body-md text-body-md text-on-surface-variant">{recipe.description}</p>
                  )}
                  <div className="flex flex-wrap gap-6 text-on-surface-variant font-body-md text-body-md">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary-container">star</span>
                      <span>{recipe.favoritesCount ?? 0} lượt yêu thích</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">restaurant</span>
                      <span>Độ khó: {DIFFICULTY_LABELS[recipe.difficulty]}</span>
                    </div>
                    {recipe.nutrition?.calories != null && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">local_fire_department</span>
                        <span>{recipe.nutrition.calories} kcal</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-low">
                    <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">kitchen</span>
                      Nguyên liệu
                    </h2>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Khẩu phần</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setServings((s) => Math.max(1, s - 1))}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors"
                          aria-label="Giảm khẩu phần"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={servings}
                          onChange={(e) => setServings(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                          className="w-12 text-center font-bold text-on-surface bg-transparent outline-none focus:bg-surface-container-high rounded-md py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setServings((s) => s + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors"
                          aria-label="Tăng khẩu phần"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                        <span className="font-label-sm text-label-sm text-on-surface-variant ml-1">người</span>
                      </div>
                    </div>
                    <ul className="space-y-4 font-body-md text-body-md">
                      {recipe.ingredients.map((ingredient) => {
                        const available = availabilityOf(ingredient.name);
                        const line = missingLineOf(ingredient.name);
                        const requiredQty = line ? line.requiredQuantity : scaleQty(ingredient.quantity);
                        return (
                          <li
                            key={`${ingredient.name}-${ingredient.unit}`}
                            className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start sm:items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${available ? 'bg-tertiary-container/30 text-tertiary' : 'bg-error-container/30 text-error'}`}>
                                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {available ? 'check_circle' : 'error'}
                                </span>
                              </div>
                              <div>
                                <p className="font-headline-sm text-headline-sm text-on-surface">
                                  {ingredient.name}
                                  {ingredient.optional && <span className="text-on-surface-variant font-body-sm font-normal ml-1">(tùy chọn)</span>}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                                  <span className="font-body-md text-on-surface-variant">
                                    Cần: <strong className="text-on-surface">{fmtQty(requiredQty)} {ingredient.unit}</strong>
                                  </span>
                                  {line && (
                                     <span className="font-label-sm px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant w-fit">
                                       Trong kho: {fmtQty(line.availableQuantity)}
                                     </span>
                                  )}
                                </div>
                                {line && line.missingQuantity > 0 && (
                                  <p className="font-label-sm text-error mt-1.5 flex items-center gap-1 bg-error-container/20 w-fit px-2 py-0.5 rounded-md">
                                    <span className="material-symbols-outlined text-[14px]">warning</span>
                                    Thiếu {fmtQty(line.missingQuantity)} {ingredient.unit}
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      onClick={openShoppingListModal}
                      disabled={working}
                      className="w-full mt-6 bg-primary text-on-primary py-3 px-4 rounded-lg font-body-md text-body-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">add_shopping_cart</span>
                      {missingLines.length > 0
                        ? `Thêm ${missingLines.length} nguyên liệu thiếu vào danh sách đi chợ`
                        : 'Đã đủ nguyên liệu trong tủ lạnh'}
                    </button>
                    <button
                      onClick={openMealModal}
                      disabled={working}
                      className="w-full mt-3 bg-secondary-container text-on-secondary-container py-3 px-4 rounded-lg font-body-md text-body-md flex items-center justify-center gap-2 hover:bg-secondary hover:text-on-secondary transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">calendar_today</span>
                      Thêm vào lịch trình bữa ăn
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-low">
                    <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">menu_book</span>
                      Các bước thực hiện
                    </h2>
                    {recipe.steps.length === 0 ? (
                      <p className="font-body-md text-on-surface-variant">Công thức chưa có hướng dẫn chi tiết.</p>
                    ) : (
                      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:ml-[1.75rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-outline-variant/50">
                        {recipe.steps.map((step, index) => {
                          const isChecked = checkedSteps.has(index);
                          return (
                            <div 
                              key={index} 
                              className="relative flex items-start gap-4 md:gap-6 cursor-pointer group"
                              onClick={() => toggleStep(index)}
                            >
                              <div className={`relative z-10 w-12 h-12 flex items-center justify-center font-headline-sm rounded-full shrink-0 ring-4 ring-surface-container-lowest transition-all duration-300 ${isChecked ? 'bg-tertiary text-on-tertiary scale-95' : 'bg-surface-container-high text-on-surface group-hover:bg-primary-container group-hover:text-on-primary-container'}`}>
                                {isChecked ? <span className="material-symbols-outlined font-bold">check</span> : index + 1}
                              </div>
                              <div className={`flex-1 p-5 rounded-2xl border transition-all duration-300 ${isChecked ? 'bg-surface-container-lowest border-outline-variant opacity-60' : 'bg-surface-container-low border-transparent hover:shadow-md hover:border-outline-variant/30'}`}>
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className={`font-headline-sm text-headline-sm transition-colors ${isChecked ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>Bước {index + 1}</h3>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-tertiary border-tertiary' : 'border-outline-variant'}`}>
                                    {isChecked && <span className="material-symbols-outlined text-on-tertiary text-[16px] font-bold">check</span>}
                                  </div>
                                </div>
                                <p className={`font-body-md text-body-md leading-relaxed transition-colors ${isChecked ? 'text-on-surface-variant' : 'text-on-surface'}`}>{step}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showMealModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl border border-outline-variant/30 animate-in zoom-in-95 duration-200">
            <h3 className="font-headline-sm text-on-surface font-bold mb-1">Thêm vào lịch trình</h3>
            <p className="font-body-md text-on-surface-variant mb-4">{recipe?.name}</p>

            <label className="block font-label-md text-on-surface-variant mb-1">Ngày</label>
            <input
              type="date"
              value={mealDate}
              onChange={(e) => setMealDate(e.target.value)}
              className="w-full mb-4 px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface outline-none focus:border-primary"
            />

            <label className="block font-label-md text-on-surface-variant mb-1">Bữa ăn</label>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {SESSION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMealSession(opt.value)}
                  className={`py-2.5 rounded-xl font-label-md font-bold border transition-colors ${
                    mealSession === opt.value
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <label className="block font-label-md text-on-surface-variant mb-1">Khẩu phần</label>
            <div className="flex items-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMealServings((s) => Math.max(1, s - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <div className="relative flex-1 min-w-0">
                <input
                  type="number"
                  min={1}
                  value={mealServings}
                  onChange={(e) => setMealServings(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                  className="w-full pl-3 pr-12 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-center font-bold outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body-md text-on-surface-variant pointer-events-none">phần</span>
              </div>
              <button
                type="button"
                onClick={() => setMealServings((s) => s + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMealModal(false)}
                disabled={working}
                className="flex-1 border border-outline-variant text-on-surface-variant font-label-md py-3 rounded-xl hover:bg-surface-container-low transition-colors font-bold disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={addToMealPlan}
                disabled={working || !mealDate}
                className="flex-1 bg-primary text-on-primary font-label-md py-3 rounded-xl hover:opacity-90 transition-opacity font-bold shadow-sm disabled:opacity-50"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {showShoppingListModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-slide-up">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Tạo danh sách đi chợ</h2>
            
            <div className="flex flex-col gap-3">
              <label className="flex flex-col font-label-sm text-on-surface-variant gap-1">
                Tên danh sách
                <input
                  type="text"
                  value={slName}
                  onChange={(e) => setSlName(e.target.value)}
                  className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md"
                  placeholder="Ví dụ: Nguyên liệu Canh chua..."
                />
              </label>

              <label className="flex flex-col font-label-sm text-on-surface-variant gap-1">
                Lặp lại định kỳ
                <select
                  value={slScheduleMode}
                  onChange={(e) => setSlScheduleMode(e.target.value)}
                  className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md"
                >
                  <option value="one_time">Không lặp lại</option>
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                </select>
              </label>

              {slScheduleMode === 'one_time' ? (
                <label className="flex flex-col font-label-sm text-on-surface-variant gap-1">
                  Ngày đi chợ
                  <input
                    type="date"
                    value={slDate}
                    onChange={(e) => setSlDate(e.target.value)}
                    className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md"
                  />
                </label>
              ) : (
                <>
                  <label className="flex flex-col font-label-sm text-on-surface-variant gap-1">
                    Bắt đầu từ ngày
                    <input
                      type="date"
                      value={slStartDate}
                      onChange={(e) => setSlStartDate(e.target.value)}
                      className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md"
                    />
                  </label>
                  <label className="flex flex-col font-label-sm text-on-surface-variant gap-1">
                    Kết thúc vào ngày
                    <input
                      type="date"
                      value={slEndDate}
                      min={slStartDate}
                      onChange={(e) => setSlEndDate(e.target.value)}
                      className="px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface font-body-md"
                    />
                  </label>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setShowShoppingListModal(false)} className="px-4 py-2 font-label-md text-primary hover:bg-primary/10 rounded-full transition-colors">Hủy</button>
              <button 
                onClick={addMissingToShoppingList} 
                disabled={working || !slName.trim()} 
                className="px-6 py-2 font-label-md bg-primary text-on-primary hover:bg-primary/90 rounded-full transition-colors disabled:opacity-50"
              >
                {working ? 'Đang tạo...' : 'Tạo danh sách'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

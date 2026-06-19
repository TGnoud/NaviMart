import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
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

  const addMissingToShoppingList = async () => {
    if (!recipeId || working) return;
    if (missingLines.length === 0) {
      showAlert('Bạn đã có đủ nguyên liệu cho món này!');
      return;
    }
    setWorking(true);
    try {
      const { shoppingList } = await recipesApi.generateShoppingList(recipeId, { servings });
      showAlert(`Đã tạo danh sách "${shoppingList.name}" với ${shoppingList.items.length} nguyên liệu còn thiếu!`);
      navigate(`/list-detail/${shoppingList.id}`);
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

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden antialiased flex">
      <SideNav />

      <div className="flex-1 flex flex-col md:ml-64 w-full h-full relative">
        <header className="md:hidden shrink-0 w-full z-50 flex justify-between items-center px-margin-mobile h-nav-height bg-surface dark:bg-surface-dim text-primary dark:text-primary-fixed-dim border-b border-outline-variant dark:border-outline">
          <Link to="/recipe-suggestion" className="p-2 -ml-2 rounded-full hover:bg-surface-container-high transition-colors active:opacity-80">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed truncate">Chi tiết công thức</h1>
          <div className="flex gap-2">
            <button onClick={toggleFavorite} className="p-2 -mr-2 rounded-full hover:bg-surface-container-high transition-colors active:opacity-80">
              <span className={`material-symbols-outlined ${isFavorite ? 'text-amber-500' : 'text-on-surface-variant'}`} style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                star
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full">
          {loading ? (
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
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
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-[100px] md:pb-8">
              <section className="space-y-6">
                <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-sm bg-surface-container">
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
                            className={`flex items-center justify-between p-3 rounded-lg ${available ? 'bg-surface-container-low' : 'bg-error-container/20 border border-error-container'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${available ? 'bg-primary-container text-primary' : 'bg-secondary-fixed text-secondary'}`}>
                                <span className="material-symbols-outlined">grocery</span>
                              </div>
                              <div>
                                <p className="text-on-surface">{ingredient.name}{ingredient.optional ? ' (tùy chọn)' : ''}</p>
                                <p className="font-label-sm text-label-sm text-on-surface-variant">
                                  Cần {fmtQty(requiredQty)} {ingredient.unit}
                                  {line ? ` • Trong kho ${fmtQty(line.availableQuantity)} ${ingredient.unit}` : ''}
                                </p>
                                {line && line.missingQuantity > 0 && (
                                  <p className="font-label-sm text-label-sm text-error font-medium">
                                    Còn thiếu {fmtQty(line.missingQuantity)} {ingredient.unit}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className={`material-symbols-outlined ${available ? 'text-primary' : 'text-secondary-container'}`}>
                              {available ? 'check_circle' : 'shopping_cart'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      onClick={addMissingToShoppingList}
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
                      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[2.25rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-outline-variant">
                        {recipe.steps.map((step, index) => (
                          <div key={index} className="relative flex items-start gap-4 md:gap-6">
                            <div className="relative z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-primary text-on-primary font-headline-sm rounded-full shrink-0 ring-4 ring-surface-container-lowest">{index + 1}</div>
                            <div className="flex-1 bg-surface-container-low p-4 rounded-xl">
                              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Bước {index + 1}</h3>
                              <p className="font-body-md text-body-md text-on-surface-variant">{step}</p>
                            </div>
                          </div>
                        ))}
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
    </div>
  );
}

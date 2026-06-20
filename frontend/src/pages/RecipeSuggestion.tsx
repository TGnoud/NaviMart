import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import NotificationDropdown from '../components/NotificationDropdown';
import PaginationControls from '../components/PaginationControls';
import SideNav from '../components/SideNav';
import { CardGridSkeleton } from '../components/Skeleton';
import { recipesApi, usersApi } from '../api';
import type { RecipeSuggestion as Suggestion, RecipeSummary, UserProfile } from '../api';
import { useDialog } from '../contexts/DialogContext';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};


const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

const SUGGESTION_LIMIT = 500;
const RECIPE_PAGE_SIZE = 8;

function RecipeImage({ recipe, className }: { recipe: RecipeSummary; className: string }) {
  const [failed, setFailed] = useState(false);

  return recipe.imageUrl && !failed ? (
    <img
      className={`${className} object-cover group-hover:scale-105 transition-transform duration-500`}
      src={recipe.imageUrl}
      alt={recipe.name}
      onError={() => setFailed(true)}
    />
  ) : (
    <div className={`${className} flex items-center justify-center bg-surface-container`}>
      <span className="material-symbols-outlined text-6xl text-outline">restaurant</span>
    </div>
  );
}

export default function RecipeSuggestion() {
  const { showAlert } = useDialog();
  const [activeTab, setActiveTab] = useState<'suggestion' | 'my-recipes' | 'favorites'>('suggestion');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [search, setSearch] = useState('');
  const [suggestionPage, setSuggestionPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // States cho Công thức của tôi
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myRecipes, setMyRecipes] = useState<RecipeSummary[]>([]);
  const [myRecipesPage, setMyRecipesPage] = useState(1);
  const [loadingMyRecipes, setLoadingMyRecipes] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeSummary[]>([]);
  const [favoriteRecipesPage, setFavoriteRecipesPage] = useState(1);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      showAlert(err instanceof Error ? err.message : fallback);
    },
    [showAlert],
  );

  // Fetch profile mot lan duy nhat
  useEffect(() => {
    usersApi.me()
      .then((data) => setProfile(data))
      .catch((err) => handleError(err, 'Không tải được thông tin cá nhân.'));
  }, [handleError]);

  // Fetch gợi ý từ tủ lạnh
  useEffect(() => {
    let cancelled = false;
    const term = search.trim();

    const fetchSuggestions = () => {
      recipesApi
        .suggestions({
          limit: SUGGESTION_LIMIT,
          prioritizeExpiring: true,
          ...(term ? { q: term } : {}),
        })
        .then((data) => {
          if (!cancelled) {
            setSuggestions(data);
            setSuggestionPage(1);
          }
        })
        .catch((err) => handleError(err, 'Không tải được gợi ý món ăn.'))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    const timer = setTimeout(() => {
      setLoading(true);
      fetchSuggestions();
    }, term ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, handleError]);

  // Fetch công thức của tôi
  useEffect(() => {
    if (activeTab !== 'my-recipes' || !profile?.id) return;

    let cancelled = false;
    const term = search.trim();

    const fetchMyRecipes = () => {
      recipesApi
        .list({
          authorId: profile.id,
          limit: 500,
          ...(term ? { q: term } : {}),
        })
        .then((data) => {
          if (!cancelled) {
            setMyRecipes(data);
            setMyRecipesPage(1);
          }
        })
        .catch((err) => handleError(err, 'Không tải được công thức của tôi.'))
        .finally(() => {
          if (!cancelled) setLoadingMyRecipes(false);
        });
    };

    const timer = setTimeout(() => {
      setLoadingMyRecipes(true);
      fetchMyRecipes();
    }, term ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeTab, profile?.id, search, handleError]);

  useEffect(() => {
    if (activeTab !== 'favorites') return;

    let cancelled = false;
    const term = search.trim().toLowerCase();

    const fetchFavorites = () => {
      recipesApi
        .favorites()
        .then((data) => {
          if (!cancelled) {
            setFavoriteRecipes(
              term
                ? data.filter((recipe) =>
                    recipe.name.toLowerCase().includes(term),
                  )
                : data,
            );
            setFavoriteRecipesPage(1);
          }
        })
        .catch((err) => handleError(err, 'Không tải được công thức yêu thích.'))
        .finally(() => {
          if (!cancelled) setLoadingFavorites(false);
        });
    };

    const timer = setTimeout(() => {
      setLoadingFavorites(true);
      fetchFavorites();
    }, term ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeTab, search, handleError]);

  const featured = suggestions[0];
  const secondFeatured = suggestions[1];
  const others = suggestions;
  const pagedOthers = useMemo(
    () =>
      others.slice(
        (suggestionPage - 1) * RECIPE_PAGE_SIZE,
        suggestionPage * RECIPE_PAGE_SIZE,
      ),
    [others, suggestionPage],
  );

  const pagedMyRecipes = useMemo(
    () =>
      myRecipes.slice(
        (myRecipesPage - 1) * RECIPE_PAGE_SIZE,
        myRecipesPage * RECIPE_PAGE_SIZE,
      ),
    [myRecipes, myRecipesPage],
  );

  const pagedFavoriteRecipes = useMemo(
    () =>
      favoriteRecipes.slice(
        (favoriteRecipesPage - 1) * RECIPE_PAGE_SIZE,
        favoriteRecipesPage * RECIPE_PAGE_SIZE,
      ),
    [favoriteRecipes, favoriteRecipesPage],
  );

  const toggleFavorite = async (recipe: RecipeSummary) => {
    try {
      if (recipe.isFavorite) {
        await recipesApi.removeFavorite(recipe.id);
      } else {
        await recipesApi.addFavorite(recipe.id);
      }

      const nextFavorite = !recipe.isFavorite;
      const updateRecipe = (item: RecipeSummary) =>
        item.id === recipe.id
          ? {
              ...item,
              isFavorite: nextFavorite,
              favoritesCount: Math.max(
                0,
                (item.favoritesCount ?? 0) + (nextFavorite ? 1 : -1),
              ),
            }
          : item;

      setSuggestions((items) =>
        items.map((item) => ({ ...item, recipe: updateRecipe(item.recipe) })),
      );
      setMyRecipes((items) => items.map(updateRecipe));
      setFavoriteRecipes((items) =>
        nextFavorite ? items.map(updateRecipe) : items.filter((item) => item.id !== recipe.id),
      );
    } catch (err) {
      handleError(err, 'Không cập nhật được yêu thích.');
    }
  };

  const FavoriteButton = ({ recipe }: { recipe: RecipeSummary }) => (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggleFavorite(recipe);
      }}
      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-surface/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-surface transition-colors"
      aria-label={recipe.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích công thức'}
    >
      <span
        className={`material-symbols-outlined ${recipe.isFavorite ? 'text-amber-500' : 'text-on-surface-variant'}`}
        style={recipe.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        star
      </span>
    </button>
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(others.length / RECIPE_PAGE_SIZE));
    if (suggestionPage > totalPages) {
      setTimeout(() => setSuggestionPage(totalPages), 0);
    }
  }, [others.length, suggestionPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(myRecipes.length / RECIPE_PAGE_SIZE));
    if (myRecipesPage > totalPages) {
      setTimeout(() => setMyRecipesPage(totalPages), 0);
    }
  }, [myRecipes.length, myRecipesPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(favoriteRecipes.length / RECIPE_PAGE_SIZE));
    if (favoriteRecipesPage > totalPages) {
      setTimeout(() => setFavoriteRecipesPage(totalPages), 0);
    }
  }, [favoriteRecipes.length, favoriteRecipesPage]);

  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex flex-col md:flex-row">
      <SideNav />
      <div className="flex-1 flex flex-col md:ml-64 w-full h-full relative">
        <header className="hidden md:flex bg-surface dark:bg-surface-dim border-b border-outline-variant w-full shrink-0 z-30">
          <div className="flex justify-between items-center w-full h-nav-height px-margin-mobile max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Link to="/home" className="hover:text-primary transition-colors flex items-center">
                <span className="material-symbols-outlined text-[20px]">home</span>
              </Link>
              <span className="text-sm">/</span>
              <span className="font-bold text-primary text-sm">Gợi ý món ăn</span>
            </div>
            <div className="flex gap-4">
              <NotificationDropdown />
              <Link to="/profile" className="text-on-surface-variant font-medium hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80 active:scale-95 duration-150">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full bg-surface relative">
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-surface-container-low to-transparent pointer-events-none -z-10"></div>
          <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 mt-4 md:mt-0 pb-[100px] md:pb-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="font-headline-md text-headline-md text-primary mb-2">Gợi ý món ăn thông minh</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-2">Dựa trên nguyên liệu sẵn có trong tủ lạnh của bạn.</p>
                <Link to="/recipe-editor" className="inline-flex items-center gap-1.5 text-primary font-label-md font-bold hover:underline mb-4">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  Tạo công thức mới
                </Link>
              </div>
              <div className="w-full md:w-[400px]">
                <label className="font-body-md text-body-md text-on-surface mb-stack-sm block font-medium">Tìm kiếm món ăn</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-[#C1C1C1] rounded-none bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline"
                    placeholder="Nhập tên món ăn..."
                    type="text"
                  />
                </div>
              </div>
            </header>

            {/* Tab bar */}
            <div className="flex border-b border-outline-variant mb-6">
              <button
                onClick={() => setActiveTab('suggestion')}
                className={`px-6 py-3 font-label-md font-bold transition-all relative ${
                  activeTab === 'suggestion'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Gợi ý từ tủ lạnh
              </button>
              <button
                onClick={() => setActiveTab('my-recipes')}
                className={`px-6 py-3 font-label-md font-bold transition-all relative ${
                  activeTab === 'my-recipes'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Công thức của tôi
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-6 py-3 font-label-md font-bold transition-all relative ${
                  activeTab === 'favorites'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Công thức yêu thích
              </button>
            </div>

            {activeTab === 'suggestion' ? (
              loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <CardGridSkeleton count={8} />
                </div>
              ) : suggestions.length === 0 ? (
                search.trim() ? (
                  <div className="py-16 text-on-surface-variant text-center">
                    <p className="font-body-md">Không tìm thấy món ăn phù hợp.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant text-center">
                    <span className="material-symbols-outlined text-6xl mb-4 text-outline">skillet</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Chưa có gợi ý nào</h3>
                    <p className="font-body-md text-body-md">Hãy thêm thực phẩm vào tủ lạnh để nhận gợi ý món ăn phù hợp.</p>
                  </div>
                )
              ) : (
                <>
                  <section className="hidden">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-error">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Giải cứu nguyên liệu sắp hết hạn</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {featured && (
                        <Link to={`/recipe-detail/${featured.recipe.id}`} className="lg:col-span-2 bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden flex flex-col sm:flex-row group cursor-pointer hover:shadow-md transition-all">
                          <div className="relative sm:w-1/2 h-56 sm:h-auto overflow-hidden">
                            <RecipeImage recipe={featured.recipe} className="w-full h-full" />
                            <FavoriteButton recipe={featured.recipe} />
                            <div className="absolute top-4 left-4 flex gap-2">
                              <span className="bg-error text-on-error font-label-sm text-label-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm font-medium">
                                <span className="material-symbols-outlined text-[16px]">priority_high</span> Ưu tiên
                              </span>
                            </div>
                          </div>
                          <div className="p-6 flex flex-col justify-between flex-1">
                            <div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {featured.recipe.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-3 py-1 rounded-full">{tag}</span>
                                ))}
                              </div>
                              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2 group-hover:text-primary transition-colors">{featured.recipe.name}</h4>
                              <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2">{featured.recipe.description}</p>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center gap-4 text-on-surface-variant font-body-md text-body-md">
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[20px]">schedule</span> {featured.recipe.cookTimeMinutes} phút</span>
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[20px]">signal_cellular_alt</span> {DIFFICULTY_LABELS[featured.recipe.difficulty]}</span>
                              </div>
                              <div className="bg-surface-container-low p-3 rounded border border-surface-container-highest">
                                <div className="flex justify-between items-end mb-2">
                                  <span className="font-label-sm text-label-sm text-on-surface-variant">Nguyên liệu sẵn có trong tủ</span>
                                  <span className="font-body-md text-body-md font-bold text-primary">{Math.round(featured.matchRatio * 100)}%</span>
                                </div>
                                <div className="w-full bg-surface-container-highest rounded-full h-2">
                                  <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.round(featured.matchRatio * 100)}%` }}></div>
                                </div>
                                {featured.missingIngredients.length > 0 && (
                                  <p className="font-label-sm text-label-sm text-secondary mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">info</span> Cần mua thêm: {featured.missingIngredients.slice(0, 3).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )}

                      {secondFeatured && (
                        <Link to={`/recipe-detail/${secondFeatured.recipe.id}`} className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all">
                          <div className="relative h-48 overflow-hidden">
                            <RecipeImage recipe={secondFeatured.recipe} className="w-full h-full" />
                            <FavoriteButton recipe={secondFeatured.recipe} />
                            <div className="absolute top-4 left-4">
                              <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm font-medium">
                                <span className="material-symbols-outlined text-[16px]">event_busy</span> Tận dụng tủ lạnh
                              </span>
                            </div>
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">{secondFeatured.recipe.name}</h4>
                            <div className="flex items-center gap-4 text-on-surface-variant font-body-md text-body-md mb-4">
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">schedule</span> {secondFeatured.recipe.cookTimeMinutes} phút</span>
                            </div>
                            <div className="mt-auto">
                              <div className="flex justify-between items-end mb-1">
                                <span className="font-label-sm text-label-sm text-on-surface-variant">Tận dụng</span>
                                <span className="font-body-md text-body-md font-bold text-primary">{Math.round(secondFeatured.matchRatio * 100)}%</span>
                              </div>
                              <div className="w-full bg-surface-container-highest rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.round(secondFeatured.matchRatio * 100)}%` }}></div>
                              </div>
                              {secondFeatured.missingIngredients.length > 0 && (
                                <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">Thiếu: {secondFeatured.missingIngredients.slice(0, 3).join(', ')}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </section>

                  {others.length > 0 && (
                    <>
                      <hr className="border-t border-outline-variant opacity-50"/>

                      <section>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface">
                            {search.trim() ? `Kết quả tìm kiếm (${suggestions.length})` : 'Tất cả công thức'}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {pagedOthers.map((suggestion) => (
                            <Link key={suggestion.recipe.id} to={`/recipe-detail/${suggestion.recipe.id}`} className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all">
                              <div className="relative h-40 overflow-hidden">
                                <RecipeImage recipe={suggestion.recipe} className="w-full h-full" />
                                <FavoriteButton recipe={suggestion.recipe} />
                              </div>
                              <div className="p-4 flex flex-col flex-1">
                                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">{suggestion.recipe.name}</h4>
                                <div className="flex items-center gap-3 text-on-surface-variant font-body-md text-body-md mb-4">
                                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {suggestion.recipe.cookTimeMinutes} phút</span>
                                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span> {DIFFICULTY_LABELS[suggestion.recipe.difficulty]}</span>
                                </div>
                                <div className="mt-auto bg-surface-container-low p-2 rounded border border-outline-variant/50">
                                  <div className="flex justify-between items-end mb-1">
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">Nguyên liệu có sẵn</span>
                                    <span className="font-body-md text-body-md font-bold text-primary">{Math.round(suggestion.matchRatio * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-surface-container-highest rounded-full h-1.5">
                                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.round(suggestion.matchRatio * 100)}%` }}></div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <PaginationControls
                          page={suggestionPage}
                          pageSize={RECIPE_PAGE_SIZE}
                          totalItems={others.length}
                          onPageChange={setSuggestionPage}
                        />
                      </section>
                    </>
                  )}
                </>
              )
            ) : activeTab === 'my-recipes' ? (
              loadingMyRecipes ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <CardGridSkeleton count={8} />
                </div>
              ) : myRecipes.length === 0 ? (
                search.trim() ? (
                  <div className="py-16 text-on-surface-variant text-center">
                    <p className="font-body-md">Không tìm thấy công thức nào của bạn.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant text-center">
                    <span className="material-symbols-outlined text-6xl mb-4 text-outline">menu_book</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Chưa có công thức nào</h3>
                    <p className="font-body-md text-body-md">Bạn chưa tạo công thức nấu ăn nào. Hãy bắt đầu chia sẻ công thức của bạn!</p>
                  </div>
                )
              ) : (
                <section>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pagedMyRecipes.map((recipe) => {
                      const statusInfo = recipe.visibility === 'personal'
                        ? { label: 'Cá nhân', className: 'bg-surface-container-high text-on-surface-variant' }
                        : recipe.status === 'approved'
                          ? { label: 'Đã chia sẻ', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
                          : STATUS_LABELS[recipe.status] || {
                            label: 'Chờ duyệt',
                            className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                          };
                      return (
                        <Link
                          key={recipe.id}
                          to={`/recipe-detail/${recipe.id}`}
                          className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all"
                        >
                          <div className="relative h-40 overflow-hidden">
                            <RecipeImage recipe={recipe} className="w-full h-full" />
                            <FavoriteButton recipe={recipe} />
                            <div className="absolute top-3 left-3">
                              <span className={`${statusInfo.className} font-label-sm text-label-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm font-medium`}>
                                {recipe.status === 'pending' && <span className="material-symbols-outlined text-[14px]">pending</span>}
                                {recipe.status === 'approved' && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
                                {recipe.status === 'rejected' && <span className="material-symbols-outlined text-[14px]">cancel</span>}
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1 truncate">{recipe.name}</h4>
                            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-3 h-10">{recipe.description || 'Không có mô tả'}</p>
                            <div className="mt-auto flex items-center gap-3 text-on-surface-variant font-body-md text-body-md">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">schedule</span> {recipe.cookTimeMinutes} phút
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span> {DIFFICULTY_LABELS[recipe.difficulty]}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <PaginationControls
                    page={myRecipesPage}
                    pageSize={RECIPE_PAGE_SIZE}
                    totalItems={myRecipes.length}
                    onPageChange={setMyRecipesPage}
                  />
                </section>
              )
            ) : (
              loadingFavorites ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <CardGridSkeleton count={8} />
                </div>
              ) : favoriteRecipes.length === 0 ? (
                search.trim() ? (
                  <div className="py-16 text-on-surface-variant text-center">
                    <p className="font-body-md">Không tìm thấy công thức yêu thích phù hợp.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant text-center">
                    <span className="material-symbols-outlined text-6xl mb-4 text-outline">star</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Chưa có công thức yêu thích</h3>
                    <p className="font-body-md text-body-md">Nhấn dấu sao trên công thức để lưu vào tab này.</p>
                  </div>
                )
              ) : (
                <section>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pagedFavoriteRecipes.map((recipe) => (
                      <Link
                        key={recipe.id}
                        to={`/recipe-detail/${recipe.id}`}
                        className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="relative h-40 overflow-hidden">
                          <RecipeImage recipe={recipe} className="w-full h-full" />
                          <FavoriteButton recipe={recipe} />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1 truncate">{recipe.name}</h4>
                          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-3 h-10">{recipe.description || 'Không có mô tả'}</p>
                          <div className="mt-auto flex items-center justify-between gap-3 text-on-surface-variant font-body-md text-body-md">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">schedule</span> {recipe.cookTimeMinutes} phút
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">star</span> {recipe.favoritesCount ?? 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <PaginationControls
                    page={favoriteRecipesPage}
                    pageSize={RECIPE_PAGE_SIZE}
                    totalItems={favoriteRecipes.length}
                    onPageChange={setFavoriteRecipesPage}
                  />
                </section>
              )
            )}
        </div>
      </main>
      </div>

      <BottomNav />
    </div>
  );
}

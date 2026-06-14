import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import PaginationControls from '../components/PaginationControls';
import SideNav from '../components/SideNav';
import { CardGridSkeleton } from '../components/Skeleton';
import { recipesApi } from '../api';
import type { RecipeSuggestion as Suggestion, RecipeSummary } from '../api';
import { useDialog } from '../contexts/DialogContext';

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

const SUGGESTION_LIMIT = 30;
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchResults, setSearchResults] = useState<RecipeSummary[] | null>(null);
  const [search, setSearch] = useState('');
  const [suggestionPage, setSuggestionPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      showAlert(err instanceof Error ? err.message : fallback);
    },
    [showAlert],
  );

  useEffect(() => {
    let cancelled = false;
    recipesApi
      .suggestions({ limit: SUGGESTION_LIMIT, prioritizeExpiring: true })
      .then((data) => {
        if (!cancelled) setSuggestions(data);
      })
      .catch((err) => handleError(err, 'Không tải được gợi ý món ăn.'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [handleError]);

  useEffect(() => {
    const term = search.trim();
    if (!term) {
      setSearchResults(null);
      setSearchPage(1);
      return;
    }
    const timer = setTimeout(() => {
      recipesApi
        .list({ q: term, limit: SUGGESTION_LIMIT })
        .then((data) => {
          setSearchResults(data);
          setSearchPage(1);
        })
        .catch((err) => handleError(err, 'Không tìm kiếm được món ăn.'));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, handleError]);

  const featured = suggestions[0];
  const secondFeatured = suggestions[1];
  const others = suggestions.slice(2);
  const pagedOthers = useMemo(
    () =>
      others.slice(
        (suggestionPage - 1) * RECIPE_PAGE_SIZE,
        suggestionPage * RECIPE_PAGE_SIZE,
      ),
    [others, suggestionPage],
  );
  const pagedSearchResults = useMemo(
    () =>
      (searchResults ?? []).slice(
        (searchPage - 1) * RECIPE_PAGE_SIZE,
        searchPage * RECIPE_PAGE_SIZE,
      ),
    [searchResults, searchPage],
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(others.length / RECIPE_PAGE_SIZE));
    if (suggestionPage > totalPages) setSuggestionPage(totalPages);
  }, [others.length, suggestionPage]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((searchResults?.length ?? 0) / RECIPE_PAGE_SIZE),
    );
    if (searchPage > totalPages) setSearchPage(totalPages);
  }, [searchResults?.length, searchPage]);

  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex flex-col md:flex-row">
      <SideNav />

      <main className="flex-1 overflow-y-auto md:ml-64 w-full bg-surface relative">
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
                  placeholder="Nhập tên món hoặc nguyên liệu..."
                  type="text"
                />
              </div>
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <CardGridSkeleton count={8} />
            </div>
          ) : searchResults !== null ? (
            <section>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Kết quả tìm kiếm ({searchResults.length})</h3>
              {searchResults.length === 0 ? (
                <p className="font-body-md text-on-surface-variant">Không tìm thấy món ăn phù hợp.</p>
              ) : (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {pagedSearchResults.map((recipe) => (
                    <Link key={recipe.id} to={`/recipe-detail/${recipe.id}`} className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all">
                      <div className="relative h-40 overflow-hidden">
                        <RecipeImage recipe={recipe} className="w-full h-full" />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">{recipe.name}</h4>
                        <div className="flex items-center gap-3 text-on-surface-variant font-body-md text-body-md">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {recipe.cookTimeMinutes} phút</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span> {DIFFICULTY_LABELS[recipe.difficulty]}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <PaginationControls
                  page={searchPage}
                  pageSize={RECIPE_PAGE_SIZE}
                  totalItems={searchResults.length}
                  onPageChange={setSearchPage}
                />
                </>
              )}
            </section>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant text-center">
              <span className="material-symbols-outlined text-6xl mb-4 text-outline">skillet</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Chưa có gợi ý nào</h3>
              <p className="font-body-md text-body-md">Hãy thêm thực phẩm vào tủ lạnh để nhận gợi ý món ăn phù hợp.</p>
            </div>
          ) : (
            <>
              <section>
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
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Đề xuất khác cho bạn</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {pagedOthers.map((suggestion) => (
                        <Link key={suggestion.recipe.id} to={`/recipe-detail/${suggestion.recipe.id}`} className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all">
                          <div className="relative h-40 overflow-hidden">
                            <RecipeImage recipe={suggestion.recipe} className="w-full h-full" />
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
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

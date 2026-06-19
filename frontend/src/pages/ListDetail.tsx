import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import NotificationDropdown from '../components/NotificationDropdown';
import { catalogApi, shoppingListsApi } from '../api';
import type { CatalogCategory, CatalogFood, ShoppingList } from '../api';
import { onSocketEvent } from '../api/socket';
import { useDialog } from '../contexts/DialogContext';
import FoodAutocomplete from '../components/FoodAutocomplete';
import { ListRowsSkeleton, Skeleton } from '../components/Skeleton';

export default function ListDetail() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useDialog();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [newItemCategoryId, setNewItemCategoryId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [completing, setCompleting] = useState(false);

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      showAlert(err instanceof Error ? err.message : fallback);
    },
    [showAlert],
  );

  useEffect(() => {
    if (!listId) return;
    let cancelled = false;
    Promise.all([shoppingListsApi.get(listId), catalogApi.categories()])
      .then(([data, categoryData]) => {
        if (!cancelled) {
          setList(data);
          setCategories(categoryData);
        }
      })
      .catch((err) => handleError(err, 'Không tải được danh sách.'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listId, handleError]);

  // Live updates when another family member modifies this list.
  useEffect(() => {
    if (!listId) return;
    const offUpdated = onSocketEvent('shoppingList:updated', (updated) => {
      if (updated.id === listId) setList(updated);
    });
    const offRemoved = onSocketEvent('shoppingList:removed', (payload) => {
      if (payload.id === listId) {
        setList((current) => (current ? { ...current, status: 'archived' } : current));
      }
    });
    return () => {
      offUpdated();
      offRemoved();
    };
  }, [listId]);

  const isCompleted = list?.status === 'completed';

  const toggleCheck = async (itemId: string, checked: boolean) => {
    if (!listId || isCompleted) return;
    try {
      setList(await shoppingListsApi.updateItem(listId, itemId, { checked: !checked }));
    } catch (err) {
      handleError(err, 'Không cập nhật được món đồ.');
    }
  };

  const updateAmount = async (itemId: string, quantity: number, delta: number) => {
    if (!listId || isCompleted) return;
    const newQuantity = Math.max(1, quantity + delta);
    if (newQuantity === quantity) return;
    try {
      setList(await shoppingListsApi.updateItem(listId, itemId, { quantity: newQuantity }));
    } catch (err) {
      handleError(err, 'Không cập nhật được số lượng.');
    }
  };

  const setAmount = async (itemId: string, quantity: number, value: number) => {
    if (!listId || isCompleted) return;
    const newQuantity = Math.max(1, Math.floor(value));
    if (!Number.isFinite(newQuantity) || newQuantity === quantity) return;
    try {
      setList(await shoppingListsApi.updateItem(listId, itemId, { quantity: newQuantity }));
    } catch (err) {
      handleError(err, 'Không cập nhật được số lượng.');
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!listId || isCompleted) return;
    try {
      setList(await shoppingListsApi.removeItem(listId, itemId));
    } catch (err) {
      handleError(err, 'Không xóa được món đồ.');
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim() || !listId || isCompleted) return;
    if (!newItemCategoryId) {
      showAlert('Vui lòng chọn danh mục thực phẩm trước khi thêm.');
      return;
    }
    try {
      setList(
        await shoppingListsApi.addItem(listId, {
          name: newItem.trim(),
          categoryId: newItemCategoryId,
          quantity: 1,
          unit: 'cái',
        }),
      );
      setNewItem('');
      setNewItemCategoryId('');
    } catch (err) {
      handleError(err, 'Không thêm được món đồ.');
    }
  };

  // Picking a catalog suggestion links the item to the food (better pantry defaults + recipe matching).
  const handleAddFood = async (food: CatalogFood) => {
    if (!listId || isCompleted) return;
    try {
      setList(
        await shoppingListsApi.addItem(listId, {
          foodId: food.id,
          categoryId: food.categoryId,
          quantity: 1,
        }),
      );
      setNewItem('');
      setNewItemCategoryId('');
    } catch (err) {
      handleError(err, 'Không thêm được món đồ.');
    }
  };

  const handleComplete = () => {
    if (!listId || !list || completing) return;
    const boughtCount = list.items.filter((item) => item.checked).length;
    if (boughtCount === 0) {
      showAlert('Hãy đánh dấu ít nhất một món đã mua trước khi hoàn thành.');
      return;
    }
    showConfirm(
      `Hoàn thành danh sách? ${boughtCount} món đã mua sẽ được tự động thêm vào tủ lạnh.`,
      async () => {
        setCompleting(true);
        try {
          const result = await shoppingListsApi.complete(listId);
          setList(result.shoppingList);
          showAlert(`Đã thêm ${result.pantryItems.length} món vào tủ lạnh!`);
          navigate('/pantry');
        } catch (err) {
          handleError(err, 'Không hoàn thành được danh sách.');
        } finally {
          setCompleting(false);
        }
      },
    );
  };

  const items = list?.items ?? [];
  const visibleItems = categoryFilter === 'all'
    ? items
    : items.filter((item) => item.categoryId === categoryFilter);
  const pendingItems = visibleItems.filter((item) => !item.checked);
  const boughtItems = visibleItems.filter((item) => item.checked);

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden font-body-md antialiased flex flex-col">
      <header className="shrink-0 bg-surface dark:bg-surface-dim border-b border-outline-variant w-full z-40">
        <div className="flex justify-between items-center w-full h-nav-height px-margin-mobile max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link to="/lists" className="material-symbols-outlined text-primary dark:text-primary-fixed hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors rounded-full p-2">arrow_back</Link>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Link to="/home" className="hover:text-primary transition-colors flex items-center">
                <span className="material-symbols-outlined text-[20px]">home</span>
              </Link>
              <span className="text-sm">/</span>
              <span className="font-bold text-primary text-sm">Chi tiết danh sách</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Link to="/profile" className="text-on-surface-variant font-medium hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80 active:scale-95 duration-150">
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto w-full pt-stack-md pb-[100px] md:pb-8">
          {loading ? (
            <div className="px-margin-mobile flex flex-col gap-stack-md">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-12 w-full" />
              <ListRowsSkeleton count={5} />
            </div>
          ) : !list ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 text-outline">error</span>
              <p className="font-body-lg text-body-lg">Không tìm thấy danh sách.</p>
            </div>
          ) : (
            <>
              <section className="px-margin-mobile mb-stack-md">
                <div className="flex justify-between items-end mb-stack-sm">
                  <div>
                    <h1 className="font-headline-md text-headline-md text-primary mb-2">{list.name}</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {list.plannedFor ? new Date(list.plannedFor).toLocaleDateString('vi-VN') : 'Chưa đặt ngày'} • {list.progress.bought}/{list.progress.total} đã mua
                    </p>
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={handleComplete}
                      disabled={completing}
                      className="flex items-center gap-2 bg-primary text-on-primary font-label-md px-4 py-2.5 rounded-full shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">task_alt</span>
                      <span className="hidden sm:inline">{completing ? 'Đang xử lý...' : 'Hoàn thành & nhập kho'}</span>
                    </button>
                  )}
                </div>

                {isCompleted && (
                  <div className="flex items-center gap-2 bg-tertiary-container/40 text-tertiary rounded-lg px-4 py-3 mb-stack-sm">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="font-body-md text-body-md">Danh sách đã hoàn thành. Các món đã mua được thêm vào tủ lạnh.</span>
                  </div>
                )}

                {!isCompleted && (
                  <div className="mt-stack-md grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_240px] gap-2">
                    <FoodAutocomplete
                      value={newItem}
                      onChange={setNewItem}
                      onSelectFood={handleAddFood}
                      onSubmit={handleAddItem}
                      icon="add_shopping_cart"
                      placeholder="Thêm món đồ nhanh (gõ để tìm, Enter để thêm)..."
                      className="w-full pl-10 pr-4 py-3 rounded-none border border-[#c1c1c1] bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container shadow-sm transition-all"
                    />
                    <select
                      value={newItemCategoryId}
                      onChange={(event) => setNewItemCategoryId(event.target.value)}
                      aria-label="Danh mục thực phẩm"
                      className="w-full px-3 py-3 border border-[#c1c1c1] bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary-container"
                    >
                      <option value="">Chọn danh mục *</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </section>

              <div className="px-margin-mobile mb-stack-md flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`whitespace-nowrap px-4 py-2 rounded-full ${categoryFilter === 'all' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}
                >Tất cả</button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryFilter(category.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full ${categoryFilter === category.id ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}
                  >{category.name}</button>
                ))}
              </div>

              {[
                { title: 'Cần mua', icon: 'shopping_cart', groupItems: pendingItems },
                { title: 'Đã mua', icon: 'check_circle', groupItems: boughtItems },
              ].map(({ title, icon, groupItems }) =>
                groupItems.length === 0 ? null : (
                  <section key={title} className="mb-stack-md">
                    <div className="px-margin-mobile flex items-center gap-2 mb-stack-sm">
                      <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      <h2 className="font-headline-sm text-headline-sm text-tertiary">{title}</h2>
                      <span className="ml-auto font-label-sm text-label-sm text-outline px-2 py-1 bg-surface-container rounded-full">{groupItems.length} món</span>
                    </div>
                    <div className="px-margin-mobile flex flex-col gap-stack-sm">
                      {groupItems.map((item) => (
                        <div key={item.id} className={`flex items-center gap-stack-sm rounded-lg p-3 border transition-all ${item.checked ? 'bg-surface-container-low border-outline-variant opacity-80' : 'bg-surface-container-lowest shadow-sm border-surface-container-highest hover:shadow-md'}`}>
                          <input
                            className="w-6 h-6 rounded border-outline-variant text-primary-container cursor-pointer flex-shrink-0"
                            type="checkbox"
                            checked={item.checked}
                            disabled={isCompleted}
                            onChange={() => toggleCheck(item.id, item.checked)}
                          />
                          <div className="flex-1 flex flex-col">
                            <span className={`font-body-md text-body-md font-bold text-on-surface ${item.checked ? 'line-through text-on-surface-variant' : ''}`}>{item.name}</span>
                            <span className={`font-label-sm text-label-sm text-on-surface-variant mt-0.5 ${item.checked ? 'line-through' : ''}`}>{item.quantity} {item.unit}{item.note ? ` • ${item.note}` : ''}</span>
                          </div>
                          {item.checked ? (
                            <div className="flex items-center opacity-50 pointer-events-none">
                              <span className="font-body-md text-body-md text-on-surface font-bold">Đã mua</span>
                            </div>
                          ) : (
                            <div className="flex items-center bg-surface-container rounded-full p-1 border border-outline-variant shrink-0">
                              <button onClick={() => updateAmount(item.id, item.quantity, -1)} className="w-7 h-7 flex items-center justify-center rounded-full text-primary-container hover:bg-surface-container-high transition-colors">
                                <span className="material-symbols-outlined text-[18px]">remove</span>
                              </button>
                              <input
                                type="number"
                                min={1}
                                defaultValue={item.quantity}
                                key={item.quantity}
                                onFocus={(e) => e.target.select()}
                                onBlur={(e) => setAmount(item.id, item.quantity, Number(e.target.value))}
                                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                className="font-body-md text-body-md text-on-surface w-10 text-center font-bold bg-transparent outline-none focus:bg-surface-container-high rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button onClick={() => updateAmount(item.id, item.quantity, 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-sm hover:opacity-90 transition-opacity">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                              </button>
                            </div>
                          )}
                          {!isCompleted && (
                            <button onClick={() => deleteItem(item.id)} className="ml-2 text-error hover:bg-error-container p-2 rounded-full transition-colors flex-shrink-0">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ),
              )}

              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-6xl mb-4 text-outline">shopping_basket</span>
                  <p className="font-body-lg text-body-lg">Danh sách trống. Thêm món đồ đầu tiên ở ô phía trên.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api';
import type {
  AdminCategory,
  AdminFood,
  AdminRecipeRecord,
  AdminStatsResponse,
  AdminUserInputLog,
  AdminUnit,
  AdminUserRecord,
  StorageLocation,
} from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { ListRowsSkeleton } from '../components/Skeleton';

type Tab = 'overview' | 'users' | 'recipes' | 'input-logs' | 'catalog' | 'foods';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
  { id: 'users', label: 'Người dùng', icon: 'group' },
  { id: 'recipes', label: 'Duyệt công thức', icon: 'menu_book' },
  { id: 'input-logs', label: 'Dữ liệu nhập tay', icon: 'fact_check' },
  { id: 'foods', label: 'Thực phẩm', icon: 'grocery' },
  { id: 'catalog', label: 'Danh mục dữ liệu', icon: 'category' },
];

const STORAGE_LABELS: Record<StorageLocation, string> = {
  freezer: 'Tủ đông',
  fridge: 'Tủ mát',
  pantry: 'Kệ khô',
  other: 'Khác',
};

type FoodForm = {
  name: string;
  categoryId: string;
  defaultUnit: string;
  defaultStorageLocation: StorageLocation;
  defaultShelfLifeDays: string;
  storageTips: string;
  barcode: string;
};

const EMPTY_FOOD_FORM: FoodForm = {
  name: '',
  categoryId: '',
  defaultUnit: 'g',
  defaultStorageLocation: 'fridge',
  defaultShelfLifeDays: '7',
  storageTips: '',
  barcode: '',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị',
  housewife: 'Nội trợ',
  member: 'Thành viên',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Hoạt động',
  banned: 'Bị khóa',
  inactive: 'Ngừng hoạt động',
};

const INPUT_LOG_SOURCE_LABELS: Record<AdminUserInputLog['source'], string> = {
  pantry: 'Kho thực phẩm',
  shopping_list: 'Danh sách mua sắm',
  recipe_ingredient: 'Nguyên liệu công thức',
};

const INPUT_LOG_STATUS_LABELS: Record<AdminUserInputLog['status'], string> = {
  pending: 'Chờ xử lý',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showAlert, showConfirm } = useDialog();
  const [tab, setTab] = useState<Tab>('overview');

  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [recipes, setRecipes] = useState<AdminRecipeRecord[]>([]);
  const [recipeStatus, setRecipeStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [inputLogs, setInputLogs] = useState<AdminUserInputLog[]>([]);
  const [inputLogStatus, setInputLogStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [units, setUnits] = useState<AdminUnit[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState({ code: '', name: '', type: 'count' });
  const [foods, setFoods] = useState<AdminFood[]>([]);
  const [foodSearch, setFoodSearch] = useState('');
  const [foodForm, setFoodForm] = useState<FoodForm>(EMPTY_FOOD_FORM);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      showAlert(err instanceof Error ? err.message : fallback);
    },
    [showAlert],
  );

  const loadTab = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'overview') {
        setStats(await adminApi.stats());
      } else if (tab === 'users') {
        const result = await adminApi.listUsers({ search: userSearch.trim() || undefined, limit: 50 });
        setUsers(result.items);
      } else if (tab === 'recipes') {
        const result = await adminApi.listModerationRecipes(recipeStatus);
        setRecipes(result.items);
      } else if (tab === 'input-logs') {
        const result = await adminApi.listUserInputLogs({
          status: inputLogStatus,
          limit: 100,
        });
        setInputLogs(result.items);
      } else if (tab === 'foods') {
        const [foodsData, categoriesData] = await Promise.all([
          adminApi.listFoods({ status: 'active', search: foodSearch.trim() || undefined }),
          adminApi.listCategories({ status: 'active' }),
        ]);
        setFoods(foodsData);
        setCategories(categoriesData);
      } else {
        const [categoriesData, unitsData] = await Promise.all([
          adminApi.listCategories({ status: 'active' }),
          adminApi.listUnits({ status: 'active' }),
        ]);
        setCategories(categoriesData);
        setUnits(unitsData);
      }
    } catch (err) {
      handleError(err, 'Không tải được dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  }, [tab, userSearch, recipeStatus, inputLogStatus, foodSearch, handleError]);

  useEffect(() => {
    const debounced = (tab === 'users' && userSearch) || (tab === 'foods' && foodSearch);
    const timer = setTimeout(loadTab, debounced ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadTab, tab, userSearch, foodSearch]);

  const updateUserField = async (
    target: AdminUserRecord,
    input: { role?: string; status?: string },
  ) => {
    try {
      const updated = await adminApi.updateUser(target.id, input);
      setUsers((items) => items.map((u) => (u.id === target.id ? updated : u)));
    } catch (err) {
      handleError(err, 'Không cập nhật được người dùng.');
    }
  };

  const deleteUser = (target: AdminUserRecord) => {
    showConfirm(`Vô hiệu hóa tài khoản "${target.displayName ?? target.email}"?`, async () => {
      try {
        await adminApi.deleteUser(target.id);
        await loadTab();
      } catch (err) {
        handleError(err, 'Không xóa được người dùng.');
      }
    });
  };

  const moderateRecipe = async (recipe: AdminRecipeRecord, status: 'approved' | 'rejected') => {
    try {
      await adminApi.setRecipeStatus(recipe.id, status);
      setRecipes((items) => items.filter((r) => r.id !== recipe.id));
    } catch (err) {
      handleError(err, 'Không cập nhật được trạng thái công thức.');
    }
  };

  const reviewInputLog = async (
    log: AdminUserInputLog,
    status: 'approved' | 'rejected',
  ) => {
    try {
      await adminApi.setUserInputLogStatus(log.id, status);
      setInputLogs((items) => items.filter((item) => item.id !== log.id));
    } catch (err) {
      handleError(err, 'Không cập nhật được dữ liệu nhập tay.');
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const created = await adminApi.createCategory({ name: newCategory.trim() });
      setCategories((items) => [...items, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategory('');
    } catch (err) {
      handleError(err, 'Không tạo được danh mục.');
    }
  };

  const removeCategory = (category: AdminCategory) => {
    showConfirm(`Lưu trữ danh mục "${category.name}"?`, async () => {
      try {
        await adminApi.deleteCategory(category.id);
        setCategories((items) => items.filter((c) => c.id !== category.id));
      } catch (err) {
        handleError(err, 'Không xóa được danh mục.');
      }
    });
  };

  const addUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.code.trim() || !newUnit.name.trim()) return;
    try {
      const created = await adminApi.createUnit({
        code: newUnit.code.trim(),
        name: newUnit.name.trim(),
        type: newUnit.type,
      });
      setUnits((items) => [...items, created].sort((a, b) => a.code.localeCompare(b.code)));
      setNewUnit({ code: '', name: '', type: 'count' });
    } catch (err) {
      handleError(err, 'Không tạo được đơn vị.');
    }
  };

  const removeUnit = (unit: AdminUnit) => {
    showConfirm(`Lưu trữ đơn vị "${unit.name}"?`, async () => {
      try {
        await adminApi.deleteUnit(unit.id);
        setUnits((items) => items.filter((u) => u.id !== unit.id));
      } catch (err) {
        handleError(err, 'Không xóa được đơn vị.');
      }
    });
  };

  const openCreateFood = () => {
    setEditingFoodId(null);
    setFoodForm({ ...EMPTY_FOOD_FORM, categoryId: categories[0]?.id ?? '' });
    setIsFoodModalOpen(true);
  };

  const openEditFood = (food: AdminFood) => {
    setEditingFoodId(food.id);
    setFoodForm({
      name: food.name,
      categoryId: food.categoryId,
      defaultUnit: food.defaultUnit,
      defaultStorageLocation: food.defaultStorageLocation,
      defaultShelfLifeDays: food.defaultShelfLifeDays != null ? String(food.defaultShelfLifeDays) : '',
      storageTips: food.storageTips ?? '',
      barcode: food.barcode ?? '',
    });
    setIsFoodModalOpen(true);
  };

  const saveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodForm.name.trim() || !foodForm.categoryId || !foodForm.defaultUnit.trim()) {
      showAlert('Cần nhập tên, danh mục và đơn vị mặc định.');
      return;
    }
    const payload = {
      name: foodForm.name.trim(),
      categoryId: foodForm.categoryId,
      defaultUnit: foodForm.defaultUnit.trim(),
      defaultStorageLocation: foodForm.defaultStorageLocation,
      defaultShelfLifeDays: foodForm.defaultShelfLifeDays
        ? Math.max(0, parseInt(foodForm.defaultShelfLifeDays) || 0)
        : undefined,
      storageTips: foodForm.storageTips.trim() || undefined,
      barcode: foodForm.barcode.trim() || undefined,
    };
    try {
      if (editingFoodId) {
        const updated = await adminApi.updateFood(editingFoodId, payload);
        setFoods((items) => items.map((f) => (f.id === editingFoodId ? updated : f)));
      } else {
        const created = await adminApi.createFood(payload);
        setFoods((items) => [...items, created].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsFoodModalOpen(false);
    } catch (err) {
      handleError(err, 'Không lưu được thực phẩm.');
    }
  };

  const removeFood = (food: AdminFood) => {
    showConfirm(`Lưu trữ thực phẩm "${food.name}"?`, async () => {
      try {
        await adminApi.deleteFood(food.id);
        setFoods((items) => items.filter((f) => f.id !== food.id));
      } catch (err) {
        handleError(err, 'Không xóa được thực phẩm.');
      }
    });
  };

  const handleLogout = () => {
    showConfirm('Đăng xuất khỏi trang quản trị?', async () => {
      await logout();
      navigate('/login');
    });
  };

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—';

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden flex font-body-md">
      {/* Admin sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-surface-container-lowest border-r border-outline-variant h-full">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-outline-variant/40">
          <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
          <div>
            <p className="font-headline-sm text-headline-sm text-primary font-bold leading-tight">NaviMart</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Trang quản trị</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${tab === item.id ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-md">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-outline-variant/40 space-y-1">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error-container/40 transition-colors">
            <span className="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full">
        <header className="shrink-0 bg-surface border-b border-outline-variant px-4 md:px-8 h-16 flex items-center justify-between">
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            {TABS.find((t) => t.id === tab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <span className="font-body-md text-on-surface-variant hidden sm:block">{user?.displayName}</span>
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              {(user?.displayName ?? 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Mobile tabs */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 bg-surface border-b border-outline-variant">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full font-label-sm transition-colors ${tab === item.id ? 'bg-primary-container text-on-primary-container font-bold' : 'bg-surface-container-high text-on-surface-variant'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <div className="max-w-6xl">
              <ListRowsSkeleton count={7} />
            </div>
          ) : tab === 'overview' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <span className="material-symbols-outlined">group</span>
                  <span className="font-label-sm font-semibold">Người dùng</span>
                </div>
                <p className="font-display-lg text-display-lg text-on-surface">{stats?.users.total ?? 0}</p>
                <p className="font-label-sm text-on-surface-variant mt-1">{stats?.users.active ?? 0} đang hoạt động</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm">
                <div className="flex items-center gap-2 text-tertiary mb-3">
                  <span className="material-symbols-outlined">family_restroom</span>
                  <span className="font-label-sm font-semibold">Nhóm gia đình</span>
                </div>
                <p className="font-display-lg text-display-lg text-on-surface">{stats?.families.total ?? 0}</p>
                <p className="font-label-sm text-on-surface-variant mt-1">nhóm đã tạo</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm">
                <div className="flex items-center gap-2 text-secondary mb-3">
                  <span className="material-symbols-outlined">menu_book</span>
                  <span className="font-label-sm font-semibold">Công thức</span>
                </div>
                <p className="font-display-lg text-display-lg text-on-surface">{stats?.recipes.total ?? 0}</p>
                <p className="font-label-sm text-on-surface-variant mt-1">{stats?.recipes.byStatus.approved ?? 0} đã duyệt</p>
              </div>
              <div className="bg-secondary-container/20 p-6 rounded-xl border border-secondary-container/40 shadow-sm">
                <div className="flex items-center gap-2 text-secondary mb-3">
                  <span className="material-symbols-outlined">pending_actions</span>
                  <span className="font-label-sm font-semibold">Chờ duyệt</span>
                </div>
                <p className="font-display-lg text-display-lg text-on-surface">{stats?.recipes.byStatus.pending ?? 0}</p>
                <button onClick={() => setTab('recipes')} className="font-label-sm text-primary underline mt-1">Duyệt ngay</button>
              </div>
            </div>
          ) : tab === 'users' ? (
            <div className="max-w-6xl space-y-4">
              <div className="relative max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Tìm theo tên, email, SĐT..."
                />
              </div>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/40 font-label-sm text-on-surface-variant">
                      <th className="px-4 py-3">Người dùng</th>
                      <th className="px-4 py-3">Liên hệ</th>
                      <th className="px-4 py-3">Vai trò</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((record) => (
                      <tr key={record.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold shrink-0">
                              {(record.displayName ?? record.firstName).charAt(0).toUpperCase()}
                            </div>
                            <span className="font-body-md font-bold text-on-surface">{record.displayName ?? `${record.firstName} ${record.lastName}`}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{record.email ?? record.phone ?? '—'}</td>
                        <td className="px-4 py-3">
                          <select
                            value={record.role}
                            disabled={record.id === user?.id}
                            onChange={(e) => updateUserField(record, { role: e.target.value })}
                            className="bg-surface-container border border-outline-variant rounded-lg px-2 py-1.5 outline-none"
                          >
                            {Object.entries(ROLE_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={record.status}
                            disabled={record.id === user?.id}
                            onChange={(e) => updateUserField(record, { status: e.target.value })}
                            className={`border border-outline-variant rounded-lg px-2 py-1.5 outline-none ${record.status === 'active' ? 'bg-tertiary-container/30 text-tertiary' : 'bg-error-container/30 text-error'}`}
                          >
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {record.id !== user?.id && (
                            <button onClick={() => deleteUser(record)} className="text-error p-2 hover:bg-error-container rounded-full transition-colors" title="Vô hiệu hóa">
                              <span className="material-symbols-outlined">person_off</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-on-surface-variant">Không tìm thấy người dùng nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : tab === 'recipes' ? (
            <div className="max-w-5xl space-y-4">
              <div className="flex gap-2">
                {(['pending', 'approved', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setRecipeStatus(status)}
                    className={`px-4 py-1.5 rounded-full font-label-sm transition-colors ${recipeStatus === status ? 'bg-primary-container text-on-primary-container font-bold' : 'bg-surface-container-high text-on-surface-variant'}`}
                  >
                    {status === 'pending' ? 'Chờ duyệt' : status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                  </button>
                ))}
              </div>
              {recipes.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-10 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 text-outline">task_alt</span>
                  <p className="font-body-lg">Không có công thức nào trong mục này.</p>
                </div>
              ) : (
                recipes.map((recipe) => (
                  <div key={recipe.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
                      {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-3xl text-outline">restaurant</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{recipe.name}</h3>
                      <p className="font-body-md text-on-surface-variant line-clamp-1">{recipe.description ?? 'Không có mô tả'}</p>
                      <p className="font-label-sm text-on-surface-variant mt-1">
                        {recipe.ingredientCount} nguyên liệu • {recipe.cookTimeMinutes} phút • {recipe.servings} khẩu phần
                      </p>
                    </div>
                    {recipeStatus === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => moderateRecipe(recipe, 'approved')} className="flex items-center gap-1 bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                          <span className="material-symbols-outlined text-[18px]">check</span> Duyệt
                        </button>
                        <button onClick={() => moderateRecipe(recipe, 'rejected')} className="flex items-center gap-1 bg-error-container text-error px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                          <span className="material-symbols-outlined text-[18px]">close</span> Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : tab === 'input-logs' ? (
            <div className="max-w-6xl space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['pending', 'approved', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setInputLogStatus(status)}
                    className={`px-4 py-1.5 rounded-full font-label-sm transition-colors ${inputLogStatus === status ? 'bg-primary-container text-on-primary-container font-bold' : 'bg-surface-container-high text-on-surface-variant'}`}
                  >
                    {INPUT_LOG_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/40 font-label-sm text-on-surface-variant">
                      <th className="px-4 py-3">Nội dung nhập</th>
                      <th className="px-4 py-3">Nguồn</th>
                      <th className="px-4 py-3">Đơn vị</th>
                      <th className="px-4 py-3">Người nhập</th>
                      <th className="px-4 py-3">Thời gian</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inputLogs.map((log) => (
                      <tr key={log.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50">
                        <td className="px-4 py-3">
                          <p className="font-body-md font-bold text-on-surface">{log.value}</p>
                          {log.note && <p className="font-label-sm text-on-surface-variant mt-1">{log.note}</p>}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{INPUT_LOG_SOURCE_LABELS[log.source]}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{log.unit ?? '—'}</td>
                        <td className="px-4 py-3 text-on-surface-variant font-mono text-sm">{log.userId}</td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {inputLogStatus === 'pending' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => reviewInputLog(log, 'approved')}
                                className="text-primary p-2 hover:bg-primary-container/40 rounded-full transition-colors"
                                title="Duyệt"
                              >
                                <span className="material-symbols-outlined text-[20px]">check</span>
                              </button>
                              <button
                                onClick={() => reviewInputLog(log, 'rejected')}
                                className="text-error p-2 hover:bg-error-container rounded-full transition-colors"
                                title="Từ chối"
                              >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant">{INPUT_LOG_STATUS_LABELS[log.status]}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {inputLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">Không có dữ liệu nhập tay trong mục này.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : tab === 'foods' ? (
            <div className="max-w-6xl space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                  <input
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Tìm thực phẩm..."
                  />
                </div>
                <button onClick={openCreateFood} className="flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity shrink-0">
                  <span className="material-symbols-outlined text-[20px]">add</span> Thêm thực phẩm
                </button>
              </div>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/40 font-label-sm text-on-surface-variant">
                      <th className="px-4 py-3">Tên</th>
                      <th className="px-4 py-3">Danh mục</th>
                      <th className="px-4 py-3">Đơn vị</th>
                      <th className="px-4 py-3">Bảo quản</th>
                      <th className="px-4 py-3">HSD mặc định</th>
                      <th className="px-4 py-3">Barcode</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((food) => (
                      <tr key={food.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50">
                        <td className="px-4 py-3 font-body-md font-bold text-on-surface">{food.name}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{categoryName(food.categoryId)}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{food.defaultUnit}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{STORAGE_LABELS[food.defaultStorageLocation]}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{food.defaultShelfLifeDays != null ? `${food.defaultShelfLifeDays} ngày` : '—'}</td>
                        <td className="px-4 py-3 text-on-surface-variant font-mono text-sm">{food.barcode ?? '—'}</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button onClick={() => openEditFood(food)} className="text-primary p-2 hover:bg-primary-container/40 rounded-full transition-colors" title="Sửa">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => removeFood(food)} className="text-error p-2 hover:bg-error-container rounded-full transition-colors" title="Lưu trữ">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {foods.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-on-surface-variant">Không có thực phẩm nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-4">Danh mục thực phẩm</h3>
                <form onSubmit={addCategory} className="flex gap-2 mb-4">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Tên danh mục mới..."
                    className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="bg-primary text-on-primary px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">Thêm</button>
                </form>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                      <span className="font-body-md text-on-surface">{category.name}</span>
                      <button onClick={() => removeCategory(category)} className="text-error p-1.5 hover:bg-error-container rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && <p className="text-on-surface-variant font-body-md py-4 text-center">Chưa có danh mục nào.</p>}
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-4">Đơn vị tính</h3>
                <form onSubmit={addUnit} className="flex flex-wrap gap-2 mb-4">
                  <input
                    value={newUnit.code}
                    onChange={(e) => setNewUnit({ ...newUnit, code: e.target.value })}
                    placeholder="Mã (kg, lít...)"
                    className="w-28 px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary"
                  />
                  <input
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                    placeholder="Tên đơn vị..."
                    className="flex-1 min-w-[120px] px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary"
                  />
                  <select
                    value={newUnit.type}
                    onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value })}
                    className="px-2 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest outline-none"
                  >
                    <option value="weight">Khối lượng</option>
                    <option value="volume">Thể tích</option>
                    <option value="count">Số lượng</option>
                    <option value="package">Đóng gói</option>
                  </select>
                  <button type="submit" className="bg-primary text-on-primary px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">Thêm</button>
                </form>
                <div className="space-y-2">
                  {units.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                      <span className="font-body-md text-on-surface"><b>{unit.code}</b> — {unit.name}</span>
                      <button onClick={() => removeUnit(unit)} className="text-error p-1.5 hover:bg-error-container rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                  {units.length === 0 && <p className="text-on-surface-variant font-body-md py-4 text-center">Chưa có đơn vị nào.</p>}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Food create/edit modal */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-lg shadow-xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {editingFoodId ? 'Sửa thực phẩm' : 'Thêm thực phẩm'}
              </h2>
              <button onClick={() => setIsFoodModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={saveFood} className="space-y-4">
              <div>
                <label className="block font-label-md text-on-surface mb-1">Tên thực phẩm *</label>
                <input
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-md text-on-surface mb-1">Danh mục *</label>
                  <select
                    value={foodForm.categoryId}
                    onChange={(e) => setFoodForm({ ...foodForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-on-surface mb-1">Đơn vị mặc định *</label>
                  <input
                    value={foodForm.defaultUnit}
                    onChange={(e) => setFoodForm({ ...foodForm, defaultUnit: e.target.value })}
                    required
                    placeholder="g, kg, quả..."
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface mb-1">Vị trí bảo quản</label>
                  <select
                    value={foodForm.defaultStorageLocation}
                    onChange={(e) => setFoodForm({ ...foodForm, defaultStorageLocation: e.target.value as StorageLocation })}
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest outline-none"
                  >
                    <option value="fridge">Tủ mát</option>
                    <option value="freezer">Tủ đông</option>
                    <option value="pantry">Kệ khô</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-on-surface mb-1">HSD mặc định (ngày)</label>
                  <input
                    value={foodForm.defaultShelfLifeDays}
                    onChange={(e) => setFoodForm({ ...foodForm, defaultShelfLifeDays: e.target.value })}
                    type="number"
                    min="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Mã vạch (barcode)</label>
                <input
                  value={foodForm.barcode}
                  onChange={(e) => setFoodForm({ ...foodForm, barcode: e.target.value })}
                  placeholder="VD: 8934673001234"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-mono"
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Mẹo bảo quản</label>
                <textarea
                  value={foodForm.storageTips}
                  onChange={(e) => setFoodForm({ ...foodForm, storageTips: e.target.value })}
                  rows={2}
                  placeholder="VD: Bảo quản ngăn mát 0-4°C..."
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsFoodModalOpen(false)} className="px-5 py-2.5 rounded-lg font-label-md font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-lg font-label-md font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-sm">
                  {editingFoodId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

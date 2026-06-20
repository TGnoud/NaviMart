import { useEffect, useState } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useDialog } from '../contexts/DialogContext';
import { pantryApi, uploadsApi, catalogApi } from '../api';
import type { CatalogFood, StorageLocation, CatalogCategory } from '../api';
import FoodAutocomplete from '../components/FoodAutocomplete';

const LOCATION_VALUES: Record<string, StorageLocation> = {
  'Tủ đông': 'freezer',
  'Tủ mát': 'fridge',
  'Kệ đồ khô': 'pantry',
};

const LOCATION_LABELS: Record<StorageLocation, string> = {
  freezer: 'Tủ đông',
  fridge: 'Tủ mát',
  pantry: 'Kệ đồ khô',
  other: 'Tủ mát',
};

function dateAfterDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function AddItem() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { showAlert } = useDialog();
  const [location, setLocation] = useState('Tủ mát');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('cái');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFood, setSelectedFood] = useState<CatalogFood | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    catalogApi.categories().then(setCategories).catch(console.error);
  }, []);

  // Catalog defaults: unit, storage location, shelf life and storage tips.
  const applyFood = (food: CatalogFood) => {
    setSelectedFood(food);
    setItemName(food.name);
    setUnit(food.defaultUnit);
    setLocation(LOCATION_LABELS[food.defaultStorageLocation] ?? 'Tủ mát');
    if (food.categoryId) {
      setCategoryId(food.categoryId);
    }
    if (food.defaultShelfLifeDays) {
      setExpiryDate(dateAfterDays(food.defaultShelfLifeDays));
    }
  };

  // Prefilled food from the barcode Scanner page.
  useEffect(() => {
    const state = routerLocation.state as { food?: CatalogFood } | null;
    if (state?.food) applyFood(state.food);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerLocation.state]);

  const handleNameChange = (value: string) => {
    setItemName(value);
    if (selectedFood && value !== selectedFood.name) {
      setSelectedFood(null);
    }
  };

  const handleImageUpload = async (file?: File) => {
    if (!file || uploadingImage) return;
    setUploadingImage(true);
    try {
      const image = await uploadsApi.image(file);
      setImageUrl(image.secureUrl);
      showAlert('Đã tải ảnh lên Cloudinary.');
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Không tải được ảnh.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || saving || uploadingImage) return;
    if (!expiryDate) {
      showAlert('Vui lòng chọn hạn sử dụng.');
      return;
    }
    const parsedQuantity = Number(quantity);
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      showAlert('Số lượng phải lớn hơn 0.');
      return;
    }
    setSaving(true);
    try {
      await pantryApi.create({
        foodId: selectedFood?.id,
        name: selectedFood ? undefined : itemName.trim(),
        categoryId: categoryId || undefined,
        quantity: parsedQuantity,
        unit,
        expiryDate: new Date(expiryDate).toISOString(),
        location: LOCATION_VALUES[location] ?? 'fridge',
        imageUrl: imageUrl || undefined,
      });
      showAlert('Đã thêm thực phẩm thành công!');
      navigate('/pantry');
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Không thêm được thực phẩm.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased h-screen flex flex-col">
      <header className="shrink-0 bg-surface dark:bg-surface-dim border-b border-outline-variant z-40 px-margin-mobile h-nav-height flex items-center justify-between shadow-sm">
        <Link to="/pantry" className="p-2 -ml-2 rounded-full hover:bg-surface-container-high transition-colors active:opacity-80">
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">Thêm thực phẩm</h1>
        <div className="w-10 h-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-margin-mobile py-stack-md pb-[90px] hide-scrollbar">
        <label className="mb-6 flex flex-col items-center justify-center bg-surface-container-low border-2 border-dashed border-outline-variant rounded-xl p-6 cursor-pointer hover:bg-surface-container transition-colors group overflow-hidden">
          {imageUrl ? (
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface-container mb-3">
              <img src={imageUrl} alt={itemName || 'Ảnh thực phẩm'} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">cloud_upload</span>
            </div>
          )}
          <span className="font-body-md text-body-md font-medium text-primary">
            {uploadingImage ? 'Đang tải ảnh lên...' : 'Tải ảnh lên'}
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploadingImage}
            onChange={(e) => handleImageUpload(e.target.files?.[0])}
          />
        </label>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="font-body-md text-body-md font-bold text-on-surface" htmlFor="itemName">Tên thực phẩm *</label>
            <FoodAutocomplete
              value={itemName}
              onChange={handleNameChange}
              onSelectFood={applyFood}
              placeholder="VD: Sữa tươi, Thịt bò... (gõ để tìm trong danh mục)"
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
            {selectedFood && (
              <p className="font-label-sm text-label-sm text-primary flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Đã liên kết với danh mục hệ thống
              </p>
            )}
          </div>

          {selectedFood?.storageTips && (
            <div className="flex items-start gap-2 bg-tertiary-container/25 border border-tertiary/20 rounded-lg px-4 py-3">
              <span className="material-symbols-outlined text-tertiary mt-0.5">lightbulb</span>
              <div>
                <p className="font-label-sm text-label-sm font-bold text-tertiary mb-0.5">Mẹo bảo quản tối ưu</p>
                <p className="font-body-md text-body-md text-on-surface">{selectedFood.storageTips}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="font-body-md text-body-md font-bold text-on-surface" htmlFor="categoryId">Danh mục</label>
            <div className="relative">
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Không có danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-body-md text-body-md font-bold text-on-surface" htmlFor="quantity">Số lượng</label>
              <div className="flex bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                <input
                  className="w-full px-4 py-3 bg-transparent outline-none"
                  id="quantity"
                  placeholder="0"
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <div className="relative border-l border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors flex items-center shrink-0">
                  <select
                    className="h-full bg-transparent border-none outline-none pl-3 pr-8 font-body-md text-body-md cursor-pointer appearance-none"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    {!['cái', 'kg', 'g', 'lít', 'ml', 'bó', 'quả'].includes(unit) && (
                      <option value={unit}>{unit}</option>
                    )}
                    <option value="cái">Cái/Hộp</option>
                    <option value="kg">Kg</option>
                    <option value="g">Gram</option>
                    <option value="lít">Lít</option>
                    <option value="ml">ml</option>
                    <option value="bó">Bó</option>
                    <option value="quả">Quả</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-body-md text-body-md font-bold text-on-surface" htmlFor="expiryDate">Hạn sử dụng</label>
              <input
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-stack-sm">
            <label className="font-body-md text-body-md font-bold text-on-surface">Vị trí lưu trữ</label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setLocation('Tủ đông')} className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all shadow-sm ${location === 'Tủ đông' ? 'border border-primary bg-primary-container text-on-primary-container' : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'}`} type="button">
                <span className="material-symbols-outlined mb-1">ac_unit</span>
                <span className="font-label-sm text-label-sm font-medium">Tủ đông</span>
              </button>
              <button onClick={() => setLocation('Tủ mát')} className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all shadow-sm ${location === 'Tủ mát' ? 'border border-primary bg-primary-container text-on-primary-container' : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'}`} type="button">
                <span className="material-symbols-outlined mb-1">kitchen</span>
                <span className="font-label-sm text-label-sm font-medium">Tủ mát</span>
              </button>
              <button onClick={() => setLocation('Kệ đồ khô')} className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all shadow-sm ${location === 'Kệ đồ khô' ? 'border border-primary bg-primary-container text-on-primary-container' : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'}`} type="button">
                <span className="material-symbols-outlined mb-1">shelves</span>
                <span className="font-label-sm text-label-sm font-medium">Kệ đồ khô</span>
              </button>
            </div>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant p-margin-mobile z-50 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto w-full">
          <button 
            onClick={handleSubmit} 
            disabled={!itemName.trim() || uploadingImage}
            className={`w-full h-14 rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-all shadow-sm ${itemName.trim() && !uploadingImage ? 'bg-primary text-white hover:opacity-90 active:scale-[0.98]' : 'bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed'}`}
          >
            <span className="material-symbols-outlined">save</span>
            {saving ? 'Đang lưu...' : uploadingImage ? 'Đang tải ảnh...' : 'Lưu thực phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
}

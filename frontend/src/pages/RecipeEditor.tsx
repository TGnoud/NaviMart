import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { catalogApi, recipesApi, uploadsApi } from '../api';
import type { CatalogUnit, RecipeEditorInput } from '../api';
import { useDialog } from '../contexts/DialogContext';
import { useAuth } from '../contexts/AuthContext';
import CustomSelect from '../components/CustomSelect';

type IngredientRow = { name: string; quantity: string; unit: string; optional: boolean };

const EMPTY_INGREDIENT: IngredientRow = { name: '', quantity: '1', unit: 'g', optional: false };

export default function RecipeEditor() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { showAlert } = useDialog();
  const { user } = useAuth();
  const isEdit = !!recipeId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [cookTime, setCookTime] = useState('30');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [servings, setServings] = useState('2');
  const [tags, setTags] = useState('');
  const [calories, setCalories] = useState('');
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ ...EMPTY_INGREDIENT }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [visibility, setVisibility] = useState<'personal' | 'shared'>('personal');
  const [units, setUnits] = useState<CatalogUnit[]>([]);

  const canCreate = user?.role === 'admin' || user?.role === 'housewife';

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .units()
      .then((data) => {
        if (!cancelled) setUnits(data);
      })
      .catch(() => {
        if (!cancelled) setUnits([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!recipeId) return;
    let cancelled = false;
    recipesApi
      .get(recipeId)
      .then((recipe) => {
        if (cancelled) return;
        setName(recipe.name);
        setDescription(recipe.description ?? '');
        setImageUrl(recipe.imageUrl ?? '');
        setCookTime(String(recipe.cookTimeMinutes));
        setDifficulty(recipe.difficulty);
        setServings(String(recipe.servings));
        setTags(recipe.tags.join(', '));
        setCalories(recipe.nutrition?.calories != null ? String(recipe.nutrition.calories) : '');
        setIngredients(
          recipe.ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantity: String(ingredient.quantity),
            unit: ingredient.unit,
            optional: ingredient.optional,
          })),
        );
        setSteps(recipe.steps.length > 0 ? recipe.steps : ['']);
      })
      .catch((err) => showAlert(err instanceof Error ? err.message : 'Không tải được công thức.'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  const updateIngredient = (index: number, patch: Partial<IngredientRow>) => {
    setIngredients((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
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
    if (saving) return;

    const validIngredients = ingredients.filter((row) => row.name.trim());
    const validSteps = steps.map((step) => step.trim()).filter(Boolean);
    if (!name.trim() || validIngredients.length === 0 || validSteps.length === 0) {
      showAlert('Cần có tên món, ít nhất 1 nguyên liệu và 1 bước thực hiện.');
      return;
    }

    const payload: RecipeEditorInput = {
      visibility: isEdit ? undefined : visibility,
      name: name.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      cookTimeMinutes: Math.max(1, parseInt(cookTime) || 30),
      difficulty,
      servings: Math.max(1, parseInt(servings) || 2),
      ingredients: validIngredients.map((row) => ({
        name: row.name.trim(),
        quantity: Math.max(0.01, Number(row.quantity) || 1),
        unit: row.unit.trim() || 'g',
        optional: row.optional,
      })),
      steps: validSteps,
      nutrition: calories ? { calories: Math.max(0, Number(calories) || 0) } : undefined,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await recipesApi.update(recipeId!, payload);
        showAlert('Đã cập nhật công thức!');
      } else {
        await recipesApi.create(payload);
        showAlert(
          visibility === 'personal'
            ? 'Đã lưu vào công thức cá nhân.'
            : 'Đã gửi công thức chia sẻ và đang chờ admin duyệt.',
        );
      }
      navigate('/recipe-suggestion');
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Không lưu được công thức.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-on-surface';

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden antialiased flex">
      <SideNav />

      <div className="flex-1 flex flex-col md:ml-64 w-full h-full relative">
        <header className="shrink-0 h-16 bg-surface flex items-center justify-between px-4 md:px-8 border-b border-outline-variant z-40">
          <div className="flex items-center">
            <Link to="/recipe-suggestion" className="text-on-surface p-2 -ml-2 mr-2 rounded-full hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {isEdit ? 'Chỉnh sửa công thức' : 'Tạo công thức mới'}
            </h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || !canCreate}
            className="bg-primary text-on-primary font-label-md font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : visibility === 'personal' ? 'Lưu cá nhân' : 'Gửi duyệt'}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-3xl mx-auto p-4 md:p-8 pb-[100px] md:pb-8">
            {!canCreate ? (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant text-center">
                <span className="material-symbols-outlined text-6xl mb-4 text-outline">lock</span>
                <p className="font-body-lg text-body-lg">Chỉ tài khoản nội trợ hoặc quản trị mới có thể tạo công thức.</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4 text-outline animate-spin">progress_activity</span>
                <p className="font-body-lg text-body-lg">Đang tải...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isEdit && (
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                    <p className="font-label-md text-on-surface mb-3">Chế độ công thức</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button type="button" onClick={() => setVisibility('personal')} className={`p-4 rounded-xl border text-left ${visibility === 'personal' ? 'border-primary bg-primary-container/30' : 'border-outline-variant'}`}>
                        <span className="material-symbols-outlined text-primary">lock</span>
                        <p className="font-label-md text-on-surface font-bold">Công thức cá nhân</p>
                        <p className="font-body-sm text-on-surface-variant">Chỉ bạn xem, được lưu ngay.</p>
                      </button>
                      <button type="button" onClick={() => setVisibility('shared')} className={`p-4 rounded-xl border text-left ${visibility === 'shared' ? 'border-primary bg-primary-container/30' : 'border-outline-variant'}`}>
                        <span className="material-symbols-outlined text-primary">public</span>
                        <p className="font-label-md text-on-surface font-bold">Chia sẻ cộng đồng</p>
                        <p className="font-body-sm text-on-surface-variant">Chờ admin duyệt trước khi công khai.</p>
                      </button>
                    </div>
                  </div>
                )}
                <div className="bg-primary-container/20 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                  <p className="font-body-md text-body-md text-on-surface">
                    {visibility === 'personal'
                      ? <>Công thức sẽ được lưu trong mục <b>Công thức cá nhân</b>.</>
                      : <>Công thức chia sẻ sẽ ở trạng thái <b>chờ duyệt</b> và công khai sau khi quản trị viên phê duyệt.</>}
                  </p>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Thông tin chung</h2>
                  <div>
                    <label className="block font-label-md text-on-surface mb-1.5">Tên món ăn *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: Thịt kho tàu" className={inputClass} />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-1.5">Mô tả</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Mô tả ngắn về món ăn..." className={inputClass} />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-1.5">Ảnh món ăn (URL)</label>
                    {imageUrl && (
                      <div className="mb-3 aspect-video overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
                        <img src={imageUrl} alt={name || 'Recipe'} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="mb-3 w-full px-4 py-3 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl hover:border-primary transition-colors cursor-pointer flex items-center justify-between gap-3">
                      <span className="font-body-md text-on-surface-variant truncate">
                        {uploadingImage ? 'Đang tải lên Cloudinary...' : 'Chọn ảnh từ máy'}
                      </span>
                      <span className="material-symbols-outlined text-primary">cloud_upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploadingImage}
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                      />
                    </label>
                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} type="url" placeholder="https://res.cloudinary.com/..." className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-label-md text-on-surface mb-1.5">Thời gian (phút)</label>
                      <input value={cookTime} onChange={(e) => setCookTime(e.target.value)} type="number" min="1" className={inputClass} />
                    </div>
                    <div>
                      <label className="block font-label-md text-on-surface mb-1.5">Độ khó</label>
                      <CustomSelect
                        value={difficulty}
                        onChange={(val) => setDifficulty(val as typeof difficulty)}
                        options={[
                          { value: 'easy', label: 'Dễ' },
                          { value: 'medium', label: 'Trung bình' },
                          { value: 'hard', label: 'Khó' }
                        ]}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-on-surface mb-1.5">Khẩu phần</label>
                      <input value={servings} onChange={(e) => setServings(e.target.value)} type="number" min="1" className={inputClass} />
                    </div>
                    <div>
                      <label className="block font-label-md text-on-surface mb-1.5">Calo (kcal)</label>
                      <input value={calories} onChange={(e) => setCalories(e.target.value)} type="number" min="0" placeholder="VD: 350" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface mb-1.5">Thẻ (phân cách bằng dấu phẩy)</label>
                    <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="VD: bữa tối, nhanh gọn" className={inputClass} />
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Nguyên liệu *</h2>
                    <button
                      type="button"
                      onClick={() => setIngredients((rows) => [...rows, { ...EMPTY_INGREDIENT }])}
                      className="flex items-center gap-1 text-primary font-label-md font-bold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span> Thêm
                    </button>
                  </div>
                  {ingredients.map((row, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-2">
                      <input
                        value={row.name}
                        onChange={(e) => updateIngredient(index, { name: e.target.value })}
                        placeholder="Tên nguyên liệu"
                        className={`${inputClass} flex-1 min-w-[140px]`}
                      />
                      <input
                        value={row.quantity}
                        onChange={(e) => updateIngredient(index, { quantity: e.target.value })}
                        type="number"
                        min="0.01"
                        step="any"
                        placeholder="SL"
                        className={`${inputClass} w-20`}
                      />
                      <div className="shrink-0 w-24">
                        <CustomSelect
                          value={row.unit}
                          onChange={(val) => updateIngredient(index, { unit: val })}
                          options={[
                            ...(units.length === 0 ? [{ value: row.unit, label: row.unit || 'g' }] : []),
                            ...(units.length > 0 && row.unit && !units.some((unit) => unit.code === row.unit) ? [{ value: row.unit, label: row.unit }] : []),
                            ...units.map((unit) => ({ value: unit.code, label: unit.code }))
                          ]}
                          className={inputClass}
                          menuClassName="w-[120px]"
                        />
                      </div>
                      <label className="flex items-center gap-1.5 font-label-sm text-on-surface-variant whitespace-nowrap cursor-pointer">
                        <input
                          type="checkbox"
                          checked={row.optional}
                          onChange={(e) => updateIngredient(index, { optional: e.target.checked })}
                          className="w-4 h-4 text-primary rounded"
                        />
                        Tùy chọn
                      </label>
                      <button
                        type="button"
                        onClick={() => setIngredients((rows) => rows.filter((_, i) => i !== index))}
                        disabled={ingredients.length === 1}
                        className="text-error p-2 hover:bg-error-container rounded-full transition-colors disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Các bước thực hiện *</h2>
                    <button
                      type="button"
                      onClick={() => setSteps((rows) => [...rows, ''])}
                      className="flex items-center gap-1 text-primary font-label-md font-bold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span> Thêm bước
                    </button>
                  </div>
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-9 h-9 mt-1.5 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">{index + 1}</div>
                      <textarea
                        value={step}
                        onChange={(e) => setSteps((rows) => rows.map((s, i) => (i === index ? e.target.value : s)))}
                        rows={2}
                        placeholder={`Mô tả bước ${index + 1}...`}
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => setSteps((rows) => rows.filter((_, i) => i !== index))}
                        disabled={steps.length === 1}
                        className="text-error p-2 mt-1.5 hover:bg-error-container rounded-full transition-colors disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">send</span>
                  {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật công thức' : visibility === 'personal' ? 'Lưu công thức cá nhân' : 'Gửi công thức chờ duyệt'}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

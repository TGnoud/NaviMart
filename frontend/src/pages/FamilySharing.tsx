import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import SideNav from '../components/SideNav';
import { ListRowsSkeleton } from '../components/Skeleton';
import { useDialog } from '../contexts/DialogContext';
import { familyApi } from '../api';
import type { Family, FamilyInvite, FamilyMember, FamilyPermission } from '../api';
import { useAuth } from '../contexts/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Chủ hộ',
  admin: 'Quản trị',
  member: 'Thành viên',
};

function memberName(member: FamilyMember) {
  return member.user?.displayName ?? member.user?.email ?? member.user?.phone ?? 'Thành viên';
}

export default function FamilySharing() {
  const { showAlert, showConfirm } = useDialog();
  const { user, refreshSession } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [invite, setInvite] = useState<FamilyInvite | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [working, setWorking] = useState(false);

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      showAlert(err instanceof Error ? err.message : fallback);
    },
    [showAlert],
  );

  const loadFamily = useCallback(async () => {
    setLoading(true);
    try {
      const [current, list] = await Promise.all([
        familyApi.current(),
        familyApi.list(),
      ]);
      setFamily(current);
      setFamilies(list);
    } catch (err) {
      handleError(err, 'Không tải được thông tin gia đình.');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  const me = family?.members.find((member) => member.userId === user?.id);
  const canManage = me?.permissions.includes('manage_family') ?? false;

  const openInviteQR = async () => {
    if (working) return;
    setWorking(true);
    try {
      const created = await familyApi.createInvite({
        permissions: ['edit_lists', 'edit_pantry', 'edit_meals', 'view_reports'],
        expiresInHours: 24,
      });
      setInvite(created);
      setIsQRModalOpen(true);
    } catch (err) {
      handleError(err, 'Không tạo được mã mời.');
    } finally {
      setWorking(false);
    }
  };

  const handleSwitchFamily = async (familyId: string) => {
    if (working || familyId === family?.id) return;
    setWorking(true);
    try {
      await familyApi.switch(familyId);
      await refreshSession();
      await loadFamily();
    } catch (err) {
      handleError(err, 'Không thể chuyển đổi nhóm gia đình.');
    } finally {
      setWorking(false);
    }
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim() || working) return;
    setWorking(true);
    try {
      await familyApi.create(newFamilyName.trim());
      await refreshSession();
      setIsCreateModalOpen(false);
      setNewFamilyName('');
      showAlert('Đã tạo nhóm gia đình mới!');
      await loadFamily();
    } catch (err) {
      handleError(err, 'Không tạo được nhóm gia đình.');
    } finally {
      setWorking(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || working) return;
    setWorking(true);
    try {
      await familyApi.join(joinCode.trim());
      // JWT carries activeFamilyId, so re-issue tokens to switch family context.
      await refreshSession();
      setIsJoinModalOpen(false);
      setJoinCode('');
      showAlert('Đã tham gia nhóm gia đình mới!');
      await loadFamily();
    } catch (err) {
      handleError(err, 'Mã mời không hợp lệ hoặc đã hết hạn.');
    } finally {
      setWorking(false);
    }
  };

  const removeMember = (member: FamilyMember) => {
    showConfirm('Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm gia đình?', async () => {
      try {
        setFamily(await familyApi.removeMember(member.userId));
      } catch (err) {
        handleError(err, 'Không xóa được thành viên.');
      }
    });
  };

  const togglePermission = async (member: FamilyMember, permission: FamilyPermission) => {
    const has = member.permissions.includes(permission);
    const next = has
      ? member.permissions.filter((p) => p !== permission)
      : [...member.permissions, permission];
    try {
      setFamily(await familyApi.updateMemberPermissions(member.userId, next));
    } catch (err) {
      handleError(err, 'Không cập nhật được quyền hạn.');
    }
  };

  const otherMembers = family?.members.filter((member) => member.userId !== user?.id) ?? [];

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden flex font-body-md">
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
              <span className="font-bold text-primary text-sm">Quản lý gia đình</span>
            </div>
            <div className="flex gap-4">
              <NotificationDropdown />
              <Link to="/profile" className="text-on-surface-variant font-medium hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80 active:scale-95 duration-150">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
            </div>
          </div>
        </header>
        <header className="md:hidden shrink-0 h-16 bg-surface flex items-center px-4 border-b border-outline-variant z-40">
          <button className="text-on-surface p-2 -ml-2 mr-2" onClick={() => window.history.back()}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-sm text-headline-sm text-on-surface">Quản lý Nhóm Gia Đình</h1>
        </header>

        <main className="flex-1 overflow-y-auto w-full">
          <div className="pt-4 md:pt-12 px-4 md:px-8 max-w-5xl mx-auto w-full pb-[100px] md:pb-8">
            {loading ? (
              <ListRowsSkeleton count={4} />
            ) : (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h1 className="font-headline-md text-headline-md text-primary mb-2 hidden md:block">Quản lý Nhóm Gia Đình</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">Gia đình "{family?.name ?? '...'}"</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary text-on-secondary font-body-md text-body-md px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Tạo nhóm mới
                    </button>
                    <button
                      onClick={() => setIsJoinModalOpen(true)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-container text-on-primary-container font-body-md text-body-md px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">group_add</span>
                      Nhập mã mời
                    </button>
                    {canManage && (
                      <button
                        onClick={openInviteQR}
                        disabled={working}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-on-primary font-body-md text-body-md px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        {working ? 'Đang tạo...' : 'Tạo mã mời'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-8 bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-outline-variant/30">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Danh sách Nhóm Gia Đình</h3>
                  <div className="space-y-3">
                    {families.map((f) => (
                      <div key={f.id} className={`flex items-center justify-between p-4 rounded-lg border ${f.id === family?.id ? 'bg-primary-container/20 border-primary' : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low'} transition-colors`}>
                        <div>
                          <p className="font-body-lg text-body-lg font-bold text-on-surface flex items-center gap-2">
                            {f.name}
                            {f.id === family?.id && <span className="text-xs bg-primary text-on-primary px-2 py-0.5 rounded-full font-bold">Đang chọn</span>}
                          </p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                            {f.members.length} thành viên
                          </p>
                        </div>
                        {f.id !== family?.id && (
                          <button
                            onClick={() => handleSwitchFamily(f.id)}
                            disabled={working}
                            className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg font-label-sm transition-colors disabled:opacity-50"
                          >
                            Chuyển
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-outline-variant/30">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Thành viên ({family?.members.length ?? 0})</h3>
                      <div className="space-y-4">
                        {family?.members.map(member => {
                          const isMe = member.userId === user?.id;
                          const name = isMe ? user?.displayName ?? memberName(member) : memberName(member);
                          return (
                            <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors group">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-headline-sm ${isMe ? 'border-2 border-primary bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                    {member.user?.avatarUrl ? (
                                      <img alt="Avatar" className="w-full h-full object-cover" src={member.user.avatarUrl}/>
                                    ) : (
                                      name.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  {isMe && (
                                    <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-surface-container-lowest">
                                      Bạn
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-body-md text-body-md font-bold text-on-surface">{name}</p>
                                  <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                                    {member.role === 'owner' && <span className="material-symbols-outlined text-[14px] text-tertiary">stars</span>}
                                    {ROLE_LABELS[member.role]}
                                  </p>
                                </div>
                              </div>
                              {!isMe && canManage && member.role !== 'owner' && (
                                <button onClick={() => removeMember(member)} className="text-error p-2 hover:bg-error-container rounded-full transition-colors" title="Xóa thành viên">
                                  <span className="material-symbols-outlined">person_remove</span>
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {(family?.activeInvites.length ?? 0) > 0 && family!.activeInvites.map((activeInvite, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-dashed border-outline-variant bg-surface-container-low/50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center text-outline-variant">
                                <span className="material-symbols-outlined">mail</span>
                              </div>
                              <div>
                                <p className="font-body-md text-body-md text-on-surface opacity-70">Mã mời đang hoạt động</p>
                                <p className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                                  Hết hạn: {new Date(activeInvite.expiresAt).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-outline-variant/30">
                      <div className="flex items-center gap-2 mb-4 text-primary">
                        <span className="material-symbols-outlined">shield_lock</span>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Quyền hạn thành viên</h3>
                      </div>
                      {!canManage ? (
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Chỉ chủ hộ mới có thể thay đổi quyền hạn.</p>
                      ) : otherMembers.length === 0 ? (
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Chưa có thành viên khác. Hãy tạo mã mời để thêm người thân.</p>
                      ) : (
                        <div className="space-y-6">
                          {otherMembers.map((member) => (
                            <div key={member.userId}>
                              <p className="font-body-md text-body-md font-bold text-on-surface mb-3">{memberName(member)}</p>
                              <div className="space-y-4">
                                {([
                                  { key: 'edit_pantry', label: 'Quản lý tủ lạnh', desc: 'Thêm, sửa và dùng thực phẩm.' },
                                  { key: 'edit_lists', label: 'Chỉnh sửa danh sách đi chợ', desc: 'Thêm, xóa hoặc đánh dấu đã mua.' },
                                  { key: 'edit_meals', label: 'Lên kế hoạch bữa ăn', desc: 'Thêm món vào lịch trình.' },
                                ] as { key: FamilyPermission; label: string; desc: string }[]).map(({ key, label, desc }) => (
                                  <label key={key} className="flex items-start justify-between cursor-pointer group">
                                    <div className="flex-1 pr-4">
                                      <p className="font-body-md text-body-md text-on-surface">{label}</p>
                                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{desc}</p>
                                    </div>
                                    <div className="relative">
                                      <input
                                        checked={member.permissions.includes(key)}
                                        onChange={() => togglePermission(member, key)}
                                        className="sr-only peer"
                                        type="checkbox"
                                      />
                                      <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                              <hr className="border-outline-variant/30 mt-4"/>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Modal: Join by Code */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Tham gia nhóm gia đình</h2>
                <button onClick={() => setIsJoinModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleJoin}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block font-label-md text-on-surface mb-1">Mã mời</label>
                    <input
                      type="text"
                      required
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value)}
                      placeholder="Nhập mã mời (VD: ABC123XYZ)..."
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all uppercase tracking-widest"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg font-label-md font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={working}
                    className="px-5 py-2.5 rounded-lg font-label-md font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                  >
                    {working ? 'Đang xử lý...' : 'Tham gia'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Invite QR Code */}
        {isQRModalOpen && invite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl border border-outline-variant/30 flex flex-col items-center">
              <div className="w-full flex justify-end mb-2">
                <button onClick={() => setIsQRModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors -mr-2 -mt-2">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <h2 className="font-headline-sm text-headline-sm text-primary mb-2 text-center">Mã mời tham gia gia đình</h2>
              <p className="font-body-md text-on-surface-variant text-center mb-6">Gửi mã này cho người thân để họ nhập trong mục "Nhập mã mời".</p>

              <div className="w-48 h-48 bg-white p-2 rounded-xl mb-6 shadow-sm border border-outline-variant">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(invite.inviteCode)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="bg-surface-container-low w-full rounded-lg p-3 text-center mb-2">
                <span className="font-label-sm text-on-surface-variant block mb-1">Mã mời (hết hạn {new Date(invite.expiresAt).toLocaleString('vi-VN')})</span>
                <span className="font-headline-sm font-bold text-on-surface tracking-widest select-all">{invite.inviteCode}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create Family */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Tạo nhóm gia đình mới</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateFamily}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block font-label-md text-on-surface mb-1">Tên nhóm gia đình</label>
                    <input
                      type="text"
                      required
                      value={newFamilyName}
                      onChange={e => setNewFamilyName(e.target.value)}
                      placeholder="Nhập tên nhóm..."
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg font-label-md font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={working || !newFamilyName.trim()}
                    className="px-5 py-2.5 rounded-lg font-label-md font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                  >
                    {working ? 'Đang tạo...' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

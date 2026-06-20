import { createMockModel, MockModel, mockQuery } from '../../test/utils/mock-model';
import { oid } from '../../test/utils/fixtures';
import { ExpiryNotificationsService } from './expiry-notifications.service';

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function makeLeanItem(expiryDate: Date, familyId = oid()) {
  return {
    _id: oid(),
    familyId,
    foodId: oid(),
    categoryId: oid(),
    name: 'Sua tuoi',
    quantity: 1,
    expiryDate,
    status: 'active',
  };
}

describe('ExpiryNotificationsService', () => {
  let service: ExpiryNotificationsService;
  let pantryItemModel: MockModel;
  let familyModel: MockModel;
  let userModel: MockModel;
  let notificationsService: {
    createManyDeduped: jest.Mock;
    normalizeLegacyVietnameseText: jest.Mock;
  };
  let realtimeService: { emitToUser: jest.Mock };

  const memberId = oid();

  beforeEach(() => {
    pantryItemModel = createMockModel();
    familyModel = createMockModel();
    userModel = createMockModel();
    notificationsService = {
      createManyDeduped: jest.fn().mockResolvedValue({ createdCount: 0, created: [] }),
      normalizeLegacyVietnameseText: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    };
    realtimeService = { emitToUser: jest.fn() };

    service = new ExpiryNotificationsService(
      pantryItemModel as never,
      familyModel as never,
      userModel as never,
      notificationsService as never,
      realtimeService as never,
    );
  });

  // Helper: a family with one active member, and that member opted into reminders.
  function wireFamilyAndUser(familyId: number | string | object, warningDays = 3) {
    familyModel.findById.mockReturnValue(
      mockQuery({ members: [{ userId: memberId, status: 'active' }] }),
    );
    userModel.find.mockReturnValue(
      mockQuery([
        {
          _id: memberId,
          notificationSettings: { expiryReminder: true, expiryReminderDays: warningDays },
        },
      ]),
    );
  }

  it('không tạo thông báo khi không có item nào sắp/đã hết hạn', async () => {
    pantryItemModel.find.mockReturnValue(mockQuery([]));

    const result = await service.createExpiryNotifications();

    expect(notificationsService.createManyDeduped).toHaveBeenCalledWith([]);
    expect(realtimeService.emitToUser).not.toHaveBeenCalled();
    expect(result.createdCount).toBe(0);
  });

  it('tạo thông báo pantry_expired cho thành viên đã bật nhắc hạn', async () => {
    const item = makeLeanItem(daysFromNow(-2));
    pantryItemModel.find.mockReturnValue(mockQuery([item]));
    wireFamilyAndUser(item.familyId);

    await service.createExpiryNotifications();

    const notifications = notificationsService.createManyDeduped.mock.calls[0][0];
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('pantry_expired');
    expect(notifications[0].userId).toBe(memberId);
    expect(notifications[0].dedupeKey.startsWith('pantry_expired:')).toBe(true);
  });

  it('phân loại pantry_expiring cho item hết hạn trong cửa sổ cảnh báo', async () => {
    const item = makeLeanItem(daysFromNow(1));
    pantryItemModel.find.mockReturnValue(mockQuery([item]));
    wireFamilyAndUser(item.familyId, 7);

    await service.createExpiryNotifications();

    const notifications = notificationsService.createManyDeduped.mock.calls[0][0];
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('pantry_expiring');
  });

  it('bỏ qua item khi trạng thái còn an toàn', async () => {
    const item = makeLeanItem(daysFromNow(400));
    pantryItemModel.find.mockReturnValue(mockQuery([item]));
    wireFamilyAndUser(item.familyId);

    await service.createExpiryNotifications();

    expect(notificationsService.createManyDeduped).toHaveBeenCalledWith([]);
  });

  it('bỏ qua item khi không tìm thấy family', async () => {
    const item = makeLeanItem(daysFromNow(-1));
    pantryItemModel.find.mockReturnValue(mockQuery([item]));
    familyModel.findById.mockReturnValue(mockQuery(null));

    await service.createExpiryNotifications();

    expect(notificationsService.createManyDeduped).toHaveBeenCalledWith([]);
    expect(userModel.find).not.toHaveBeenCalled();
  });

  it('phát realtime cho từng thông báo vừa được tạo', async () => {
    const item = makeLeanItem(daysFromNow(-1));
    pantryItemModel.find.mockReturnValue(mockQuery([item]));
    wireFamilyAndUser(item.familyId);
    notificationsService.createManyDeduped.mockResolvedValue({
      createdCount: 1,
      created: [{ id: 'n1', userId: 'u1' }],
    });

    await service.createExpiryNotifications();

    expect(realtimeService.emitToUser).toHaveBeenCalledWith(
      'u1',
      'notification:new',
      expect.objectContaining({ id: 'n1' }),
    );
  });

  it('chuẩn hóa thông báo cũ trước khi quét lúc khởi động', async () => {
    pantryItemModel.find.mockReturnValue(mockQuery([]));

    await service.createExpiryNotificationsOnStartup();

    expect(notificationsService.normalizeLegacyVietnameseText).toHaveBeenCalledTimes(1);
    expect(notificationsService.createManyDeduped).toHaveBeenCalledWith([]);
  });
});

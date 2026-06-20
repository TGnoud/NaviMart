import { Types } from 'mongoose';
import { AiChefService } from './ai-chef.service';
import { createMockModel, mockQuery, MockModel } from '../../test/utils/mock-model';
import { makeUser, makePantryItem } from '../../test/utils/fixtures';

/**
 * Unit tests for AiChefService. The Timely client is a plain mock so no network
 * is touched; we assert pantry-context building, family resolution fallback,
 * conversation-id handling, and the prompt/session wiring passed to Timely.
 */
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

describe('AiChefService', () => {
  let service: AiChefService;
  let familyModel: MockModel;
  let pantryModel: MockModel;
  let timely: { isConfigured: boolean; complete: jest.Mock };

  // A user whose membership in the active family will resolve as active.
  const familyId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const user = makeUser({
    userId: userId.toString(),
    activeFamilyId: familyId.toString(),
  });

  /** A family doc shaped like resolveActiveFamilyId's lean projection. */
  function activeFamily() {
    return {
      _id: familyId,
      members: [{ userId, status: 'active' }],
    };
  }

  beforeEach(() => {
    familyModel = createMockModel();
    pantryModel = createMockModel();
    timely = {
      isConfigured: true,
      complete: jest.fn().mockResolvedValue('Gợi ý: canh chua cá.'),
    };
    service = new AiChefService(
      familyModel as never,
      pantryModel as never,
      timely as never,
    );
  });

  describe('getStatus', () => {
    it('reflects the Timely client configuration flag', () => {
      expect(service.getStatus()).toEqual({ configured: true });
      timely.isConfigured = false;
      expect(service.getStatus()).toEqual({ configured: false });
    });
  });

  describe('chat', () => {
    it('builds a pantry context and returns the reply + conversationId', async () => {
      familyModel.findById.mockReturnValue(mockQuery(activeFamily()));
      pantryModel.find.mockReturnValue(
        mockQuery([
          makePantryItem({ name: 'Thịt bò', quantity: 2, unit: 'kg', expiryDate: daysFromNow(100) }),
          makePantryItem({ name: 'Cà chua', quantity: 3, unit: 'quả', expiryDate: daysFromNow(100) }),
        ]),
      );

      const result = await service.chat(user, {
        message: 'Tối nay nấu gì?',
        conversationId: 'conv_abc',
      });

      expect(result).toEqual({
        reply: 'Gợi ý: canh chua cá.',
        conversationId: 'conv_abc',
      });

      // Pantry query is scoped + only counts in-stock active items.
      expect(pantryModel.find).toHaveBeenCalledWith({
        familyId,
        status: 'active',
        quantity: { $gt: 0 },
      });

      const [sessionId, prompt] = timely.complete.mock.calls[0];
      expect(sessionId).toBe(`navimart_${userId.toString()}_conv_abc`);
      expect(prompt).toContain('Thịt bò: 2 kg');
      expect(prompt).toContain('Cà chua: 3 quả');
      expect(prompt).toContain('Tối nay nấu gì?');
    });

    it('generates a new conversationId when none is supplied', async () => {
      familyModel.findById.mockReturnValue(mockQuery(activeFamily()));
      pantryModel.find.mockReturnValue(mockQuery([]));

      const result = await service.chat(user, { message: 'Xin chào' });

      expect(result.conversationId).toMatch(/^conv_[a-f0-9]{24}$/);
      expect(timely.complete.mock.calls[0][0]).toBe(
        `navimart_${userId.toString()}_${result.conversationId}`,
      );
    });

    it('flags an EMPTY fridge when the family has no in-stock items', async () => {
      familyModel.findById.mockReturnValue(mockQuery(activeFamily()));
      pantryModel.find.mockReturnValue(mockQuery([]));

      await service.chat(user, { message: 'Gợi ý món' });

      expect(timely.complete.mock.calls[0][1]).toContain('TRỐNG');
    });

    it('still works for a user without a family (empty pantry, no throw)', async () => {
      const noFamilyUser = makeUser({ activeFamilyId: undefined });

      const result = await service.chat(noFamilyUser, { message: 'Hi' });

      expect(result.reply).toBe('Gợi ý: canh chua cá.');
      expect(pantryModel.find).not.toHaveBeenCalled();
      expect(timely.complete.mock.calls[0][1]).toContain('TRỐNG');
    });

    it('falls back to an empty pantry if the caller is not an active member', async () => {
      // Family exists but the user is not a member → resolveActiveFamilyId
      // throws, which chat() catches → empty pantry context.
      familyModel.findById.mockReturnValue(
        mockQuery({ _id: familyId, members: [] }),
      );

      await service.chat(user, { message: 'Hi' });

      expect(pantryModel.find).not.toHaveBeenCalled();
      expect(timely.complete.mock.calls[0][1]).toContain('TRỐNG');
    });

    it('annotates expired and soon-to-expire items in the context', async () => {
      familyModel.findById.mockReturnValue(mockQuery(activeFamily()));
      pantryModel.find.mockReturnValue(
        mockQuery([
          makePantryItem({ name: 'Sữa', expiryDate: daysFromNow(-1) }),
          makePantryItem({ name: 'Rau', expiryDate: daysFromNow(2) }),
          makePantryItem({ name: 'Gạo', expiryDate: daysFromNow(100) }),
        ]),
      );

      await service.chat(user, { message: 'Cần giải cứu gì?' });

      const prompt = timely.complete.mock.calls[0][1];
      expect(prompt).toContain('Sữa');
      expect(prompt).toContain('[ĐÃ HẾT HẠN]');
      expect(prompt).toContain('[SẮP HẾT HẠN');
    });

    it('propagates Timely failures to the caller', async () => {
      familyModel.findById.mockReturnValue(mockQuery(activeFamily()));
      pantryModel.find.mockReturnValue(mockQuery([]));
      timely.complete.mockRejectedValueOnce(new Error('AI down'));

      await expect(
        service.chat(user, { message: 'Hi' }),
      ).rejects.toThrow('AI down');
    });
  });
});

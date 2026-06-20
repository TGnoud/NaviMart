import { AiChefController } from './ai-chef.controller';
import { makeUser } from '../../test/utils/fixtures';

/**
 * Thin controller: assert it delegates to the service and passes the current
 * user + body straight through.
 */
describe('AiChefController', () => {
  let controller: AiChefController;
  let service: { getStatus: jest.Mock; chat: jest.Mock };

  beforeEach(() => {
    service = {
      getStatus: jest.fn().mockReturnValue({ configured: true }),
      chat: jest.fn().mockResolvedValue({ reply: 'ok', conversationId: 'c1' }),
    };
    controller = new AiChefController(service as never);
  });

  it('GET status delegates to the service', () => {
    expect(controller.getStatus()).toEqual({ configured: true });
    expect(service.getStatus).toHaveBeenCalledTimes(1);
  });

  it('POST chat forwards the user and dto and returns the reply', async () => {
    const user = makeUser();
    const dto = { message: 'Tối nay nấu gì?' };

    const result = await controller.chat(user, dto);

    expect(result).toEqual({ reply: 'ok', conversationId: 'c1' });
    expect(service.chat).toHaveBeenCalledWith(user, dto);
  });
});

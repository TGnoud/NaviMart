import { RealtimeService } from './realtime.service';

describe('RealtimeService', () => {
  it('does nothing before a socket server is attached', () => {
    const service = new RealtimeService();

    expect(() => service.emitToFamily('family1', 'event', {})).not.toThrow();
    expect(() => service.emitToUser('user1', 'event', {})).not.toThrow();
  });

  it('emits events to family and user rooms', () => {
    const emit = jest.fn();
    const to = jest.fn(() => ({ emit }));
    const service = new RealtimeService();

    service.setServer({ to } as never);
    service.emitToFamily('family1', 'pantry:updated', { id: 'item1' });
    service.emitToUser('user1', 'notification:new', { id: 'n1' });

    expect(to).toHaveBeenNthCalledWith(1, 'family:family1');
    expect(emit).toHaveBeenNthCalledWith(1, 'pantry:updated', { id: 'item1' });
    expect(to).toHaveBeenNthCalledWith(2, 'user:user1');
    expect(emit).toHaveBeenNthCalledWith(2, 'notification:new', { id: 'n1' });
  });
});

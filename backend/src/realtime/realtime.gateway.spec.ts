import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RealtimeGateway } from './realtime.gateway';

function makeSocket(token?: unknown) {
  return {
    id: 'socket1',
    handshake: { auth: { token } },
    disconnect: jest.fn(),
    join: jest.fn(),
  };
}

describe('RealtimeGateway', () => {
  const jwtService = { verifyAsync: jest.fn() };
  const configService = { getOrThrow: jest.fn(() => 'secret') };
  const realtimeService = { setServer: jest.fn() };
  let gateway: RealtimeGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new RealtimeGateway(
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      realtimeService as never,
    );
  });

  it('registers the socket server after init', () => {
    const server = {};
    gateway.afterInit(server as never);
    expect(realtimeService.setServer).toHaveBeenCalledWith(server);
  });

  it('disconnects clients without a token', async () => {
    const socket = makeSocket();

    await gateway.handleConnection(socket as never);

    expect(socket.disconnect).toHaveBeenCalledWith(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('disconnects clients with an invalid token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));
    const socket = makeSocket('token');

    await gateway.handleConnection(socket as never);

    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });

  it('joins user and family rooms for a valid token', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user1',
      activeFamilyId: 'family1',
    });
    const socket = makeSocket('token');

    await gateway.handleConnection(socket as never);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', {
      secret: 'secret',
    });
    expect(socket.join).toHaveBeenCalledWith('user:user1');
    expect(socket.join).toHaveBeenCalledWith('family:family1');
    expect(socket.disconnect).not.toHaveBeenCalled();
  });

  it('does not join a family room when the token has no active family', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user1' });
    const socket = makeSocket('token');

    await gateway.handleConnection(socket as never);

    expect(socket.join).toHaveBeenCalledTimes(1);
    expect(socket.join).toHaveBeenCalledWith('user:user1');
  });
});

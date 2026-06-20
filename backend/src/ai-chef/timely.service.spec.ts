import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TimelyService } from './timely.service';

/**
 * Unit tests for the TimelyGPT client. `fetch` is mocked globally so no real
 * network call is made; we assert the auth/caching/retry/error logic only.
 */
type FetchInit = { json?: unknown; text?: string; status?: number; ok?: boolean };

function fakeResponse(init: FetchInit): Response {
  const status = init.status ?? 200;
  return {
    ok: init.ok ?? (status >= 200 && status < 300),
    status,
    json: async () => init.json,
    text: async () => init.text ?? '',
  } as unknown as Response;
}

const AUTH_OK = { json: { success: true, data: { access_token: 'tok-123' } } };
const COMPLETION_OK = {
  json: { type: 'final_response', message: 'Hôm nay nấu canh chua nhé!' },
};

describe('TimelyService', () => {
  let service: TimelyService;
  let config: { get: jest.Mock };
  let mockFetch: jest.Mock;

  const ENV_KEYS = ['TIMELY_API_KEY', 'TIMELY_BASE_URL', 'TIMELY_MODEL'];
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    // Isolate from any real env so config is the single source of truth.
    for (const k of ENV_KEYS) {
      savedEnv[k] = process.env[k];
      delete process.env[k];
    }
    const values: Record<string, string> = {
      TIMELY_API_KEY: 'secret-key',
      TIMELY_BASE_URL: 'https://timely.test/api',
      TIMELY_MODEL: 'gpt-test',
    };
    config = { get: jest.fn((key: string) => values[key]) };
    service = new TimelyService(config as unknown as ConfigService);

    mockFetch = jest.fn();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
    jest.restoreAllMocks();
  });

  describe('isConfigured', () => {
    it('is true when an API key is present', () => {
      expect(service.isConfigured).toBe(true);
    });

    it('is false when no API key is configured anywhere', () => {
      config.get.mockReturnValue(undefined);
      expect(service.isConfigured).toBe(false);
    });

    it('falls back to process.env.TIMELY_API_KEY', () => {
      config.get.mockReturnValue(undefined);
      process.env.TIMELY_API_KEY = 'env-key';
      expect(service.isConfigured).toBe(true);
    });
  });

  describe('complete', () => {
    it('throws ServiceUnavailable and makes no call when not configured', async () => {
      config.get.mockReturnValue(undefined);
      await expect(service.complete('sess', 'hi')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('authenticates then returns the completion message', async () => {
      mockFetch
        .mockResolvedValueOnce(fakeResponse(AUTH_OK))
        .mockResolvedValueOnce(fakeResponse(COMPLETION_OK));

      const reply = await service.complete('sess-1', 'Tối nay ăn gì?');

      expect(reply).toBe('Hôm nay nấu canh chua nhé!');
      // First call = auth (GET + X-Timely-API), second = completion (Bearer).
      const [authUrl, authInit] = mockFetch.mock.calls[0];
      expect(authUrl).toBe('https://timely.test/api/sdk-auth/authenticate');
      expect(authInit.method).toBe('GET');
      expect(authInit.headers['X-Timely-API']).toBe('secret-key');

      const [compUrl, compInit] = mockFetch.mock.calls[1];
      expect(compUrl).toBe('https://timely.test/api/llm-completion');
      expect(compInit.method).toBe('POST');
      expect(compInit.headers.Authorization).toBe('Bearer tok-123');
      const body = JSON.parse(compInit.body);
      expect(body.session_id).toBe('sess-1');
      expect(body.chat_model_node.model).toBe('gpt-test');
      expect(body.locale).toBe('vi');
      expect(body.messages[0].content).toContain('Tối nay ăn gì?');
    });

    it('caches the access token across calls (auth only once)', async () => {
      mockFetch
        .mockResolvedValueOnce(fakeResponse(AUTH_OK))
        .mockResolvedValueOnce(fakeResponse(COMPLETION_OK))
        .mockResolvedValueOnce(fakeResponse(COMPLETION_OK));

      await service.complete('s', 'a');
      await service.complete('s', 'b');

      // 1 auth + 2 completions = 3 (not 4) → token was reused.
      expect(mockFetch).toHaveBeenCalledTimes(3);
      const authCalls = mockFetch.mock.calls.filter(([url]) =>
        String(url).endsWith('/sdk-auth/authenticate'),
      );
      expect(authCalls).toHaveLength(1);
    });

    it('re-authenticates and retries once on a 401 completion', async () => {
      mockFetch
        .mockResolvedValueOnce(fakeResponse(AUTH_OK))
        .mockResolvedValueOnce(fakeResponse({ status: 401, json: {} }))
        .mockResolvedValueOnce(
          fakeResponse({ json: { success: true, data: { access_token: 'tok-2' } } }),
        )
        .mockResolvedValueOnce(fakeResponse(COMPLETION_OK));

      const reply = await service.complete('s', 'a');

      expect(reply).toBe('Hôm nay nấu canh chua nhé!');
      expect(mockFetch).toHaveBeenCalledTimes(4);
      // The retried completion uses the refreshed token.
      const lastCompletion = mockFetch.mock.calls[3][1];
      expect(lastCompletion.headers.Authorization).toBe('Bearer tok-2');
    });

    it('throws when authentication HTTP fails', async () => {
      mockFetch.mockResolvedValueOnce(fakeResponse({ status: 500, json: {} }));
      await expect(service.complete('s', 'a')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });

    it('throws when auth succeeds HTTP-wise but returns no token', async () => {
      mockFetch.mockResolvedValueOnce(
        fakeResponse({ json: { success: false } }),
      );
      await expect(service.complete('s', 'a')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });

    it('throws when the completion endpoint returns a non-OK status', async () => {
      mockFetch
        .mockResolvedValueOnce(fakeResponse(AUTH_OK))
        .mockResolvedValueOnce(fakeResponse({ status: 500, text: 'boom' }));
      await expect(service.complete('s', 'a')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });

    it('throws on an unexpected completion shape', async () => {
      mockFetch
        .mockResolvedValueOnce(fakeResponse(AUTH_OK))
        .mockResolvedValueOnce(fakeResponse({ json: { type: 'thinking' } }));
      await expect(service.complete('s', 'a')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });
});

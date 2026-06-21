import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GmailMailService } from './gmail-mail.service';

function makeConfig(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => values[key]),
    getOrThrow: jest.fn((key: string) => {
      const value = values[key];
      if (!value) {
        throw new Error(`Missing ${key}`);
      }
      return value;
    }),
  } as unknown as ConfigService;
}

function okJson(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue(data),
  } as unknown as Response;
}

function errorText(status: number, text: string) {
  return {
    ok: false,
    status,
    text: jest.fn().mockResolvedValue(text),
    json: jest.fn().mockResolvedValue({}),
  } as unknown as Response;
}

describe('GmailMailService', () => {
  const fullConfig = {
    PASSWORD_RESET_MAIL_MODE: 'gmail-api',
    GMAIL_FROM_EMAIL: 'noreply@example.com',
    GMAIL_CLIENT_ID: 'client',
    GMAIL_CLIENT_SECRET: 'secret',
    GMAIL_REFRESH_TOKEN: 'refresh',
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('is enabled only in gmail-api mode', () => {
    expect(new GmailMailService(makeConfig(fullConfig)).isEnabled()).toBe(true);
    expect(new GmailMailService(makeConfig({})).isEnabled()).toBe(false);
  });

  it('rejects mail sending when Gmail settings are missing', async () => {
    const service = new GmailMailService(makeConfig({}));

    await expect(
      service.sendPasswordResetCode('user@example.com', '123456'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('requests an OAuth token, sends a base64url Gmail message, and caches the token', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(okJson({ access_token: 'token1', expires_in: 3600 }))
      .mockResolvedValue(okJson({ id: 'message1' }));
    const service = new GmailMailService(makeConfig(fullConfig));

    await service.sendPasswordResetCode('user@example.com', '123456');
    await service.sendEmailVerificationCode('user@example.com', '654321');

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token1' }),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      3,
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token1' }),
      }),
    );
  });

  it('reports OAuth token failures', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ error_description: 'bad refresh' }),
    } as unknown as Response);
    const service = new GmailMailService(makeConfig(fullConfig));

    await expect(
      service.sendPasswordResetCode('user@example.com', '123456'),
    ).rejects.toThrow('bad refresh');
  });

  it('reports Gmail send failures with the response body', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(okJson({ access_token: 'token1', expires_in: 3600 }))
      .mockResolvedValueOnce(errorText(500, 'send failed'));
    const service = new GmailMailService(makeConfig(fullConfig));

    await expect(
      service.sendPasswordResetCode('user@example.com', '123456'),
    ).rejects.toThrow('send failed');
  });
});

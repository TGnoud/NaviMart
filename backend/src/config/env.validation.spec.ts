import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('fills safe development defaults for missing optional values', () => {
    const result = validateEnv({});

    expect(result).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      MONGODB_URI: 'mongodb://localhost:27017/navimart',
      CORS_ORIGIN: 'http://localhost:5173',
      JWT_ACCESS_SECRET: 'dev-access-secret-change-me',
      JWT_REFRESH_SECRET: 'dev-refresh-secret-change-me',
      EXPIRY_NOTIFICATION_CRON: '0 8 * * *',
    });
    expect(result.MONGODB_DB_NAME).toBeUndefined();
  });

  it('parses explicit values and drops blank optional strings', () => {
    const result = validateEnv({
      NODE_ENV: 'test',
      PORT: '4000',
      MONGODB_URI: 'mongodb://db/navimart',
      MONGODB_DB_NAME: 'navimart_test',
      CORS_ORIGIN: 'http://app',
      CLOUDINARY_CLOUD_NAME: '',
      TIMELY_MODEL: 'model1',
    });

    expect(result.PORT).toBe(4000);
    expect(result.MONGODB_DB_NAME).toBe('navimart_test');
    expect(result.CLOUDINARY_CLOUD_NAME).toBeUndefined();
    expect(result.TIMELY_MODEL).toBe('model1');
  });

  it('rejects unsupported NODE_ENV values', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow(
      'NODE_ENV must be one of',
    );
  });

  it('rejects invalid TCP ports', () => {
    expect(() => validateEnv({ PORT: '0' })).toThrow(
      'PORT must be a valid TCP port number',
    );
    expect(() => validateEnv({ PORT: '70000' })).toThrow(
      'PORT must be a valid TCP port number',
    );
    expect(() => validateEnv({ PORT: 'abc' })).toThrow(
      'PORT must be a valid TCP port number',
    );
  });
});

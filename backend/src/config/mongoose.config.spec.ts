import { ConfigService } from '@nestjs/config';
import { createMongooseOptions } from './mongoose.config';

function makeConfig(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => values[key]),
    getOrThrow: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

describe('createMongooseOptions', () => {
  it('maps uri, database name and non-production autoIndex', () => {
    const options = createMongooseOptions(
      makeConfig({
        MONGODB_URI: 'mongodb://localhost/navimart',
        MONGODB_DB_NAME: 'navimart_test',
        NODE_ENV: 'test',
      }),
    );

    expect(options).toEqual({
      uri: 'mongodb://localhost/navimart',
      dbName: 'navimart_test',
      autoIndex: true,
    });
  });

  it('disables autoIndex in production', () => {
    const options = createMongooseOptions(
      makeConfig({
        MONGODB_URI: 'mongodb://prod/navimart',
        NODE_ENV: 'production',
      }),
    );

    expect(options.autoIndex).toBe(false);
  });
});

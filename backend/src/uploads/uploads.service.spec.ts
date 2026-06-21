import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadsService } from './uploads.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

function makeConfig(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

describe('UploadsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures Cloudinary when credentials are present', () => {
    new UploadsService(
      makeConfig({
        CLOUDINARY_CLOUD_NAME: 'cloud',
        CLOUDINARY_API_KEY: 'key',
        CLOUDINARY_API_SECRET: 'secret',
      }),
    );

    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'cloud',
      api_key: 'key',
      api_secret: 'secret',
      secure: true,
    });
  });

  it('rejects uploads when Cloudinary is not configured', async () => {
    const service = new UploadsService(makeConfig({}));

    await expect(
      service.uploadImage({ buffer: Buffer.from('x') } as Express.Multer.File),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('uploads an image stream and maps Cloudinary response fields', async () => {
    const stream = { end: jest.fn() };
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (_options, callback) => {
        callback(null, {
          public_id: 'navimart/item',
          url: 'http://image',
          secure_url: 'https://image',
          width: 640,
          height: 480,
          format: 'jpg',
          bytes: 1234,
        });
        return stream;
      },
    );
    const service = new UploadsService(
      makeConfig({
        CLOUDINARY_CLOUD_NAME: 'cloud',
        CLOUDINARY_API_KEY: 'key',
        CLOUDINARY_API_SECRET: 'secret',
        CLOUDINARY_UPLOAD_FOLDER: 'custom-folder',
      }),
    );

    const result = await service.uploadImage({
      buffer: Buffer.from('image'),
    } as Express.Multer.File);

    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: 'custom-folder',
        resource_type: 'image',
        use_filename: true,
      }),
      expect.any(Function),
    );
    expect(stream.end).toHaveBeenCalledWith(Buffer.from('image'));
    expect(result).toEqual({
      publicId: 'navimart/item',
      url: 'http://image',
      secureUrl: 'https://image',
      width: 640,
      height: 480,
      format: 'jpg',
      bytes: 1234,
    });
  });

  it('converts Cloudinary stream failures into rejected uploads', async () => {
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (_options, callback) => {
        callback(new Error('upload failed'));
        return { end: jest.fn() };
      },
    );
    const service = new UploadsService(
      makeConfig({
        CLOUDINARY_CLOUD_NAME: 'cloud',
        CLOUDINARY_API_KEY: 'key',
        CLOUDINARY_API_SECRET: 'secret',
      }),
    );

    await expect(
      service.uploadImage({ buffer: Buffer.from('x') } as Express.Multer.File),
    ).rejects.toThrow('upload failed');
  });
});

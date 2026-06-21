import { BadRequestException } from '@nestjs/common';
import { UploadsController } from './uploads.controller';

describe('UploadsController', () => {
  const uploadsService = {
    uploadImage: jest.fn(),
  };

  let controller: UploadsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UploadsController(uploadsService as never);
  });

  it('requires an uploaded file', () => {
    expect(() => controller.uploadImage()).toThrow(BadRequestException);
  });

  it('delegates image upload to the service', async () => {
    const file = { buffer: Buffer.from('image') } as Express.Multer.File;
    const uploaded = { publicId: 'p1' };
    uploadsService.uploadImage.mockResolvedValue(uploaded);

    await expect(controller.uploadImage(file)).resolves.toBe(uploaded);
    expect(uploadsService.uploadImage).toHaveBeenCalledWith(file);
  });
});

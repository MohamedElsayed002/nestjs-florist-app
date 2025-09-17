import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ProductImageService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string; imageId: string }> {
    if (!file) {
      throw new BadRequestException(
        'File is missing! Ensure you are sending a valid file.',
      );
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'products' }, (error, result) => {
          if (error) {
            reject(new Error('Failed to upload image to Cloudinary'));
          } else {
            resolve({ imageUrl: result.secure_url, imageId: result.public_id });
          }
        })
        .end(file.buffer);
    });
  }

  async deleteImage(imageId?: string): Promise<void> {
    if (!imageId) return;
    try {
      await cloudinary.uploader.destroy(imageId);
    } catch (error) {
      // ignore deletion errors, not critical for workflow
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.logger.log('Cloudinary configurado com sucesso.');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            this.logger.error('Erro no upload para o Cloudinary:', error);
            return reject(
              new Error(error.message || 'Erro no upload para o Cloudinary'),
            );
          }
          if (result) return resolve(result);
          return reject(new Error('Resposta vazia do Cloudinary'));
        },
      );

      uploadStream.write(file.buffer);
      uploadStream.end();
    });
  }
}

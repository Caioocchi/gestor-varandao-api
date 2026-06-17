import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, mongo, ConnectionStates } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class GridFsService implements OnModuleInit {
  private bucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    if (this.connection.readyState === ConnectionStates.connected) {
      this.initBucket();
    } else {
      this.connection.once('open', () => {
        this.initBucket();
      });
    }
  }

  private initBucket() {
    if (this.connection.db) {
      this.bucket = new mongo.GridFSBucket(this.connection.db, {
        bucketName: 'uploads',
      });
    }
  }

  private getBucket(): GridFSBucket {
    if (!this.bucket) {
      if (!this.connection.db) {
        throw new BadRequestException(
          'Conexão com o MongoDB não estabelecida.',
        );
      }
      this.bucket = new mongo.GridFSBucket(this.connection.db, {
        bucketName: 'uploads',
      });
    }
    return this.bucket;
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ id: string; filename: string; contentType: string }> {
    const bucket = this.getBucket();
    const filename = `${Date.now()}-${file.originalname}`;
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType: file.mimetype },
    });

    const readableStream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      readableStream
        .pipe(uploadStream)
        .on('error', (err) => {
          reject(
            new BadRequestException(
              `Erro no upload para o GridFS: ${err.message}`,
            ),
          );
        })
        .on('finish', () => {
          resolve({
            id: uploadStream.id.toString(),
            filename,
            contentType: file.mimetype,
          });
        });
    });
  }

  async deleteFile(id: string): Promise<void> {
    if (!id || !ObjectId.isValid(id)) return;
    const bucket = this.getBucket();
    try {
      await bucket.delete(new ObjectId(id));
    } catch (err) {
      console.warn(
        `GridFS: Arquivo com ID ${id} não pôde ser excluído ou não existe.`,
        err,
      );
    }
  }

  openDownloadStream(id: string) {
    const bucket = this.getBucket();
    return bucket.openDownloadStream(new ObjectId(id));
  }

  async getFileInfo(id: string) {
    const bucket = this.getBucket();
    const files = await bucket.find({ _id: new ObjectId(id) }).toArray();
    if (files.length === 0) {
      throw new BadRequestException('Arquivo não encontrado no GridFS');
    }
    const file = files[0];
    return {
      filename: file.filename,
      length: file.length,
      contentType: file.metadata?.contentType || 'application/octet-stream',
    };
  }

  getFileUrl(req: any, id: string): string {
    const host = req.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${host}/arquivos/file/${id}`;
  }
}

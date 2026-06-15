import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conteudo, ConteudoSchema } from './arquivos.schema';
import { ArquivosController } from './arquivos.controller';
import { ArquivosService } from './arquivos.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Conteudo.name,
        schema: ConteudoSchema,
      },
    ]),
    CloudinaryModule,
  ],
  controllers: [ArquivosController],
  providers: [ArquivosService],
  exports: [ArquivosService],
})
export class ArquivosModule {}

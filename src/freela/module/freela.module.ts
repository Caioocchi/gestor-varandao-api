import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FreelaService } from '../service/freela.service';
import { FreelaController } from '../controller/freela.controller';

import { Freela, FreelaSchema } from '../schemas/freela.schema';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Freela.name,
        schema: FreelaSchema,
      },
    ]),
    CloudinaryModule,
  ],
  controllers: [FreelaController],
  providers: [FreelaService],
})
export class FreelaModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FreelaService } from '../service/freela.service';
import { FreelaController } from '../controller/freela.controller';

import { Freela, FreelaSchema } from '../schemas/freela.schema';
import { GridFsModule } from '../../gridfs/gridfs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Freela.name,
        schema: FreelaSchema,
      },
    ]),
    GridFsModule,
  ],
  controllers: [FreelaController],
  providers: [FreelaService],
})
export class FreelaModule {}

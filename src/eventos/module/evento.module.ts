import { Module } from '@nestjs/common';
import { EventoService } from '../service/evento.service';
import { EventosController } from '../controller/evento.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Evento, EventoSchema } from '../schemas/evento.schema';
import { NotificationModule } from './notification.module';
import { GridFsModule } from '../../gridfs/gridfs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Evento.name,
        schema: EventoSchema,
      },
    ]),
    NotificationModule,
    GridFsModule,
  ],
  providers: [EventoService],
  controllers: [EventosController],
})
export class EventosModule {}

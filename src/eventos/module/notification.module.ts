import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Evento, EventoSchema } from '../schemas/evento.schema';
import { User, UserSchema } from '../../users/schemas/user.schema';
import { Freela, FreelaSchema } from '../../freela/schemas/freela.schema';
import { NotificationService } from '../service/notification.service';
import { CronNotificationService } from '../service/cron-notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Evento.name, schema: EventoSchema },
      { name: User.name, schema: UserSchema },
      { name: Freela.name, schema: FreelaSchema },
    ]),
  ],
  providers: [NotificationService, CronNotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

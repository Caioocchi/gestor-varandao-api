import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FreelaModule } from './freela/module/freela.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/module/auth.module';
import { UserModule } from './users/module/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => ({
        uri: configService.get<string>(
          'MONGODB_URI'
        )
      })
    }),
    FreelaModule,
    AuthModule,
    UserModule
  ]
})
export class AppModule {}

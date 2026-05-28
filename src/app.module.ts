import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FreelaModule } from './freela/module/freela.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/module/auth.module';
import { UserModule } from './users/module/users.module';
import { EventosModule } from './eventos/module/evento.module';
import { ProdutoModule } from './produtos/module/produto.module';
import { Produto, ProdutoSchema } from './produtos/schemas/produto.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature([
      {
        name: Produto.name,
        schema: ProdutoSchema,
      },
    ]),
    FreelaModule,
    AuthModule,
    UserModule,
    EventosModule,
    ProdutoModule,
  ],
  providers: [SeedService]
})
export class AppModule {}

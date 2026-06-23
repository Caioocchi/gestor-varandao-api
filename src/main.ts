import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { NestExpressApplication } from '@nestjs/platform-express';

import { join } from 'path';
import { SeedService } from './seed.service';

const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const seedService = app.get(SeedService);

  await seedService.seedProdutos();

  app.enableCors({
    origin: [
      'http://localhost:9000',
      'http://localhost:9200',
      'https://gestor-varandao-api.vercel.com',
      'https://gestor-varandao.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    redirect: false,
  });

  await app.listen(port, '0.0.0.0');
}
bootstrap();

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FreelaModule } from './module/freela.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://varandao:Varandao2026@ac-c5sbqiy-shard-00-00.8e4dtqg.mongodb.net:27017,ac-c5sbqiy-shard-00-01.8e4dtqg.mongodb.net:27017,ac-c5sbqiy-shard-00-02.8e4dtqg.mongodb.net:27017/?ssl=true&replicaSet=atlas-7xsur3-shard-0&authSource=admin&appName=varandao',
    ),
    FreelaModule
  ]
})
export class AppModule {}

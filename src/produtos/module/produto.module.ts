import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Produto, ProdutoSchema } from '../schemas/produto.schema';
import { ProdutoController } from '../controller/produto.controller';
import { ProdutoService } from '../service/produto.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Produto.name,
        schema: ProdutoSchema,
      },
    ]),
  ],

  controllers: [ProdutoController],

  providers: [ProdutoService],

  exports: [ProdutoService],
})
export class ProdutoModule {}

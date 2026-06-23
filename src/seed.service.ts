import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Produto } from './produtos/schemas/produto.schema';

import { produtosPadrao } from './produtos.seed';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Produto.name)
    private produtoModel: Model<Produto>,
  ) {}

  async seedProdutos() {
    const total = await this.produtoModel.countDocuments();

    if (total > 0) {
      return;
    }

    await this.produtoModel.insertMany(produtosPadrao);
  }
}

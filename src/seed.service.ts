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

    console.log('Verificando produtos...');

    const total =
      await this.produtoModel.countDocuments();

    console.log('Total:', total);

    if (total > 0) {
      console.log('Produtos já cadastrados');
      return;
    }

    await this.produtoModel.insertMany(
      produtosPadrao,
    );

    console.log('Produtos inseridos!');
  }
}
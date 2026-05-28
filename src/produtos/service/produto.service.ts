import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Produto } from '../schemas/produto.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProdutoService {

  constructor(
    @InjectModel(Produto.name)
    private produtoModel: Model<Produto>,
  ) {}

  async findAll() {
    return await this.produtoModel.find();
  }

  async findByCategoria(categoria: string) {
    return await this.produtoModel.find().where(categoria)
  }
}
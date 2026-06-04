import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Produto } from '../schemas/produto.schema';
import { Model } from 'mongoose';
import { CreateProdutoDto } from '../dto/produto.dto';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectModel(Produto.name)
    private produtoModel: Model<Produto>,
  ) {}

  async findAll(pagina: number = 1) {
    const limite = 10;
    const skip = (pagina - 1) * limite;
    return await this.produtoModel
      .find()
      .collation({ locale: 'pt', strength: 1 })
      .sort({
        categoria: 1,
        nome: 1,
      })
      .skip(skip)
      .limit(limite)
      .exec();
  }

  async findByCategoria(categoria: string) {
    return await this.produtoModel.find().where(categoria);
  }

  async createProduto(dto: CreateProdutoDto) {
    return await this.produtoModel.create(dto);
  }

  async deleteProdutoById(id: string) {
    return await this.produtoModel.findByIdAndDelete(id).exec();
  }
}

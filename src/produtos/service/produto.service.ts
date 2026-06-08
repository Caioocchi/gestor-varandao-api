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

  async findAll(pagina: number = 1, pesquisa?: string) {
    const limite = 10;
    const skip = (pagina - 1) * limite;

    const filtro: any = {};

    if (pesquisa) {
      const termo = pesquisa
        .trim()
        .replace(/[aáàâãä]/gi, '[aáàâãä]')
        .replace(/[eéèêẽë]/gi, '[eéèêẽë]')
        .replace(/[iíìîĩï]/gi, '[iíìîĩï]')
        .replace(/[oóòôõö]/gi, '[oóòôõö]')
        .replace(/[uúùûũü]/gi, '[uúùûũü]')
        .replace(/[cç]/gi, '[cç]');

      filtro.$or = [
        { nome: { $regex: termo, $options: 'i' } },
        { categoria: { $regex: termo, $options: 'i' } }
      ]
    }

    return await this.produtoModel
      .find(filtro)
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
    return await this.produtoModel.find({ categoria }).exec();
  }

  async createProduto(dto: CreateProdutoDto) {
    return await this.produtoModel.create(dto);
  }

  async findProdutoById(id: string): Promise<Produto | null> {
    return await this.produtoModel.findById(id).exec();
  }

  async deleteProdutoById(id: string) {
    return await this.produtoModel.findByIdAndDelete(id).exec();
  }

  async updateProdutoById(id: string, dto: CreateProdutoDto) {
    return await this.produtoModel.findByIdAndUpdate(id, dto).exec();
  }
}

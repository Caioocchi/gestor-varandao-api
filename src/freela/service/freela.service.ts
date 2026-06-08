import { Injectable } from '@nestjs/common';
import { CreateFreelaDto } from '../dto/freela.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Freela } from '../schemas/freela.schema';
import { Model } from 'mongoose';

@Injectable()
export class FreelaService {
  constructor(
    @InjectModel(Freela.name)
    private freelaModel: Model<Freela>,
  ) {}

  async createFreela(createFreelaDto: CreateFreelaDto): Promise<Freela> {
    const createdFreela = new this.freelaModel(createFreelaDto);
    return await createdFreela.save();
  }

  async findAllFreelas(pagina?: number, pesquisa?: string): Promise<Freela[]> {
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

      filtro.nome = {
        $regex: termo,
        $options: 'i',
      };
    }

    const query = this.freelaModel
      .find(filtro)
      .collation({ locale: 'pt', strength: 1 })
      .sort({ nome: 1 });

    if (pagina) {
      const limite = 10;
      const skip = (pagina - 1) * limite;

      query.skip(skip).limit(limite);
    }

    return await query.exec();
  }

  async findFreelaById(id: string): Promise<Freela | null> {
    return await this.freelaModel.findById(id).exec();
  }

  async deleteFreelaById(id: string): Promise<string> {
    await this.freelaModel.findByIdAndDelete(id).exec();

    return 'Freela excluído com sucesso.';
  }

  async updateFreelaById(id: string, dto: CreateFreelaDto): Promise<string> {
    await this.freelaModel.findByIdAndUpdate(id, dto);

    return 'Freela alterado com sucesso.';
  }
}

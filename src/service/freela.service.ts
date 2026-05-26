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

  async findAllFreelas(): Promise<Freela[]> {
    return await this.freelaModel.find().exec();
  }

  async findFreelaById(id: string): Promise<Freela | null> {
    return await this.freelaModel.findById(id).exec();
  }

  async deleteFreelaById(id: string): Promise<string> {
    await this.freelaModel.findByIdAndDelete(id).exec();

    return 'Freela excluído com sucesso.'
  }

  async updateFreelaById(id: string, dto: CreateFreelaDto): Promise<string> {
    await this.freelaModel.findByIdAndUpdate(id, dto)

    return 'Freela alterado com sucesso.'
  }
}

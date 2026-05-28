import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Evento } from '../schemas/evento.schema';
import { CreateEventoDTO } from '../dto/evento.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class EventoService {
    constructor(
        @InjectModel(Evento.name)
        private eventoModel: Model<Evento>
    ) {}

    async createEvento(dto: CreateEventoDTO): Promise<Evento> {
        const createdEvento = new this.eventoModel(dto);

        return await createdEvento.save();
    }

    async findAllEventos(): Promise<Evento[]> {
        return await this.eventoModel.find().exec()
    }

    async findEventoById(id: string): Promise<Evento | null> {
        return await this.eventoModel.findById(id).exec()
    }

    async updateEvento(id: string, dto: CreateEventoDTO): Promise<string> {
        await this.eventoModel.findByIdAndUpdate(id, dto)

        return 'Evento alterado com sucesso'
    }

    async deleteEvento(id: string): Promise<string> {
        await this.eventoModel.findByIdAndDelete(id)

        return 'Evento exlcuído'
    }
}

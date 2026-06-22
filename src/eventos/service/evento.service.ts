import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Evento } from '../schemas/evento.schema';
import { CreateEventoDTO } from '../dto/evento.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class EventoService {
  constructor(
    @InjectModel(Evento.name)
    private eventoModel: Model<Evento>,
  ) {}

  async createEvento(dto: CreateEventoDTO): Promise<Evento> {
    const createdEvento = new this.eventoModel(dto);

    return await createdEvento.save();
  }

  async findAllEventos(
    dataParam?: string,
    periodo?: string,
  ): Promise<Evento[]> {
    const query: any = {};

    if (dataParam) {
      const partes = dataParam.split('/').map((p) => p.trim());
      if (partes.length === 3) {
        const day = partes[0].padStart(2, '0');
        const month = partes[1].padStart(2, '0');
        let year = partes[2];
        if (year.length === 2) {
          year = '20' + year;
        }
        query.data = `${year}-${month}-${day}`;
      } else if (partes.length === 2) {
        if (partes[0] === '' && partes[1]) {
          // Busca apenas pelo mês: ex: "/06" ou "/6"
          const month = partes[1].padStart(2, '0');
          query.data = { $regex: new RegExp('-' + month + '-') };
        } else if (partes[0] && partes[1] === '') {
          // Busca apenas pelo dia com barra: ex: "13/"
          const day = partes[0].padStart(2, '0');
          query.data = { $regex: new RegExp('-' + day + '$') };
        } else if (partes[0] && partes[1]) {
          // Busca por dia e mês: ex: "13/06"
          const day = partes[0].padStart(2, '0');
          const month = partes[1].padStart(2, '0');
          query.data = { $regex: new RegExp('-' + month + '-' + day + '$') };
        }
      } else if (partes.length === 1 && partes[0]) {
        if (partes[0].length === 4) {
          // Busca por ano: ex: "2026"
          query.data = { $regex: new RegExp('^' + partes[0]) };
        } else {
          // Busca genérica por número: ex: "06" ou "6" (traz eventos no dia 6 OU no mês de Junho)
          const num = partes[0].padStart(2, '0');
          query.data = { $regex: new RegExp('-' + num + '(-|$)') };
        }
      }
    } else {
      // Obtém a data local de hoje no formato YYYY-MM-DD
      const d = new Date();
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - offset * 60 * 1000);
      const hoje = localDate.toISOString().split('T')[0];

      if (periodo === 'todos') {
        // Sem filtro de data
      } else if (periodo === 'realizados') {
        // Eventos que já ocorreram: data < hoje
        query.data = { $lt: hoje };
      } else {
        // Padrão (proximos): Eventos futuros ou que ocorrem hoje: data >= hoje
        query.data = { $gte: hoje };
      }
    }

    return await this.eventoModel.find(query).sort({ data: 1 }).exec();
  }

  async findEventoById(id: string): Promise<Evento | null> {
    return await this.eventoModel.findById(id).exec();
  }

  async updateEvento(id: string, dto: CreateEventoDTO): Promise<string> {
    await this.eventoModel.findByIdAndUpdate(id, dto);

    return 'Evento alterado com sucesso';
  }

  async deleteEvento(id: string): Promise<string> {
    await this.eventoModel.findByIdAndDelete(id);

    return 'Evento exlcuído';
  }

  async updateConferencia(
    id: string,
    itens: { nome: string; quantidade_retornada: number }[],
  ): Promise<string> {
    const evento = await this.eventoModel.findById(id);
    if (!evento) {
      throw new Error('Evento não encontrado');
    }

    if (evento.itens) {
      evento.itens = evento.itens.map((existingItem) => {
        const match = itens.find((i) => i.nome === existingItem.nome);
        if (match) {
          existingItem.quantidade_retornada =
            match.quantidade_retornada.toString();
        }
        return existingItem;
      });
    }

    await this.eventoModel.findByIdAndUpdate(id, { itens: evento.itens });

    return 'Conferência salva com sucesso';
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Freela, FreelaSchema } from '../../freela/schemas/freela.schema';

@Schema({ _id: false })
export class Endereco {
  @Prop()
  cep!: string;

  @Prop()
  logradouro!: string;

  @Prop()
  numero?: string;

  @Prop()
  complemento?: string;

  @Prop()
  bairro!: string;

  @Prop()
  cidade!: string;
}

export const EnderecoSchema = SchemaFactory.createForClass(Endereco);

@Schema({ _id: false })
export class EventoItem {
  @Prop()
  nome!: string;

  @Prop()
  categoria!: string;

  @Prop()
  quantidade!: number;

  @Prop()
  unidade!: string;

  @Prop()
  quantidade_retornada?: string;
}

export const EventoItemSchema = SchemaFactory.createForClass(EventoItem);

@Schema({ _id: false })
export class QuantidadePessoas {
  @Prop()
  quantidade_adultos?: number;

  @Prop()
  quantidade_criancas?: number;

  @Prop()
  quantidade_staffs?: number;
}

export const QuantidadePessoasSchema =
  SchemaFactory.createForClass(QuantidadePessoas);

@Schema({ timestamps: true })
export class Evento {
  @PrimaryGeneratedColumn()
  _id!: string;

  @Prop()
  nome_contratante!: string;

  @Prop()
  telefone!: string;

  @Prop()
  endereco?: Endereco;

  @Prop()
  data!: string;

  @Prop()
  hora_evento!: string;

  @Prop()
  hora_saida!: string;

  @Prop({ type: QuantidadePessoasSchema })
  quantidade_pessoas?: QuantidadePessoas;

  @Prop()
  responsavel!: string;

  @Prop()
  menu!: string;

  @Prop()
  bebidas!: boolean;

  @Prop()
  observacoes!: string;

  @Prop()
  sugestao_qtd!: string;

  @Prop({
    type: [EventoItemSchema],
  })
  itens?: EventoItem[];

  @Prop({ type: [FreelaSchema] })
  freelas?: Freela[];
}

export const EventoSchema = SchemaFactory.createForClass(Evento);

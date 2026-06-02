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
  @Prop({ required: true })
  nome!: string;

  @Prop({ required: true })
  categoria!: string;

  @Prop({ required: true })
  quantidade!: number;

  @Prop({ required: true })
  unidade!: string;
}

export const EventoItemSchema = SchemaFactory.createForClass(EventoItem);

@Schema({ timestamps: true })
export class Evento {
  @PrimaryGeneratedColumn()
  _id!: string;

  @Prop({ required: true })
  nome_contratante!: string;

  @Prop({ required: true })
  telefone!: string;

  @Prop({ type: EnderecoSchema })
  endereco?: Endereco;

  @Prop({ required: true })
  data!: string;

  @Prop({ required: true })
  hora!: string;

  @Prop()
  qtde_pessoas?: number;

  @Prop({ required: true })
  responsavel!: string;

  @Prop({ required: true })
  menu!: string;

  @Prop({ required: true })
  bebidas!: boolean;

  @Prop()
  observacoes!: string;

  @Prop()
  sugestao_qtd!: string;

  @Prop({
    type: [EventoItemSchema],
  })
  itens?: EventoItem[];

  @Prop({type: [FreelaSchema]})
  freelas?: Freela[]
}

export const EventoSchema = SchemaFactory.createForClass(Evento);

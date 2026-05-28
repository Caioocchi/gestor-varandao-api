import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Endereco {
  @Prop({ required: true })
  cep!: string

  @Prop({ required: true })
  logradouro!: string

  @Prop()
  numero?: string

  @Prop()
  complemento?: string

  @Prop({ required: true })
  bairro!: string

  @Prop({ required: true })
  cidade!: string
}

export const EnderecoSchema = SchemaFactory.createForClass(Endereco)

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

export const EventoItemSchema = SchemaFactory.createForClass(EventoItem)

@Schema({ timestamps: true })
export class Evento {
  @Prop({ required: true })
  nome_contratante!: string;

  @Prop({ 
    type: EnderecoSchema,
    required: true,
   })
  endereco!: Endereco; 

  @Prop({ required: true })
  data!: string;

  @Prop({ required: true })
  hora!: string;

  @Prop({ required: true })
  qtde_pessoas!: number;

  @Prop()
  observacoes!: string;

  @Prop({ 
    type: [EventoItemSchema],
    required: true,
   })
  itens!: EventoItem[];
}

export const EventoSchema = SchemaFactory.createForClass(Evento);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConteudoDocument = Conteudo & Document;

export enum TipoConteudo {
  ARQUIVO = 'ARQUIVO',
  WHATSAPP = 'WHATSAPP',
}

@Schema({
  timestamps: true,
})
export class Conteudo {
  @Prop({
    required: true,
    enum: TipoConteudo,
  })
  tipo!: TipoConteudo;

  // Dados para arquivos
  @Prop()
  nomeArquivo?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  urlArquivo?: string;

  @Prop()
  tamanho?: number;

  // Dados para mensagens WhatsApp
  @Prop()
  titulo?: string;

  @Prop()
  mensagem?: string;

  @Prop({
    default: true,
  })
  ativo?: boolean;
}

export const ConteudoSchema = SchemaFactory.createForClass(Conteudo);

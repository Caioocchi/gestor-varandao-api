import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

export type ProdutoDocument = HydratedDocument<Produto>;

@Schema({
  timestamps: true,
})
export class Produto {
  @Prop({
    required: true,
  })
  nome!: string;

  @Prop({
    required: true,
  })
  categoria!: string;

  @Prop({
    required: true,
  })
  unidade!: string;

  @Prop({
    default: true,
  })
  ativo!: boolean;
}

export const ProdutoSchema = SchemaFactory.createForClass(Produto);

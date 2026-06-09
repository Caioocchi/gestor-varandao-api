import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PrimaryGeneratedColumn } from 'typeorm';

@Schema()
export class Produto {
  @PrimaryGeneratedColumn()
  _id!: string;

  @Prop()
  nome!: string;

  @Prop()
  categoria!: string;

  @Prop()
  unidade!: string;

  @Prop()
  ativo!: boolean;
}

export const ProdutoSchema = SchemaFactory.createForClass(Produto);


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PrimaryGeneratedColumn } from 'typeorm';

@Schema()
export class Freela {
  @PrimaryGeneratedColumn()
  _id!: string

  @Prop()
  nome!: string;

  @Prop()
  dt_nascimento!: string;

  @Prop()
  pix!: string;

  @Prop()
  telefone!: string;

  @Prop()
  cpf!: string;

  @Prop()
  funcao?: string;

  @Prop()
  urlFoto?: string;
}

export const FreelaSchema = SchemaFactory.createForClass(Freela);

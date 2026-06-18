import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Itens {
  @Prop()
  nome!: string;

  @Prop()
  checked!: boolean;
}

export const ItensSchema = SchemaFactory.createForClass(Itens);

@Schema()
export class Notepad {
  _id!: string;

  @Prop({ type: [ItensSchema] })
  itens!: Itens[];
}

export const NotepadSchema = SchemaFactory.createForClass(Notepad);

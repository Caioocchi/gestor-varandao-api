import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ required: true })
  nome!: string;

  @Prop({
    required: true,
    unique: true,
  })
  email!: string;

  @Prop({ required: true })
  senha!: string;

  @Prop({
    required: true,
    default: 'padrao',
    enum: ['administrador', 'padrao'],
  })
  role!: string;

  @Prop({
    type: [
      {
        deviceType: { type: String, required: true },
        token: { type: String, required: true },
      },
    ],
    default: [],
  })
  fcmTokens?: { deviceType: string; token: string }[];
}

export const UserSchema = SchemaFactory.createForClass(User);

import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async onModuleInit() {
    try {
      // 1. Define 'administrador' para os e-mails dos administradores no banco
      await this.userModel.updateOne(
        { email: 'CAIOOCCHI5@GMAIL.COM' },
        { $set: { role: 'administrador' } },
      );
      await this.userModel.updateOne(
        { email: 'MATHEUS.LDS@HOTMAIL.COM' },
        { $set: { role: 'administrador' } },
      );
      await this.userModel.updateOne(
        { email: 'ALEXANDRE.BBARCELOS@HOTMAIL.COM' },
        { $set: { role: 'administrador' } },
      );

      // 2. Define 'padrao' para todos os outros que não possuam campo role
      await this.userModel.updateMany(
        { role: { $exists: false } },
        { $set: { role: 'padrao' } },
      );
    } catch (error) {
      console.error('Erro na migração de roles dos usuários:', error);
    }
  }

  async createUsuario(dto: CreateUserDto) {
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    return this.userModel.create({
      ...dto,
      email: dto.email.toUpperCase(),
      senha: senhaHash,
    });
  }
}

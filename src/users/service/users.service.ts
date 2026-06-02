import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}
  async createUsuario(dto: CreateUserDto) {
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    return this.userModel.create({
      ...dto,
      email: dto.email.toUpperCase(),
      senha: senhaHash,
    });
  }
}

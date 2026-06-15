import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../users/schemas/user.schema';
import { Model } from 'mongoose';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.userModel.findOne({
      email: dto.email.toUpperCase(),
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const senhaCorreta = await bcrypt.compare(dto.senha, usuario.senha);

    if (!senhaCorreta) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const token = this.jwtService.sign({
      sub: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    });

    return {
      access_token: token,
      usuario,
    };
  }

  async getProfile(userId: string) {
    const usuario = await this.userModel.findById(userId).select('-senha');
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return usuario;
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    const usuario = await this.userModel.findById(userId);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const senhaCorreta = await bcrypt.compare(oldPass, usuario.senha);
    if (!senhaCorreta) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const hashNovaSenha = await bcrypt.hash(newPass, 10);
    usuario.senha = hashNovaSenha;
    await usuario.save();

    return { message: 'Senha alterada com sucesso' };
  }

  async registerPushToken(userId: string, token: string, deviceType: string) {
    const usuario = await this.userModel.findById(userId);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (!usuario.fcmTokens) {
      usuario.fcmTokens = [];
    }

    // Se o token já existir na lista em outro tipo de dispositivo, removemos para evitar duplicidade
    usuario.fcmTokens = usuario.fcmTokens.filter(
      (item) => item.token !== token,
    );

    // Verificar se o dispositivo usado já possui um token salvo
    const existingDeviceIndex = usuario.fcmTokens.findIndex(
      (item) => item.deviceType.toLowerCase() === deviceType.toLowerCase(),
    );

    if (existingDeviceIndex !== -1) {
      // Se o dispositivo já tem token e o gerado for diferente, sobrescreve
      if (usuario.fcmTokens[existingDeviceIndex].token !== token) {
        usuario.fcmTokens[existingDeviceIndex].token = token;
      }
    } else {
      // Caso contrário, adiciona à lista
      usuario.fcmTokens.push({ deviceType, token });
    }

    // Garante que o documento seja marcado como modificado para arrays no mongoose
    usuario.markModified('fcmTokens');

    await usuario.save();
    return { message: 'Token de push registrado com sucesso' };
  }
}

import * as bcrypt from 'bcrypt';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../users/schemas/user.schema';
import { Model } from 'mongoose';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import axios from 'axios';

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

  async solicitarTokenDeRecuperacao(email: string) {
    const usuario = await this.userModel.findOne({
      email: email.toUpperCase(),
    });
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const token = randomBytes(3).toString('hex').toUpperCase();

    usuario.resetToken = token;
    usuario.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    await usuario.save();

    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: 'Gestor Varandão',
            email: 'caioocchi5@gmail.com', // O e-mail que você usou para criar a conta no Brevo
          },
          to: [{ email: usuario.email }],
          subject: 'Recuperação de Senha',
          htmlContent: `
          <p>Olá!</p>
          <p>Seu código de verificação para redefinir a senha é:</p>
          <h2 style="font-size: 24px; letter-spacing: 3px; color: #1976D2; font-family: monospace;">${token}</h2>
          <p>Este código é válido por 15 minutos e deve ser digitado dentro do aplicativo.</p>
        `,
        },
        {
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error('Erro ao enviar e-mail pelo Brevo:', error);
      throw new BadRequestException(
        'Erro ao processar o envio do e-mail de recuperação.',
      );
    }

    console.log('Link enviado com sucesso para:', usuario.email);
    return { message: 'Link de recuperação enviado com sucesso' };
  }

  async validarTokenDeRecuperacao(token: string) {
    if (!token) {
      throw new BadRequestException('Token é obrigatório.');
    }
    const usuario = await this.userModel.findOne({
      resetToken: token.toUpperCase(),
      resetTokenExpires: { $gt: new Date() },
    });
    if (!usuario) {
      throw new BadRequestException('Código inválido ou expirado.');
    }
    return { email: usuario.email };
  }

  async forgotPassword(novaSenha: string, token: string) {
    const usuario = await this.userModel.findOne({
      resetToken: token ? token.toUpperCase() : '',
      resetTokenExpires: { $gt: new Date() },
    });
    if (!usuario) {
      throw new BadRequestException('Código inválido ou expirado.');
    }
    const hashNovaSenha = await bcrypt.hash(novaSenha, 10);
    usuario.senha = hashNovaSenha;
    usuario.resetToken = undefined;
    usuario.resetTokenExpires = undefined;
    await usuario.save();

    return { message: 'Senha redefinida com sucesso' };
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

import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

import { AuthService } from '../service/auth.service';

import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.userId,
      dto.senhaAtual,
      dto.novaSenha,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('push-token')
  async registerPushToken(
    @Request() req: AuthenticatedRequest,
    @Body() body: { token: string; deviceType?: string },
  ) {
    const userAgent = req.headers['user-agent'];
    const deviceType = body.deviceType || this.detectDeviceType(userAgent);
    return this.authService.registerPushToken(
      req.user.userId,
      body.token,
      deviceType,
    );
  }

  private detectDeviceType(userAgent?: string): string {
    if (!userAgent) return 'Web';
    const ua = userAgent.toLowerCase();
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ipad') || ua.includes('iphone') || ua.includes('ipod'))
      return 'iOS';
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('macintosh')) return 'Mac';
    if (ua.includes('linux')) return 'Linux';
    return 'Web';
  }
}

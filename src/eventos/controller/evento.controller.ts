import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Patch,
  UseGuards,
  Request,
  ForbiddenException,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventoService } from '../service/evento.service';
import { CreateEventoDTO } from '../dto/evento.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { NotificationService } from '../service/notification.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('eventos')
export class EventosController {
  constructor(
    private readonly eventoService: EventoService,
    private readonly notificationService: NotificationService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Roles('administrador', 'padrao')
  @Post('teste-notificacao')
  async testeNotificacao(
    @Body() body: { token: string; title?: string; body?: string },
  ) {
    console.log(
      'Solicitação de envio de notificação push de teste:',
      body.token,
    );
    await this.notificationService.sendPushNotification(
      [body.token],
      body.title || 'Teste de Notificação',
      body.body || 'Seu PWA está recebendo notificações com sucesso!',
    );
    return { success: true };
  }

  @Roles('administrador', 'padrao')
  @Post('upload-imagem')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImagem(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    const uploadRes = await this.cloudinaryService.uploadFile(file, 'eventos');
    return { url: uploadRes.secure_url };
  }

  @Roles('administrador')
  @Post()
  async createEvento(@Body() dto: CreateEventoDTO) {
    console.log('dto', dto);
    return await this.eventoService.createEvento(dto);
  }

  @Get()
  async findAllEventos(
    @Request() req: any,
    @Query('data') data?: string,
    @Query('periodo') periodo?: string,
  ) {
    const { userId, role, nome } = req.user;
    const firstNome = nome ? nome.split(' ')[0] : undefined;
    console.log('nome', nome);
    console.log('userId', userId);
    console.log('firstNome', firstNome);
    console.log('role', role);
    if (role === 'padrao') {
      return await this.eventoService.findAllEventos(
        userId,
        firstNome,
        data,
        periodo,
      );
    }
    return await this.eventoService.findAllEventos(
      undefined,
      undefined,
      data,
      periodo,
    );
  }

  @Get(':id')
  async findEventoById(@Param('id') id: string, @Request() req: any) {
    const { userId, role, nome } = req.user;
    const firstNome = nome ? nome.split(' ')[0] : undefined;
    const evento = await this.eventoService.findEventoById(id);
    if (!evento) {
      return null;
    }
    if (role === 'padrao') {
      if (
        evento.responsavel !== userId &&
        evento.responsavel !== nome &&
        evento.responsavel !== firstNome
      ) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar este evento',
        );
      }
    }
    return evento;
  }

  @Roles('administrador', 'padrao')
  @Put(':id')
  async updateEvento(
    @Param('id') id: string,
    @Body() dto: CreateEventoDTO,
    @Request() req: any,
  ) {
    const { userId, role, nome } = req.user;
    const firstNome = nome ? nome.split(' ')[0] : undefined;
    const evento = await this.eventoService.findEventoById(id);
    if (!evento) {
      return null;
    }
    if (role === 'padrao') {
      if (
        evento.responsavel !== userId &&
        evento.responsavel !== nome &&
        evento.responsavel !== firstNome
      ) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar este evento',
        );
      }
    }
    console.log('dto', dto);
    return await this.eventoService.updateEvento(id, dto);
  }

  @Roles('administrador')
  @Post('delete/:id')
  async deleteEvento(@Param('id') id: string) {
    return await this.eventoService.deleteEvento(id);
  }

  @Roles('administrador', 'padrao')
  @Patch(':id/conferencia')
  async updateConferencia(
    @Param('id') id: string,
    @Body() body: { itens: { nome: string; quantidade_retornada: number }[] },
    @Request() req: any,
  ) {
    const { userId, role, nome } = req.user;
    const firstNome = nome ? nome.split(' ')[0] : undefined;
    const evento = await this.eventoService.findEventoById(id);
    if (!evento) {
      return null;
    }
    if (role === 'padrao') {
      if (
        evento.responsavel !== userId &&
        evento.responsavel !== nome &&
        evento.responsavel !== firstNome
      ) {
        throw new ForbiddenException(
          'Você não tem permissão para atualizar a conferência deste evento',
        );
      }
    }
    return await this.eventoService.updateConferencia(id, body.itens);
  }
}

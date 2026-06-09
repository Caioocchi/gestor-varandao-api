import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { ArquivosService } from './arquivos.service';
import { CreateWhatsappDto } from './arquivos.dto';

@Controller('arquivos')
export class ArquivosController {
  constructor(private readonly arquivosService: ArquivosService) {}

  /**
   * Retorna os arquivos e as mensagens separados
   */
  @Get()
  async getSeparados() {
    return await this.arquivosService.getSeparados();
  }

  /**
   * Cria uma nova mensagem WhatsApp
   */
  @Post('whatsapp')
  async createWhatsapp(@Body() dto: CreateWhatsappDto) {
    return await this.arquivosService.createWhatsapp(dto);
  }

  /**
   * Atualiza uma mensagem WhatsApp existente
   */
  @Put('whatsapp/update/:id')
  async updateWhatsapp(
    @Param('id') id: string,
    @Body() dto: CreateWhatsappDto,
  ) {
    return await this.arquivosService.updateWhatsapp(id, dto);
  }

  /**
   * Atualiza o nome de um arquivo existente
   */
  @Put('update/:id')
  async updateArquivo(
    @Param('id') id: string,
    @Body('nomeArquivo') nomeArquivo: string,
  ) {
    return await this.arquivosService.updateArquivo(id, nomeArquivo);
  }

  /**
   * Faz upload de um arquivo físico e cria o registro no banco
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const dest = './uploads/arquivos';
          // Garante a existência do diretório
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          callback(null, dest);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async createArquivo(
    @UploadedFile() file: Express.Multer.File,
    @Body('nomeArquivo') nomeArquivo?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return await this.arquivosService.createArquivo(file, nomeArquivo);
  }

  /**
   * Exclui um registro por ID (deleta arquivo físico se aplicável)
   */
  @Post('delete/:id')
  async deleteById(@Param('id') id: string) {
    return await this.arquivosService.deleteById(id);
  }
}

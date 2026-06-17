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
  Res,
  Req,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ArquivosService } from './arquivos.service';
import { CreateWhatsappDto } from './arquivos.dto';
import { GridFsService } from '../gridfs/gridfs.service';

@Controller('arquivos')
export class ArquivosController {
  constructor(
    private readonly arquivosService: ArquivosService,
    private readonly gridFsService: GridFsService,
  ) {}

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
  @UseInterceptors(FileInterceptor('file'))
  async createArquivo(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Body('nomeArquivo') nomeArquivo?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    const uploadRes = await this.gridFsService.uploadFile(file);
    const fileUrl = this.gridFsService.getFileUrl(req, uploadRes.id);
    return await this.arquivosService.createArquivo(
      fileUrl,
      file.mimetype,
      file.size,
      nomeArquivo,
    );
  }

  /**
   * Retorna/streams o arquivo físico armazenado no GridFS
   */
  @Get('file/:id')
  async getFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const fileInfo = await this.gridFsService.getFileInfo(id);
      res.set({
        'Content-Type': fileInfo.contentType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileInfo.filename)}"`,
        'Content-Length': fileInfo.length,
      });
      const downloadStream = this.gridFsService.openDownloadStream(id);
      return new StreamableFile(downloadStream);
    } catch (error) {
      throw new NotFoundException('Arquivo não encontrado: ', error);
    }
  }

  /**
   * Exclui um registro por ID (deleta arquivo físico se aplicável)
   */
  @Post('delete/:id')
  async deleteById(@Param('id') id: string) {
    return await this.arquivosService.deleteById(id);
  }
}

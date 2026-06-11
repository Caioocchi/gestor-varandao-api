import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { FreelaService } from '../service/freela.service';
import { CreateFreelaDto } from '../dto/freela.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
@Controller('freelas')
export class FreelaController {
  constructor(private readonly freelaService: FreelaService) {}

  @Get()
  async findAllFreelas(
    @Query('pagina') pagina?: number,
    @Query('pesquisa') pesquisa?: string,
  ) {
    return await this.freelaService.findAllFreelas(pagina, pesquisa);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('urlFoto', {
      storage: diskStorage({
        destination: './uploads/freelas',

        filename: (req, file, callback) => {
          const nomeArquivo = Date.now() + extname(file.originalname);

          callback(null, nomeArquivo);
        },
      }),
    }),
  )
  async createFreela(
    @UploadedFile() foto: Express.Multer.File,
    @Body() dto: CreateFreelaDto,
  ) {
    if (foto) {
      dto.urlFoto = foto.filename;
    }

    return await this.freelaService.createFreela(dto);
  }

  @Get(':id')
  async findFreelaById(@Param('id') id: string) {
    return await this.freelaService.findFreelaById(id);
  }

  @Post('delete/:id')
  async deleteFreelaById(@Param('id') id: string) {
    return await this.freelaService.deleteFreelaById(id);
  }

  @Put('update/:id')
  @UseInterceptors(
    FileInterceptor('urlFoto', {
      storage: diskStorage({
        destination: './uploads/freelas',

        filename: (req, file, callback) => {
          const nomeArquivo = Date.now() + extname(file.originalname);

          callback(null, nomeArquivo);
        },
      }),
    }),
  )
  async updateFreelaById(
    @Param('id') id: string,

    @UploadedFile()
    foto: Express.Multer.File,

    @Body()
    dto: any,
  ) {
    if (foto) {
      dto.urlFoto = foto.filename;
    }

    return this.freelaService.updateFreelaById(id, dto);
  }
}

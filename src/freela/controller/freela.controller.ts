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
  Request,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { FreelaService } from '../service/freela.service';
import { CreateFreelaDto } from '../dto/freela.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
@Controller('freelas')
export class FreelaController {
  constructor(
    private readonly freelaService: FreelaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Roles('administrador', 'padrao')
  @Get()
  async findAllFreelas(
    @Request() req,
    @Query('pagina') pagina?: number,
    @Query('pesquisa') pesquisa?: string,
  ) {
    console.log(req.user);
    return await this.freelaService.findAllFreelas(pagina, pesquisa);
  }

  @Post()
  @UseInterceptors(FileInterceptor('urlFoto'))
  async createFreela(
    @UploadedFile() foto: Express.Multer.File,
    @Body() dto: CreateFreelaDto,
  ) {
    if (foto) {
      const result = await this.cloudinaryService.uploadFile(foto, 'freelas');
      dto.urlFoto = result.secure_url;
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
  @UseInterceptors(FileInterceptor('urlFoto'))
  async updateFreelaById(
    @Param('id') id: string,

    @UploadedFile()
    foto: Express.Multer.File,

    @Body()
    dto: any,
  ) {
    if (foto) {
      const result = await this.cloudinaryService.uploadFile(foto, 'freelas');
      dto.urlFoto = result.secure_url;
    }

    return this.freelaService.updateFreelaById(id, dto);
  }
}

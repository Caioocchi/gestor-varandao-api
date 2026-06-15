import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProdutoService } from '../service/produto.service';
import { CreateProdutoDto } from '../dto/produto.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Roles('administrador', 'padrao')
  @Get()
  async findAll(
    @Query('pagina') pagina: number = 1,
    @Query('pesquisa') pesquisa?: string,
  ) {
    return await this.produtoService.findAll(pagina, pesquisa);
  }

  @Roles('administrador', 'padrao')
  @Get('categoria/:categoria')
  async findByCategoria(@Param('categoria') categoria: string) {
    return await this.produtoService.findByCategoria(categoria);
  }

  @Get(':id')
  async findProdutoById(@Param('id') id: string) {
    return await this.produtoService.findProdutoById(id);
  }

  @Post()
  async createProduto(@Body() dto: CreateProdutoDto) {
    return await this.produtoService.createProduto(dto);
  }

  @Put(':id')
  async updateProdutoById(
    @Param('id') id: string,
    @Body() dto: CreateProdutoDto,
  ) {
    return await this.produtoService.updateProdutoById(id, dto);
  }

  @Post('delete/:id')
  async deleteProdutoById(@Param('id') id: string) {
    return await this.produtoService.deleteProdutoById(id);
  }
}

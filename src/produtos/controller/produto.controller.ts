import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProdutoService } from '../service/produto.service';
import { CreateProdutoDto } from '../dto/produto.dto';

@Controller('produto')
export class ProdutoController {
    constructor(
        private readonly produtoService: ProdutoService
    ) {}

    @Get()
    async findAll(@Query('pagina') pagina: number = 1) {
        return await this.produtoService.findAll(pagina)
    }

    @Get(':categoria')
    async findByCategoria(@Param() categoria: string) {
        return await this.produtoService.findByCategoria(categoria)
    }

    @Post()
    async createProduto(@Body() dto: CreateProdutoDto) {
        return await this.produtoService.createProduto(dto)
    }

    @Post('delete/:id')
    async deleteProdutoById(@Param('id') id: string) {
        return await this.produtoService.deleteProdutoById(id)
    }
}

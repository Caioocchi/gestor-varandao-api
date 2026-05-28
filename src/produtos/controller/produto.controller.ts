import { Controller, Get, Param } from '@nestjs/common';
import { ProdutoService } from '../service/produto.service';

@Controller('produto')
export class ProdutoController {
    constructor(
        private readonly produtoService: ProdutoService
    ) {}

    @Get()
    async findAll() {
        return await this.produtoService.findAll()
    }

    @Get(':categoria')
    async findByCategoria(@Param() categoria: string) {
        return await this.produtoService.findByCategoria(categoria)
    }
}

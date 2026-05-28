import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { EventoService } from '../service/evento.service';
import { CreateEventoDTO } from '../dto/evento.dto';

@Controller('eventos')
export class EventosController {
    constructor(
        private readonly eventoService: EventoService 
    ) {}

    @Post()
    async createEvento(@Body() dto: CreateEventoDTO) {
        console.log("dto", dto)
        return await this.eventoService.createEvento(dto)
    }

    @Get()
    async findAllEventos() {
        return await this.eventoService.findAllEventos()
    }

    @Get(':id')
    async findEventoById(@Param() id: string) {
        return await this.eventoService.findEventoById(id)
    }

    @Put(':id')
    async updateEvento(@Param() id: string, @Body() dto: CreateEventoDTO) {
        return await this.eventoService.updateEvento(id, dto)
    }

    @Post('delete/:id')
    async deleteEvento(@Param() id: string) {
        return await this.eventoService.deleteEvento(id)
    }
}

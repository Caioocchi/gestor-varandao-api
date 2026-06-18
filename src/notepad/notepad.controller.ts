import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { NotepadService } from './notepad.service';
import { CreateNotepadDto } from './notepad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador', 'padrao')
@Controller('notepad')
export class NotepadController {
  constructor(private readonly notepadService: NotepadService) {}

  @Get()
  async getNotepad() {
    return await this.notepadService.getNotepad();
  }

  @Post()
  async saveNotepad(@Body() dto: CreateNotepadDto) {
    return await this.notepadService.saveNotepad(dto);
  }

  @Post('item/delete/:id')
  async deleteItem(@Param('id') id: string) {
    return await this.notepadService.deleteItem(id);
  }

  @Post('item/update/:id')
  async updateItemStatus(@Param('id') id: string, @Body() data: any) {
    return await this.notepadService.updateItemStatus(id, data.checked);
  }

  @Post('clear')
  async clearNotepad() {
    return await this.notepadService.clearNotepad();
  }
}

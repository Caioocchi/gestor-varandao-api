import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notepad } from './notepad.schema';
import { CreateNotepadDto } from './notepad.dto';

@Injectable()
export class NotepadService {
  constructor(
    @InjectModel(Notepad.name)
    private readonly notepadModel: Model<Notepad>,
  ) {}

  async getNotepad(): Promise<Notepad> {
    let notepad = await this.notepadModel.findOne().exec();
    if (!notepad) {
      notepad = await this.notepadModel.create({ itens: [] });
    }
    return notepad;
  }

  async saveNotepad(dto: CreateNotepadDto): Promise<Notepad> {
    const notepad = await this.notepadModel.findOne().exec();
    if (!notepad) {
      return await this.notepadModel.create({
        itens: [dto],
      });
    }
    notepad.itens.push(dto);
    return await notepad.save();
  }

  async deleteItem(itemId: string): Promise<Notepad> {
    const notepad = await this.notepadModel.findOne().exec();
    if (!notepad) {
      throw new NotFoundException('Notepad não encontrado');
    }
    (notepad.itens as any).pull(itemId);
    return await notepad.save();
  }

  async updateItemStatus(itemId: string, checked: boolean): Promise<Notepad> {
    const notepad = await this.notepadModel.findOne().exec();
    if (!notepad) {
      throw new NotFoundException('Notepad não encontrado');
    }
    const item = notepad.itens.find((i: any) => i._id.toString() === itemId);
    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }
    item.checked = checked;
    return await notepad.save();
  }

  async clearNotepad(): Promise<Notepad> {
    const notepad = await this.notepadModel.findOne().exec();
    if (!notepad) {
      throw new NotFoundException('Notepad não encontrado');
    }
    notepad.itens = [];
    return await notepad.save();
  }
}

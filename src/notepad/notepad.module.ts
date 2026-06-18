import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notepad, NotepadSchema } from './notepad.schema';
import { NotepadController } from './notepad.controller';
import { NotepadService } from './notepad.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notepad.name,
        schema: NotepadSchema,
      },
    ]),
  ],
  controllers: [NotepadController],
  providers: [NotepadService],
  exports: [NotepadService],
})
export class NotepadModule {}

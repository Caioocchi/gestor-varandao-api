import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ItensDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsBoolean()
  checked!: boolean;
}

export class CreateNotepadDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsBoolean()
  checked!: boolean;
}

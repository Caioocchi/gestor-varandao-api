import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFreelaDto {
  @IsNotEmpty()
  @IsString()
  _id!: string;

  @IsNotEmpty()
  @IsString()
  nome!: string;

  @IsNotEmpty()
  @IsString()
  dt_nascimento!: string;

  @IsNotEmpty()
  @IsString()
  pix!: string;

  @IsNotEmpty()
  @IsString()
  telefone!: string;

  @IsNotEmpty()
  @IsString()
  cpf!: string;

  @IsString()
  urlFoto?: string;
}

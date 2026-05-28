import { IsNotEmpty, IsString } from 'class-validator';

export class EnderecoDTO {
  @IsNotEmpty()
  @IsString()
  cep!: string;

  @IsNotEmpty()
  @IsString()
  logradouro!: string;

  @IsString()
  numero?: string;

  @IsString()
  complemento?: string;

  @IsNotEmpty()
  @IsString()
  bairro!: string;

  @IsNotEmpty()
  @IsString()
  cidade!: string;
}

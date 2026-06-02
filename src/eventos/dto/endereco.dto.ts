import { IsString } from 'class-validator';

export class EnderecoDTO {
  @IsString()
  cep?: string;

  @IsString()
  logradouro?: string;

  @IsString()
  numero?: string;

  @IsString()
  complemento?: string;

  @IsString()
  bairro?: string;

  @IsString()
  cidade?: string;
}

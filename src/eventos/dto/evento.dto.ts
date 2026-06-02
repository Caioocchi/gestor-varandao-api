import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { CreateEventoItemDto } from './eventoItem.dto';
import { EnderecoDTO } from './endereco.dto';

export class CreateEventoDTO {
  @IsNotEmpty()
  @IsString()
  _id!: string

  @IsNotEmpty()
  @IsString()
  nome_contratante!: string;

  @IsNotEmpty()
  @IsString()
  telefone!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EnderecoDTO)
  endereco?: EnderecoDTO;

  @IsNotEmpty()
  @IsString()
  data!: string;

  @IsNotEmpty()
  @IsString()
  hora!: string;

  @IsNumber()
  qtde_pessoas?: number;

  @IsNotEmpty()
  @IsString()
  responsavel!: string;

  @IsNotEmpty()
  @IsString()
  menu!: string;

  @IsNotEmpty()
  @IsBoolean()
  bebidas!: boolean;

  @IsString()
  observacoes!: string;

  @IsString()
  sugestao_qtd!: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventoItemDto)
  itens?: CreateEventoItemDto[];
}

import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { CreateEventoItemDto } from './eventoItem.dto';
import { EnderecoDTO } from './endereco.dto';

export class CreateEventoDTO {
  @IsNotEmpty()
  @IsString()
  nome_contratante!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EnderecoDTO)
  endereco!: EnderecoDTO;

  @IsNotEmpty()
  @IsString()
  data!: string;

  @IsNotEmpty()
  @IsString()
  hora!: string;

  @IsNotEmpty()
  @IsNumber()
  qtde_pessoas!: number;

  @IsNotEmpty()
  @IsString()
  observacoes!: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventoItemDto)
  itens!: CreateEventoItemDto[];
}

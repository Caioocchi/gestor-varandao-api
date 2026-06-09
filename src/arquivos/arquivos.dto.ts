import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateWhatsappDto {
  @IsNotEmpty()
  @IsString()
  titulo!: string;

  @IsNotEmpty()
  @IsString()
  mensagem!: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Conteudo, ConteudoDocument, TipoConteudo } from './arquivos.schema';
import { CreateWhatsappDto } from './arquivos.dto';

@Injectable()
export class ArquivosService {
  constructor(
    @InjectModel(Conteudo.name)
    private readonly conteudoModel: Model<ConteudoDocument>,
  ) {}

  /**
   * Retorna os arquivos e as mensagens de WhatsApp de maneira separada.
   */
  async getSeparados() {
    const [arquivos, whatsapp] = await Promise.all([
      this.conteudoModel
        .find({ tipo: TipoConteudo.ARQUIVO })
        .sort({ createdAt: -1 })
        .exec(),
      this.conteudoModel
        .find({ tipo: TipoConteudo.WHATSAPP })
        .sort({ createdAt: -1 })
        .exec(),
    ]);

    return {
      arquivos,
      whatsapp,
    };
  }

  /**
   * Cria uma mensagem padrão de WhatsApp.
   */
  async createWhatsapp(dto: CreateWhatsappDto): Promise<Conteudo> {
    const novo = new this.conteudoModel({
      tipo: TipoConteudo.WHATSAPP,
      titulo: dto.titulo,
      mensagem: dto.mensagem,
      ativo: dto.ativo !== undefined ? dto.ativo : true,
    });
    return await novo.save();
  }

  /**
   * Armazena as informações de um arquivo físico no banco de dados.
   */
  async createArquivo(
    urlArquivo: string,
    mimeType: string,
    tamanho: number,
    nomeArquivo?: string,
  ): Promise<Conteudo> {
    const nomeFinal =
      nomeArquivo && nomeArquivo.trim() ? nomeArquivo.trim() : 'Arquivo';
    const novo = new this.conteudoModel({
      tipo: TipoConteudo.ARQUIVO,
      nomeArquivo: nomeFinal,
      mimeType,
      urlArquivo,
      tamanho,
      ativo: true,
    });
    return await novo.save();
  }

  /**
   * Atualiza uma mensagem de WhatsApp.
   */
  async updateWhatsapp(id: string, dto: CreateWhatsappDto): Promise<Conteudo> {
    const doc = await this.conteudoModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Conteúdo não encontrado');
    }
    if (dto.titulo !== undefined) doc.titulo = dto.titulo;
    if (dto.mensagem !== undefined) doc.mensagem = dto.mensagem;
    if (dto.ativo !== undefined) doc.ativo = dto.ativo;
    return await doc.save();
  }

  /**
   * Atualiza o nome de um arquivo cadastrado.
   */
  async updateArquivo(id: string, nomeArquivo: string): Promise<Conteudo> {
    const doc = await this.conteudoModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Conteúdo não encontrado');
    }
    if (nomeArquivo !== undefined) doc.nomeArquivo = nomeArquivo;
    return await doc.save();
  }

  /**
   * Exclui um registro do banco de dados e remove o arquivo físico correspondente se for do tipo ARQUIVO.
   */
  async deleteById(id: string): Promise<{ success: boolean; message: string }> {
    const doc = await this.conteudoModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Conteúdo não encontrado');
    }

    // Se for um arquivo físico, remover o arquivo do disco
    if (doc.tipo === TipoConteudo.ARQUIVO && doc.urlArquivo) {
      const filename = doc.urlArquivo.replace(/^arquivos\//, '');
      const filePath = path.join(
        process.cwd(),
        'uploads',
        'arquivos',
        filename,
      );

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Erro ao deletar arquivo físico: ${filePath}`, err);
        }
      }
    }

    await this.conteudoModel.findByIdAndDelete(id).exec();

    return {
      success: true,
      message: 'Conteúdo excluído com sucesso.',
    };
  }
}

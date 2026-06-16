import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evento } from '../schemas/evento.schema';
import { User } from '../../users/schemas/user.schema';
import { Freela } from '../../freela/schemas/freela.schema';
import { NotificationService } from './notification.service';

@Injectable()
export class CronNotificationService {
  private readonly logger = new Logger(CronNotificationService.name);

  constructor(
    @InjectModel(Evento.name)
    private eventoModel: Model<Evento>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Freela.name)
    private freelaModel: Model<Freela>,
    private readonly notificationService: NotificationService,
  ) {}

  // Toda segunda e terça-feira às 07:00 da manhã (Horário de Brasília)
  @Cron('0 7 * * 1,2', {
    timeZone: 'America/Sao_Paulo',
  })
  async handleWeeklyNotifications() {
    this.logger.log('Iniciando rotina de notificações agendadas...');

    // 1. Obter todos os tokens de push cadastrados
    const users = await this.userModel.find({
      fcmTokens: { $exists: true, $not: { $size: 0 } },
    });

    const tokensSet = new Set<string>();
    for (const u of users) {
      if (u.fcmTokens && u.fcmTokens.length > 0) {
        for (const tObj of u.fcmTokens) {
          if (tObj.token) {
            tokensSet.add(tObj.token);
          }
        }
      }
    }
    const tokens = Array.from(tokensSet);

    if (tokens.length === 0) {
      this.logger.log(
        'Nenhum token FCM registrado. Cancelando envio de notificações.',
      );
      return;
    }

    // Obter data atual no fuso horário 'America/Sao_Paulo'
    const hoje = new Date();
    const spString = hoje.toLocaleString('en-US', {
      timeZone: 'America/Sao_Paulo',
    });
    const hojeSP = new Date(spString);

    // 2. Notificação 1: Eventos da Semana (considerando segunda-feira como início da semana)
    const dayOfWeek = hojeSP.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 é domingo (diff 6), 1 é segunda (diff 0), etc.

    const inicioSemana = new Date(hojeSP);
    inicioSemana.setDate(hojeSP.getDate() - diff);
    inicioSemana.setHours(0, 0, 0, 0);

    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6); // Domingo
    fimSemana.setHours(23, 59, 59, 999);

    const formatToYYYYMMDD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const inicioStr = formatToYYYYMMDD(inicioSemana);
    const fimStr = formatToYYYYMMDD(fimSemana);

    const totalEventos = await this.eventoModel.countDocuments({
      data: { $gte: inicioStr, $lte: fimStr },
    });

    let corpoEventos = '';
    if (totalEventos === 0) {
      corpoEventos = 'Nenhum evento agendado para esta semana.';
    } else if (totalEventos === 1) {
      corpoEventos = 'Você tem 1 evento agendado para esta semana!';
    } else {
      corpoEventos = `Você tem ${totalEventos} eventos agendados para esta semana!`;
    }

    await this.notificationService.sendPushNotification(
      tokens,
      'Eventos da Semana 📅',
      corpoEventos,
    );

    // 3. Notificação 2: Aniversário de Freelas (no dia de hoje)
    const dia = String(hojeSP.getDate()).padStart(2, '0');
    const mes = String(hojeSP.getMonth() + 1).padStart(2, '0');
    const diaMesHoje = `${dia}/${mes}`; // formato "DD/MM"

    const aniversariantes = await this.freelaModel.find({
      dt_nascimento: diaMesHoje,
    });

    if (aniversariantes.length > 0) {
      for (const freela of aniversariantes) {
        await this.notificationService.sendPushNotification(
          tokens,
          'Aniversariante do Dia! 🎂',
          `Hoje é aniversário de ${freela.nome}! Não esqueça de parabenizá-lo(a).`,
        );
      }
    } else {
      this.logger.log('Nenhum freelancer faz aniversário hoje.');
    }

    this.logger.log('Rotina de notificações concluída.');
  }
}

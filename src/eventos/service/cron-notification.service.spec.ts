import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CronNotificationService } from './cron-notification.service';
import { NotificationService } from './notification.service';
import { Evento } from '../schemas/evento.schema';
import { User } from '../../users/schemas/user.schema';
import { Freela } from '../../freela/schemas/freela.schema';

describe('CronNotificationService', () => {
  let service: CronNotificationService;
  let userModelMock: any;
  let eventoModelMock: any;
  let freelaModelMock: any;
  let sendPushNotificationMock: jest.Mock;

  beforeEach(async () => {
    userModelMock = {
      find: jest.fn(),
    };

    eventoModelMock = {
      countDocuments: jest.fn(),
    };

    freelaModelMock = {
      find: jest.fn(),
    };

    sendPushNotificationMock = jest.fn();
    const notificationServiceMock = {
      sendPushNotification: sendPushNotificationMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronNotificationService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
        {
          provide: getModelToken(Evento.name),
          useValue: eventoModelMock,
        },
        {
          provide: getModelToken(Freela.name),
          useValue: freelaModelMock,
        },
        {
          provide: NotificationService,
          useValue: notificationServiceMock,
        },
      ],
    }).compile();

    service = module.get<CronNotificationService>(CronNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleWeeklyNotifications', () => {
    it('should query active tokens, count events, find birthday freelancers and send notifications', async () => {
      // Mock Users
      userModelMock.find.mockResolvedValue([
        { fcmTokens: [{ deviceType: 'Web', token: 'token-1' }] },
        { fcmTokens: [{ deviceType: 'Android', token: 'token-3' }] },
        { fcmTokens: [] },
      ]);

      // Mock Event Count
      eventoModelMock.countDocuments.mockResolvedValue(3);

      // Mock Birthday Freelancers
      freelaModelMock.find.mockResolvedValue([
        { nome: 'João Silva', dt_nascimento: '11/06' },
      ]);

      await service.handleWeeklyNotifications();

      // Verify users find is called with FCM filter
      expect(userModelMock.find).toHaveBeenCalledWith({
        fcmTokens: { $exists: true, $not: { $size: 0 } },
      });

      // Verify event count is called with date range
      expect(eventoModelMock.countDocuments).toHaveBeenCalledWith({
        data: {
          $gte: expect.any(String),
          $lte: expect.any(String),
        },
      });

      // Verify birthday query is called with correct format DD/MM
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const expectedDiaMes = `${dia}/${mes}`;
      expect(freelaModelMock.find).toHaveBeenCalledWith({
        dt_nascimento: expectedDiaMes,
      });

      // Verify notifications were sent
      // 1. Weekly events
      expect(sendPushNotificationMock).toHaveBeenCalledWith(
        ['token-1', 'token-3'],
        'Eventos da Semana 📅',
        'Você tem 3 eventos agendados para esta semana!',
      );

      // 2. Birthday
      expect(sendPushNotificationMock).toHaveBeenCalledWith(
        ['token-1', 'token-3'],
        'Aniversariante do Dia! 🎂',
        'Hoje é aniversário de João Silva! Não esqueça de parabenizá-lo(a).',
      );
    });

    it('should log and return if no tokens are found', async () => {
      userModelMock.find.mockResolvedValue([]);

      await service.handleWeeklyNotifications();

      expect(eventoModelMock.countDocuments).not.toHaveBeenCalled();
      expect(sendPushNotificationMock).not.toHaveBeenCalled();
    });
  });
});

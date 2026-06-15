import { Injectable, Logger } from '@nestjs/common';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private fcmInitialized = false;

  constructor() {
    try {
      if (getApps().length > 0) {
        this.fcmInitialized = true;
      } else {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (projectId && clientEmail && privateKey) {
          initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
          });
          this.fcmInitialized = true;
          this.logger.log(
            'Firebase Admin SDK inicializado com sucesso via variáveis de ambiente.',
          );
        } else {
          const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
          if (serviceAccountPath) {
            initializeApp({
              credential: cert(serviceAccountPath),
            });
            this.fcmInitialized = true;
            this.logger.log(
              'Firebase Admin SDK inicializado com sucesso via arquivo JSON.',
            );
          } else {
            this.logger.warn(
              'Credenciais Firebase não totalmente configuradas no .env. Notificações FCM reais estão desabilitadas.',
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Erro ao inicializar Firebase Admin:', error);
    }
  }

  async sendPushNotification(tokens: string[], title: string, body: string) {
    const validTokens = tokens.filter(Boolean);
    if (validTokens.length === 0) {
      this.logger.log('Nenhum token válido para enviar a notificação.');
      return;
    }

    if (!this.fcmInitialized) {
      this.logger.warn(
        `Notificações reais inativas (FCM não inicializado). Conteúdo: [${title}] ${body} (Enviando para ${validTokens.length} dispositivos)`,
      );
      return;
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        webpush: {
          notification: {
            title,
            body,
            requireInteraction: true,
          },
        },
        tokens: validTokens,
      };

      const response = await getMessaging().sendEachForMulticast(message);
      this.logger.log(
        `Notificações enviadas. Sucessos: ${response.successCount}, Falhas: ${response.failureCount}`,
      );
    } catch (error) {
      this.logger.error('Erro ao enviar mensagens multicast FCM:', error);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    if (!getApps().length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (projectId && clientEmail && privateKey) {
        try {
          initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
          });
          this.logger.log(
            'Firebase inicializado via variáveis de ambiente com sucesso.',
          );
        } catch (error) {
          this.logger.error(
            'Erro ao inicializar Firebase Admin no FirebaseService:',
            error,
          );
        }
      } else {
        this.logger.warn(
          'Credenciais do Firebase não configuradas nas variáveis de ambiente. Inicialização ignorada.',
        );
      }
    }
  }

  getMessaging() {
    try {
      return getMessaging();
    } catch (error) {
      this.logger.error('Erro ao obter messaging do Firebase:', error);
      return null;
    }
  }
}

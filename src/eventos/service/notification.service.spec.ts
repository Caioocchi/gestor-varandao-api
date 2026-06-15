import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';

// Mock the modular firebase-admin submodules
const mockInitializeApp = jest.fn();
const mockCert = jest.fn().mockReturnValue({});
const mockGetApps = jest.fn().mockReturnValue([]);

jest.mock('firebase-admin/app', () => ({
  initializeApp: (...args: any[]) => mockInitializeApp(...args),
  cert: (...args: any[]) => mockCert(...args),
  getApps: () => mockGetApps(),
}));

const mockSendEachForMulticast = jest.fn();
const mockGetMessaging = jest.fn().mockReturnValue({
  sendEachForMulticast: (...args: any[]) => mockSendEachForMulticast(...args),
});

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: () => mockGetMessaging(),
}));

describe('NotificationService', () => {
  let service: NotificationService;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should initialize Firebase when credentials path is provided', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH = '/path/to/key.json';
    mockGetApps.mockReturnValue([]); // No apps initialized yet

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);

    expect(mockGetApps).toHaveBeenCalled();
    expect(mockCert).toHaveBeenCalledWith('/path/to/key.json');
    expect(mockInitializeApp).toHaveBeenCalledWith({
      credential: {},
    });
  });

  it('should skip initialization if firebase app is already initialized', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH = '/path/to/key.json';
    mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]); // App already initialized

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);

    expect(mockGetApps).toHaveBeenCalled();
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  it('should not initialize Firebase and log warning if env variable is missing', async () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    mockGetApps.mockReturnValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);

    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  describe('sendPushNotification', () => {
    it('should not send if no valid tokens', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);
      const module: TestingModule = await Test.createTestingModule({
        providers: [NotificationService],
      }).compile();
      service = module.get<NotificationService>(NotificationService);

      await service.sendPushNotification([], 'Title', 'Body');

      expect(mockGetMessaging).not.toHaveBeenCalled();
    });

    it('should not send if Firebase is not initialized', async () => {
      delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      mockGetApps.mockReturnValue([]);

      const module: TestingModule = await Test.createTestingModule({
        providers: [NotificationService],
      }).compile();
      service = module.get<NotificationService>(NotificationService);

      await service.sendPushNotification(['token-1'], 'Title', 'Body');

      expect(mockGetMessaging).not.toHaveBeenCalled();
    });

    it('should invoke sendEachForMulticast when FCM is active', async () => {
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH = '/path/to/key.json';
      mockGetApps.mockReturnValue([]);
      mockSendEachForMulticast.mockResolvedValue({
        successCount: 1,
        failureCount: 0,
        responses: [{ success: true }, { success: true }],
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [NotificationService],
      }).compile();
      service = module.get<NotificationService>(NotificationService);

      await service.sendPushNotification(
        ['token-1', 'token-2'],
        'Title',
        'Body',
      );

      expect(mockGetMessaging).toHaveBeenCalled();
      expect(mockSendEachForMulticast).toHaveBeenCalledWith({
        tokens: ['token-1', 'token-2'],
        notification: { title: 'Title', body: 'Body' },
        webpush: {
          headers: {
            Urgency: 'high',
          },
          notification: {
            title: 'Title',
            body: 'Body',
            icon: '/icons/icon-128x128.png',
            badge: '/icons/icon-128x128.png',
            requireInteraction: true,
          },
        },
      });
    });
  });
});

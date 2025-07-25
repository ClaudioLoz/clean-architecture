import * as admin from 'firebase-admin';

export interface FirebaseConfig {
  projectId: string;
  isEmulator: boolean;
  emulatorHost?: string;
  emulatorPort?: number;
}

export class FirebaseConfigService {
  private static instance: FirebaseConfigService;
  private app: admin.app.App;

  private constructor() {
    this.initializeFirebase();
  }

  static getInstance(): FirebaseConfigService {
    if (!FirebaseConfigService.instance) {
      FirebaseConfigService.instance = new FirebaseConfigService();
    }
    return FirebaseConfigService.instance;
  }

  private initializeFirebase(): void {
    const config: FirebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'clean-architecture-test',
      isEmulator: process.env.NODE_ENV !== 'production',
      emulatorHost: process.env.FIRESTORE_EMULATOR_HOST || 'localhost',
      emulatorPort: parseInt(process.env.FIRESTORE_EMULATOR_PORT || '8080'),
    };

    if (config.isEmulator) {
      process.env.FIRESTORE_EMULATOR_HOST = `${config.emulatorHost}:${config.emulatorPort}`;

      this.app = admin.initializeApp({
        projectId: config.projectId,
      });
    } else {
      this.app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: config.projectId,
      });
    }
  }

  getFirestore(): admin.firestore.Firestore {
    return this.app.firestore();
  }

  getApp(): admin.app.App {
    return this.app;
  }
}

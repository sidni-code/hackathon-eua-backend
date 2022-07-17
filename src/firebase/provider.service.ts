import { Injectable } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { App } from 'firebase-admin/app';
import { Auth } from 'firebase-admin/lib/auth/auth';
import { FirebaseConfigService } from '../config/firebase/config.service';

@Injectable()
export class FirebaseProviderService {
  private firebaseApp: App;
  constructor(private readonly firebaseConfigService: FirebaseConfigService) {
    this.firebaseApp = firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        clientEmail: this.firebaseConfigService.clientEmail,
        projectId: this.firebaseConfigService.projectId,
        privateKey: this.firebaseConfigService.privateKey,
      }),
    });
  }
  get firestore(): firebaseAdmin.firestore.Firestore {
    return firebaseAdmin.firestore(this.firebaseApp);
  }
}

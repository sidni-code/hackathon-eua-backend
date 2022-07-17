import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseConfigService {
  constructor(private configService: ConfigService) {}

  get projectId(): string {
    return this.configService.get<string>('firebase.projectId');
  }

  get clientEmail(): string {
    return this.configService.get<string>('firebase.clientEmail');
  }

  get privateKey(): string {
    return this.configService.get<string>('firebase.privateKey');
  }
}

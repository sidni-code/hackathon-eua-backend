import { Module } from '@nestjs/common';
import { FirebaseConfigModule } from '../config/firebase/config.module';
import { FirebaseProviderService } from './provider.service';

@Module({
  imports: [FirebaseConfigModule],
  providers: [FirebaseProviderService],
  exports: [FirebaseProviderService],
})
export class FirebaseProviderModule {}

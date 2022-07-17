import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { FirebaseProviderModule } from './firebase/provider.module';

@Module({
  imports: [FirebaseProviderModule],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}

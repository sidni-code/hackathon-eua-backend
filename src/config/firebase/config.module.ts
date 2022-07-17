import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseConfigService } from './config.service';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        FIREBASE_PROJECT_ID: Joi.string(),
        FIREBASE_CLIENT_EMAIL: Joi.string().email(),
        FIREBASE_PRIVATE_KEY: Joi.string(),
      }),
    }),
  ],
  providers: [FirebaseConfigService],
  exports: [FirebaseConfigService],
})
export class FirebaseConfigModule {}

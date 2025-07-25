import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FirebaseUserRepository } from './database/firebase-user.repository';
import { PasswordServiceImpl } from './services/password.service';
import { NestJSEventPublisher } from './services/nestjs-event-publisher.service';
import { UuidGeneratorService } from './services/uuid-generator.service';
import { EventHandlerService } from './services/event-handler.service';
import {
  USER_REPOSITORY_TOKEN,
  PASSWORD_SERVICE_TOKEN,
  EVENT_PUBLISHER_TOKEN,
  ID_GENERATOR_TOKEN,
} from '../application/di-tokens';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: FirebaseUserRepository,
    },
    {
      provide: PASSWORD_SERVICE_TOKEN,
      useClass: PasswordServiceImpl,
    },
    {
      provide: EVENT_PUBLISHER_TOKEN,
      useClass: NestJSEventPublisher,
    },
    {
      provide: ID_GENERATOR_TOKEN,
      useClass: UuidGeneratorService,
    },
    EventHandlerService,
  ],
  exports: [
    USER_REPOSITORY_TOKEN,
    PASSWORD_SERVICE_TOKEN,
    EVENT_PUBLISHER_TOKEN,
    ID_GENERATOR_TOKEN,
  ],
})
export class InfrastructureModule {}

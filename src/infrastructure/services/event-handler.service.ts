import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UserCreatedEvent,
  USER_EVENTS,
} from '../../domain/events/user-created.event';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { PasswordService } from '../../domain/services/password.service.interface';
import {
  USER_REPOSITORY_TOKEN,
  PASSWORD_SERVICE_TOKEN,
} from '../../application/di-tokens';

@Injectable()
export class EventHandlerService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_SERVICE_TOKEN)
    private readonly passwordService: PasswordService,
  ) {}

  @OnEvent(USER_EVENTS.USER_CREATED)
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    console.log(`User created event received for user: ${event.userId}`);

    if (!event.hasPassword) {
      console.log(`Generating password for user: ${event.userId}`);

      const generatedPassword = this.passwordService.generateSecurePassword();

      const hashedPassword =
        await this.passwordService.hashPassword(generatedPassword);

      const user = await this.userRepository.findById(event.userId);
      if (user) {
        const updatedUser = user.updatePassword(hashedPassword);
        await this.userRepository.update(updatedUser);

        console.log(`Password generated and updated for user: ${event.userId}`);
      }
    }
  }
}

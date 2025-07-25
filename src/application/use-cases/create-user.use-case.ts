import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { PasswordService } from '../../domain/services/password.service.interface';
import { IdGenerator } from '../../domain/services/id-generator.interface';
import { EventPublisher } from '../../domain/services/event-publisher.interface';
import {
  UserAlreadyExistsException,
  InvalidPasswordException,
} from '../../domain/exceptions/domain.exceptions';
import {
  UserCreatedEvent,
  USER_EVENTS,
} from '../../domain/events/user-created.event';
import {
  USER_REPOSITORY_TOKEN,
  PASSWORD_SERVICE_TOKEN,
  ID_GENERATOR_TOKEN,
  EVENT_PUBLISHER_TOKEN,
} from '../di-tokens';
import { CreateUserDto } from '../dtos/create-user.dto';
import { CreateUserResponseDto } from '../dtos/create-user-response.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_SERVICE_TOKEN)
    private readonly passwordService: PasswordService,
    @Inject(ID_GENERATOR_TOKEN)
    private readonly idGenerator: IdGenerator,
    @Inject(EVENT_PUBLISHER_TOKEN)
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new UserAlreadyExistsException('email', createUserDto.email);
    }

    const userId = this.idGenerator.generate();

    let hashedPassword: string | undefined;
    const hasProvidedPassword = !!createUserDto.password;

    if (createUserDto.password) {
      if (
        !this.passwordService.validatePasswordStrength(createUserDto.password)
      ) {
        throw new InvalidPasswordException(
          'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
        );
      }
      hashedPassword = await this.passwordService.hashPassword(
        createUserDto.password,
      );
    }

    const user = User.create(
      userId,
      createUserDto.username,
      createUserDto.email,
      hashedPassword,
    );

    const savedUser = await this.userRepository.save(user);

    const userCreatedEvent = new UserCreatedEvent(
      savedUser.id,
      savedUser.username,
      savedUser.email,
      hasProvidedPassword,
    );
    this.eventPublisher.publish(USER_EVENTS.USER_CREATED, userCreatedEvent);

    return new CreateUserResponseDto(
      savedUser.id,
      savedUser.username,
      savedUser.email,
    );
  }
}

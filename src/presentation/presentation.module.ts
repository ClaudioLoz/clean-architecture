import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { UserController } from './controllers/user.controller';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [CreateUserUseCase],
  controllers: [UserController],
})
export class PresentationModule {}

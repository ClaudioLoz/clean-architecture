import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseFilters,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { CreateUserResponseDto } from '../../application/dtos/create-user-response.dto';
import { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

@Controller('api/v1/users')
@UseFilters(DomainExceptionFilter)
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body(new ValidationPipe()) request: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const createUserDto: CreateUserDto = {
      username: request.username,
      email: request.email,
      password: request.password,
    };

    return this.createUserUseCase.execute(createUserDto);
  }
}

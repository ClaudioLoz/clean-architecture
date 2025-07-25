import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  UserAlreadyExistsException,
  InvalidPasswordException,
  DomainException,
} from '../../domain/exceptions/domain.exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;
    let error = 'Bad Request';

    if (exception instanceof UserAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
      error = 'Conflict';
    } else if (exception instanceof InvalidPasswordException) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Bad Request';
    }

    response.status(status).json({
      statusCode: status,
      error: error,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}

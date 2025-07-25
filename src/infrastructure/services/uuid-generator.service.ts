import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IdGenerator } from '../../domain/services/id-generator.interface';

@Injectable()
export class UuidGeneratorService implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}

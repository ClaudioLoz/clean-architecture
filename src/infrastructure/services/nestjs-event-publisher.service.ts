import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPublisher } from '../../domain/services/event-publisher.interface';

@Injectable()
export class NestJSEventPublisher implements EventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish<T>(eventName: string, event: T): void {
    this.eventEmitter.emit(eventName, event);
  }
}

export interface EventPublisher {
  publish<T>(eventName: string, event: T): void;
}

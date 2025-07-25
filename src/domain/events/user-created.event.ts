export const USER_EVENTS = {
  USER_CREATED: 'user.created',
} as const;

export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly email: string,
    public readonly hasPassword: boolean,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

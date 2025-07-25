export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserAlreadyExistsException extends DomainException {
  constructor(field: string, value: string) {
    super(`User with ${field} '${value}' already exists`);
  }
}

export class InvalidPasswordException extends DomainException {
  constructor(message: string) {
    super(`Invalid password: ${message}`);
  }
}

export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly password?: string,
  ) {}

  static create(
    id: string,
    username: string,
    email: string,
    password?: string,
  ): User {
    return new User(id, username, email, password);
  }

  updatePassword(newPassword: string): User {
    return new User(this.id, this.username, this.email, newPassword);
  }

  hasPassword(): boolean {
    return !!this.password;
  }
}

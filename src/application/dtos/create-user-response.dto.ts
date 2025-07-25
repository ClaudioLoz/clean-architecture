export class CreateUserResponseDto {
  id: string;
  username: string;
  email: string;

  constructor(id: string, username: string, email: string) {
    this.id = id;
    this.username = username;
    this.email = email;
  }
}

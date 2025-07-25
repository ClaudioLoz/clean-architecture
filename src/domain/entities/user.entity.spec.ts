import { User } from './user.entity';

describe('User Entity', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const username = 'testuser';
  const email = 'test@example.com';
  const password = 'SecurePassword123!';

  describe('create', () => {
    it('should create a new user with all properties', () => {
      const user = User.create(userId, username, email, password);

      expect(user.id).toBe(userId);
      expect(user.username).toBe(username);
      expect(user.email).toBe(email);
      expect(user.password).toBe(password);
    });

    it('should create a new user without password', () => {
      const user = User.create(userId, username, email);

      expect(user.id).toBe(userId);
      expect(user.username).toBe(username);
      expect(user.email).toBe(email);
      expect(user.password).toBeUndefined();
    });
  });

  describe('updatePassword', () => {
    it('should create a new user instance with updated password', () => {
      const user = User.create(userId, username, email, password);
      const newPassword = 'NewSecurePassword123!';

      const updatedUser = user.updatePassword(newPassword);

      expect(updatedUser).not.toBe(user);
      expect(updatedUser.password).toBe(newPassword);
      expect(updatedUser.id).toBe(userId);
      expect(updatedUser.username).toBe(username);
      expect(updatedUser.email).toBe(email);
    });
  });

  describe('hasPassword', () => {
    it('should return true when user has password', () => {
      const user = User.create(userId, username, email, password);
      expect(user.hasPassword()).toBe(true);
    });

    it('should return false when user has no password', () => {
      const user = User.create(userId, username, email);
      expect(user.hasPassword()).toBe(false);
    });

    it('should return false when password is empty string', () => {
      const user = User.create(userId, username, email, '');
      expect(user.hasPassword()).toBe(false);
    });
  });
});

import { PasswordServiceImpl } from './password.service';

describe('PasswordServiceImpl', () => {
  let service: PasswordServiceImpl;

  beforeEach(() => {
    service = new PasswordServiceImpl();
  });

  describe('generateSecurePassword', () => {
    it('should generate a password with default length of 12', () => {
      const password = service.generateSecurePassword();
      expect(password).toBeDefined();
      expect(password.length).toBe(12);
    });

    it('should generate a password with custom length', () => {
      const length = 16;
      const password = service.generateSecurePassword(length);
      expect(password.length).toBe(length);
    });

    it('should generate different passwords on each call', () => {
      const password1 = service.generateSecurePassword();
      const password2 = service.generateSecurePassword();
      expect(password1).not.toBe(password2);
    });

    it('should generate password with required character types', () => {
      const password = service.generateSecurePassword();

      // Check for lowercase
      expect(/[a-z]/.test(password)).toBe(true);
      // Check for uppercase
      expect(/[A-Z]/.test(password)).toBe(true);
      // Check for numbers
      expect(/\d/.test(password)).toBe(true);
      // Check for special characters
      expect(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)).toBe(true);
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Salt should make them different
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hashPassword(password);

      const result = await service.comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await service.hashPassword(password);

      const result = await service.comparePassword(wrongPassword, hash);
      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return true for strong password', () => {
      const strongPassword = 'TestPassword123!';
      const result = service.validatePasswordStrength(strongPassword);
      expect(result).toBe(true);
    });

    it('should return false for password without uppercase', () => {
      const weakPassword = 'testpassword123!';
      const result = service.validatePasswordStrength(weakPassword);
      expect(result).toBe(false);
    });

    it('should return false for password without lowercase', () => {
      const weakPassword = 'TESTPASSWORD123!';
      const result = service.validatePasswordStrength(weakPassword);
      expect(result).toBe(false);
    });

    it('should return false for password without numbers', () => {
      const weakPassword = 'TestPassword!';
      const result = service.validatePasswordStrength(weakPassword);
      expect(result).toBe(false);
    });

    it('should return false for password without special characters', () => {
      const weakPassword = 'TestPassword123';
      const result = service.validatePasswordStrength(weakPassword);
      expect(result).toBe(false);
    });

    it('should return false for password too short', () => {
      const shortPassword = 'Test1!';
      const result = service.validatePasswordStrength(shortPassword);
      expect(result).toBe(false);
    });
  });
});

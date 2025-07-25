export interface PasswordService {
  generateSecurePassword(length?: number): string;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  validatePasswordStrength(password: string): boolean;
}

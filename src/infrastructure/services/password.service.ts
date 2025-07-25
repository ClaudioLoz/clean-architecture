import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PasswordService as IPasswordService } from '../../domain/services/password.service.interface';

@Injectable()
export class PasswordServiceImpl implements IPasswordService {
  private readonly saltRounds = 12;

  generateSecurePassword(length: number = 12): string {
    if (length < 8) {
      throw new Error('Password length must be at least 8 characters');
    }

    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + specialChars;

    // Use bcrypt's salt generation for cryptographic randomness
    const salt = bcrypt.genSaltSync(12);
    // Combine with crypto.randomBytes for additional entropy
    const entropy = crypto.randomBytes(32).toString('hex') + salt;

    let password = '';

    // Ensure at least one character from each required type
    password += this.getSecureRandomChar(uppercase, entropy, 0);
    password += this.getSecureRandomChar(lowercase, entropy, 1);
    password += this.getSecureRandomChar(numbers, entropy, 2);
    password += this.getSecureRandomChar(specialChars, entropy, 3);

    // Fill remaining length with random characters from all sets
    for (let i = 4; i < length; i++) {
      password += this.getSecureRandomChar(allChars, entropy, i);
    }

    // Shuffle the password to avoid predictable patterns
    return this.secureShuffleString(password, entropy);
  }

  private getSecureRandomChar(
    charset: string,
    entropy: string,
    position: number,
  ): string {
    // Create deterministic but unpredictable index using entropy and position
    const hash = crypto
      .createHash('sha256')
      .update(entropy + position.toString())
      .digest();
    const randomIndex = hash.readUInt32BE(0) % charset.length;
    return charset[randomIndex];
  }

  private secureShuffleString(str: string, entropy: string): string {
    const chars = str.split('');
    const hash = crypto
      .createHash('sha256')
      .update(entropy + 'shuffle')
      .digest();

    for (let i = chars.length - 1; i > 0; i--) {
      // Use hash bytes to generate random index
      const randomIndex = hash.readUInt8(i % hash.length) % (i + 1);
      [chars[i], chars[randomIndex]] = [chars[randomIndex], chars[i]];
    }

    return chars.join('');
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): boolean {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password);

    return hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
  }
}
